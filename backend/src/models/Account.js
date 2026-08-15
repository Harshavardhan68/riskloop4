/**
 * Account Model
 * Normalized account/profile data structure
 * All broker-specific data must be transformed to this format
 */

export class Account {
  constructor(data = {}) {
    this.brokerId = data.brokerId || '';           // Internal broker identifier
    this.brokerName = data.brokerName || '';       // Display name
    this.userId = data.userId || '';               // Broker's user ID
    this.clientId = data.clientId || '';           // Broker's client code
    this.name = data.name || '';                   // User's full name
    this.email = data.email || '';                 // Email address
    this.mobile = data.mobile || '';               // Mobile number
    this.pan = data.pan || '';                     // PAN card number (masked)
    this.exchanges = data.exchanges || [];         // ['NSE', 'BSE', 'MCX', etc.]
    this.segments = data.segments || [];           // ['EQUITY', 'DERIVATIVE', 'COMMODITY']
    this.products = data.products || [];           // ['CNC', 'MIS', 'NRML', etc.]
    this.accountStatus = data.accountStatus || ''; // 'ACTIVE', 'SUSPENDED', etc.
    this.connectedAt = data.connectedAt || new Date().toISOString();
    this.metadata = data.metadata || {};           // Broker-specific additional data
  }

  toJSON() {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      userId: this.userId,
      clientId: this.clientId,
      name: this.name,
      email: this.email,
      mobile: this.mobile,
      pan: this.pan,
      exchanges: this.exchanges,
      segments: this.segments,
      products: this.products,
      accountStatus: this.accountStatus,
      connectedAt: this.connectedAt,
      metadata: this.metadata,
    };
  }

  isValid() {
    return !!(this.brokerId && this.userId && this.name);
  }
}
