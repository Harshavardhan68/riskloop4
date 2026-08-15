/**
 * Authentication Routes
 * POST /api/auth/connect    – connect to broker + sync historical data into DB
 * POST /api/auth/disconnect – disconnect
 * GET  /api/auth/status/:id – connection status
 */

import express from 'express';
import { brokerService }         from '../services/BrokerService.js';
import { persistenceService }    from '../services/PersistenceService.js';
import { tradeExecutionService } from '../services/TradeExecutionService.js';

const router = express.Router();

// ── POST /api/auth/connect ────────────────────────────────────────────────────

router.post('/connect', async (req, res) => {
  try {
    const { brokerId, credentials } = req.body;

    if (!brokerId) {
      return res.status(400).json({ success: false, error: 'brokerId is required' });
    }

    const sessionId = req.sessionID || 'default-session';
    const adapter   = brokerService.getAdapter(sessionId, brokerId);

    // Authenticate with broker
    const connected = await adapter.connect(credentials || {});

    if (!connected) {
      return res.status(401).json({
        success: false,
        error:   'Connection failed',
        message: 'Unable to authenticate with broker',
      });
    }

    // ── Historical data sync ──────────────────────────────────────────────
    // Run in background so the connect response is fast.
    // Errors here are logged but do not fail the connect response.
    setImmediate(() => _syncHistoricalData(brokerId, sessionId, adapter));

    res.json({
      success: true,
      message: `Connected to ${adapter.brokerName}. Historical data sync started.`,
      data: {
        brokerId:   adapter.brokerId,
        brokerName: adapter.brokerName,
        connected:  true,
      },
    });
  } catch (err) {
    console.error('[auth/connect] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/disconnect ─────────────────────────────────────────────────

router.post('/disconnect', async (req, res) => {
  try {
    const { brokerId } = req.body;

    if (!brokerId) {
      return res.status(400).json({ success: false, error: 'brokerId is required' });
    }

    const sessionId = req.sessionID || 'default-session';
    brokerService.removeAdapter(sessionId, brokerId);

    res.json({ success: true, message: 'Disconnected successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/status/:brokerId ────────────────────────────────────────────

router.get('/status/:brokerId', (req, res) => {
  try {
    const { brokerId } = req.params;
    const sessionId    = req.sessionID || 'default-session';
    const connected    = brokerService.isConnected(sessionId, brokerId);

    res.json({ success: true, data: { brokerId, connected } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/sync ───────────────────────────────────────────────────────
// Manual re-sync endpoint — useful after WebSocket reconnect or on demand.

router.post('/sync', async (req, res) => {
  try {
    const { brokerId } = req.body;

    if (!brokerId) {
      return res.status(400).json({ success: false, error: 'brokerId is required' });
    }

    const sessionId = req.sessionID || 'default-session';

    if (!brokerService.isConnected(sessionId, brokerId)) {
      return res.status(401).json({ success: false, error: 'Not connected to broker' });
    }

    const adapter = brokerService.getAdapter(sessionId, brokerId);
    const result  = await _syncHistoricalData(brokerId, sessionId, adapter);

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Internal sync helper ──────────────────────────────────────────────────────

async function _syncHistoricalData(brokerId, sessionId, adapter) {
  const result = {
    brokerId,
    orders:    0,
    trades:    0,
    positions: 0,
    holdings:  0,
    errors:    [],
  };

  console.log(`[auth] Starting historical sync for ${brokerId}…`);

  // Orders
  try {
    const orders = await adapter.getOrders();
    const plain  = orders.map(o => (typeof o.toJSON === 'function' ? o.toJSON() : o));
    persistenceService.saveOrders(brokerId, plain);
    result.orders = plain.length;
  } catch (err) {
    result.errors.push(`orders: ${err.message}`);
    console.warn(`[auth/sync] Orders failed for ${brokerId}:`, err.message);
  }

  // Trades — sync through TradeExecutionService so dedup is applied
  try {
    const trades  = await adapter.getTradeHistory();
    const plain   = trades.map(t => (typeof t.toJSON === 'function' ? t.toJSON() : t));
    const synced  = await tradeExecutionService.synchronizeRestTrades(brokerId, plain);
    result.trades = synced.inserted;
  } catch (err) {
    result.errors.push(`trades: ${err.message}`);
    console.warn(`[auth/sync] Trades failed for ${brokerId}:`, err.message);
  }

  // Positions
  try {
    const positions = await adapter.getPositions();
    const plain     = positions.map(p => (typeof p.toJSON === 'function' ? p.toJSON() : p));
    persistenceService.savePositions(brokerId, plain);
    result.positions = plain.length;
  } catch (err) {
    result.errors.push(`positions: ${err.message}`);
    console.warn(`[auth/sync] Positions failed for ${brokerId}:`, err.message);
  }

  // Holdings
  try {
    const holdings = await adapter.getHoldings();
    const plain    = holdings.map(h => (typeof h.toJSON === 'function' ? h.toJSON() : h));
    persistenceService.saveHoldings(brokerId, plain);
    result.holdings = plain.length;
  } catch (err) {
    result.errors.push(`holdings: ${err.message}`);
    console.warn(`[auth/sync] Holdings failed for ${brokerId}:`, err.message);
  }

  console.log(
    `[auth] Sync complete for ${brokerId}: ` +
    `${result.orders} orders, ${result.trades} trades, ` +
    `${result.positions} positions, ${result.holdings} holdings` +
    (result.errors.length ? ` | errors: ${result.errors.join('; ')}` : '')
  );

  return result;
}

export default router;
