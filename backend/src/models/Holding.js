/**
 * Holding Model
 * Normalized holdings (long-term delivery positions) data structure
 * All broker-specific holdings data must be transformed to this format
 */

export class Holding {
  constructor(data = {}) {
    this.symbol = data.symbol || '';                   // Trading symbol
    this.tradingSymbol = data.tradingSymbol || '';     // Full trading symbol
    this.isin = data.isin || '';                       // ISIN code
    this.exchange = data.exchange || '';               // NSE, BSE
    this.quantity = data.quantity || 0;                // Total quantity
    this.t1Quantity = data.t1Quantity || 0;            // T+1 quantity
    this.authorizedQuantity = data.authorizedQuantity || 0; // Available for sale
    this.collateralQuantity = data.collateralQuantity || 0; // Pledged quantity
    this.averagePrice = data.averagePrice || 0;        // Average buy price
    this.lastPrice = data.lastPrice || 0;              // Current market price
    this.closePrice = data.closePrice || 0;            // Previous day close
    this.pnl = data.pnl || 0;                          // Overall P&L
    this.dayPnl = data.dayPnl || 0;                    // Today's P&L
    this.pnlPercent = data.pnlPercent || 0;            // P&L percentage
    this.investedValue = data.investedValue || 0;      // Total invested
    this.currentValue = data.currentValue || 0;        // Current market value
    this.metadata = data.metadata || {};               // Broker-specific data
  }

  toJSON() {
    return {
      symbol: this.symbol,
      tradingSymbol: this.tradingSymbol,
      isin: this.isin,
      exchange: this.exchange,
      quantity: this.quantity,
      t1Quantity: this.t1Quantity,
      authorizedQuantity: this.authorizedQuantity,
      collateralQuantity: this.collateralQuantity,
      averagePrice: this.averagePrice,
      lastPrice: this.lastPrice,
      closePrice: this.closePrice,
      pnl: this.pnl,
      dayPnl: this.dayPnl,
      pnlPercent: this.pnlPercent,
      investedValue: this.investedValue,
      currentValue: this.currentValue,
      metadata: this.metadata,
    };
  }

  isValid() {
    return !!(this.symbol && this.exchange && this.quantity > 0);
  }
}
