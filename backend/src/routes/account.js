/**
 * Account Routes
 * API endpoints for account operations (profile, funds)
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
      message: 'Please connect to broker first using /api/auth/connect',
    });
  }

  req.brokerId = brokerId;
  req.sessionId = sessionId;
  next();
};

/**
 * GET /api/account/profile?brokerId=<broker>
 * Get user profile
 */
router.get('/profile', requireBrokerConnection, async (req, res) => {
  try {
    const adapter = brokerService.getAdapter(req.sessionId, req.brokerId);
    const profile = await adapter.getProfile();
    
    res.json({
      success: true,
      data: profile.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/account/funds?brokerId=<broker>
 * Get available funds/margin
 */
router.get('/funds', requireBrokerConnection, async (req, res) => {
  try {
    const adapter = brokerService.getAdapter(req.sessionId, req.brokerId);
    const funds = await adapter.getFunds();
    
    res.json({
      success: true,
      data: funds.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
