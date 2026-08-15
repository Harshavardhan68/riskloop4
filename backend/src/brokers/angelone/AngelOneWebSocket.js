/**
 * Angel One WebSocket Adapter
 * Real-time market data and order feeds using SmartAPI WebSocket v2
 * 
 * WebSocket URL: wss://smartapisocket.angelbroking.com/smart-stream
 * 
 * Feed Types:
 * - LTP: Last Traded Price
 * - QUOTE: Depth + OHLC
 * - SNAP_QUOTE: Full snapshot
 * - ORDER_FEED: Real-time order updates
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from '../BaseWebSocketAdapter.js';

export class AngelOneWebSocket extends BaseWebSocketAdapter {
  constructor(config = {}) {
    super({
      brokerId: 'angelone',
      brokerName: 'Angel One',
      ...config,
    });

    // Angel One WebSocket configuration
    this.wsUrl = 'wss://smartapisocket.angelbroking.com/smart-stream';
    
    // Authentication tokens (provided by AngelOneAdapter after login)
    this.authToken = config.authToken || null;
    this.apiKey = config.apiKey || null;
    this.clientCode = config.clientCode || null;
    this.feedToken = config.feedToken || null;
    
    // Message correlation
    this.correlationId = 'riskloop_' + Date.now();
    
    // Feed modes
    this.feedModes = {
      LTP: 1,           // Last Traded Price
      QUOTE: 2,         // Quote (depth)
      SNAP_QUOTE: 3     // Snap Quote (full snapshot)
    };
    
    // Exchange types
    this.exchangeTypes = {
      NSE_CM: 1,        // NSE Cash
      NSE_FO: 2,        // NSE F&O
      BSE_CM: 3,        // BSE Cash
      BSE_FO: 4,        // BSE F&O
      MCX_FO: 5,        // MCX F&O
      NCX_FO: 7,        // NCX F&O
      CDS_FO: 13        // CDS F&O
    };

    // Order feed enabled
    this.orderFeedEnabled = false;
  }

  /**
   * Connect to Angel One WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Validate configuration
        if (!this.authToken || !this.apiKey || !this.clientCode || !this.feedToken) {
          throw new Error('Missing WebSocket authentication credentials');
        }

        this._log('Connecting to Angel One WebSocket...');
        this._setConnectionState('CONNECTING');

        // Create WebSocket connection
        this.ws = new WebSocket(this.wsUrl);

        // Connection opened
        this.ws.on('open', () => {
          this._log('WebSocket connection established');
          
          // Send authentication message
          const authMessage = {
            correlationID: this.correlationId,
            action: 1, // Subscribe
            params: {
              mode: 1, // Initial mode (LTP)
              tokenList: []
            }
          };

          this.ws.send(JSON.stringify(authMessage));
          
          this._setConnectionState('CONNECTED');
          this.reconnectAttempts = 0;
          
          // Start heartbeat
          this._startHeartbeat(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.ping();
            }
          });

          this.emit('connected', {
            brokerId: this.brokerId,
            timestamp: new Date().toISOString(),
          });

          resolve();
        });

        // Message received
        this.ws.on('message', (data) => {
          try {
            this._handleMessage(data);
          } catch (error) {
            this._error('Error handling message', error);
          }
        });

        // Error
        this.ws.on('error', (error) => {
          this._error('WebSocket error', error);
          
          this.emit('error', {
            brokerId: this.brokerId,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
          
          if (this.connectionState === 'CONNECTING') {
            reject(error);
          }
        });

        // Connection closed
        this.ws.on('close', (code, reason) => {
          this._log(`WebSocket closed: ${code} - ${reason}`);
          
          this.emit('disconnected', {
            brokerId: this.brokerId,
            code,
            reason: reason.toString(),
            timestamp: new Date().toISOString(),
          });

          this._cleanup();

          // Attempt reconnection if not intentional disconnect
          if (code !== 1000 && this.connectionState !== 'DISCONNECTED') {
            this._attemptReconnect();
          }
        });

        // Pong (heartbeat response)
        this.ws.on('pong', () => {
          // Connection is alive
        });

      } catch (error) {
        this._error('Connection failed', error);
        this._setConnectionState('ERROR');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  async disconnect() {
    try {
      this._log('Disconnecting from WebSocket...');
      
      this._clearReconnectTimer();
      this._setConnectionState('DISCONNECTED');

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send unsubscribe for all
        const unsubMessage = {
          correlationID: this.correlationId,
          action: 0, // Unsubscribe
          params: {
            mode: 1,
            tokenList: []
          }
        };
        
        this.ws.send(JSON.stringify(unsubMessage));
        
        // Close connection
        this.ws.close(1000, 'Client disconnect');
      }

      this._cleanup();
      
      // Clear subscription tracking
      this.subscriptions.clear();
      this.subscriptionsByType.clear();
      this.orderFeedEnabled = false;

    } catch (error) {
      this._error('Disconnect error', error);
      throw error;
    }
  }

  /**
   * Subscribe to market data
   * 
   * @param {Array} symbols - Array of {exchange, token} objects
   * @param {String} feedType - 'LTP', 'QUOTE', or 'SNAP_QUOTE'
   */
  async subscribe(symbols, feedType = 'LTP') {
    try {
      if (!this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      const mode = this.feedModes[feedType] || 1;
      
      // Group symbols by exchange
      const tokensByExchange = this._groupByExchange(symbols);
      
      // Send subscribe message
      const subscribeMessage = {
        correlationID: this.correlationId,
        action: 1, // Subscribe
        params: {
          mode,
          tokenList: this._formatTokenList(tokensByExchange)
        }
      };

      this.ws.send(JSON.stringify(subscribeMessage));

      // Track subscriptions
      symbols.forEach(sym => {
        const symbolKey = `${sym.exchange}:${sym.token}`;
        this._trackSubscription(symbolKey, feedType, {
          exchange: sym.exchange,
          token: sym.token,
          symbol: sym.symbol || symbolKey
        });
      });

      this._log(`Subscribed to ${symbols.length} symbols (${feedType})`);

      this.emit('subscribed', {
        brokerId: this.brokerId,
        symbols,
        feedType,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this._error('Subscribe failed', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from market data
   */
  async unsubscribe(symbols, feedType = 'LTP') {
    try {
      if (!this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      const mode = this.feedModes[feedType] || 1;
      
      // Group symbols by exchange
      const tokensByExchange = this._groupByExchange(symbols);
      
      // Send unsubscribe message
      const unsubscribeMessage = {
        correlationID: this.correlationId,
        action: 0, // Unsubscribe
        params: {
          mode,
          tokenList: this._formatTokenList(tokensByExchange)
        }
      };

      this.ws.send(JSON.stringify(unsubscribeMessage));

      // Remove subscription tracking
      symbols.forEach(sym => {
        const symbolKey = `${sym.exchange}:${sym.token}`;
        this._untrackSubscription(symbolKey, feedType);
      });

      this._log(`Unsubscribed from ${symbols.length} symbols (${feedType})`);

      this.emit('unsubscribed', {
        brokerId: this.brokerId,
        symbols,
        feedType,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this._error('Unsubscribe failed', error);
      throw error;
    }
  }

  /**
   * Subscribe to order feed
   */
  async subscribeOrderFeed() {
    try {
      if (!this.isConnected) {
        throw new Error('WebSocket not connected');
      }

      // Angel One order feed subscription
      const orderFeedMessage = {
        correlationID: this.correlationId,
        action: 1, // Subscribe
        params: {
          mode: 1,
          tokenList: [{
            exchangeType: 1,
            tokens: [] // Empty for order feed
          }]
        }
      };

      this.ws.send(JSON.stringify(orderFeedMessage));
      this.orderFeedEnabled = true;

      this._log('Subscribed to order feed');

      this.emit('orderFeedSubscribed', {
        brokerId: this.brokerId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this._error('Order feed subscription failed', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from order feed
   */
  async unsubscribeOrderFeed() {
    try {
      if (!this.isConnected) {
        return;
      }

      const orderFeedMessage = {
        correlationID: this.correlationId,
        action: 0, // Unsubscribe
        params: {
          mode: 1,
          tokenList: []
        }
      };

      this.ws.send(JSON.stringify(orderFeedMessage));
      this.orderFeedEnabled = false;

      this._log('Unsubscribed from order feed');

    } catch (error) {
      this._error('Order feed unsubscription failed', error);
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  _handleMessage(data) {
    try {
      // Angel One sends binary data for market updates
      if (Buffer.isBuffer(data)) {
        this._handleBinaryData(data);
        return;
      }

      // Text messages (acknowledgements, errors)
      const message = JSON.parse(data.toString());
      
      if (message.type === 'error') {
        this._error('Server error: ' + message.message);
        this.emit('serverError', {
          brokerId: this.brokerId,
          error: message.message,
          timestamp: new Date().toISOString(),
        });
      } else if (message.type === 'order') {
        this._handleOrderUpdate(message.data);
      } else {
        // Other message types
        this._log('Received message:', message);
      }

    } catch (error) {
      this._error('Message handling error', error);
    }
  }

  /**
   * Handle binary market data
   */
  _handleBinaryData(data) {
    try {
      // Parse binary data according to Angel One protocol
      // Note: Angel One sends market data in binary format for efficiency
      // The exact format depends on the subscription mode (LTP/QUOTE/SNAP_QUOTE)
      
      // For now, emit raw data - implement parser based on Angel One documentation
      const parsedData = this._parseBinaryMarketData(data);
      
      if (parsedData) {
        this.emit('marketData', {
          brokerId: this.brokerId,
          ...parsedData,
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      this._error('Binary data parsing error', error);
    }
  }

  /**
   * Parse binary market data (simplified - needs full implementation)
   */
  _parseBinaryMarketData(buffer) {
    // TODO: Implement full binary parser based on Angel One documentation
    // This is a placeholder that emits the raw buffer
    // In production, parse according to the exact protocol specification
    
    try {
      // Example structure (varies by mode):
      // Bytes 0-1: Exchange type
      // Bytes 2-9: Token
      // Bytes 10-17: LTP (or more fields for QUOTE/SNAP_QUOTE modes)
      
      return {
        exchange: buffer.readUInt8(0),
        token: buffer.readBigUInt64BE(2).toString(),
        ltp: buffer.length >= 18 ? buffer.readBigInt64BE(10) / BigInt(100) : null,
        raw: buffer.toString('base64') // For debugging
      };
    } catch (error) {
      this._error('Binary parsing failed', error);
      return null;
    }
  }

  /**
   * Handle order update message
   */
  _handleOrderUpdate(orderData) {
    try {
      this._log('Order update received:', orderData);

      this.emit('orderUpdate', {
        brokerId: this.brokerId,
        order: orderData,
        timestamp: new Date().toISOString(),
      });

      // Check if this is an execution/fill event
      if (orderData.status === 'complete' || orderData.status === 'COMPLETE' || 
          orderData.filledQuantity > 0) {
        
        this.emit('executionUpdate', {
          brokerId: this.brokerId,
          execution: {
            orderId: orderData.orderid || orderData.orderId,
            tradeId: orderData.tradeid || orderData.tradeId,
            symbol: orderData.tradingsymbol || orderData.symbol,
            exchange: orderData.exchange,
            side: orderData.transactiontype || orderData.side,
            quantity: orderData.filledshares || orderData.filledQuantity || 0,
            price: orderData.averageprice || orderData.price || 0,
            product: orderData.producttype || orderData.product,
            status: orderData.status,
            timestamp: orderData.updatetime || orderData.timestamp,
          },
          timestamp: new Date().toISOString(),
        });
      }

    } catch (error) {
      this._error('Order update handling error', error);
    }
  }

  /**
   * Group symbols by exchange
   */
  _groupByExchange(symbols) {
    const grouped = {};
    
    symbols.forEach(sym => {
      const exchange = sym.exchange || 'NSE_CM';
      if (!grouped[exchange]) {
        grouped[exchange] = [];
      }
      grouped[exchange].push(sym.token);
    });
    
    return grouped;
  }

  /**
   * Format token list for Angel One protocol
   */
  _formatTokenList(tokensByExchange) {
    const tokenList = [];
    
    Object.keys(tokensByExchange).forEach(exchange => {
      const exchangeType = this.exchangeTypes[exchange] || 1;
      tokenList.push({
        exchangeType,
        tokens: tokensByExchange[exchange]
      });
    });
    
    return tokenList;
  }
}
