/**
 * Multi-Provider News Service for RiskLoop
 *
 * Integrates NewsAPI (Primary) and GNews (Secondary/Fallback) with
 * in-memory TTL caching, deduplication, and normalized article structures.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category query mappings
const CATEGORY_QUERIES = {
  'all': 'stock market OR economy OR trading OR inflation OR interest rates',
  'india': 'NSE OR BSE OR Nifty OR Sensex OR "Indian stock market" OR RBI',
  'forex': 'Forex OR "currency trading" OR EURUSD OR GBPUSD OR USDINR OR "central bank"',
  'gold': '"gold price" OR "gold rate" OR "precious metals" OR bullion OR "silver price"',
  'crypto': 'Bitcoin OR Ethereum OR "crypto market" OR cryptocurrency OR BTC OR ETH',
  'us-markets': '"Wall Street" OR "S&P 500" OR Nasdaq OR "Dow Jones" OR "Federal Reserve"'
};

class NewsService {
  constructor() {
    // In-memory cache: category -> { timestamp: number, articles: Array, provider: string }
    this.cache = new Map();
    this.defaultTtlMs = parseInt(process.env.NEWS_CACHE_TTL_MS, 10) || 15 * 60 * 1000; // 15 minutes default
    this.timeoutMs = parseInt(process.env.API_TIMEOUT, 10) || 15000;
  }

  /**
   * Get NewsAPI API Key
   */
  get newsApiKey() {
    return process.env.NEWSAPI_API_KEY ? process.env.NEWSAPI_API_KEY.trim() : '';
  }

  /**
   * Get GNews API Key
   */
  get gnewsApiKey() {
    return process.env.GNEWS_API_KEY ? process.env.GNEWS_API_KEY.trim() : '';
  }

  /**
   * Normalize an article title for deduplication
   */
  _normalizeTitle(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 80);
  }

  /**
   * Deduplicate and filter raw article list
   */
  _deduplicateArticles(articles) {
    const seenTitles = new Set();
    const seenUrls = new Set();
    const result = [];

    for (const item of articles) {
      if (!item || !item.title) continue;

      // Filter out deleted/placeholder titles
      if (item.title === '[Removed]' || item.title.includes('404 Not Found')) continue;

      const normTitle = this._normalizeTitle(item.title);
      const url = item.url ? item.url.trim().toLowerCase() : '';

      if (normTitle && seenTitles.has(normTitle)) continue;
      if (url && seenUrls.has(url)) continue;

      if (normTitle) seenTitles.add(normTitle);
      if (url) seenUrls.add(url);

      result.push(item);
    }

    return result;
  }

  /**
   * Fetch from Primary Provider: NewsAPI
   */
  async fetchFromNewsApi(category = 'all', query = null) {
    const apiKey = this.newsApiKey;
    if (!apiKey) {
      throw new Error('NewsAPI API key not configured');
    }

    const searchQuery = query || CATEGORY_QUERIES[category] || CATEGORY_QUERIES['all'];
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '25');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'User-Agent': 'RiskLoop-App/1.0',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`NewsAPI HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.articles)) {
        return data.articles.map(a => ({
          title: a.title || 'Untitled',
          description: a.description || a.content || '',
          source: a.source && a.source.name ? a.source.name : 'NewsAPI',
          url: a.url || '',
          image: a.urlToImage || null,
          publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString(),
          category: category,
        }));
      }

      throw new Error('NewsAPI returned empty or invalid response payload');
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch from Secondary Provider: GNews
   */
  async fetchFromGNews(category = 'all', query = null) {
    const apiKey = this.gnewsApiKey;
    if (!apiKey) {
      throw new Error('GNews API key not configured');
    }

    const searchQuery = query || CATEGORY_QUERIES[category] || CATEGORY_QUERIES['all'];
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', '20');
    url.searchParams.set('apikey', apiKey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RiskLoop-App/1.0'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`GNews HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.articles)) {
        return data.articles.map(a => ({
          title: a.title || 'Untitled',
          description: a.description || a.content || '',
          source: a.source && a.source.name ? a.source.name : 'GNews',
          url: a.url || '',
          image: a.image || null,
          publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString(),
          category: category,
        }));
      }

      throw new Error('GNews returned empty or invalid response payload');
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fallback to local static market-news.json file if available
   */
  _getLocalFallbackNews(category = 'all') {
    try {
      const fallbackPath = path.resolve(__dirname, '../../../data/market-news.json');
      if (fs.existsSync(fallbackPath)) {
        const raw = fs.readFileSync(fallbackPath, 'utf8');
        const json = JSON.parse(raw);
        if (json && Array.isArray(json.articles)) {
          return json.articles.map(a => ({
            title: a.title,
            description: a.excerpt || a.description || '',
            source: a.source || 'Market Feed',
            url: a.url || '',
            image: null,
            publishedAt: a.publishedAt || new Date().toISOString(),
            category: category,
          }));
        }
      }
    } catch (e) {
      console.warn('[NewsService] Failed to read local fallback news:', e.message);
    }

    // Default static curated articles if no file found
    return [
      {
        title: 'Global Markets Digest: Central banks navigate inflation and growth trajectories',
        description: 'Equities and forex markets balance economic momentum with global policy adjustments.',
        source: 'RiskLoop Market Desk',
        url: 'https://economictimes.indiatimes.com/markets',
        image: null,
        publishedAt: new Date().toISOString(),
        category: category,
      },
      {
        title: 'Reserve Bank of India maintains steady benchmark policy rate',
        description: 'Monetary Policy Committee maintains focus on withdrawal of accommodation while supporting GDP growth.',
        source: 'Economic Times',
        url: 'https://economictimes.indiatimes.com/news/economy',
        image: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: category,
      },
      {
        title: 'Currency & Bullion Update: US Dollar consolidates while Gold tests key technical levels',
        description: 'Treasury yields stabilize as investors monitor trade balance data and commodities positioning.',
        source: 'Forex Desk',
        url: 'https://economictimes.indiatimes.com/markets/commodities',
        image: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: category,
      }
    ];
  }

  /**
   * Main method to get market news with automatic provider failover and caching
   *
   * @param {Object} options
   * @param {string} options.category - One of 'all', 'india', 'forex', 'gold', 'crypto', 'us-markets'
   * @param {string} [options.query] - Custom search query
   * @param {boolean} [options.forceRefresh] - Bypass in-memory cache
   * @returns {Promise<{ success: boolean, count: number, provider: string, cached: boolean, category: string, articles: Array }>}
   */
  async getMarketNews({ category = 'all', query = null, forceRefresh = false } = {}) {
    const validCategory = CATEGORY_QUERIES[category] ? category : 'all';
    const cacheKey = `${validCategory}:${query || 'default'}`;
    const now = Date.now();

    // Check In-Memory Cache
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.defaultTtlMs) {
        return {
          success: true,
          count: cached.articles.length,
          provider: cached.provider,
          cached: true,
          category: validCategory,
          timestamp: new Date(cached.timestamp).toISOString(),
          articles: cached.articles,
        };
      }
    }

    let articles = [];
    let providerUsed = '';
    let lastError = null;

    // 1. Try Primary: NewsAPI
    try {
      articles = await this.fetchFromNewsApi(validCategory, query);
      providerUsed = 'newsapi';
    } catch (err) {
      console.warn(`[NewsService] NewsAPI failed for category '${validCategory}':`, err.message);
      lastError = err;
    }

    // 2. Try Secondary Fallback: GNews
    if ((!articles || articles.length === 0) && this.gnewsApiKey) {
      try {
        articles = await this.fetchFromGNews(validCategory, query);
        providerUsed = 'gnews';
      } catch (err) {
        console.warn(`[NewsService] GNews fallback failed for category '${validCategory}':`, err.message);
        lastError = err;
      }
    }

    // 3. Fallback to Local/Static if both fail or keys not set
    if (!articles || articles.length === 0) {
      console.info(`[NewsService] Using local fallback market data for '${validCategory}'`);
      articles = this._getLocalFallbackNews(validCategory);
      providerUsed = 'local_fallback';
    }

    // Deduplicate articles
    const dedupedArticles = this._deduplicateArticles(articles);

    // Save to Cache
    this.cache.set(cacheKey, {
      timestamp: now,
      articles: dedupedArticles,
      provider: providerUsed,
    });

    return {
      success: true,
      count: dedupedArticles.length,
      provider: providerUsed,
      cached: false,
      category: validCategory,
      timestamp: new Date(now).toISOString(),
      articles: dedupedArticles,
    };
  }

  /**
   * Get diagnostics on caching and provider configuration
   */
  getStatus() {
    return {
      hasNewsApiKey: Boolean(this.newsApiKey),
      hasGNewsApiKey: Boolean(this.gnewsApiKey),
      cacheTtlMs: this.defaultTtlMs,
      cachedCategories: Array.from(this.cache.keys()).map(key => ({
        key,
        ageSeconds: Math.round((Date.now() - (this.cache.get(key)?.timestamp || 0)) / 1000),
        articleCount: this.cache.get(key)?.articles?.length || 0,
        provider: this.cache.get(key)?.provider,
      })),
    };
  }

  /**
   * Clear in-memory cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export const newsService = new NewsService();
export default newsService;
