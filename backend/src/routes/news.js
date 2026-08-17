/**
 * Market News Routes
 * Endpoints for multi-provider news aggregation (NewsAPI + GNews)
 */

import { Router } from 'express';
import { newsService } from '../services/newsService.js';

const router = Router();

/**
 * GET /api/market/news
 * Fetch market news with category filters, caching, and failover
 *
 * Query Parameters:
 *  - category: 'all' | 'india' | 'forex' | 'gold' | 'crypto' | 'us-markets' (default: 'all')
 *  - q: Custom search query string (optional)
 *  - refresh: 'true' | '1' to force bypass cache
 */
router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const query = req.query.q || null;
    const forceRefresh = req.query.refresh === 'true' || req.query.refresh === '1';

    const result = await newsService.getMarketNews({
      category,
      query,
      forceRefresh,
    });

    res.json(result);
  } catch (error) {
    console.error('[newsRoutes] Error serving news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve market news',
      message: error.message,
      articles: [],
    });
  }
});

/**
 * GET /api/market/news/status
 * Get news provider and cache status diagnostics
 */
router.get('/status', (req, res) => {
  try {
    const status = newsService.getStatus();
    res.json({
      success: true,
      status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
