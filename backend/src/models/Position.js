/**
 * Position Model
 * Normalized position data structure
 * All broker-specific position data must be transformed to this format
 */

export class Position {
  constructor(data = {}) {
    this.positionId = data.positionId || '';           // Internal position ID
    this.symbol = data.symbol || '';                   // Trading symbol
    this.tradingSymbol = data.tradingSymbol || '';     // Full trading symbol with expiry
    this.exchange = data.exchange || '';               // NSE, BSE, MCX, etc.
    this.segment = data.segment || '';                 // EQUITY, DERIVATIVE, COMMODITY
    this.product = data.product || '';                 // CNC, MIS, NRML, etc.
    this.instrumentType = data.instrumentType || '';   // EQ, FUT, CE, PE
    this.quantity = data.quantity || 0;                // Current quantity (signed: +ve for long, -ve for short)
    this.buyQuantity = data.buyQuantity || 0;          // Total bought
    this.sellQuantity = data.sellQuantity || 0;        // Total sold
    this.buyPrice = data.buyPrice || 0;                // Average buy price
    this.sellPrice = data.sellPrice || 0;              // Average sell price
    this.lastPrice = data.lastPrice || 0;              // Current market price
    this.closePrice = data.closePrice || 0;            // Previous day close
    this.pnl = data.pnl || 0;                          // Realized + Unrealized P&L
    this.realizedPnl = data.realizedPnl || 0;          // Realized P&L
    this.unrealizedPnl = data.unrealizedPnl || 0;      // Unrealized P&L
    this.pnlPercent = data.pnlPercent || 0;            // P&L percentage
    this.lotSize = data.lotSize || 1;                  // Contract lot size (for F&O)
    this.multiplier = data.multiplier || 1;            // Price multiplier
    this.value = data.value || 0;                      // Position value
    this.investedValue = data.investedValue || 0;      // Total invested
    this.currentValue = data.currentValue || 0;        // Current market value
    this.metadata = data.metadata || {};               // Broker-specific data
  }

  toJSON() {
    return {
      positionId: this.positionId,
      symbol: this.symbol,
      tradingSymbol: this.tradingSymbol,
      exchange: this.exchange,
      segment: this.segment,
      product: this.product,
      instrumentType: this.instrumentType,
      quantity: this.quantity,
      buyQuantity: this.buyQuantity,
      sellQuantity: this.sellQuantity,
      buyPrice: this.buyPrice,
      sellPrice: this.sellPrice,
      lastPrice: this.lastPrice,
      closePrice: this.closePrice,
      pnl: this.pnl,
      realizedPnl: this.realizedPnl,
      unrealizedPnl: this.unrealizedPnl,
      pnlPercent: this.pnlPercent,
      lotSize: this.lotSize,
      multiplier: this.multiplier,
      value: this.value,
      investedValue: this.investedValue,
      currentValue: this.currentValue,
      metadata: this.metadata,
    };
  }

  isValid() {
    return !!(this.symbol && this.exchange && this.quantity !== 0);
  }

  isLong() {
    return this.quantity > 0;
  }

  isShort() {
    return this.quantity < 0;
  }
}
