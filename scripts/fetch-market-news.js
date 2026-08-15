/**
 * Fetch Market News from RSS Feeds
 * Converts RSS feeds to JSON for client-side consumption
 * Avoids CORS issues by running server-side via GitHub Actions
 */

import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RSS Feed sources
const RSS_FEEDS = [
  {
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    source: 'Economic Times',
    category: 'market'
  },
  {
    url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms',
    source: 'Economic Times',
    category: 'rbi'
  },
  // Add more RSS feeds as needed
];

async function fetchRSSFeed(feedConfig) {
  const parser = new Parser({
    customFields: {
      item: ['description', 'pubDate']
    }
  });
  
  try {
    const feed = await parser.parseURL(feedConfig.url);
    
    return feed.items.slice(0, 10).map(item => ({
      title: item.title,
      excerpt: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || '',
      category: feedConfig.category,
      source: feedConfig.source,
      publishedAt: new Date(item.pubDate).toISOString(),
      url: item.link
    }));
  } catch (error) {
    console.error(`Error fetching ${feedConfig.source}:`, error.message);
    return [];
  }
}

async function updateMarketNews() {
  console.log('📰 Fetching market news from RSS feeds...');
  
  try {
    // Fetch all RSS feeds in parallel
    const results = await Promise.all(
      RSS_FEEDS.map(feed => fetchRSSFeed(feed))
    );
    
    // Flatten and sort by date
    const allArticles = results
      .flat()
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 20); // Keep top 20 most recent
    
    // Create news JSON
    const newsData = {
      articles: allArticles,
      lastUpdated: new Date().toISOString(),
      source: 'RSS Feed Aggregation',
      note: 'Converted from RSS feeds by GitHub Actions on schedule'
    };
    
    // Write to data/market-news.json
    const dataPath = path.join(__dirname, '..', 'data', 'market-news.json');
    fs.writeFileSync(dataPath, JSON.stringify(newsData, null, 2));
    
    console.log(`✅ Updated market news with ${allArticles.length} articles`);
    console.log(`📝 Written to: ${dataPath}`);
    
  } catch (error) {
    console.error('❌ Error updating market news:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateMarketNews();
}

export { updateMarketNews };
