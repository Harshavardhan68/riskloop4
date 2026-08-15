/**
 * Base Broker Adapter
 * Abstract class defining the common interface for all broker integrations
 * All broker adapters MUST extend this class and implement all methods
 */

import { Account, Position, Order, Funds, Holding, Quote, Trade } from '../models/index.js';

export class BaseBrokerAdapter {
  constructor(config = {}) {
    this.config = config;
    this.brokerId = config.brokerId || 'unknown';
    this.brokerName = config.brokerName || 'Unknown Broker';
    this.isConnected = false;
    this.sessionData = null;
  }

  /**
   * Get broker capabilities
   * Override this to mark unsupported features
   */
  getCapabilities() {
    return {
      profile: true,
      funds: true,
      positions: true,
      orders: true,
      holdings: true,
      quotes: true,
      tradeHistory: true,
      placeOrder: false,      // Disabled in Phase 1
      modifyOrder: false,     // Disabled in Phase 1
      cancelOrder: false,     // Disabled in Phase 1
    };
  }

  /**
   * Check if a capability is supported
   */
  supportsCapability(capability) {
    const capabilities = this.getCapabilities();
    return capabilities[capability] === true;
  }

  /**
   * Authenticate and establish connection with broker
   * @returns {Promise<boolean>}
   */
  async connect(credentials) {
    throw new Error(`${this.brokerName}: connect() not implemented`);
  }

  /**
   * Disconnect and cleanup session
   */
  async disconnect() {
    this.isConnected = false;
    this.sessionData = null;
  }

  /**
   * Get user profile/account details
   * @returns {Promise<Account>}
   */
  async getProfile() {
    if (!this.supportsCapability('profile')) {
      throw new Error(`${this.brokerName}: Profile fetching not supported`);
    }
    throw new Error(`${this.brokerName}: getProfile() not implemented`);
  }

  /**
   * Get available funds/margin
   * @returns {Promise<Funds>}
   */
  async getFunds() {
    if (!this.supportsCapability('funds')) {
      throw new Error(`${this.brokerName}: Funds fetching not supported`);
    }
    throw new Error(`${this.brokerName}: getFunds() not implemented`);
  }

  /**
   * Get current positions
   * @returns {Promise<Position[]>}
   */
  async getPositions() {
    if (!this.supportsCapability('positions')) {
      throw new Error(`${this.brokerName}: Positions fetching not supported`);
    }
    throw new Error(`${this.brokerName}: getPositions() not implemented`);
  }

  /**
   * Get orders (today or historical)
   * @returns {Promise<Order[]>}
   */
  async getOrders() {
    if (!this.supportsCapability('orders')) {
      throw new Error(`${this.brokerName}: Orders fetching not supported`);
    }
    throw new Error(`${this.brokerName}: getOrders() not implemented`);
  }

  /**
   * Get holdings (long-term delivery positions)
   * @returns {Promise<Holding[]>}
   */
  async getHoldings() {
    if (!this.supportsCapability('holdings')) {
      throw new Error(`${this.brokerName}: Holdings fetching not supported`);
    }
    throw new Error(`${this.brokerName}: getHoldings() not implemented`);
  }

  /**
   * Get trade history
   * @returns {Promise<Trade[]>}
   */
  async getTradeHistory() {
    if (!this.supportsCapability('tradeHistory')) {
      throw new Error(`${this.brokerName}: Trade history not supported`);
    }
    throw new Error(`${this.brokerName}: getTradeHistory() not implemented`);
  }

  /**
   * Get market quotes for symbols
   * @param {string[]} symbols - Array of trading symbols
   * @returns {Promise<Quote[]>}
   */
  async getQuotes(symbols) {
    if (!this.supportsCapability('quotes')) {
      throw new Error(`${this.brokerName}: Quotes fetching not supported`);
    }
    throw new Error(`${this.brokerName}: getQuotes() not implemented`);
  }

  /**
   * Place order (DISABLED IN PHASE 1)
   * @param {Object} orderParams
   * @returns {Promise<Order>}
   */
  async placeOrder(orderParams) {
    throw new Error(`${this.brokerName}: Order placement not implemented in Phase 1`);
  }

  /**
   * Modify order (DISABLED IN PHASE 1)
   * @param {string} orderId
   * @param {Object} modifications
   * @returns {Promise<Order>}
   */
  async modifyOrder(orderId, modifications) {
    throw new Error(`${this.brokerName}: Order modification not implemented in Phase 1`);
  }

  /**
   * Cancel order (DISABLED IN PHASE 1)
   * @param {string} orderId
   * @returns {Promise<boolean>}
   */
  async cancelOrder(orderId) {
    throw new Error(`${this.brokerName}: Order cancellation not implemented in Phase 1`);
  }

  /**
   * Utility: Log debug information
   */
  _log(message, data = null) {
    console.log(`[${this.brokerName}] ${message}`, data || '');
  }

  /**
   * Utility: Log error information
   */
  _error(message, error = null) {
    console.error(`[${this.brokerName}] ERROR: ${message}`, error || '');
  }
}
