/**
 * Upstox WebSocket Adapter
 * Real-time portfolio updates (orders, positions, holdings) using Upstox API v2 WebSocket
 * 
 * WebSocket URL: wss://api.upstox.com/v2/feed/portfolio-stream-feed
 * 
 * Official Docs: https://upstox.com/developer/api-documentation/get-portfolio-stream-feed/
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from '../BaseWebSocketAdapter.js';

export class UpstoxWebSocket extends BaseWebSocketAdapter {
  constructor(config = {}) {
    super({
      brokerId: 'upstox',
      brokerName: 'Upstox',
      ...config,
    });

    // Upstox WebSocket configuration
    this.wsBaseUrl = 'wss://api.upstox.com/v2/feed/portfolio-stream-feed';
    
    // Authentication (provided by UpstoxAdapter after OAuth)
    this.accessToken = config.accessToken || null;
    
    // Update types: order, gtt_order, position, holding
    this.updateTypes = config.updateTypes || ['order'];
    
    // Portfolio feed enabled
    this.portfolioFeedEnabled = false;
  }

  /**
   * Connect to Upstox WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Validate configuration
        if (!this.accessToken) {
          throw new Error('Missing WebSocket authentication token');
        }

        this._log('Connecting to Upstox WebSocket...');
        this._setConnectionState('CONNECTING');

        // Build WebSocket URL with update types
        const updateTypesParam = this.updateTypes.join(',');
        const wsUrl = `${this.wsBaseUrl}?update_types=${updateTypesParam}`;

        // Create WebSocket connection with authorization header
        this.ws = new WebSocket(wsUrl, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });

        // Connection opened
        this.ws.on('open', () => {
          this._log('WebSocket connection established');
          this._setConnectionState('CONNECTED');
          this.reconnectAttempts = 0;
          this.portfolioFeedEnabled = true;
          
          // Start heartbeat (ping every 30 seconds)
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
          this.portfolioFeedEnabled = false;
          
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
   * Disconnect from Upstox WebSocket
   */
  async disconnect() {
    try {
      this._log('Disconnecting from Upstox WebSocket...');
      
      // Close WebSocket
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      this._cleanup();
      this.portfolioFeedEnabled = false;
      
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
   * Upstox WebSocket automatically sends portfolio updates based on update_types parameter
   */
  async subscribeOrderFeed() {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this._log('Portfolio feed automatically enabled on connection');
    this.portfolioFeedEnabled = true;

    this.emit('orderFeedEnabled', {
      brokerId: this.brokerId,
      updateTypes: this.updateTypes,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Unsubscribe from order feed
   * For Upstox, this effectively means disconnecting
   */
  async unsubscribeOrderFeed() {
    this._log('Unsubscribing from portfolio feed (will disconnect)');
    this.portfolioFeedEnabled = false;
    await this.disconnect();
  }

  /**
   * Subscribe to market data
   * Note: Upstox portfolio WebSocket only provides portfolio updates, not market data
   * Market data requires separate WebSocket connection
   */
  async subscribe(symbols, feedType = 'LTP') {
    throw new Error('Market data subscription not supported on portfolio WebSocket. Use Upstox market data WebSocket separately.');
  }

  /**
   * Unsubscribe from market data
   */
  async unsubscribe(symbols, feedType = 'LTP') {
    throw new Error('Market data unsubscription not supported on portfolio WebSocket.');
  }

  /**
   * Handle WebSocket messages
   */
  _handleMessage(message) {
    try {
      // Upstox sends messages with update_type field
      const updateType = message.update_type;
      
      if (!updateType) {
        this._log('Received message without update_type', message);
        return;
      }
      
      // Route message based on update type
      switch (updateType) {
        case 'order':
          this._handleOrderUpdate(message);
          break;
          
        case 'gtt_order':
          this._handleGTTOrderUpdate(message);
          break;
          
        case 'position':
          this._handlePositionUpdate(message);
          break;
          
        case 'holding':
          this._handleHoldingUpdate(message);
          break;
          
        default:
          this._log('Unknown update type: ' + updateType, message);
      }
    } catch (error) {
      this._error('Error handling message', error);
    }
  }

  /**
   * Handle order updates
   */
  _handleOrderUpdate(orderData) {
    // Emit generic order update
    this.emit('orderUpdate', {
      brokerId: this.brokerId,
      type: 'order',
      data: orderData,
      timestamp: new Date().toISOString(),
    });
    
    // Check if this is an execution (trade/fill)
    // Upstox indicates executed orders with status 'complete' or 'traded'
    // Only emit executionUpdate if actual quantity was filled
    const status = (orderData.status || '').toLowerCase();
    const filledQty = parseInt(orderData.filled_quantity) || 0;
    
    if ((status === 'complete' || status === 'traded') && filledQty > 0) {
      // This is an actual execution/fill - broker confirmed trade
      this.emit('executionUpdate', {
        brokerId: this.brokerId,
        execution: {
          orderId: orderData.order_id || '',
          tradeId: orderData.exchange_order_id || orderData.order_id || '',
          symbol: orderData.trading_symbol || orderData.tradingsymbol || '',
          tradingSymbol: orderData.instrument_token || orderData.instrument_key || '',
          exchange: orderData.exchange || '',
          segment: this._mapProductType(orderData.product),
          product: orderData.product || '',
          instrumentType: orderData.instrument_type || '',
          transactionType: orderData.transaction_type || '',
          side: orderData.transaction_type || '',
          quantity: filledQty,
          price: parseFloat(orderData.average_price) || parseFloat(orderData.price) || 0,
          tradeValue: filledQty * (parseFloat(orderData.average_price) || parseFloat(orderData.price) || 0),
          tradeDate: orderData.order_timestamp ? orderData.order_timestamp.split(' ')[0] : '',
          tradeTime: orderData.order_timestamp ? orderData.order_timestamp.split(' ')[1] : '',
          timestamp: orderData.order_timestamp || orderData.exchange_timestamp || new Date().toISOString(),
          status: 'COMPLETE',
          processedFrom: 'WEBSOCKET',
          totalQuantity: parseInt(orderData.quantity) || 0,
          metadata: {
            order_ref_id: orderData.order_ref_id,
            exchange_order_id: orderData.exchange_order_id,
            parent_order_id: orderData.parent_order_id,
            status_message: orderData.status_message,
            variety: orderData.variety,
            validity: orderData.validity,
            is_amo: orderData.is_amo,
          },
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle GTT order updates
   */
  _handleGTTOrderUpdate(gttData) {
    this.emit('gttOrderUpdate', {
      brokerId: this.brokerId,
      type: 'gtt_order',
      data: gttData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle position updates
   */
  _handlePositionUpdate(positionData) {
    this.emit('positionUpdate', {
      brokerId: this.brokerId,
      type: 'position',
      data: positionData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle holding updates
   */
  _handleHoldingUpdate(holdingData) {
    this.emit('holdingUpdate', {
      brokerId: this.brokerId,
      type: 'holding',
      data: holdingData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Map Upstox product type to segments
   */
  _mapProductType(productType) {
    const mapping = {
      'D': 'EQUITY',     // Delivery/CNC
      'I': 'EQUITY',     // Intraday
      'CO': 'EQUITY',    // Cover Order
      'OCO': 'EQUITY',   // One Cancels Other
      'MTF': 'EQUITY',   // Margin Trading Facility
    };
    
    return mapping[productType] || 'EQUITY';
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      portfolioFeedEnabled: this.portfolioFeedEnabled,
      updateTypes: this.updateTypes,
    };
  }
}
