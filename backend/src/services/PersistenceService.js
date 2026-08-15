/**
 * PersistenceService
 * High-level façade over DatabaseService for orders, positions, and holdings.
 *
 * Keeps broker-specific logic behind the multi-broker abstraction:
 * callers pass normalised model objects (Order, Position, Holding)
 * and this service handles all DB interaction.
 *
 * Trades are NOT handled here — TradeExecutionService owns that flow
 * because it must enforce the "only confirmed executions become trades" rule.
 */

import { db } from './DatabaseService.js';

class PersistenceService {

  // ── Orders ────────────────────────────────────────────────────────────────

  /**
   * Persist a single order that was just placed or returned by the broker.
   * Safe to call repeatedly — upsert semantics (status updates are applied).
   *
   * @param {string} brokerId
   * @param {Order|object} order  – normalised Order model or plain object
   */
  saveOrder(brokerId, order) {
    try {
      db.upsertOrder(brokerId, order);
    } catch (err) {
      console.error(`[PersistenceService] saveOrder failed for ${brokerId}:`, err.message);
      throw err;
    }
  }

  /**
   * Persist a batch of orders (e.g. full order book fetched on reconnect).
   * Wrapped in a single transaction for performance.
   */
  saveOrders(brokerId, orders) {
    if (!orders || orders.length === 0) return;
    try {
      db.upsertOrders(brokerId, orders);
      console.log(`[PersistenceService] Saved ${orders.length} orders for ${brokerId}.`);
    } catch (err) {
      console.error(`[PersistenceService] saveOrders failed for ${brokerId}:`, err.message);
      throw err;
    }
  }

  /**
   * Return all persisted orders for a broker, newest first.
   * Merges with live broker data in the route layer — this only provides
   * the DB portion.
   */
  getOrders(brokerId) {
    try {
      return db.getOrders(brokerId);
    } catch (err) {
      console.error(`[PersistenceService] getOrders failed for ${brokerId}:`, err.message);
      return [];
    }
  }

  // ── Positions ─────────────────────────────────────────────────────────────

  /**
   * Replace the full position snapshot for a broker.
   * Called every time fresh positions are fetched from the broker.
   */
  savePositions(brokerId, positions) {
    if (!positions) return;
    try {
      db.replacePositions(brokerId, positions);
      console.log(`[PersistenceService] Saved ${positions.length} positions for ${brokerId}.`);
    } catch (err) {
      console.error(`[PersistenceService] savePositions failed for ${brokerId}:`, err.message);
      throw err;
    }
  }

  /**
   * Return persisted positions for a broker.
   * Used as fallback when the broker API is unreachable.
   */
  getPositions(brokerId) {
    try {
      return db.getPositions(brokerId);
    } catch (err) {
      console.error(`[PersistenceService] getPositions failed for ${brokerId}:`, err.message);
      return [];
    }
  }

  // ── Holdings ──────────────────────────────────────────────────────────────

  /**
   * Replace the full holdings snapshot for a broker.
   */
  saveHoldings(brokerId, holdings) {
    if (!holdings) return;
    try {
      db.replaceHoldings(brokerId, holdings);
      console.log(`[PersistenceService] Saved ${holdings.length} holdings for ${brokerId}.`);
    } catch (err) {
      console.error(`[PersistenceService] saveHoldings failed for ${brokerId}:`, err.message);
      throw err;
    }
  }

  /**
   * Return persisted holdings for a broker.
   */
  getHoldings(brokerId) {
    try {
      return db.getHoldings(brokerId);
    } catch (err) {
      console.error(`[PersistenceService] getHoldings failed for ${brokerId}:`, err.message);
      return [];
    }
  }

  // ── Sync helpers ──────────────────────────────────────────────────────────

  /**
   * Full broker data sync — persists orders, positions, and holdings in one
   * call.  Used from the auth/connect route after a successful broker login.
   *
   * @param {string} brokerId
   * @param {object} data  – { orders, positions, holdings }  (arrays, may be null/undefined)
   */
  syncBrokerSnapshot(brokerId, data = {}) {
    const results = { orders: 0, positions: 0, holdings: 0, errors: [] };

    if (data.orders && Array.isArray(data.orders)) {
      try {
        // data.orders may be Order model instances — call toJSON() if available
        const plain = data.orders.map(o => (typeof o.toJSON === 'function' ? o.toJSON() : o));
        this.saveOrders(brokerId, plain);
        results.orders = plain.length;
      } catch (err) {
        results.errors.push(`orders: ${err.message}`);
      }
    }

    if (data.positions && Array.isArray(data.positions)) {
      try {
        const plain = data.positions.map(p => (typeof p.toJSON === 'function' ? p.toJSON() : p));
        this.savePositions(brokerId, plain);
        results.positions = plain.length;
      } catch (err) {
        results.errors.push(`positions: ${err.message}`);
      }
    }

    if (data.holdings && Array.isArray(data.holdings)) {
      try {
        const plain = data.holdings.map(h => (typeof h.toJSON === 'function' ? h.toJSON() : h));
        this.saveHoldings(brokerId, plain);
        results.holdings = plain.length;
      } catch (err) {
        results.errors.push(`holdings: ${err.message}`);
      }
    }

    console.log(
      `[PersistenceService] syncBrokerSnapshot ${brokerId}: ` +
      `${results.orders} orders, ${results.positions} positions, ${results.holdings} holdings` +
      (results.errors.length ? ` | errors: ${results.errors.join('; ')}` : '')
    );

    return results;
  }

  /**
   * Merge DB records with live broker records.
   * Live data wins for matching IDs (it's more current).
   * DB-only records (older history) are appended.
   *
   * @param {string}   idField   – field name that uniquely identifies a record
   * @param {Array}    liveItems – fresh data from broker API
   * @param {Array}    dbItems   – persisted data from SQLite
   * @returns {Array}  merged, live-first list
   */
  mergeWithLive(idField, liveItems, dbItems) {
    if (!liveItems || liveItems.length === 0) return dbItems || [];
    if (!dbItems   || dbItems.length   === 0) return liveItems;

    const liveIds = new Set(liveItems.map(item => item[idField]));
    const dbOnly  = dbItems.filter(item => !liveIds.has(item[idField]));

    // Live items first (most recent state), then historical DB-only items
    return [...liveItems, ...dbOnly];
  }
}

export const persistenceService = new PersistenceService();
