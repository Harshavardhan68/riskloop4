/**
 * WebSocket Service
 * Manages WebSocket connections for all brokers
 * Handles market data and order feed subscriptions
 */

import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    
    // Map of sessionId -> Map of brokerId -> WebSocketAdapter
    this.connections = new Map();
    
    // Market data cache (symbol -> latest data)
    this.marketDataCache = new Map();
    
    // Subscription management (sessionId -> Set of symbols)
    this.subscriptionsBySession = new Map();
  }

  /**
   * Create or get WebSocket connection for a broker
   * 
   * @param {String} sessionId - User session ID
   * @param {String} brokerId - Broker ID
   * @param {Object} wsAdapter - WebSocket adapter instance
   */
  async createConnection(sessionId, brokerId, wsAdapter) {
    try {
      // Get or create session map
      if (!this.connections.has(sessionId)) {
        this.connections.set(sessionId, new Map());
      }

      const sessionConnections = this.connections.get(sessionId);

      // Check if already connected
      if (sessionConnections.has(brokerId)) {
        const existing = sessionConnections.get(brokerId);
        if (existing.isConnected) {
          return existing;
        }
      }

      // Store connection
      sessionConnections.set(brokerId, wsAdapter);

      // Set up event listeners
      this._setupEventListeners(sessionId, brokerId, wsAdapter);

      // Connect
      await wsAdapter.connect();

      return wsAdapter;

    } catch (error) {
      console.error(`[WebSocketService] Failed to create connection for ${brokerId}:`, error);
      throw error;
    }
  }

  /**
   * Get WebSocket connection for a broker
   */
  getConnection(sessionId, brokerId) {
    if (!this.connections.has(sessionId)) {
      return null;
    }

    return this.connections.get(sessionId).get(brokerId);
  }

  /**
   * Check if connected
   */
  isConnected(sessionId, brokerId) {
    const connection = this.getConnection(sessionId, brokerId);
    return connection ? connection.isConnected : false;
  }

  /**
   * Disconnect WebSocket
   */
  async disconnect(sessionId, brokerId) {
    const connection = this.getConnection(sessionId, brokerId);
    
    if (connection) {
      await connection.disconnect();
      
      // Remove from connections
      if (this.connections.has(sessionId)) {
        this.connections.get(sessionId).delete(brokerId);
      }
      
      // Clear subscriptions
      this._clearSubscriptions(sessionId, brokerId);
    }
  }

  /**
   * Disconnect all WebSockets for a session
   */
  async disconnectAll(sessionId) {
    if (!this.connections.has(sessionId)) {
      return;
    }

    const sessionConnections = this.connections.get(sessionId);
    const disconnectPromises = [];

    sessionConnections.forEach((connection, brokerId) => {
      disconnectPromises.push(this.disconnect(sessionId, brokerId));
    });

    await Promise.all(disconnectPromises);
    
    this.connections.delete(sessionId);
    this.subscriptionsBySession.delete(sessionId);
  }

  /**
   * Subscribe to market data
   */
  async subscribeMarketData(sessionId, brokerId, symbols, feedType = 'LTP') {
    const connection = this.getConnection(sessionId, brokerId);
    
    if (!connection) {
      throw new Error(`WebSocket not connected for ${brokerId}`);
    }

    if (!connection.isConnected) {
      throw new Error(`WebSocket connection not established for ${brokerId}`);
    }

    await connection.subscribe(symbols, feedType);

    // Track subscriptions
    if (!this.subscriptionsBySession.has(sessionId)) {
      this.subscriptionsBySession.set(sessionId, new Map());
    }

    const sessionSubs = this.subscriptionsBySession.get(sessionId);
    if (!sessionSubs.has(brokerId)) {
      sessionSubs.set(brokerId, new Set());
    }

    symbols.forEach(sym => {
      const symbolKey = `${sym.exchange}:${sym.token}`;
      sessionSubs.get(brokerId).add(symbolKey);
    });
  }

  /**
   * Unsubscribe from market data
   */
  async unsubscribeMarketData(sessionId, brokerId, symbols, feedType = 'LTP') {
    const connection = this.getConnection(sessionId, brokerId);
    
    if (!connection) {
      return;
    }

    await connection.unsubscribe(symbols, feedType);

    // Remove from tracking
    if (this.subscriptionsBySession.has(sessionId)) {
      const sessionSubs = this.subscriptionsBySession.get(sessionId);
      if (sessionSubs.has(brokerId)) {
        symbols.forEach(sym => {
          const symbolKey = `${sym.exchange}:${sym.token}`;
          sessionSubs.get(brokerId).delete(symbolKey);
        });
      }
    }
  }

  /**
   * Subscribe to order feed
   */
  async subscribeOrderFeed(sessionId, brokerId) {
    const connection = this.getConnection(sessionId, brokerId);
    
    if (!connection) {
      throw new Error(`WebSocket not connected for ${brokerId}`);
    }

    await connection.subscribeOrderFeed();
  }

  /**
   * Unsubscribe from order feed
   */
  async unsubscribeOrderFeed(sessionId, brokerId) {
    const connection = this.getConnection(sessionId, brokerId);
    
    if (!connection) {
      return;
    }

    await connection.unsubscribeOrderFeed();
  }

  /**
   * Get connection status
   */
  getStatus(sessionId, brokerId) {
    const connection = this.getConnection(sessionId, brokerId);
    
    if (!connection) {
      return {
        brokerId,
        isConnected: false,
        connectionState: 'DISCONNECTED',
      };
    }

    return connection.getStatus();
  }

  /**
   * Get all statuses for a session
   */
  getAllStatuses(sessionId) {
    if (!this.connections.has(sessionId)) {
      return [];
    }

    const statuses = [];
    this.connections.get(sessionId).forEach((connection, brokerId) => {
      statuses.push(connection.getStatus());
    });

    return statuses;
  }

  /**
   * Get market data from cache
   */
  getMarketData(symbol) {
    return this.marketDataCache.get(symbol);
  }

  /**
   * Get all market data
   */
  getAllMarketData() {
    const data = {};
    this.marketDataCache.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  /**
   * Setup event listeners for WebSocket connection
   */
  _setupEventListeners(sessionId, brokerId, wsAdapter) {
    // Connection state changes
    wsAdapter.on('connectionStateChange', (data) => {
      this.emit('connectionStateChange', {
        sessionId,
        ...data,
      });
    });

    // Connected
    wsAdapter.on('connected', (data) => {
      this.emit('connected', {
        sessionId,
        ...data,
      });
    });

    // Disconnected
    wsAdapter.on('disconnected', (data) => {
      this.emit('disconnected', {
        sessionId,
        ...data,
      });
    });

    // Market data
    wsAdapter.on('marketData', (data) => {
      // Update cache
      const symbolKey = `${data.exchange}:${data.token}`;
      this.marketDataCache.set(symbolKey, {
        ...data,
        lastUpdate: new Date().toISOString(),
      });

      // Emit to subscribers
      this.emit('marketData', {
        sessionId,
        ...data,
      });
    });

    // Order update
    wsAdapter.on('orderUpdate', (data) => {
      this.emit('orderUpdate', {
        sessionId,
        ...data,
      });
    });

    // Execution update (actual trade fill)
    wsAdapter.on('executionUpdate', (data) => {
      this.emit('executionUpdate', {
        sessionId,
        ...data,
      });
    });

    // Errors
    wsAdapter.on('error', (data) => {
      this.emit('error', {
        sessionId,
        ...data,
      });
    });

    // Reconnecting
    wsAdapter.on('reconnecting', (data) => {
      this.emit('reconnecting', {
        sessionId,
        ...data,
      });
    });
  }

  /**
   * Clear subscriptions for a session/broker
   */
  _clearSubscriptions(sessionId, brokerId) {
    if (this.subscriptionsBySession.has(sessionId)) {
      const sessionSubs = this.subscriptionsBySession.get(sessionId);
      sessionSubs.delete(brokerId);
      
      if (sessionSubs.size === 0) {
        this.subscriptionsBySession.delete(sessionId);
      }
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
