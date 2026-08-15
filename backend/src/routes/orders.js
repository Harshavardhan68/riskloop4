/**
 * Orders Routes
 * GET  /api/orders          – merged DB + live broker orders
 * POST /api/orders          – place order, persist immediately
 * PUT  /api/orders/:orderId – modify order
 * DEL  /api/orders/:orderId – cancel order
 *
 * TRADE RULE: placing an order is NOT a trade.
 * Only broker-confirmed executions (handled by TradeExecutionService) become trades.
 */

import express from 'express';
import { brokerService }      from '../services/BrokerService.js';
import { persistenceService } from '../services/PersistenceService.js';

const router = express.Router();

// ── Middleware ────────────────────────────────────────────────────────────────

const requireBrokerConnection = (req, res, next) => {
  const brokerId = req.query.brokerId || req.body?.brokerId;

  if (!brokerId) {
    return res.status(400).json({ success: false, error: 'brokerId is required' });
  }

  const sessionId = req.sessionID || 'default-session';

  if (!brokerService.isConnected(sessionId, brokerId)) {
    return res.status(401).json({ success: false, error: 'Not connected to broker' });
  }

  req.brokerId  = brokerId;
  req.sessionId = sessionId;
  next();
};

// ── GET /api/orders ───────────────────────────────────────────────────────────

router.get('/', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    const adapter = brokerService.getAdapter(sessionId, brokerId);

    let liveOrders = [];
    try {
      const fetched = await adapter.getOrders();
      liveOrders    = fetched.map(o => (typeof o.toJSON === 'function' ? o.toJSON() : o));

      // Persist the fresh snapshot so history survives restart
      persistenceService.saveOrders(brokerId, liveOrders);
    } catch (liveErr) {
      console.warn(`[orders] Live fetch failed for ${brokerId}, falling back to DB:`, liveErr.message);
    }

    // Merge: live data wins; DB fills in historical records not in live list
    const dbOrders = persistenceService.getOrders(brokerId);
    const merged   = persistenceService.mergeWithLive('orderId', liveOrders, dbOrders);

    res.json({ success: true, data: merged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/orders ──────────────────────────────────────────────────────────

router.post('/', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    const orderRequest = req.body;

    // Basic required-field validation
    const missing = ['symbol', 'side', 'quantity'].filter(f => !orderRequest[f]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        error:   `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const adapter = brokerService.getAdapter(sessionId, brokerId);
    const order   = await adapter.placeOrder(orderRequest);

    // Persist the order immediately — it is an ORDER, not a trade
    const orderData = typeof order.toJSON === 'function' ? order.toJSON() : order;
    persistenceService.saveOrder(brokerId, orderData);

    res.json({
      success: true,
      data:    orderData,
      message: 'Order placed and persisted. It will become a Trade only after broker execution.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/orders/:orderId ──────────────────────────────────────────────────

router.put('/:orderId', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId }  = req;
    const { orderId }              = req.params;
    const adapter                  = brokerService.getAdapter(sessionId, brokerId);
    const result                   = await adapter.modifyOrder(orderId, req.body);

    res.json({ success: true, data: result, message: 'Order modified.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/orders/:orderId ───────────────────────────────────────────────

router.delete('/:orderId', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    const { orderId }             = req.params;
    const variety                 = req.query.variety || 'NORMAL';
    const adapter                 = brokerService.getAdapter(sessionId, brokerId);
    const result                  = await adapter.cancelOrder(orderId, variety);

    // Update persisted status to CANCELLED
    persistenceService.saveOrder(brokerId, {
      orderId,
      status:          'CANCELLED',
      updateTimestamp: new Date().toISOString(),
    });

    res.json({ success: true, data: result, message: 'Order cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
