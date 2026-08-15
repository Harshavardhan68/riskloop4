/**
 * DatabaseService
 * SQLite persistence layer using Node.js built-in node:sqlite (Node 22+).
 *
 * Stores: orders, trades (broker-confirmed executions only),
 *         positions, holdings.
 *
 * SECURITY:  No API keys, tokens, passwords or secrets are stored here.
 *            Only trading data is persisted.
 *
 * TRADE RULE: A row in `trades` represents a broker-confirmed fill only.
 *             An entry in `orders` is never automatically promoted to a trade.
 *             The UNIQUE constraint on (broker_id, broker_trade_id) in `trades`
 *             enforces duplicate-execution prevention at the database level.
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Database file lives at backend/data/riskloop.db
const DATA_DIR = join(__dirname, '..', '..', 'data');
const DB_PATH  = join(DATA_DIR, 'riskloop.db');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Open the database file and apply the full schema.
   * Safe to call multiple times (idempotent CREATE IF NOT EXISTS).
   */
  initialize() {
    if (this.db) return; // already open

    // Ensure the data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    this.db = new DatabaseSync(DB_PATH);

    // WAL mode for better concurrent read performance
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA foreign_keys = ON;');

    this._applySchema();

    console.log(`[DatabaseService] Opened database at ${DB_PATH}`);
  }

  /** Close the database (called on graceful shutdown). */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[DatabaseService] Database closed.');
    }
  }

  // ── Schema ───────────────────────────────────────────────────────────────

  _applySchema() {
    // ── orders ──────────────────────────────────────────────────────────
    // An order is placed but NOT a trade until the broker confirms a fill.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        broker_id           TEXT    NOT NULL,
        broker_order_id     TEXT    NOT NULL,
        symbol              TEXT    NOT NULL,
        exchange            TEXT    NOT NULL DEFAULT '',
        segment             TEXT    NOT NULL DEFAULT '',
        product             TEXT    NOT NULL DEFAULT '',
        order_type          TEXT    NOT NULL DEFAULT '',
        transaction_type    TEXT    NOT NULL DEFAULT '',
        quantity            INTEGER NOT NULL DEFAULT 0,
        filled_quantity     INTEGER NOT NULL DEFAULT 0,
        pending_quantity    INTEGER NOT NULL DEFAULT 0,
        cancelled_quantity  INTEGER NOT NULL DEFAULT 0,
        price               REAL    NOT NULL DEFAULT 0,
        trigger_price       REAL    NOT NULL DEFAULT 0,
        average_price       REAL    NOT NULL DEFAULT 0,
        status              TEXT    NOT NULL DEFAULT 'PENDING',
        status_message      TEXT    NOT NULL DEFAULT '',
        validity            TEXT    NOT NULL DEFAULT 'DAY',
        variety             TEXT    NOT NULL DEFAULT 'NORMAL',
        order_timestamp     TEXT    NOT NULL DEFAULT '',
        update_timestamp    TEXT    NOT NULL DEFAULT '',
        raw_json            TEXT    NOT NULL DEFAULT '{}',
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at          TEXT    NOT NULL DEFAULT (datetime('now')),

        -- One broker_order_id per broker — prevents double-insert
        UNIQUE (broker_id, broker_order_id)
      );
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_orders_broker
        ON orders (broker_id, status);
    `);

    // ── trades ───────────────────────────────────────────────────────────
    // A trade row = ONE broker-confirmed fill/execution.
    // Partial fills create multiple rows all referencing the same broker_order_id.
    // UNIQUE (broker_id, broker_trade_id) is the hard duplicate-prevention guard.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trades (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        broker_id           TEXT    NOT NULL,
        broker_trade_id     TEXT    NOT NULL,   -- broker's fill/execution ID
        broker_order_id     TEXT    NOT NULL,   -- parent order ID
        symbol              TEXT    NOT NULL,
        exchange            TEXT    NOT NULL DEFAULT '',
        segment             TEXT    NOT NULL DEFAULT '',
        product             TEXT    NOT NULL DEFAULT '',
        instrument_type     TEXT    NOT NULL DEFAULT '',
        transaction_type    TEXT    NOT NULL DEFAULT '',
        quantity            INTEGER NOT NULL DEFAULT 0,
        price               REAL    NOT NULL DEFAULT 0,
        trade_value         REAL    NOT NULL DEFAULT 0,
        is_partial_fill     INTEGER NOT NULL DEFAULT 0,  -- 0=false 1=true
        trade_date          TEXT    NOT NULL DEFAULT '',
        trade_time          TEXT    NOT NULL DEFAULT '',
        trade_timestamp     TEXT    NOT NULL DEFAULT '',
        raw_json            TEXT    NOT NULL DEFAULT '{}',
        created_at          TEXT    NOT NULL DEFAULT (datetime('now')),

        -- Core duplicate-prevention constraint
        UNIQUE (broker_id, broker_trade_id)
      );
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_trades_broker
        ON trades (broker_id, broker_order_id);
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_trades_date
        ON trades (broker_id, trade_date);
    `);

    // ── positions ────────────────────────────────────────────────────────
    // Snapshot from broker — refreshed on every sync.
    // One row per (broker_id, symbol, product).
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS positions (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        broker_id        TEXT    NOT NULL,
        symbol           TEXT    NOT NULL,
        exchange         TEXT    NOT NULL DEFAULT '',
        product          TEXT    NOT NULL DEFAULT '',
        quantity         INTEGER NOT NULL DEFAULT 0,
        overnight_qty    INTEGER NOT NULL DEFAULT 0,
        average_price    REAL    NOT NULL DEFAULT 0,
        ltp              REAL    NOT NULL DEFAULT 0,
        pnl              REAL    NOT NULL DEFAULT 0,
        realised_pnl     REAL    NOT NULL DEFAULT 0,
        unrealised_pnl   REAL    NOT NULL DEFAULT 0,
        raw_json         TEXT    NOT NULL DEFAULT '{}',
        updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),

        UNIQUE (broker_id, symbol, product)
      );
    `);

    // ── holdings ─────────────────────────────────────────────────────────
    // Long-term delivery holdings — refreshed on every sync.
    // One row per (broker_id, symbol).
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS holdings (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        broker_id        TEXT    NOT NULL,
        symbol           TEXT    NOT NULL,
        exchange         TEXT    NOT NULL DEFAULT '',
        quantity         INTEGER NOT NULL DEFAULT 0,
        average_price    REAL    NOT NULL DEFAULT 0,
        ltp              REAL    NOT NULL DEFAULT 0,
        pnl              REAL    NOT NULL DEFAULT 0,
        raw_json         TEXT    NOT NULL DEFAULT '{}',
        updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),

        UNIQUE (broker_id, symbol)
      );
    `);

    console.log('[DatabaseService] Schema applied.');
  }

  // ── Orders ───────────────────────────────────────────────────────────────

  /**
   * Upsert an order row.
   * INSERT OR REPLACE semantics: safe to call on every broker sync.
   */
  upsertOrder(brokerId, order) {
    const stmt = this.db.prepare(`
      INSERT INTO orders (
        broker_id, broker_order_id, symbol, exchange, segment, product,
        order_type, transaction_type, quantity, filled_quantity,
        pending_quantity, cancelled_quantity, price, trigger_price,
        average_price, status, status_message, validity, variety,
        order_timestamp, update_timestamp, raw_json, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, datetime('now')
      )
      ON CONFLICT (broker_id, broker_order_id) DO UPDATE SET
        filled_quantity    = excluded.filled_quantity,
        pending_quantity   = excluded.pending_quantity,
        cancelled_quantity = excluded.cancelled_quantity,
        average_price      = excluded.average_price,
        status             = excluded.status,
        status_message     = excluded.status_message,
        update_timestamp   = excluded.update_timestamp,
        raw_json           = excluded.raw_json,
        updated_at         = datetime('now')
    `);

    stmt.run(
      brokerId,
      order.orderId       || order.broker_order_id || '',
      order.symbol        || '',
      order.exchange      || '',
      order.segment       || '',
      order.product       || '',
      order.orderType     || order.order_type || '',
      order.transactionType || order.transaction_type || '',
      order.quantity      || 0,
      order.filledQuantity   || order.filled_quantity   || 0,
      order.pendingQuantity  || order.pending_quantity  || 0,
      order.cancelledQuantity || order.cancelled_quantity || 0,
      order.price         || 0,
      order.triggerPrice  || order.trigger_price || 0,
      order.averagePrice  || order.average_price || 0,
      order.status        || 'PENDING',
      order.statusMessage || order.status_message || '',
      order.validity      || 'DAY',
      order.variety       || 'NORMAL',
      order.orderTimestamp  || order.order_timestamp  || '',
      order.updateTimestamp || order.update_timestamp || '',
      JSON.stringify(order.metadata || order.raw_json || {})
    );
  }

  /** Save a batch of orders (wraps in a transaction for speed). */
  upsertOrders(brokerId, orders) {
    const tx = this.db.prepare('BEGIN');
    const commit = this.db.prepare('COMMIT');
    tx.run();
    try {
      for (const o of orders) {
        this.upsertOrder(brokerId, o);
      }
      commit.run();
    } catch (err) {
      this.db.prepare('ROLLBACK').run();
      throw err;
    }
  }

  /** Return all orders for a broker, newest first. */
  getOrders(brokerId) {
    return this.db
      .prepare('SELECT * FROM orders WHERE broker_id = ? ORDER BY created_at DESC')
      .all(brokerId)
      .map(r => this._rowToOrder(r));
  }

  /** Return orders by status. */
  getOrdersByStatus(brokerId, status) {
    return this.db
      .prepare('SELECT * FROM orders WHERE broker_id = ? AND status = ? ORDER BY created_at DESC')
      .all(brokerId, status)
      .map(r => this._rowToOrder(r));
  }

  // ── Trades ───────────────────────────────────────────────────────────────

  /**
   * Insert a confirmed execution as a trade.
   * Returns true if inserted, false if duplicate (already existed).
   *
   * IMPORTANT: only call this when the broker has confirmed execution.
   */
  insertTrade(brokerId, trade) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO trades (
          broker_id, broker_trade_id, broker_order_id, symbol, exchange,
          segment, product, instrument_type, transaction_type,
          quantity, price, trade_value, is_partial_fill,
          trade_date, trade_time, trade_timestamp, raw_json
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?
        )
      `);

      const tradeId    = trade.tradeId     || trade.broker_trade_id || '';
      const orderId    = trade.orderId     || trade.broker_order_id || '';
      const qty        = trade.quantity    || 0;
      const price      = trade.price       || trade.averagePrice || 0;
      const tradeValue = trade.tradeValue  || (qty * price);

      stmt.run(
        brokerId,
        tradeId,
        orderId,
        trade.symbol          || '',
        trade.exchange        || '',
        trade.segment         || '',
        trade.product         || '',
        trade.instrumentType  || trade.instrument_type || '',
        trade.transactionType || trade.transaction_type || trade.side || '',
        qty,
        price,
        tradeValue,
        trade.isPartialFill   || trade.is_partial_fill ? 1 : 0,
        trade.tradeDate       || trade.trade_date  || new Date().toISOString().split('T')[0],
        trade.tradeTime       || trade.trade_time  || new Date().toISOString().split('T')[1],
        trade.timestamp       || trade.trade_timestamp || new Date().toISOString(),
        JSON.stringify(trade.metadata || {})
      );

      return true; // new row inserted

    } catch (err) {
      // UNIQUE constraint violation = duplicate — silently ignore
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        console.log(`[DatabaseService] Duplicate trade ignored: ${brokerId}:${trade.tradeId || trade.broker_trade_id}`);
        return false;
      }
      throw err;
    }
  }

  /** Insert a batch of trades, returns { inserted, duplicates } counts. */
  insertTrades(brokerId, trades) {
    let inserted = 0;
    let duplicates = 0;

    const beginStmt  = this.db.prepare('BEGIN');
    const commitStmt = this.db.prepare('COMMIT');
    beginStmt.run();
    try {
      for (const t of trades) {
        const ok = this.insertTrade(brokerId, t);
        ok ? inserted++ : duplicates++;
      }
      commitStmt.run();
    } catch (err) {
      this.db.prepare('ROLLBACK').run();
      throw err;
    }

    return { inserted, duplicates };
  }

  /** Return all trades for a broker, newest first. */
  getTrades(brokerId) {
    return this.db
      .prepare('SELECT * FROM trades WHERE broker_id = ? ORDER BY trade_timestamp DESC')
      .all(brokerId)
      .map(r => this._rowToTrade(r));
  }

  /** Return trades for a specific order. */
  getTradesByOrder(brokerId, brokerOrderId) {
    return this.db
      .prepare('SELECT * FROM trades WHERE broker_id = ? AND broker_order_id = ? ORDER BY trade_timestamp ASC')
      .all(brokerId, brokerOrderId)
      .map(r => this._rowToTrade(r));
  }

  /** Return trades for today only (trade_date = local YYYY-MM-DD). */
  getTradesToday(brokerId) {
    const today = new Date().toISOString().split('T')[0];
    return this.db
      .prepare('SELECT * FROM trades WHERE broker_id = ? AND trade_date = ? ORDER BY trade_timestamp ASC')
      .all(brokerId, today)
      .map(r => this._rowToTrade(r));
  }

  /** Check if a broker_trade_id already exists (fast duplicate check). */
  tradeExists(brokerId, brokerTradeId) {
    const row = this.db
      .prepare('SELECT 1 FROM trades WHERE broker_id = ? AND broker_trade_id = ? LIMIT 1')
      .get(brokerId, brokerTradeId);
    return row !== undefined;
  }

  // ── Positions ────────────────────────────────────────────────────────────

  /** Replace all positions for a broker in one transaction. */
  replacePositions(brokerId, positions) {
    const beginStmt  = this.db.prepare('BEGIN');
    const commitStmt = this.db.prepare('COMMIT');
    const deleteStmt = this.db.prepare('DELETE FROM positions WHERE broker_id = ?');

    beginStmt.run();
    try {
      deleteStmt.run(brokerId);
      for (const p of positions) {
        this._upsertPosition(brokerId, p);
      }
      commitStmt.run();
    } catch (err) {
      this.db.prepare('ROLLBACK').run();
      throw err;
    }
  }

  _upsertPosition(brokerId, pos) {
    this.db.prepare(`
      INSERT INTO positions (
        broker_id, symbol, exchange, product,
        quantity, overnight_qty, average_price, ltp,
        pnl, realised_pnl, unrealised_pnl, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (broker_id, symbol, product) DO UPDATE SET
        quantity        = excluded.quantity,
        overnight_qty   = excluded.overnight_qty,
        average_price   = excluded.average_price,
        ltp             = excluded.ltp,
        pnl             = excluded.pnl,
        realised_pnl    = excluded.realised_pnl,
        unrealised_pnl  = excluded.unrealised_pnl,
        raw_json        = excluded.raw_json,
        updated_at      = datetime('now')
    `).run(
      brokerId,
      pos.symbol        || '',
      pos.exchange      || '',
      pos.product       || '',
      pos.quantity      || 0,
      pos.overnightQuantity || pos.overnight_qty || 0,
      pos.averagePrice  || pos.average_price || 0,
      pos.ltp           || 0,
      pos.pnl           || 0,
      pos.realisedPnl   || pos.realised_pnl   || 0,
      pos.unrealisedPnl || pos.unrealised_pnl || 0,
      JSON.stringify(pos.metadata || {})
    );
  }

  getPositions(brokerId) {
    return this.db
      .prepare('SELECT * FROM positions WHERE broker_id = ? ORDER BY symbol ASC')
      .all(brokerId)
      .map(r => this._rowToPosition(r));
  }

  // ── Holdings ─────────────────────────────────────────────────────────────

  /** Replace all holdings for a broker in one transaction. */
  replaceHoldings(brokerId, holdings) {
    const beginStmt  = this.db.prepare('BEGIN');
    const commitStmt = this.db.prepare('COMMIT');
    const deleteStmt = this.db.prepare('DELETE FROM holdings WHERE broker_id = ?');

    beginStmt.run();
    try {
      deleteStmt.run(brokerId);
      for (const h of holdings) {
        this._upsertHolding(brokerId, h);
      }
      commitStmt.run();
    } catch (err) {
      this.db.prepare('ROLLBACK').run();
      throw err;
    }
  }

  _upsertHolding(brokerId, holding) {
    this.db.prepare(`
      INSERT INTO holdings (
        broker_id, symbol, exchange, quantity,
        average_price, ltp, pnl, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT (broker_id, symbol) DO UPDATE SET
        quantity      = excluded.quantity,
        average_price = excluded.average_price,
        ltp           = excluded.ltp,
        pnl           = excluded.pnl,
        raw_json      = excluded.raw_json,
        updated_at    = datetime('now')
    `).run(
      brokerId,
      holding.symbol        || '',
      holding.exchange      || '',
      holding.quantity      || 0,
      holding.averagePrice  || holding.average_price || 0,
      holding.ltp           || 0,
      holding.pnl           || 0,
      JSON.stringify(holding.metadata || {})
    );
  }

  getHoldings(brokerId) {
    return this.db
      .prepare('SELECT * FROM holdings WHERE broker_id = ? ORDER BY symbol ASC')
      .all(brokerId)
      .map(r => this._rowToHolding(r));
  }

  // ── Row mappers ──────────────────────────────────────────────────────────

  _rowToOrder(r) {
    let meta = {};
    try { meta = JSON.parse(r.raw_json); } catch (_) {}
    return {
      orderId:           r.broker_order_id,
      symbol:            r.symbol,
      exchange:          r.exchange,
      segment:           r.segment,
      product:           r.product,
      orderType:         r.order_type,
      transactionType:   r.transaction_type,
      side:              r.transaction_type,
      quantity:          r.quantity,
      filledQuantity:    r.filled_quantity,
      pendingQuantity:   r.pending_quantity,
      cancelledQuantity: r.cancelled_quantity,
      price:             r.price,
      triggerPrice:      r.trigger_price,
      averagePrice:      r.average_price,
      status:            r.status,
      statusMessage:     r.status_message,
      validity:          r.validity,
      variety:           r.variety,
      orderTimestamp:    r.order_timestamp,
      updateTimestamp:   r.update_timestamp,
      metadata:          meta,
      _dbId:             r.id,
      _source:           'db',
    };
  }

  _rowToTrade(r) {
    let meta = {};
    try { meta = JSON.parse(r.raw_json); } catch (_) {}
    return {
      tradeId:         r.broker_trade_id,
      orderId:         r.broker_order_id,
      symbol:          r.symbol,
      exchange:        r.exchange,
      segment:         r.segment,
      product:         r.product,
      instrumentType:  r.instrument_type,
      transactionType: r.transaction_type,
      side:            r.transaction_type,
      quantity:        r.quantity,
      price:           r.price,
      tradeValue:      r.trade_value,
      isPartialFill:   r.is_partial_fill === 1,
      tradeDate:       r.trade_date,
      tradeTime:       r.trade_time,
      timestamp:       r.trade_timestamp,
      time:            r.trade_time,
      metadata:        meta,
      _dbId:           r.id,
      _source:         'db',
    };
  }

  _rowToPosition(r) {
    let meta = {};
    try { meta = JSON.parse(r.raw_json); } catch (_) {}
    return {
      symbol:           r.symbol,
      exchange:         r.exchange,
      product:          r.product,
      quantity:         r.quantity,
      overnightQuantity: r.overnight_qty,
      averagePrice:     r.average_price,
      ltp:              r.ltp,
      pnl:              r.pnl,
      realisedPnl:      r.realised_pnl,
      unrealisedPnl:    r.unrealised_pnl,
      metadata:         meta,
      _source:          'db',
    };
  }

  _rowToHolding(r) {
    let meta = {};
    try { meta = JSON.parse(r.raw_json); } catch (_) {}
    return {
      symbol:       r.symbol,
      exchange:     r.exchange,
      quantity:     r.quantity,
      averagePrice: r.average_price,
      ltp:          r.ltp,
      pnl:          r.pnl,
      metadata:     meta,
      _source:      'db',
    };
  }
}

// Singleton
export const db = new DatabaseService();
