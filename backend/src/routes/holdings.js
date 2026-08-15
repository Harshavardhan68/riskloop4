/**
 * Holdings Routes
 * API endpoints for holdings operations
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
 * GET /api/holdings?brokerId=<broker>
 * Get holdings (long-term delivery positions)
 */
router.get('/', requireBrokerConnection, async (req, res) => {
  try {
    const adapter = brokerService.getAdapter(req.sessionId, req.brokerId);
    const holdings = await adapter.getHoldings();
    
    res.json({
      success: true,
      data: holdings.map(h => h.toJSON()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
