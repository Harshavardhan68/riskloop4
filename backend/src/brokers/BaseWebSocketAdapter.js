/**
 * Base WebSocket Adapter
 * Abstract class defining the common interface for all broker WebSocket integrations
 * All broker WebSocket adapters MUST extend this class
 */

import { EventEmitter } from 'events';

export class BaseWebSocketAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.brokerId = config.brokerId || 'unknown';
    this.brokerName = config.brokerName || 'Unknown Broker';
    this.isConnected = false;
    this.isReconnecting = false;
    this.connectionState = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING, ERROR
    
    // Configuration
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 3000;
    this.reconnectAttempts = 0;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    
    // Subscriptions tracking
    this.subscriptions = new Map(); // Map of symbol -> subscription data
    this.subscriptionsByType = new Map(); // Map of feedType -> Set of symbols
    
    // WebSocket instance
    this.ws = null;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
  }

  /**
   * Connect to WebSocket
   * Must be implemented by broker-specific adapter
   */
  async connect() {
    throw new Error('connect() must be implemented by broker-specific adapter');
  }

  /**
   * Disconnect from WebSocket
   * Must be implemented by broker-specific adapter
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by broker-specific adapter');
  }

  /**
   * Subscribe to market data
   * Must be implemented by broker-specific adapter
   * 
   * @param {Array} symbols - Array of symbols to subscribe
   * @param {String} feedType - Type of feed (e.g., 'LTP', 'QUOTE', 'SNAPQUOTE')
   */
  async subscribe(symbols, feedType = 'LTP') {
    throw new Error('subscribe() must be implemented by broker-specific adapter');
  }

  /**
   * Unsubscribe from market data
   * Must be implemented by broker-specific adapter
   * 
   * @param {Array} symbols - Array of symbols to unsubscribe
   * @param {String} feedType - Type of feed
   */
  async unsubscribe(symbols, feedType = 'LTP') {
    throw new Error('unsubscribe() must be implemented by broker-specific adapter');
  }

  /**
   * Enable order feed (if supported by broker)
   * Must be implemented by broker-specific adapter
   */
  async subscribeOrderFeed() {
    throw new Error('subscribeOrderFeed() must be implemented by broker-specific adapter');
  }

  /**
   * Disable order feed
   * Must be implemented by broker-specific adapter
   */
  async unsubscribeOrderFeed() {
    throw new Error('unsubscribeOrderFeed() must be implemented by broker-specific adapter');
  }

  /**
   * Set connection state and emit event
   */
  _setConnectionState(state) {
    const previousState = this.connectionState;
    this.connectionState = state;
    
    this.isConnected = (state === 'CONNECTED');
    this.isReconnecting = (state === 'RECONNECTING');
    
    if (previousState !== state) {
      this.emit('connectionStateChange', {
        brokerId: this.brokerId,
        previousState,
        currentState: state,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle reconnection logic
   */
  async _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this._error('Max reconnect attempts reached');
      this._setConnectionState('ERROR');
      this.emit('reconnectFailed', {
        brokerId: this.brokerId,
        attempts: this.reconnectAttempts,
      });
      return;
    }

    this.reconnectAttempts++;
    this._setConnectionState('RECONNECTING');
    
    this._log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    this.emit('reconnecting', {
      brokerId: this.brokerId,
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    });

    // Exponential backoff
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
        this.reconnectAttempts = 0; // Reset on successful connection
      } catch (error) {
        this._error('Reconnection failed: ' + error.message);
        await this._attemptReconnect();
      }
    }, Math.min(delay, 30000)); // Max 30 seconds delay
  }

  /**
   * Start heartbeat/ping mechanism
   */
  _startHeartbeat(pingFunction) {
    this._stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        try {
          pingFunction();
        } catch (error) {
          this._error('Heartbeat failed: ' + error.message);
        }
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Clear reconnect timer
   */
  _clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Track subscription
   */
  _trackSubscription(symbol, feedType, data = {}) {
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Map());
    }
    
    this.subscriptions.get(symbol).set(feedType, {
      subscribedAt: new Date().toISOString(),
      ...data,
    });

    // Track by feed type
    if (!this.subscriptionsByType.has(feedType)) {
      this.subscriptionsByType.set(feedType, new Set());
    }
    this.subscriptionsByType.get(feedType).add(symbol);
  }

  /**
   * Remove subscription tracking
   */
  _untrackSubscription(symbol, feedType) {
    if (this.subscriptions.has(symbol)) {
      this.subscriptions.get(symbol).delete(feedType);
      
      if (this.subscriptions.get(symbol).size === 0) {
        this.subscriptions.delete(symbol);
      }
    }

    if (this.subscriptionsByType.has(feedType)) {
      this.subscriptionsByType.get(feedType).delete(symbol);
      
      if (this.subscriptionsByType.get(feedType).size === 0) {
        this.subscriptionsByType.delete(feedType);
      }
    }
  }

  /**
   * Check if subscribed to symbol
   */
  isSubscribed(symbol, feedType = null) {
    if (!this.subscriptions.has(symbol)) {
      return false;
    }
    
    if (feedType) {
      return this.subscriptions.get(symbol).has(feedType);
    }
    
    return true;
  }

  /**
   * Get all subscriptions
   */
  getSubscriptions() {
    const subs = [];
    
    this.subscriptions.forEach((feedTypes, symbol) => {
      feedTypes.forEach((data, feedType) => {
        subs.push({
          symbol,
          feedType,
          ...data,
        });
      });
    });
    
    return subs;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      isConnected: this.isConnected,
      connectionState: this.connectionState,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: this.getSubscriptions().length,
    };
  }

  /**
   * Cleanup on disconnect
   */
  _cleanup() {
    this._stopHeartbeat();
    this._clearReconnectTimer();
    
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws = null;
    }
    
    this._setConnectionState('DISCONNECTED');
  }

  /**
   * Logging
   */
  _log(message, data = null) {
    console.log(`[${this.brokerName} WebSocket] ${message}`, data || '');
  }

  /**
   * Error logging
   */
  _error(message, error = null) {
    console.error(`[${this.brokerName} WebSocket] ERROR: ${message}`, error || '');
  }
}
