/**
 * Quotes Routes
 * API endpoints for market quotes
 */

import express from 'express';
import { brokerService } from '../services/BrokerService.js';

const router = express.Router();

/**
 * Middleware: Check broker connection
 */
const requireBrokerConnection = (req, res, next) => {
  const { brokerId } = req.query;
  
  if (!brokerId) {
    return res.status(400).json({
      success: false,
      error: 'brokerId query parameter is required',
    });
  }

  const sessionId = req.sessionID || 'default-session';
  const connected = brokerService.isConnected(sessionId, brokerId);
  
  if (!connected) {
    return res.status(401).json({
      success: false,
      error: 'Not connected to broker',
    });
  }

  req.brokerId = brokerId;
  req.sessionId = sessionId;
  next();
};

/**
 * POST /api/quotes?brokerId=<broker>
 * Get quotes for symbols
 * 
 * Body: { symbols: string[] }
 */
router.post('/', requireBrokerConnection, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'symbols array is required',
      });
    }

    const adapter = brokerService.getAdapter(req.sessionId, req.brokerId);
    const quotes = await adapter.getQuotes(symbols);
    
    res.json({
      success: true,
      data: quotes.map(q => q.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
