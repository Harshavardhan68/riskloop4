/**
 * TradeExecutionService
 * Synchronises actual broker executions with RiskLoop trades.
 * Persists every confirmed fill to SQLite via DatabaseService.
 *
 * CORE RULE:
 *   Orders are NOT trades.
 *   Only a broker-confirmed fill/execution creates a Trade row.
 *   Duplicate prevention is enforced at TWO levels:
 *     1. In-memory  : this.processedExecutions Set (fast, within a session)
 *     2. Database   : UNIQUE (broker_id, broker_trade_id) constraint (across restarts)
 */

import { EventEmitter } from 'events';
import { db } from './DatabaseService.js';

class TradeExecutionService extends EventEmitter {
  constructor() {
    super();

    // ── In-memory caches (rebuilt from DB on initialize()) ──────────────

    // executionId -> execution data
    this.executions = new Map();

    // orderId -> [executionId, ...]
    this.orderExecutions = new Map();

    // Set of executionIds already processed (duplicate guard, session-level)
    this.processedExecutions = new Set();

    // tradeId -> trade object
    this.trades = new Map();

    // orderId -> partial-fill state
    this.partialFills = new Map();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Load all previously persisted trades from the database into memory.
   * Call once after DatabaseService.initialize().
   */
  loadFromDatabase() {
    // We load for every broker that has trades stored; we don't need to know
    // the broker list up front — just hydrate all rows.
    try {
      const rows = db.db
        .prepare('SELECT * FROM trades ORDER BY created_at ASC')
        .all();

      for (const row of rows) {
        const executionId = this._makeExecutionId(
          row.broker_id,
          row.broker_order_id,
          row.broker_trade_id
        );

        // Mark as already processed so arriving WebSocket events for the
        // same fill are recognised as duplicates and skipped.
        this.processedExecutions.add(executionId);

        // Rebuild the trade object from DB columns
        const trade = db._rowToTrade(row);
        trade.brokerId = row.broker_id;

        this.trades.set(row.broker_trade_id, trade);

        // Rebuild order -> execution mapping
        if (!this.orderExecutions.has(row.broker_order_id)) {
          this.orderExecutions.set(row.broker_order_id, []);
        }
        this.orderExecutions.get(row.broker_order_id).push(executionId);

        // Rebuild partial-fill state
        this._rebuildPartialFill(row.broker_order_id, trade);
      }

      console.log(`[TradeExecutionService] Loaded ${rows.length} trade(s) from database.`);
    } catch (err) {
      console.error('[TradeExecutionService] Failed to load trades from DB:', err.message);
    }
  }

  // ── Core execution processing ────────────────────────────────────────────

  /**
   * Process a single execution event from the broker.
   * Called by WebSocket order-feed handler AND by the REST-sync path.
   *
   * @param {string} brokerId
   * @param {object} execution  – normalised execution/fill data
   * @returns {object} trade record (new or existing)
   */
  async processExecution(brokerId, execution) {
    const orderId      = execution.orderId  || execution.order_id  || '';
    const tradeId      = execution.tradeId  || execution.trade_id  || execution.executionId || '';
    const executionId  = this._makeExecutionId(brokerId, orderId, tradeId);

    // ── Level-1 duplicate check: in-memory ─────────────────────────────
    if (this.processedExecutions.has(executionId)) {
      console.log(`[TradeExecutionService] Duplicate (memory): ${executionId}`);
      return this.trades.get(tradeId);
    }

    // ── Level-2 duplicate check: database ──────────────────────────────
    if (db.tradeExists(brokerId, tradeId)) {
      console.log(`[TradeExecutionService] Duplicate (db): ${executionId}`);
      this.processedExecutions.add(executionId); // sync memory with db
      return this.trades.get(tradeId);
    }

    // ── Mark processed ──────────────────────────────────────────────────
    this.processedExecutions.add(executionId);

    // Store raw execution
    this.executions.set(executionId, {
      ...execution,
      executionId,
      brokerId,
      processedAt: new Date().toISOString(),
    });

    // Update order -> executions mapping
    if (!this.orderExecutions.has(orderId)) {
      this.orderExecutions.set(orderId, []);
    }
    this.orderExecutions.get(orderId).push(executionId);

    // Determine partial-fill status
    const isPartialFill = this._checkPartialFill(orderId, execution);

    // Build trade object
    const trade = this._buildTrade(brokerId, execution, executionId, isPartialFill);

    // ── Persist to SQLite ───────────────────────────────────────────────
    const inserted = db.insertTrade(brokerId, trade);
    if (!inserted) {
      // DB said duplicate (race between memory check and DB) — safe to ignore
      console.log(`[TradeExecutionService] DB duplicate race for: ${executionId}`);
    }

    // Store in memory
    this.trades.set(tradeId, trade);

    // Emit event for WebSocket broadcast
    this.emit('executionProcessed', {
      brokerId,
      orderId,
      executionId,
      tradeId: trade.tradeId,
      isPartialFill,
      execution,
      trade,
      timestamp: new Date().toISOString(),
    });

    console.log(`[TradeExecutionService] New trade persisted: ${tradeId} (${brokerId} ${execution.symbol})`);
    return trade;
  }

  /**
   * Sync a batch of REST-API trade records.
   * Used on broker reconnect to load today's fills that arrived before
   * the WebSocket was connected.
   *
   * Returns { inserted, duplicates } counts.
   */
  async synchronizeRestTrades(brokerId, restTrades) {
    let inserted   = 0;
    let duplicates = 0;
    const newTrades = [];

    for (const restTrade of restTrades) {
      const tradeId     = restTrade.tradeId  || restTrade.trade_id  || '';
      const orderId     = restTrade.orderId  || restTrade.order_id  || '';
      const executionId = this._makeExecutionId(brokerId, orderId, tradeId);

      if (this.processedExecutions.has(executionId) || db.tradeExists(brokerId, tradeId)) {
        duplicates++;
        continue;
      }

      try {
        const trade = await this.processExecution(brokerId, {
          orderId,
          tradeId,
          executionId: tradeId,
          symbol:          restTrade.symbol,
          exchange:        restTrade.exchange        || '',
          segment:         restTrade.segment         || '',
          product:         restTrade.product         || '',
          instrumentType:  restTrade.instrumentType  || '',
          side:            restTrade.transactionType || restTrade.side || '',
          transactionType: restTrade.transactionType || restTrade.side || '',
          quantity:        restTrade.quantity        || 0,
          price:           restTrade.price           || 0,
          tradeValue:      restTrade.tradeValue      || 0,
          tradeDate:       restTrade.tradeDate       || restTrade.trade_date  || '',
          tradeTime:       restTrade.tradeTime       || restTrade.trade_time  || '',
          timestamp:       restTrade.timestamp       || '',
          status:          'COMPLETE',
          processedFrom:   'REST_SYNC',
        });

        newTrades.push(trade);
        inserted++;
      } catch (err) {
        console.error(`[TradeExecutionService] Error syncing trade ${tradeId}:`, err.message);
      }
    }

    if (newTrades.length > 0) {
      this.emit('restTradesSynchronized', {
        brokerId,
        count:     newTrades.length,
        trades:    newTrades,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`[TradeExecutionService] REST sync for ${brokerId}: ${inserted} new, ${duplicates} duplicates.`);
    return { inserted, duplicates };
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Get all persisted trades for a broker.
   * Always reads from DB (source of truth); memory cache is best-effort.
   */
  getTradesByBroker(brokerId) {
    return db.getTrades(brokerId);
  }

  /** Get trades for a specific order (all partial fills included). */
  getTradesByOrder(orderId) {
    // Try memory first for current-session data, fall back to a DB scan
    // across all brokers for that order.
    const rows = db.db
      .prepare('SELECT * FROM trades WHERE broker_order_id = ? ORDER BY trade_timestamp ASC')
      .all(orderId)
      .map(r => db._rowToTrade(r));
    return rows;
  }

  /** Get today's trades for a broker. */
  getTradesToday(brokerId) {
    return db.getTradesToday(brokerId);
  }

  getPartialFillStatus(orderId) {
    return this.partialFills.get(orderId) || null;
  }

  /** Get a single trade by tradeId. */
  getTrade(tradeId) {
    return this.trades.get(tradeId) || null;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _makeExecutionId(brokerId, orderId, tradeId) {
    return `${brokerId}:${orderId}:${tradeId}`;
  }

  /**
   * Build (or update) the in-memory trade object.
   * For partial fills the SAME tradeId maps to multiple executions,
   * so we accumulate quantity and recalculate the weighted average price.
   */
  _buildTrade(brokerId, execution, executionId, isPartialFill) {
    const tradeId = execution.tradeId || execution.trade_id || executionId;

    const existing = this.trades.get(tradeId);

    if (existing) {
      // Partial fill: accumulate
      const prevTotal = existing.quantity * existing.price;
      const thisTotal = execution.quantity * execution.price;
      existing.quantity    += execution.quantity;
      existing.price        = (prevTotal + thisTotal) / existing.quantity;
      existing.tradeValue   = existing.quantity * existing.price;
      existing.isPartialFill = isPartialFill;
      existing.updatedAt    = new Date().toISOString();
      existing.executions   = existing.executions || [];
      existing.executions.push({ executionId, quantity: execution.quantity, price: execution.price });
      return existing;
    }

    return {
      tradeId,
      brokerId,
      orderId:         execution.orderId  || '',
      symbol:          execution.symbol   || '',
      exchange:        execution.exchange || '',
      segment:         execution.segment  || '',
      product:         execution.product  || '',
      instrumentType:  execution.instrumentType  || '',
      transactionType: execution.transactionType || execution.side || '',
      side:            execution.transactionType || execution.side || '',
      quantity:        execution.quantity || 0,
      price:           execution.price    || 0,
      tradeValue:      execution.tradeValue || (execution.quantity * execution.price) || 0,
      isPartialFill,
      tradeDate:       execution.tradeDate  || new Date().toISOString().split('T')[0],
      tradeTime:       execution.tradeTime  || new Date().toISOString().split('T')[1],
      timestamp:       execution.timestamp  || new Date().toISOString(),
      time:            execution.tradeTime  || new Date().toISOString().split('T')[1],
      status:          execution.status     || 'COMPLETE',
      executions:      [{ executionId, quantity: execution.quantity, price: execution.price }],
      metadata:        { processedFrom: execution.processedFrom || 'WEBSOCKET' },
      createdAt:       new Date().toISOString(),
      updatedAt:       new Date().toISOString(),
    };
  }

  _checkPartialFill(orderId, execution) {
    let state = this.partialFills.get(orderId);

    if (!state) {
      state = {
        orderId,
        totalQuantity:  execution.totalQuantity || execution.quantity || 0,
        filledQuantity: 0,
        executions:     [],
        isComplete:     false,
      };
      this.partialFills.set(orderId, state);
    }

    state.filledQuantity += (execution.quantity || 0);
    state.executions.push({
      tradeId:   execution.tradeId   || '',
      quantity:  execution.quantity  || 0,
      price:     execution.price     || 0,
      timestamp: execution.timestamp || new Date().toISOString(),
    });

    state.isComplete = state.filledQuantity >= state.totalQuantity;
    return !state.isComplete || state.executions.length > 1;
  }

  _rebuildPartialFill(orderId, trade) {
    let state = this.partialFills.get(orderId);
    if (!state) {
      state = { orderId, totalQuantity: trade.quantity, filledQuantity: 0, executions: [], isComplete: false };
      this.partialFills.set(orderId, state);
    }
    state.filledQuantity += trade.quantity;
    state.executions.push({ tradeId: trade.tradeId, quantity: trade.quantity, price: trade.price });
  }

  /** Periodic cleanup: remove in-memory executions older than 48 h. */
  cleanupOldExecutions() {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    for (const [id, exec] of this.executions) {
      if (new Date(exec.processedAt).getTime() < cutoff) {
        this.executions.delete(id);
        this.processedExecutions.delete(id);
      }
    }
  }
}

export const tradeExecutionService = new TradeExecutionService();
