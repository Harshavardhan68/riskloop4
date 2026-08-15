/**
 * Brokers Routes
 * API endpoints for broker operations
 */

import express from 'express';
import { brokerService } from '../services/BrokerService.js';

const router = express.Router();

/**
 * GET /api/brokers
 * Get list of all available brokers
 */
router.get('/', (req, res) => {
  try {
    const brokers = brokerService.getAvailableBrokers();
    res.json({
      success: true,
      data: brokers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/brokers/indian
 * Get list of Indian brokers
 */
router.get('/indian', (req, res) => {
  try {
    const brokers = brokerService.getBrokersByType('indian');
    res.json({
      success: true,
      data: brokers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/brokers/forex
 * Get list of Forex brokers
 */
router.get('/forex', (req, res) => {
  try {
    const brokers = brokerService.getBrokersByType('forex');
    res.json({
      success: true,
      data: brokers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/brokers/:brokerId/capabilities
 * Get capabilities of a specific broker
 */
router.get('/:brokerId/capabilities', (req, res) => {
  try {
    const { brokerId } = req.params;
    const capabilities = brokerService.getBrokerCapabilities(brokerId);
    
    res.json({
      success: true,
      data: {
        brokerId,
        capabilities,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
