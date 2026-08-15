/**
 * Funds Model
 * Normalized funds/margin data structure
 * All broker-specific funds data must be transformed to this format
 */

export class Funds {
  constructor(data = {}) {
    this.segment = data.segment || 'EQUITY';           // EQUITY, COMMODITY, etc.
    this.availableMargin = data.availableMargin || 0;  // Available cash/margin
    this.usedMargin = data.usedMargin || 0;            // Used margin
    this.totalMargin = data.totalMargin || 0;          // Total margin (available + used)
    this.openingBalance = data.openingBalance || 0;    // Opening balance
    this.netBalance = data.netBalance || 0;            // Net available balance
    this.realizedPnl = data.realizedPnl || 0;          // Today's realized P&L
    this.unrealizedPnl = data.unrealizedPnl || 0;      // Today's unrealized P&L
    this.marginUsed = data.marginUsed || 0;            // Margin blocked
    this.collateral = data.collateral || 0;            // Collateral value
    this.payinAmount = data.payinAmount || 0;          // Amount to be paid in
    this.payoutAmount = data.payoutAmount || 0;        // Amount to be paid out
    this.adhocMargin = data.adhocMargin || 0;          // Additional margin
    this.exposureMargin = data.exposureMargin || 0;    // Exposure margin
    this.spanMargin = data.spanMargin || 0;            // SPAN margin
    this.deliveryMargin = data.deliveryMargin || 0;    // Delivery margin
    this.timestamp = data.timestamp || new Date().toISOString();
    this.metadata = data.metadata || {};               // Broker-specific data
  }

  toJSON() {
    return {
      segment: this.segment,
      availableMargin: this.availableMargin,
      usedMargin: this.usedMargin,
      totalMargin: this.totalMargin,
      openingBalance: this.openingBalance,
      netBalance: this.netBalance,
      realizedPnl: this.realizedPnl,
      unrealizedPnl: this.unrealizedPnl,
      marginUsed: this.marginUsed,
      collateral: this.collateral,
      payinAmount: this.payinAmount,
      payoutAmount: this.payoutAmount,
      adhocMargin: this.adhocMargin,
      exposureMargin: this.exposureMargin,
      spanMargin: this.spanMargin,
      deliveryMargin: this.deliveryMargin,
      timestamp: this.timestamp,
      metadata: this.metadata,
    };
  }

  isValid() {
    return this.totalMargin >= 0;
  }

  getUtilizationPercent() {
    if (this.totalMargin === 0) return 0;
    return ((this.usedMargin / this.totalMargin) * 100).toFixed(2);
  }
}
