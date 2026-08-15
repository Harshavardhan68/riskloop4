/**
 * Quote Model
 * Normalized market quote/LTP data structure
 * All broker-specific quote data must be transformed to this format
 */

export class Quote {
  constructor(data = {}) {
    this.symbol = data.symbol || '';                   // Trading symbol
    this.tradingSymbol = data.tradingSymbol || '';     // Full trading symbol
    this.exchange = data.exchange || '';               // NSE, BSE, MCX
    this.segment = data.segment || '';                 // EQUITY, DERIVATIVE, etc.
    this.instrumentType = data.instrumentType || '';   // EQ, FUT, CE, PE
    this.ltp = data.ltp || 0;                          // Last traded price
    this.open = data.open || 0;                        // Open price
    this.high = data.high || 0;                        // Day high
    this.low = data.low || 0;                          // Day low
    this.close = data.close || 0;                      // Previous day close
    this.change = data.change || 0;                    // Price change
    this.changePercent = data.changePercent || 0;      // % change
    this.volume = data.volume || 0;                    // Total volume
    this.bidPrice = data.bidPrice || 0;                // Best bid price
    this.bidQty = data.bidQty || 0;                    // Best bid quantity
    this.askPrice = data.askPrice || 0;                // Best ask price
    this.askQty = data.askQty || 0;                    // Best ask quantity
    this.totalBuyQty = data.totalBuyQty || 0;          // Total buy quantity
    this.totalSellQty = data.totalSellQty || 0;        // Total sell quantity
    this.upperCircuit = data.upperCircuit || 0;        // Upper circuit limit
    this.lowerCircuit = data.lowerCircuit || 0;        // Lower circuit limit
    this.lotSize = data.lotSize || 1;                  // Contract lot size
    this.tickSize = data.tickSize || 0.05;             // Tick size
    this.timestamp = data.timestamp || new Date().toISOString();
    this.metadata = data.metadata || {};               // Broker-specific data
  }

  toJSON() {
    return {
      symbol: this.symbol,
      tradingSymbol: this.tradingSymbol,
      exchange: this.exchange,
      segment: this.segment,
      instrumentType: this.instrumentType,
      ltp: this.ltp,
      open: this.open,
      high: this.high,
      low: this.low,
      close: this.close,
      change: this.change,
      changePercent: this.changePercent,
      volume: this.volume,
      bidPrice: this.bidPrice,
      bidQty: this.bidQty,
      askPrice: this.askPrice,
      askQty: this.askQty,
      totalBuyQty: this.totalBuyQty,
      totalSellQty: this.totalSellQty,
      upperCircuit: this.upperCircuit,
      lowerCircuit: this.lowerCircuit,
      lotSize: this.lotSize,
      tickSize: this.tickSize,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }

  isValid() {
    return !!(this.symbol && this.exchange && this.ltp > 0);
  }
}
