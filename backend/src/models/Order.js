/**
 * Order Model
 * Normalized order data structure
 * All broker-specific order data must be transformed to this format
 */

export class Order {
  constructor(data = {}) {
    this.orderId = data.orderId || '';                 // Broker's order ID
    this.orderTag = data.orderTag || '';               // User-defined tag
    this.symbol = data.symbol || '';                   // Trading symbol
    this.tradingSymbol = data.tradingSymbol || '';     // Full trading symbol
    this.exchange = data.exchange || '';               // NSE, BSE, MCX, etc.
    this.segment = data.segment || '';                 // EQUITY, DERIVATIVE, etc.
    this.product = data.product || '';                 // CNC, MIS, NRML, etc.
    this.instrumentType = data.instrumentType || '';   // EQ, FUT, CE, PE
    this.orderType = data.orderType || '';             // MARKET, LIMIT, SL, SL-M
    this.transactionType = data.transactionType || ''; // BUY, SELL
    this.quantity = data.quantity || 0;                // Order quantity
    this.filledQuantity = data.filledQuantity || 0;    // Filled quantity
    this.pendingQuantity = data.pendingQuantity || 0;  // Pending quantity
    this.cancelledQuantity = data.cancelledQuantity || 0; // Cancelled quantity
    this.price = data.price || 0;                      // Order price
    this.triggerPrice = data.triggerPrice || 0;        // Stop-loss trigger price
    this.averagePrice = data.averagePrice || 0;        // Average filled price
    this.status = data.status || '';                   // PENDING, OPEN, COMPLETE, REJECTED, CANCELLED
    this.statusMessage = data.statusMessage || '';     // Status description
    this.validity = data.validity || 'DAY';            // DAY, IOC, GTT
    this.variety = data.variety || 'REGULAR';          // REGULAR, AMO, CO, BO
    this.orderTimestamp = data.orderTimestamp || '';   // Order placed time
    this.updateTimestamp = data.updateTimestamp || ''; // Last update time
    this.lotSize = data.lotSize || 1;                  // Contract lot size
    this.metadata = data.metadata || {};               // Broker-specific data
  }

  toJSON() {
    return {
      orderId: this.orderId,
      orderTag: this.orderTag,
      symbol: this.symbol,
      tradingSymbol: this.tradingSymbol,
      exchange: this.exchange,
      segment: this.segment,
      product: this.product,
      instrumentType: this.instrumentType,
      orderType: this.orderType,
      transactionType: this.transactionType,
      quantity: this.quantity,
      filledQuantity: this.filledQuantity,
      pendingQuantity: this.pendingQuantity,
      cancelledQuantity: this.cancelledQuantity,
      price: this.price,
      triggerPrice: this.triggerPrice,
      averagePrice: this.averagePrice,
      status: this.status,
      statusMessage: this.statusMessage,
      validity: this.validity,
      variety: this.variety,
      orderTimestamp: this.orderTimestamp,
      updateTimestamp: this.updateTimestamp,
      lotSize: this.lotSize,
      metadata: this.metadata,
    };
  }

  isValid() {
    return !!(this.orderId && this.symbol && this.exchange && this.transactionType);
  }

  isPending() {
    return ['PENDING', 'OPEN', 'TRIGGER_PENDING'].includes(this.status);
  }

  isCompleted() {
    return this.status === 'COMPLETE';
  }

  isRejected() {
    return this.status === 'REJECTED';
  }

  isCancelled() {
    return this.status === 'CANCELLED';
  }
}
