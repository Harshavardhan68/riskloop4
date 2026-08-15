/**
 * WebSocket Routes
 * API endpoints for WebSocket management and subscriptions
 */

import express from 'express';
import { brokerService } from '../services/BrokerService.js';
import { webSocketService } from '../services/WebSocketService.js';
import { tradeExecutionService } from '../services/TradeExecutionService.js';

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
 * POST /api/websocket/connect?brokerId=<broker>
 * Connect WebSocket for a broker
 */
router.post('/connect', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    
    // Get broker adapter
    const adapter = brokerService.getAdapter(sessionId, brokerId);
    
    // Get WebSocket instance from adapter
    const wsAdapter = adapter.getWebSocket();
    
    // Check if already connected
    if (webSocketService.isConnected(sessionId, brokerId)) {
      return res.json({
        success: true,
        message: 'WebSocket already connected',
        data: webSocketService.getStatus(sessionId, brokerId),
      });
    }
    
    // Create connection via WebSocketService
    await webSocketService.createConnection(sessionId, brokerId, wsAdapter);
    
    res.json({
      success: true,
      message: 'WebSocket connected successfully',
      data: webSocketService.getStatus(sessionId, brokerId),
    });
    
  } catch (error) {
    console.error('WebSocket connect error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/websocket/disconnect?brokerId=<broker>
 * Disconnect WebSocket
 */
router.post('/disconnect', async (req, res) => {
  try {
    const { brokerId } = req.query;
    const sessionId = req.sessionID || 'default-session';
    
    if (!brokerId) {
      return res.status(400).json({
        success: false,
        error: 'brokerId is required',
      });
    }
    
    await webSocketService.disconnect(sessionId, brokerId);
    
    res.json({
      success: true,
      message: 'WebSocket disconnected',
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/websocket/status?brokerId=<broker>
 * Get WebSocket connection status
 */
router.get('/status', async (req, res) => {
  try {
    const { brokerId } = req.query;
    const sessionId = req.sessionID || 'default-session';
    
    if (!brokerId) {
      // Return all statuses
      const statuses = webSocketService.getAllStatuses(sessionId);
      return res.json({
        success: true,
        data: statuses,
      });
    }
    
    const status = webSocketService.getStatus(sessionId, brokerId);
    
    res.json({
      success: true,
      data: status,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/websocket/subscribe/market-data?brokerId=<broker>
 * Subscribe to market data
 * 
 * Body: {
 *   symbols: [{ exchange: 'NSE_CM', token: '26009', symbol: 'RELIANCE' }],
 *   feedType: 'LTP' | 'QUOTE' | 'SNAP_QUOTE'
 * }
 */
router.post('/subscribe/market-data', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    const { symbols, feedType = 'LTP' } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'symbols array is required',
      });
    }
    
    await webSocketService.subscribeMarketData(sessionId, brokerId, symbols, feedType);
    
    res.json({
      success: true,
      message: `Subscribed to ${symbols.length} symbols`,
      data: {
        symbols,
        feedType,
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/websocket/unsubscribe/market-data?brokerId=<broker>
 * Unsubscribe from market data
 */
router.post('/unsubscribe/market-data', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    const { symbols, feedType = 'LTP' } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'symbols array is required',
      });
    }
    
    await webSocketService.unsubscribeMarketData(sessionId, brokerId, symbols, feedType);
    
    res.json({
      success: true,
      message: `Unsubscribed from ${symbols.length} symbols`,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/websocket/subscribe/order-feed?brokerId=<broker>
 * Subscribe to order feed
 */
router.post('/subscribe/order-feed', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    
    await webSocketService.subscribeOrderFeed(sessionId, brokerId);
    
    res.json({
      success: true,
      message: 'Subscribed to order feed',
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/websocket/unsubscribe/order-feed?brokerId=<broker>
 * Unsubscribe from order feed
 */
router.post('/unsubscribe/order-feed', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    
    await webSocketService.unsubscribeOrderFeed(sessionId, brokerId);
    
    res.json({
      success: true,
      message: 'Unsubscribed from order feed',
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/websocket/market-data?brokerId=<broker>
 * Get cached market data
 */
router.get('/market-data', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (symbol) {
      const data = webSocketService.getMarketData(symbol);
      return res.json({
        success: true,
        data,
      });
    }
    
    // Return all market data
    const allData = webSocketService.getAllMarketData();
    
    res.json({
      success: true,
      data: allData,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/websocket/trades?brokerId=<broker>
 * Get synchronized trades (actual executions only)
 */
router.get('/trades', async (req, res) => {
  try {
    const { brokerId, orderId } = req.query;
    
    if (!brokerId) {
      return res.status(400).json({
        success: false,
        error: 'brokerId is required',
      });
    }
    
    let trades;
    
    if (orderId) {
      trades = tradeExecutionService.getTradesByOrder(orderId);
    } else {
      trades = tradeExecutionService.getTradesByBroker(brokerId);
    }
    
    res.json({
      success: true,
      data: trades,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/websocket/partial-fills/:orderId
 * Get partial fill status for an order
 */
router.get('/partial-fills/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const fillStatus = tradeExecutionService.getPartialFillStatus(orderId);
    
    if (!fillStatus) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or no fills yet',
      });
    }
    
    res.json({
      success: true,
      data: fillStatus,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
