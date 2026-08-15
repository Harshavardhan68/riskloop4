/**
 * FYERS WebSocket Adapter
 * Real-time market data and order feeds using FYERS API v3 WebSocket
 * 
 * FYERS has two WebSocket types:
 * - Data WebSocket: Market data (quotes, depth, symbol updates)
 * - Order WebSocket: Order, position, trade, and general updates
 * 
 * Official Docs: https://myapi.fyers.in/docsv3
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from '../BaseWebSocketAdapter.js';

export class FyersWebSocket extends BaseWebSocketAdapter {
  constructor(config = {}) {
    super({
      brokerId: 'fyers',
      brokerName: 'FYERS',
      ...config,
    });

    // FYERS WebSocket URLs
    this.dataWsUrl = 'wss://api-t1.fyers.in/data-ws/v3';
    this.orderWsUrl = 'wss://api-t1.fyers.in/order-ws/v3';
    
    // Authentication (provided by FyersAdapter after login)
    this.accessToken = config.accessToken || null;
    
    // Separate WebSocket connections
    this.dataWs = null;
    this.orderWs = null;
    
    // Connection states
    this.dataWsConnected = false;
    this.orderWsConnected = false;
    
    // Feed modes
    this.feedModes = {
      SYMBOL_UPDATE: 'SymbolUpdate',  // Real-time symbol updates
      DEPTH_UPDATE: 'DepthUpdate',    // Market depth changes
      LITE_MODE: 'LiteMode'           // LTP only
    };
    
    // Order feed types
    this.orderFeedTypes = {
      ON_ORDERS: 'OnOrders',
      ON_TRADES: 'OnTrades',
      ON_POSITIONS: 'OnPositions',
      ON_GENERAL: 'OnGeneral'  // eDIS, price alerts, login events
    };

    // Lite mode flag
    this.liteMode = config.liteMode || false;
    
    // Order feed enabled
    this.orderFeedEnabled = false;
  }

  /**
   * Connect to FYERS WebSockets (both data and order)
   */
  async connect() {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate configuration
        if (!this.accessToken) {
          throw new Error('Missing WebSocket authentication credentials');
        }

        this._log('Connecting to FYERS WebSockets...');
        this._setConnectionState('CONNECTING');

        // Connect data WebSocket
        await this._connectDataWebSocket();
        
        // Connect order WebSocket
        await this._connectOrderWebSocket();
        
        this._setConnectionState('CONNECTED');
        this.reconnectAttempts = 0;
        
        // Start heartbeat
        this._startHeartbeat(() => {
          if (this.dataWs && this.dataWs.readyState === WebSocket.OPEN) {
            this.dataWs.ping();
          }
          if (this.orderWs && this.orderWs.readyState === WebSocket.OPEN) {
            this.orderWs.ping();
          }
        });

        this.emit('connected', {
          brokerId: this.brokerId,
          timestamp: new Date().toISOString(),
        });

        resolve();
      } catch (error) {
        this._error('Failed to connect: ' + error.message);
        this._setConnectionState('ERROR');
        reject(error);
      }
    });
  }

  /**
   * Connect to FYERS Data WebSocket
   */
  async _connectDataWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        this._log('Connecting to Data WebSocket...');

        // Create WebSocket connection with access token
        const wsUrl = `${this.dataWsUrl}?access_token=${this.accessToken}`;
        this.dataWs = new WebSocket(wsUrl);

        // Connection opened
        this.dataWs.on('open', () => {
          this._log('Data WebSocket connected');
          this.dataWsConnected = true;
          resolve();
        });

        // Message received
        this.dataWs.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this._handleDataMessage(message);
          } catch (error) {
            this._error('Failed to parse data message', error);
          }
        });

        // Connection error
        this.dataWs.on('error', (error) => {
          this._error('Data WebSocket error', error);
          this.dataWsConnected = false;
          
          if (!this.isConnected) {
            reject(error);
          } else {
            this.emit('error', {
              brokerId: this.brokerId,
              type: 'data_ws',
              error: error.message,
            });
          }
        });

        // Connection closed
        this.dataWs.on('close', (code, reason) => {
          this._log(`Data WebSocket closed: ${code} - ${reason}`);
          this.dataWsConnected = false;
          
          if (this.isConnected) {
            // Attempt reconnection
            this._attemptReconnect();
          }
        });

        // Pong response
        this.dataWs.on('pong', () => {
          // Heartbeat acknowledged
        });

        // Set connection timeout
        const timeout = setTimeout(() => {
          if (!this.dataWsConnected) {
            this.dataWs.close();
            reject(new Error('Data WebSocket connection timeout'));
          }
        }, 10000);

        this.dataWs.once('open', () => clearTimeout(timeout));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Connect to FYERS Order WebSocket
   */
  async _connectOrderWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        this._log('Connecting to Order WebSocket...');

        // Create WebSocket connection with access token
        const wsUrl = `${this.orderWsUrl}?access_token=${this.accessToken}`;
        this.orderWs = new WebSocket(wsUrl);

        // Connection opened
        this.orderWs.on('open', () => {
          this._log('Order WebSocket connected');
          this.orderWsConnected = true;
          resolve();
        });

        // Message received
        this.orderWs.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this._handleOrderMessage(message);
          } catch (error) {
            this._error('Failed to parse order message', error);
          }
        });

        // Connection error
        this.orderWs.on('error', (error) => {
          this._error('Order WebSocket error', error);
          this.orderWsConnected = false;
          
          if (!this.isConnected) {
            reject(error);
          } else {
            this.emit('error', {
              brokerId: this.brokerId,
              type: 'order_ws',
              error: error.message,
            });
          }
        });

        // Connection closed
        this.orderWs.on('close', (code, reason) => {
          this._log(`Order WebSocket closed: ${code} - ${reason}`);
          this.orderWsConnected = false;
          
          if (this.isConnected) {
            // Attempt reconnection
            this._attemptReconnect();
          }
        });

        // Pong response
        this.orderWs.on('pong', () => {
          // Heartbeat acknowledged
        });

        // Set connection timeout
        const timeout = setTimeout(() => {
          if (!this.orderWsConnected) {
            this.orderWs.close();
            reject(new Error('Order WebSocket connection timeout'));
          }
        }, 10000);

        this.orderWs.once('open', () => clearTimeout(timeout));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from FYERS WebSockets
   */
  async disconnect() {
    try {
      this._log('Disconnecting from FYERS WebSockets...');
      
      // Close data WebSocket
      if (this.dataWs) {
        this.dataWs.close();
        this.dataWs = null;
        this.dataWsConnected = false;
      }
      
      // Close order WebSocket
      if (this.orderWs) {
        this.orderWs.close();
        this.orderWs = null;
        this.orderWsConnected = false;
      }
      
      this._cleanup();
      
      this.emit('disconnected', {
        brokerId: this.brokerId,
        timestamp: new Date().toISOString(),
      });
      
      this._log('Disconnected successfully');
    } catch (error) {
      this._error('Error during disconnect', error);
    }
  }

  /**
   * Subscribe to market data
   * @param {Array} symbols - Array of symbols (e.g., ['NSE:SBIN-EQ', 'NSE:RELIANCE-EQ'])
   * @param {String} feedType - Feed type (SymbolUpdate, DepthUpdate)
   */
  async subscribe(symbols, feedType = 'SymbolUpdate') {
    try {
      if (!this.dataWsConnected) {
        throw new Error('Data WebSocket not connected');
      }

      if (!Array.isArray(symbols) || symbols.length === 0) {
        throw new Error('Symbols must be a non-empty array');
      }

      this._log(`Subscribing to ${symbols.length} symbols with ${feedType}`);

      // Prepare subscription message
      const subscribeMessage = {
        T: 'SUB_L2',  // Subscribe to Level 2 data
        L2LIST: symbols,
        SUB_T: this.liteMode ? 1 : 2  // 1 = Lite mode, 2 = Full mode
      };

      // Send subscription request
      this.dataWs.send(JSON.stringify(subscribeMessage));

      // Track subscriptions
      symbols.forEach(symbol => {
        this._trackSubscription(symbol, feedType, { liteMode: this.liteMode });
      });

      this.emit('subscribed', {
        brokerId: this.brokerId,
        symbols,
        feedType,
        timestamp: new Date().toISOString(),
      });

      this._log(`Subscribed to ${symbols.length} symbols`);
    } catch (error) {
      this._error('Subscribe failed: ' + error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe from market data
   * @param {Array} symbols - Array of symbols to unsubscribe
   * @param {String} feedType - Feed type
   */
  async unsubscribe(symbols, feedType = 'SymbolUpdate') {
    try {
      if (!this.dataWsConnected) {
        throw new Error('Data WebSocket not connected');
      }

      if (!Array.isArray(symbols) || symbols.length === 0) {
        throw new Error('Symbols must be a non-empty array');
      }

      this._log(`Unsubscribing from ${symbols.length} symbols`);

      // Prepare unsubscription message
      const unsubscribeMessage = {
        T: 'UNSUB_L2',
        L2LIST: symbols
      };

      // Send unsubscription request
      this.dataWs.send(JSON.stringify(unsubscribeMessage));

      // Remove subscription tracking
      symbols.forEach(symbol => {
        this._untrackSubscription(symbol, feedType);
      });

      this.emit('unsubscribed', {
        brokerId: this.brokerId,
        symbols,
        feedType,
        timestamp: new Date().toISOString(),
      });

      this._log(`Unsubscribed from ${symbols.length} symbols`);
    } catch (error) {
      this._error('Unsubscribe failed: ' + error.message);
      throw error;
    }
  }

  /**
   * Subscribe to order feed
   */
  async subscribeOrderFeed() {
    try {
      if (!this.orderWsConnected) {
        throw new Error('Order WebSocket not connected');
      }

      if (this.orderFeedEnabled) {
        this._log('Order feed already enabled');
        return;
      }

      this._log('Subscribing to order feed...');

      // Subscribe to all order feed types
      const subscribeMessage = {
        T: 'SUB_ORD',  // Subscribe to orders
        SLIST: ['OnOrders', 'OnTrades', 'OnPositions', 'OnGeneral']
      };

      this.orderWs.send(JSON.stringify(subscribeMessage));
      this.orderFeedEnabled = true;

      this.emit('orderFeedEnabled', {
        brokerId: this.brokerId,
        timestamp: new Date().toISOString(),
      });

      this._log('Order feed enabled');
    } catch (error) {
      this._error('Failed to enable order feed: ' + error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe from order feed
   */
  async unsubscribeOrderFeed() {
    try {
      if (!this.orderWsConnected) {
        throw new Error('Order WebSocket not connected');
      }

      if (!this.orderFeedEnabled) {
        this._log('Order feed already disabled');
        return;
      }

      this._log('Unsubscribing from order feed...');

      const unsubscribeMessage = {
        T: 'UNSUB_ORD'
      };

      this.orderWs.send(JSON.stringify(unsubscribeMessage));
      this.orderFeedEnabled = false;

      this.emit('orderFeedDisabled', {
        brokerId: this.brokerId,
        timestamp: new Date().toISOString(),
      });

      this._log('Order feed disabled');
    } catch (error) {
      this._error('Failed to disable order feed: ' + error.message);
      throw error;
    }
  }

  /**
   * Handle data WebSocket messages (market data)
   */
  _handleDataMessage(message) {
    try {
      // Check message status
      if (message.s && message.s !== 'ok') {
        this._error('Data message error: ' + (message.message || 'Unknown error'));
        return;
      }

      // Handle different message types
      if (message.T === 'sf') {
        // Symbol update (full data)
        this.emit('marketData', {
          brokerId: this.brokerId,
          type: 'symbolUpdate',
          data: message,
          timestamp: new Date().toISOString(),
        });
      } else if (message.T === 'dp') {
        // Depth update
        this.emit('marketData', {
          brokerId: this.brokerId,
          type: 'depthUpdate',
          data: message,
          timestamp: new Date().toISOString(),
        });
      } else if (message.T === 'ack') {
        // Acknowledgment
        this._log('Subscription acknowledged');
      } else {
        // Unknown message type
        this._log('Unknown data message type: ' + message.T, message);
      }
    } catch (error) {
      this._error('Error handling data message', error);
    }
  }

  /**
   * Handle order WebSocket messages (order/trade/position updates)
   */
  _handleOrderMessage(message) {
    try {
      // Check message status
      if (message.s && message.s !== 'ok') {
        this._error('Order message error: ' + (message.message || 'Unknown error'));
        return;
      }

      // Handle order updates
      if (message.type === 'order' || message.orders) {
        this.emit('orderUpdate', {
          brokerId: this.brokerId,
          type: 'order',
          data: message.orders || message,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Handle trade updates (actual executions/fills)
      if (message.type === 'trade' || message.trades) {
        const trades = Array.isArray(message.trades) ? message.trades : [message];
        
        // Emit as executionUpdate for TradeExecutionService integration
        trades.forEach(trade => {
          this.emit('executionUpdate', {
            brokerId: this.brokerId,
            execution: {
              orderId: trade.orderNumber || trade.id || '',
              tradeId: trade.tradeNumber || trade.id || '',
              symbol: trade.symbol || '',
              exchange: trade.symbol ? trade.symbol.split(':')[0] : '',
              segment: trade.segment || '',
              product: trade.productType || '',
              instrumentType: trade.segment || '',
              transactionType: trade.side === 1 ? 'BUY' : 'SELL',
              side: trade.side === 1 ? 'BUY' : 'SELL',
              quantity: parseInt(trade.tradedQty) || 0,
              price: parseFloat(trade.tradePrice) || 0,
              tradeValue: (parseInt(trade.tradedQty) || 0) * (parseFloat(trade.tradePrice) || 0),
              tradeDate: trade.orderDateTime ? trade.orderDateTime.split(' ')[0] : '',
              tradeTime: trade.orderDateTime ? trade.orderDateTime.split(' ')[1] : '',
              timestamp: trade.orderDateTime || new Date().toISOString(),
              status: 'COMPLETE',
              processedFrom: 'WEBSOCKET',
            },
            timestamp: new Date().toISOString(),
          });
        });
      }
      
      // Handle position updates
      if (message.type === 'position' || message.positions) {
        this.emit('positionUpdate', {
          brokerId: this.brokerId,
          type: 'position',
          data: message.positions || message,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Handle general updates (eDIS, price alerts, login)
      if (message.type === 'general') {
        this.emit('generalUpdate', {
          brokerId: this.brokerId,
          type: 'general',
          data: message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this._error('Error handling order message', error);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      dataWsConnected: this.dataWsConnected,
      orderWsConnected: this.orderWsConnected,
      orderFeedEnabled: this.orderFeedEnabled,
      liteMode: this.liteMode,
    };
  }
}
