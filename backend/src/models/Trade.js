/**
 * Trade Model
 * Normalized trade history data structure
 * All broker-specific trade data must be transformed to this format
 */

export class Trade {
  constructor(data = {}) {
    this.tradeId = data.tradeId || '';                 // Unique trade ID
    this.orderId = data.orderId || '';                 // Related order ID
    this.symbol = data.symbol || '';                   // Trading symbol
    this.tradingSymbol = data.tradingSymbol || '';     // Full trading symbol
    this.exchange = data.exchange || '';               // NSE, BSE, MCX
    this.segment = data.segment || '';                 // EQUITY, DERIVATIVE
    this.product = data.product || '';                 // CNC, MIS, NRML
    this.instrumentType = data.instrumentType || '';   // EQ, FUT, CE, PE
    this.transactionType = data.transactionType || ''; // BUY, SELL
    this.quantity = data.quantity || 0;                // Trade quantity
    this.price = data.price || 0;                      // Trade price
    this.tradeValue = data.tradeValue || 0;            // Total trade value
    this.tradeDate = data.tradeDate || '';             // Trade date
    this.tradeTime = data.tradeTime || '';             // Trade time
    this.timestamp = data.timestamp || '';             // Full timestamp
    this.metadata = data.metadata || {};               // Broker-specific data
  }

  toJSON() {
    return {
      tradeId: this.tradeId,
      orderId: this.orderId,
      symbol: this.symbol,
      tradingSymbol: this.tradingSymbol,
      exchange: this.exchange,
      segment: this.segment,
      product: this.product,
      instrumentType: this.instrumentType,
      transactionType: this.transactionType,
      quantity: this.quantity,
      price: this.price,
      tradeValue: this.tradeValue,
      tradeDate: this.tradeDate,
      tradeTime: this.tradeTime,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }

  isValid() {
    return !!(this.tradeId && this.symbol && this.exchange && this.quantity > 0);
  }
}
