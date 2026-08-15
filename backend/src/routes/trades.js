/**
 * Trades Routes
 * GET /api/trades  – broker-confirmed executions only (merged DB + live)
 *
 * TRADE RULE: this endpoint only returns actual fills confirmed by the broker.
 * Pending / open orders are never included here.
 */

import express from 'express';
import { brokerService }          from '../services/BrokerService.js';
import { persistenceService }     from '../services/PersistenceService.js';
import { tradeExecutionService }  from '../services/TradeExecutionService.js';

const router = express.Router();

// ── Middleware ────────────────────────────────────────────────────────────────

const requireBrokerConnection = (req, res, next) => {
  const { brokerId } = req.query;

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

// ── GET /api/trades ───────────────────────────────────────────────────────────

router.get('/', requireBrokerConnection, async (req, res) => {
  try {
    const { brokerId, sessionId } = req;
    const adapter = brokerService.getAdapter(sessionId, brokerId);

    // 1. Fetch live trade history from the broker (confirmed fills only)
    let liveTrades = [];
    try {
      const fetched = await adapter.getTradeHistory();
      liveTrades    = fetched.map(t => (typeof t.toJSON === 'function' ? t.toJSON() : t));

      // 2. Sync into DB — deduplicated by UNIQUE(broker_id, broker_trade_id)
      if (liveTrades.length > 0) {
        const syncResult = await tradeExecutionService.synchronizeRestTrades(brokerId, liveTrades);
        console.log(`[trades] Sync result for ${brokerId}:`, syncResult);
      }
    } catch (liveErr) {
      console.warn(`[trades] Live fetch failed for ${brokerId}, using DB only:`, liveErr.message);
    }

    // 3. Return DB records (authoritative, includes all historical fills)
    const dbTrades = tradeExecutionService.getTradesByBroker(brokerId);

    // 4. Merge: live wins, DB fills historical gaps
    const merged = persistenceService.mergeWithLive('tradeId', liveTrades, dbTrades);

    res.json({
      success: true,
      data:    merged,
      meta: {
        live:  liveTrades.length,
        total: merged.length,
        note:  'Only broker-confirmed executions are included.',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
