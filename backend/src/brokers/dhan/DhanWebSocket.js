/**
 * Dhan WebSocket Adapter
 * Real-time order updates using Dhan API v2 WebSocket
 * 
 * WebSocket URL: wss://api-order-update.dhan.co
 * 
 * Official Docs: https://dhanhq.co/docs/v2/order-update/
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from '../BaseWebSocketAdapter.js';

export class DhanWebSocket extends BaseWebSocketAdapter {
  constructor(config = {}) {
    super({
      brokerId: 'dhan',
      brokerName: 'Dhan',
      ...config,
    });

    // Dhan WebSocket configuration
    this.wsUrl = 'wss://api-order-update.dhan.co';
    
    // Authentication (provided by DhanAdapter after login)
    this.accessToken = config.accessToken || null;
    this.clientId = config.clientId || null;
    
    // Message codes
    this.MSG_CODE_ORDER_UPDATE = 42;
    
    // User type
    this.userType = 'SELF'; // SELF for individual traders
    
    // Order feed enabled
    this.orderFeedEnabled = false;
  }

  /**
   * Connect to Dhan WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Validate configuration
        if (!this.accessToken || !this.clientId) {
          throw new Error('Missing WebSocket authentication credentials');
        }

        this._log('Connecting to Dhan WebSocket...');
        this._setConnectionState('CONNECTING');

        // Create WebSocket connection
        this.ws = new WebSocket(this.wsUrl);

        // Connection opened
        this.ws.on('open', () => {
          this._log('WebSocket connection established');
          
          // Send authentication message
          const authMessage = {
            LoginReq: {
              MsgCode: this.MSG_CODE_ORDER_UPDATE,
              ClientId: this.clientId,
              Token: this.accessToken,
            },
            UserType: this.userType,
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
            const message = JSON.parse(data.toString());
            this._handleMessage(message);
          } catch (error) {
            this._error('Failed to parse message', error);
          }
        });

        // Connection error
        this.ws.on('error', (error) => {
          this._error('WebSocket error', error);
          
          if (!this.isConnected) {
            reject(error);
          } else {
            this.emit('error', {
              brokerId: this.brokerId,
              error: error.message,
            });
          }
        });

        // Connection closed
        this.ws.on('close', (code, reason) => {
          this._log(`WebSocket closed: ${code} - ${reason}`);
          
          if (this.isConnected) {
            // Attempt reconnection
            this._attemptReconnect();
          }
        });

        // Pong response
        this.ws.on('pong', () => {
          // Heartbeat acknowledged
        });

        // Set connection timeout
        const timeout = setTimeout(() => {
          if (!this.isConnected) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);

        this.ws.once('open', () => clearTimeout(timeout));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from Dhan WebSocket
   */
  async disconnect() {
    try {
      this._log('Disconnecting from Dhan WebSocket...');
      
      // Close WebSocket
      if (this.ws) {
        this.ws.close();
        this.ws = null;
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
   * Subscribe to order feed (automatically enabled on connection)
   * Dhan WebSocket automatically sends order updates once connected
   */
  async subscribeOrderFeed() {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this._log('Order feed automatically enabled on connection');
    this.orderFeedEnabled = true;

    this.emit('orderFeedEnabled', {
      brokerId: this.brokerId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unsubscribe from order feed
   * For Dhan, this effectively means disconnecting
   */
  async unsubscribeOrderFeed() {
    this._log('Unsubscribing from order feed (will disconnect)');
    this.orderFeedEnabled = false;
    await this.disconnect();
  }

  /**
   * Subscribe to market data
   * Note: Dhan order WebSocket only provides order updates, not market data
   */
  async subscribe(symbols, feedType = 'LTP') {
    throw new Error('Market data subscription not supported on order WebSocket. Use Dhan market data WebSocket separately.');
  }

  /**
   * Unsubscribe from market data
   */
  async unsubscribe(symbols, feedType = 'LTP') {
    throw new Error('Market data unsubscription not supported on order WebSocket.');
  }

  /**
   * Handle WebSocket messages
   */
  _handleMessage(message) {
    try {
      // Dhan sends messages with Type field
      const messageType = message.Type || message.type;
      
      if (messageType === 'order_alert' || message.Data) {
        // Order update message
        const orderData = message.Data || message.data || message;
        
        // Emit order update
        this.emit('orderUpdate', {
          brokerId: this.brokerId,
          type: 'order',
          data: orderData,
          timestamp: new Date().toISOString(),
        });
        
        // Check if this is an execution (trade)
        if (orderData.TradedQty > 0 && orderData.Status === 'TRADED') {
          // This is an actual execution/fill
          this.emit('executionUpdate', {
            brokerId: this.brokerId,
            execution: {
              orderId: orderData.OrderNo || orderData.ExchOrderNo || '',
              tradeId: orderData.ExchOrderNo || orderData.OrderNo || '',
              symbol: orderData.Symbol || '',
              exchange: orderData.Exchange || '',
              segment: this._mapSegment(orderData.Segment),
              product: this._mapProduct(orderData.Product),
              instrumentType: orderData.Instrument || '',
              transactionType: this._mapTransactionType(orderData.TxnType),
              side: this._mapTransactionType(orderData.TxnType),
              quantity: parseInt(orderData.TradedQty) || 0,
              price: parseFloat(orderData.AvgTradedPrice) || parseFloat(orderData.TradedPrice) || 0,
              tradeValue: (parseInt(orderData.TradedQty) || 0) * (parseFloat(orderData.AvgTradedPrice) || parseFloat(orderData.TradedPrice) || 0),
              tradeDate: orderData.LastUpdatedTime ? orderData.LastUpdatedTime.split(' ')[0] : '',
              tradeTime: orderData.LastUpdatedTime ? orderData.LastUpdatedTime.split(' ')[1] : '',
              timestamp: orderData.LastUpdatedTime || new Date().toISOString(),
              status: 'COMPLETE',
              processedFrom: 'WEBSOCKET',
              totalQuantity: parseInt(orderData.Quantity) || 0,
            },
            timestamp: new Date().toISOString(),
          });
        }
      } else if (messageType === 'auth' || message.status === 'success') {
        // Authentication confirmation
        this._log('WebSocket authentication successful');
        this.orderFeedEnabled = true;
      } else {
        // Unknown message type
        this._log('Unknown message type: ' + messageType, message);
      }
    } catch (error) {
      this._error('Error handling message', error);
    }
  }

  /**
   * Map Dhan segment to RiskLoop format
   */
  _mapSegment(segment) {
    const mapping = {
      'E': 'EQUITY',
      'D': 'DERIVATIVE',
      'C': 'COMMODITY',
      'X': 'CURRENCY',
    };
    
    return mapping[segment] || 'EQUITY';
  }

  /**
   * Map Dhan product type to full name
   */
  _mapProduct(product) {
    const mapping = {
      'C': 'CNC',
      'I': 'INTRADAY',
      'M': 'MARGIN',
      'F': 'MTF',
      'V': 'CO',
      'B': 'BO',
    };
    
    return mapping[product] || product;
  }

  /**
   * Map Dhan transaction type to RiskLoop format
   */
  _mapTransactionType(txnType) {
    const mapping = {
      'B': 'BUY',
      'S': 'SELL',
    };
    
    return mapping[txnType] || txnType;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      orderFeedEnabled: this.orderFeedEnabled,
    };
  }
}
