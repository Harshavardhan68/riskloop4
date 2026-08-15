/**
 * WebSocket Client for Real-Time Updates
 * Handles live portfolio updates without manual refresh
 */

(function() {
  'use strict';

  let websocket = null;
  let reconnectInterval = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Connection status elements
  let connectionStatusElement = null;

  /**
   * Initialize WebSocket client
   */
  function initializeWebSocket(brokerId) {
    if (!brokerId) {
      console.warn('WebSocket: No broker ID provided');
      return;
    }

    console.log('WebSocket: Initializing connection for broker:', brokerId);
    
    // Close existing connection
    if (websocket) {
      websocket.close();
    }

    // Create connection status indicator
    createConnectionStatusIndicator();

    // Connect to WebSocket
    connect(brokerId);
  }

  /**
   * Connect to WebSocket server
   */
  function connect(brokerId) {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws?brokerId=${brokerId}`;
      
      console.log('WebSocket: Connecting to', wsUrl);
      websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('WebSocket: Connected successfully');
        reconnectAttempts = 0;
        updateConnectionStatus('connected');
        
        // Subscribe to real-time feeds
        subscribeToFeeds(brokerId);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket: Failed to parse message:', error);
        }
      };

      websocket.onclose = (event) => {
        console.log('WebSocket: Connection closed:', event.code, event.reason);
        updateConnectionStatus('disconnected');
        
        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnection(brokerId);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket: Connection error:', error);
        updateConnectionStatus('error');
      };

    } catch (error) {
      console.error('WebSocket: Failed to create connection:', error);
      updateConnectionStatus('error');
    }
  }

  /**
   * Schedule reconnection attempt
   */
  function scheduleReconnection(brokerId) {
    if (reconnectInterval) {
      clearTimeout(reconnectInterval);
    }

    reconnectAttempts++;
    updateConnectionStatus('reconnecting');
    
    console.log(`WebSocket: Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
    
    reconnectInterval = setTimeout(() => {
      connect(brokerId);
    }, reconnectDelay);
  }

  /**
   * Subscribe to real-time feeds
   */
  function subscribeToFeeds(brokerId) {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Subscribe to order updates
    websocket.send(JSON.stringify({
      type: 'subscribe',
      feed: 'orders',
      brokerId: brokerId
    }));

    // Subscribe to position updates
    websocket.send(JSON.stringify({
      type: 'subscribe',
      feed: 'positions',
      brokerId: brokerId
    }));

    // Subscribe to trade executions
    websocket.send(JSON.stringify({
      type: 'subscribe',
      feed: 'trades',
      brokerId: brokerId
    }));

    console.log('WebSocket: Subscribed to real-time feeds');
  }

  /**
   * Handle incoming WebSocket messages
   */
  function handleWebSocketMessage(data) {
    console.log('WebSocket: Received message:', data);

    switch (data.type) {
      case 'order_update':
        handleOrderUpdate(data.data);
        break;
      case 'position_update':
        handlePositionUpdate(data.data);
        break;
      case 'trade_execution':
        handleTradeExecution(data.data);
        break;
      case 'funds_update':
        handleFundsUpdate(data.data);
        break;
      case 'heartbeat':
        // Keep connection alive
        break;
      default:
        console.warn('WebSocket: Unknown message type:', data.type);
    }
  }

  /**
   * Handle order status updates
   */
  function handleOrderUpdate(orderData) {
    console.log('WebSocket: Order update received:', orderData);
    
    // Update orders table in real-time
    updateOrdersTable(orderData);
    
    // Show toast notification for important status changes
    if (orderData.status === 'EXECUTED' || orderData.status === 'CANCELLED' || orderData.status === 'REJECTED') {
      showToast(`Order ${orderData.status.toLowerCase()}: ${orderData.symbol}`, 
        orderData.status === 'EXECUTED' ? 'success' : 'warning');
    }
  }

  /**
   * Handle position updates
   */
  function handlePositionUpdate(positionData) {
    console.log('WebSocket: Position update received:', positionData);
    
    // Update positions table in real-time
    updatePositionsTable(positionData);
  }

  /**
   * Handle trade execution updates
   */
  function handleTradeExecution(tradeData) {
    console.log('WebSocket: Trade execution received:', tradeData);
    
    // CRITICAL: Only broker-confirmed executions create trades
    if (tradeData.status === 'EXECUTED') {
      // Update trades table in real-time
      updateTradesTable(tradeData);
      
      // Update related order status
      handleOrderUpdate({
        orderId: tradeData.orderId,
        status: 'EXECUTED',
        filledQuantity: tradeData.quantity,
        averagePrice: tradeData.price
      });
      
      showToast(`Trade executed: ${tradeData.symbol} ${tradeData.side} ${tradeData.quantity}`, 'success');
    }
  }

  /**
   * Handle funds update
   */
  function handleFundsUpdate(fundsData) {
    console.log('WebSocket: Funds update received:', fundsData);
    
    // Update funds display in real-time
    updateFundsDisplay(fundsData);
  }

  /**
   * Update orders table with new data
   */
  function updateOrdersTable(orderData) {
    const ordersSection = document.querySelector('[data-section="orders"]');
    if (!ordersSection) return;

    // If this is a single order update, merge with existing data
    if (window.brokerData && window.brokerData.orders) {
      const existingOrderIndex = window.brokerData.orders.findIndex(o => o.orderId === orderData.orderId);
      
      if (existingOrderIndex >= 0) {
        // Update existing order
        window.brokerData.orders[existingOrderIndex] = { ...window.brokerData.orders[existingOrderIndex], ...orderData };
      } else {
        // Add new order
        window.brokerData.orders.push(orderData);
      }
      
      // Re-render orders table
      const ordersHtml = renderOrdersTable(window.brokerData.orders);
      ordersSection.outerHTML = ordersHtml;
    }
  }

  /**
   * Update positions table with new data
   */
  function updatePositionsTable(positionData) {
    const positionsSection = document.querySelector('[data-section="positions"]');
    if (!positionsSection) return;

    // Update positions data and re-render
    if (window.brokerData && window.brokerData.positions) {
      const existingPositionIndex = window.brokerData.positions.findIndex(p => p.symbol === positionData.symbol);
      
      if (existingPositionIndex >= 0) {
        window.brokerData.positions[existingPositionIndex] = { ...window.brokerData.positions[existingPositionIndex], ...positionData };
      } else if (positionData.quantity !== 0) {
        window.brokerData.positions.push(positionData);
      }
      
      // Remove zero quantity positions
      window.brokerData.positions = window.brokerData.positions.filter(p => p.quantity !== 0);
      
      // Re-render positions table
      const positionsHtml = renderPositionsTable(window.brokerData.positions);
      positionsSection.outerHTML = positionsHtml;
    }
  }

  /**
   * Update trades table with new data
   */
  function updateTradesTable(tradeData) {
    const tradesSection = document.querySelector('[data-section="trades"]');
    if (!tradesSection) return;

    // Add new trade to beginning of list
    if (window.brokerData && window.brokerData.trades) {
      window.brokerData.trades.unshift(tradeData);
      
      // Keep only last 100 trades for performance
      if (window.brokerData.trades.length > 100) {
        window.brokerData.trades = window.brokerData.trades.slice(0, 100);
      }
      
      // Re-render trades table
      const tradesHtml = renderTradesTable(window.brokerData.trades);
      tradesSection.outerHTML = tradesHtml;
    }
  }

  /**
   * Update funds display
   */
  function updateFundsDisplay(fundsData) {
    const fundsSection = document.querySelector('[data-section="funds"]');
    if (!fundsSection) return;

    // Update funds data and re-render
    if (window.brokerData) {
      window.brokerData.funds = { ...window.brokerData.funds, ...fundsData };
      
      // Re-render funds card
      const fundsHtml = renderFundsCard(window.brokerData.funds);
      fundsSection.outerHTML = fundsHtml;
    }
  }

  /**
   * Create connection status indicator
   */
  function createConnectionStatusIndicator() {
    // Remove existing indicator
    if (connectionStatusElement) {
      connectionStatusElement.remove();
    }

    // Create new indicator
    connectionStatusElement = document.createElement('div');
    connectionStatusElement.className = 'websocket-status';
    connectionStatusElement.innerHTML = `
      <div class="websocket-status-indicator">
        <div class="websocket-status-dot"></div>
        <span class="websocket-status-text">Connecting...</span>
      </div>
    `;

    // Add to portfolio page header if it exists
    const portfolioHeader = document.querySelector('.broker-dashboard-header');
    if (portfolioHeader) {
      portfolioHeader.appendChild(connectionStatusElement);
    }
  }

  /**
   * Update connection status indicator
   */
  function updateConnectionStatus(status) {
    if (!connectionStatusElement) return;

    const dot = connectionStatusElement.querySelector('.websocket-status-dot');
    const text = connectionStatusElement.querySelector('.websocket-status-text');

    switch (status) {
      case 'connected':
        dot.className = 'websocket-status-dot websocket-status-connected';
        text.textContent = 'Live Updates';
        break;
      case 'disconnected':
        dot.className = 'websocket-status-dot websocket-status-disconnected';
        text.textContent = 'Disconnected';
        break;
      case 'reconnecting':
        dot.className = 'websocket-status-dot websocket-status-reconnecting';
        text.textContent = 'Reconnecting...';
        break;
      case 'error':
        dot.className = 'websocket-status-dot websocket-status-error';
        text.textContent = 'Connection Error';
        break;
      default:
        dot.className = 'websocket-status-dot';
        text.textContent = 'Unknown';
    }
  }

  /**
   * Disconnect WebSocket
   */
  function disconnect() {
    if (reconnectInterval) {
      clearTimeout(reconnectInterval);
      reconnectInterval = null;
    }

    if (websocket) {
      websocket.close(1000, 'Manual disconnect');
      websocket = null;
    }

    if (connectionStatusElement) {
      connectionStatusElement.remove();
      connectionStatusElement = null;
    }

    console.log('WebSocket: Disconnected');
  }

  /**
   * Send message to WebSocket
   */
  function sendMessage(message) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Export WebSocket client to global scope
  window.websocketClient = {
    initialize: initializeWebSocket,
    disconnect: disconnect,
    send: sendMessage,
    getStatus: () => websocket ? websocket.readyState : WebSocket.CLOSED
  };

})();