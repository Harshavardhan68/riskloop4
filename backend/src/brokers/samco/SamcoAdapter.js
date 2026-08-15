/**
 * SAMCO Broker Adapter
 * Placeholder implementation - To be implemented in later phase
 * 
 * Official Docs: https://developers.stocknote.com/
 */

import { BaseBrokerAdapter } from '../BaseBrokerAdapter.js';
import { Account, Funds } from '../../models/index.js';

export class SamcoAdapter extends BaseBrokerAdapter {
  constructor(config = {}) {
    super({
      brokerId: 'samco',
      brokerName: 'SAMCO',
      ...config,
    });
    
    this.userId = config.userId || process.env.SAMCO_USER_ID;
    this.password = config.password || process.env.SAMCO_PASSWORD;
    this.baseUrl = 'https://api.stocknote.com';
  }

  async connect(credentials = {}) {
    this._log('TODO: Implement SAMCO connection');
    this.isConnected = false;
    return this.isConnected;
  }

  async getProfile() {
    this._log('TODO: Implement SAMCO profile API');
    return new Account({
      brokerId: 'samco',
      brokerName: 'SAMCO',
      userId: 'PLACEHOLDER',
      name: 'Not Implemented',
      accountStatus: 'NOT_CONNECTED',
    });
  }

  async getFunds() {
    this._log('TODO: Implement SAMCO funds API');
    return new Funds({});
  }

  async getPositions() {
    this._log('TODO: Implement SAMCO positions API');
    return [];
  }

  async getOrders() {
    this._log('TODO: Implement SAMCO orders API');
    return [];
  }

  async getHoldings() {
    this._log('TODO: Implement SAMCO holdings API');
    return [];
  }

  async getTradeHistory() {
    this._log('TODO: Implement SAMCO trade history API');
    return [];
  }

  async getQuotes(symbols) {
    this._log('TODO: Implement SAMCO quotes API', symbols);
    return [];
  }
}
