# Phase 9: Upstox Broker Integration

## Overview
Complete integration of Upstox broker with OAuth2 authentication, real-time WebSocket updates, order placement, and SQLite persistence. Follows the established multi-broker architecture pattern from Angel One, FYERS, and Dhan.

## Implementation Status: ✅ COMPLETE

### What Was Implemented

#### 1. Authentication (OAuth 2.0)
- **File**: `backend/src/brokers/upstox/UpstoxAdapter.js`
- **Method**: `connect(credentials)`
- **Flow**: Authorization code → Token exchange → Profile validation
- **Token Storage**: Server-side only (never exposed to frontend)
- **Token Validity**: Until 3:30 AM next day
- **Security**: Credential sanitization in logs, masked PAN in profile

#### 2. Data Fetching Methods
All methods normalize Upstox responses to RiskLoop models:

| Method | Endpoint | Model |
|--------|----------|-------|
| `getProfile()` | `/user/profile` | Account |
| `getFunds()` | `/user/get-funds-and-margin` | Funds |
| `getPositions()` | `/portfolio/short-term-holdings` | Position[] |
| `getOrders()` | `/order/retrieve-all` | Order[] |
| `getHoldings()` | `/portfolio/long-term-holdings` | Holding[] |
| `getTradeHistory()` | `/charges/historical-trades` | Trade[] |
| `getQuotes(symbols)` | `/market-quote/quotes` | Quote[] |

#### 3. Order Placement
- **File**: `backend/src/brokers/upstox/UpstoxAdapter.js`
- **Methods**:
  - `placeOrder(orderRequest)` - POST to `/order/place`
  - `modifyOrder(orderId, modifications)` - PUT to `/v3/order/modify`
  - `cancelOrder(orderId)` - DELETE to `/order/cancel`
- **Features**:
  - Request validation before submission
  - Error handling with safe messages (no credential leaks)
  - Uses HFT endpoints (`api-hft.upstox.com`) for better performance
  - Supports MARKET, LIMIT, SL, SL-M order types
  - Supports Delivery (D), Intraday (I), MTF products
  - Supports AMO (After Market Orders)

#### 4. WebSocket Real-Time Updates
- **File**: `backend/src/brokers/upstox/UpstoxWebSocket.js`
- **URL**: `wss://api.upstox.com/v2/feed/portfolio-stream-feed?update_types=order`
- **Auth**: Bearer token in WebSocket headers
- **Events Emitted**:
  - `orderUpdate` - All order status changes
  - `executionUpdate` - Only broker-confirmed trades (status = 'complete' or 'traded' with filled_quantity > 0)
  - `positionUpdate` - Position changes
  - `holdingUpdate` - Holding changes
  - `gttOrderUpdate` - GTT order changes

#### 5. Trade Execution Flow
```
WebSocket (Upstox) 
  → UpstoxWebSocket.emit('executionUpdate')
  → webSocketService (existing)
  → server.js handler (existing)
  → tradeExecutionService.processExecution() (existing)
  → SQLite database (automatic duplicate prevention)
```

**Orders ≠ Trades**: Only broker-confirmed executions with `filled_quantity > 0` become Trades in the database.

#### 6. Database Integration
- **Automatic**: Uses existing SQLite schema and services
- **Tables**: `orders`, `trades`, `positions`, `holdings`
- **Duplicate Prevention**: UNIQUE constraint on (broker_id, broker_trade_id)
- **Partial Fills**: Supported via quantity tracking
- **No Changes Required**: Fully compatible with existing database layer

---

## Architecture Verification ✅

### 1. Adapter Pattern
- ✅ Extends `BaseBrokerAdapter`
- ✅ Implements all required methods
- ✅ Returns RiskLoop model instances
- ✅ Follows Angel One/FYERS/Dhan pattern

### 2. WebSocket Pattern
- ✅ Extends `BaseWebSocketAdapter`
- ✅ Implements EventEmitter interface
- ✅ Emits standardized events
- ✅ Automatic reconnection logic
- ✅ Heartbeat/ping mechanism

### 3. Service Integration
- ✅ Registered in `BrokerService.js`
- ✅ Exported from `brokers/index.js`
- ✅ Logo path configured
- ✅ Environment variables documented

### 4. Security
- ✅ Tokens stored server-side only
- ✅ Credentials never logged
- ✅ PAN masking in profile
- ✅ Safe error messages (no credential exposure)

---

## Files Modified

### New Files
1. `backend/src/brokers/upstox/UpstoxAdapter.js` (490 lines)
2. `backend/src/brokers/upstox/UpstoxWebSocket.js` (340 lines)
3. `PHASE9-UPSTOX-INTEGRATION.md` (this file)

### Existing Files (Verified - No Changes Needed)
- `backend/src/services/BrokerService.js` - ✅ Upstox already registered
- `backend/src/brokers/index.js` - ✅ UpstoxAdapter already exported
- `backend/.env.example` - ✅ Environment variables documented
- `backend/src/server.js` - ✅ WebSocket event wiring exists
- `backend/src/services/TradeExecutionService.js` - ✅ Compatible
- `backend/src/services/DatabaseService.js` - ✅ Compatible

---

## Testing Checklist

### ✅ Tests NOT Requiring Live Credentials

#### 1. Syntax & Import Validation
```bash
# Check for syntax errors
node --check backend/src/brokers/upstox/UpstoxAdapter.js
node --check backend/src/brokers/upstox/UpstoxWebSocket.js
```

#### 2. Module Import Test
```javascript
// Test imports resolve correctly
import { UpstoxAdapter } from './backend/src/brokers/upstox/UpstoxAdapter.js';
import { UpstoxWebSocket } from './backend/src/brokers/upstox/UpstoxWebSocket.js';
console.log('Imports successful');
```

#### 3. Adapter Instantiation Test
```javascript
const adapter = new UpstoxAdapter({
  apiKey: 'test-key',
  apiSecret: 'test-secret',
  redirectUri: 'http://localhost:3000/callback'
});
console.log('Adapter ID:', adapter.brokerId); // Should print 'upstox'
console.log('Base URL:', adapter.baseUrl); // Should print 'https://api.upstox.com/v2'
```

#### 4. Capabilities Test
```javascript
const capabilities = adapter.getCapabilities();
console.log('Supports order placement:', capabilities.supportsOrderPlacement); // true
console.log('Supported segments:', capabilities.supportedSegments); // ['EQUITY', 'DERIVATIVE', 'CURRENCY', 'COMMODITY']
```

#### 5. BrokerService Registration Test
```javascript
import { brokerService } from './backend/src/services/BrokerService.js';
const brokers = brokerService.getAvailableBrokers();
const upstox = brokers.find(b => b.id === 'upstox');
console.log('Upstox registered:', !!upstox); // true
console.log('Upstox enabled:', upstox.enabled); // true
```

#### 6. WebSocket Instantiation Test
```javascript
const ws = new UpstoxWebSocket({
  accessToken: 'test-token',
  brokerId: 'upstox'
});
console.log('WebSocket broker:', ws.brokerId); // 'upstox'
console.log('WebSocket URL:', ws.wsBaseUrl); // 'wss://api.upstox.com/v2/feed/portfolio-stream-feed'
```

#### 7. Order Validation Test (No API Call)
```javascript
try {
  adapter._validateOrderRequest({
    quantity: -1, // Invalid
    product: 'D',
    transactionType: 'BUY'
  });
} catch (error) {
  console.log('Validation works:', error.message.includes('quantity')); // true
}
```

#### 8. Normalization Test (Mock Data)
```javascript
const mockUpstoxProfile = {
  data: {
    user_id: 'TEST123',
    user_name: 'Test User',
    email: 'test@example.com',
    pan: 'ABCDE1234F',
    exchanges: ['NSE', 'BSE'],
    is_active: true
  }
};

const account = adapter._normalizeProfile(mockUpstoxProfile);
console.log('Normalized PAN masked:', account.pan.includes('****')); // true
console.log('User ID:', account.userId); // 'TEST123'
```

### ⚠️ Tests REQUIRING Live Upstox Credentials

#### 9. Authentication Test
```javascript
// Requires: Valid UPSTOX_API_KEY, UPSTOX_API_SECRET in .env
// Requires: OAuth authorization code from Upstox login flow
const adapter = new UpstoxAdapter();
await adapter.connect({ authCode: 'YOUR_AUTH_CODE_HERE' });
console.log('Connected:', adapter.isConnected);
```

#### 10. Profile Fetch Test
```javascript
// Requires: Connected adapter with valid access token
const profile = await adapter.getProfile();
console.log('User ID:', profile.userId);
console.log('Exchanges:', profile.exchanges);
```

#### 11. Funds Fetch Test
```javascript
// Requires: Connected adapter with valid access token
const funds = await adapter.getFunds();
console.log('Available Margin:', funds.availableMargin);
console.log('Used Margin:', funds.usedMargin);
```

#### 12. Orders Fetch Test
```javascript
// Requires: Connected adapter with valid access token
const orders = await adapter.getOrders();
console.log('Total orders:', orders.length);
```

#### 13. Order Placement Test
```javascript
// Requires: Connected adapter with valid access token
// WARNING: Places real order on exchange!
const result = await adapter.placeOrder({
  instrumentToken: 'NSE_EQ|INE669E01016', // NHPC example
  quantity: 1,
  product: 'D',
  transactionType: 'BUY',
  orderType: 'LIMIT',
  price: 100.00,
  validity: 'DAY',
  tag: 'TEST_ORDER'
});
console.log('Order placed:', result.orderId);
```

#### 14. WebSocket Connection Test
```javascript
// Requires: Valid access token from connected adapter
const ws = adapter.getWebSocket();
await ws.connect();

ws.on('orderUpdate', (data) => {
  console.log('Order update received:', data);
});

ws.on('executionUpdate', (data) => {
  console.log('Trade execution:', data.execution);
});
```

#### 15. End-to-End Trade Flow Test
```javascript
// Requires: Connected adapter, WebSocket, and database
// 1. Place order
// 2. Wait for WebSocket execution update
// 3. Verify trade in database
// WARNING: Places real order!
```

---

## Setup Instructions

### 1. Environment Configuration
Edit `backend/.env`:
```env
# Upstox Credentials (Get from https://upstox.com/developer/)
UPSTOX_API_KEY=your_api_key_here
UPSTOX_API_SECRET=your_api_secret_here
UPSTOX_REDIRECT_URI=http://localhost:3000/api/auth/upstox/callback
```

### 2. OAuth 2.0 Flow Setup

#### Step 1: Create Upstox App
1. Go to https://upstox.com/developer/
2. Create a new app
3. Copy API Key (client_id) and API Secret (client_secret)
4. Register redirect URI: `http://localhost:3000/api/auth/upstox/callback`

#### Step 2: Generate Authorization URL
```javascript
const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?` +
  `response_type=code&` +
  `client_id=${UPSTOX_API_KEY}&` +
  `redirect_uri=${encodeURIComponent(UPSTOX_REDIRECT_URI)}`;

console.log('Open this URL in browser:', authUrl);
```

#### Step 3: Login and Get Code
1. Open the authorization URL
2. Login to Upstox account
3. Authorize the app
4. You'll be redirected to: `http://localhost:3000/api/auth/upstox/callback?code=AUTH_CODE_HERE`
5. Extract the `code` parameter

#### Step 4: Connect Adapter
```javascript
const adapter = new UpstoxAdapter();
await adapter.connect({ authCode: 'AUTH_CODE_FROM_STEP_3' });
// Token is now stored in adapter.accessToken (server-side only)
```

### 3. WebSocket Setup
```javascript
// After successful connection
const ws = adapter.getWebSocket();
await ws.connect();

// Subscribe to order updates (automatic on connection)
await ws.subscribeOrderFeed();

// Listen for trade executions
ws.on('executionUpdate', (data) => {
  // Automatically processed by TradeExecutionService
  console.log('Trade executed:', data.execution);
});
```

---

## API Reference

### UpstoxAdapter Methods

#### Authentication
```javascript
// Connect with OAuth code
await adapter.connect({ authCode: string })

// Disconnect and clear session
await adapter.disconnect()
```

#### Data Methods
```javascript
// Get user profile
const profile: Account = await adapter.getProfile()

// Get funds/margin
const funds: Funds = await adapter.getFunds()

// Get open positions
const positions: Position[] = await adapter.getPositions()

// Get order book
const orders: Order[] = await adapter.getOrders()

// Get holdings (delivery)
const holdings: Holding[] = await adapter.getHoldings()

// Get trade history
const trades: Trade[] = await adapter.getTradeHistory()

// Get market quotes
const quotes: Quote[] = await adapter.getQuotes(['NSE_EQ|INE669E01016'])
```

#### Order Methods
```javascript
// Place order
const result = await adapter.placeOrder({
  instrumentToken: string,    // Required: e.g., 'NSE_EQ|INE669E01016'
  quantity: number,           // Required: Must be > 0
  product: string,            // Required: 'D' | 'I' | 'MTF'
  transactionType: string,    // Required: 'BUY' | 'SELL'
  orderType: string,          // Required: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
  price: number,              // Required for LIMIT orders
  triggerPrice: number,       // Required for SL/SL-M orders
  validity: string,           // Optional: 'DAY' | 'IOC' (default: 'DAY')
  disclosedQuantity: number,  // Optional: default 0
  tag: string,                // Optional: custom identifier
  isAMO: boolean,             // Optional: After Market Order
  marketProtection: number    // Optional: -1 (auto), 0 (none), 1-25 (%)
})

// Modify order
const result = await adapter.modifyOrder(orderId: string, {
  quantity: number,           // Optional
  orderType: string,          // Required
  price: number,              // Required
  triggerPrice: number,       // Required
  validity: string,           // Required
  disclosedQuantity: number,  // Optional
  marketProtection: number    // Optional
})

// Cancel order
const result = await adapter.cancelOrder(orderId: string)
```

#### Utility Methods
```javascript
// Get broker capabilities
const capabilities = adapter.getCapabilities()

// Get WebSocket instance
const ws = adapter.getWebSocket()
```

### UpstoxWebSocket Events

```javascript
// Connection events
ws.on('connected', (data) => { ... })
ws.on('disconnected', (data) => { ... })
ws.on('error', (data) => { ... })
ws.on('reconnecting', (data) => { ... })

// Portfolio events
ws.on('orderUpdate', (data) => {
  // All order status changes
  // data.data contains full Upstox order object
})

ws.on('executionUpdate', (data) => {
  // Only broker-confirmed trades
  // data.execution contains normalized Trade object
  // Automatically flows to TradeExecutionService
})

ws.on('positionUpdate', (data) => {
  // Position changes
})

ws.on('holdingUpdate', (data) => {
  // Holding changes
})

ws.on('gttOrderUpdate', (data) => {
  // GTT order changes
})
```

---

## Upstox-Specific Notes

### 1. Instrument Keys
Upstox uses `instrument_token` format: `EXCHANGE|ISIN`
- Example: `NSE_EQ|INE669E01016` (NHPC equity)
- Not symbol strings like "RELIANCE" or "NIFTY"
- Get instrument keys from Upstox BOD instruments file

### 2. Product Types
- `D` - Delivery (CNC)
- `I` - Intraday (MIS)
- `MTF` - Margin Trading Facility

### 3. Order Types
- `MARKET` - Market order (immediate execution at best price)
- `LIMIT` - Limit order (execute at specific price or better)
- `SL` - Stop Loss Limit (trigger + limit price)
- `SL-M` - Stop Loss Market (trigger only)

### 4. Token Validity
- Access tokens valid until 3:30 AM next trading day
- Must re-authenticate daily for live trading
- No refresh token mechanism
- Use manual token generation for testing

### 5. HFT Endpoints
Upstox provides HFT (High Frequency Trading) endpoints:
- `https://api-hft.upstox.com` - Lower latency
- Used automatically for order placement and modification

### 6. Market Protection
- `-1` - Automatic protection (recommended)
- `0` - No protection (may be rejected by exchange)
- `1-25` - Custom percentage (e.g., 2 = 2% price band)

### 7. After Market Orders (AMO)
- Set `is_amo: true` for AMO
- System auto-infers based on market hours
- AMO orders execute at market open

---

## Database Schema (Existing - No Changes)

### Trades Table
```sql
CREATE TABLE trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  broker_id TEXT NOT NULL,
  broker_trade_id TEXT NOT NULL,
  order_id TEXT,
  symbol TEXT,
  exchange TEXT,
  segment TEXT,
  product TEXT,
  side TEXT,
  quantity INTEGER,
  price REAL,
  trade_value REAL,
  trade_date TEXT,
  trade_time TEXT,
  timestamp TEXT,
  status TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(broker_id, broker_trade_id)  -- Duplicate prevention
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  broker_id TEXT NOT NULL,
  broker_order_id TEXT NOT NULL,
  symbol TEXT,
  exchange TEXT,
  quantity INTEGER,
  filled_quantity INTEGER,
  price REAL,
  order_type TEXT,
  side TEXT,
  status TEXT,
  timestamp TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(broker_id, broker_order_id)
);
```

---

## Troubleshooting

### Issue: "Not connected to Upstox"
**Cause**: Adapter not connected or token expired  
**Solution**: Call `adapter.connect({ authCode })` with fresh authorization code

### Issue: "Missing WebSocket authentication token"
**Cause**: Trying to connect WebSocket before adapter authentication  
**Solution**: Connect adapter first, then get WebSocket via `adapter.getWebSocket()`

### Issue: "Order validation failed"
**Cause**: Invalid order parameters  
**Solution**: Check error message, ensure all required fields present and valid

### Issue: "Invalid Credentials error"
**Cause**: client_id, redirect_uri don't match registered values  
**Solution**: Verify .env values match Upstox app configuration exactly

### Issue: Token expired daily
**Cause**: Upstox tokens expire at 3:30 AM daily  
**Solution**: This is expected behavior. Re-authenticate each trading day.

### Issue: WebSocket disconnects randomly
**Cause**: Network issues or token expiry  
**Solution**: WebSocket auto-reconnects. If persistent, check token validity.

### Issue: Duplicate trades in database
**Cause**: Should never happen (UNIQUE constraint)  
**Solution**: Check logs for constraint violations. System handles this automatically.

---

## Performance Notes

- **HFT Endpoints**: Used automatically for order placement (lower latency)
- **WebSocket**: Single connection handles all portfolio updates
- **Normalization**: Happens in-memory, negligible overhead
- **Database**: SQLite with indexes on (broker_id, broker_trade_id)
- **Token Caching**: Access token stored in adapter instance (no repeated auth)

---

## Security Considerations

✅ **Tokens stored server-side only** - Never exposed to frontend  
✅ **Credentials sanitized in logs** - No accidental leaks  
✅ **PAN masked in responses** - Privacy protection  
✅ **Error messages safe** - No credential exposure  
✅ **Environment variables** - Credentials in .env (git-ignored)  
✅ **HTTPS/WSS only** - Secure transport  

---

## Next Steps

1. **Test without credentials** (syntax, imports, instantiation)
2. **Get Upstox API credentials** from developer portal
3. **Set up .env file** with API key and secret
4. **Test OAuth flow** and connection
5. **Test data fetching** methods
6. **Test WebSocket** connection and events
7. **Test order placement** (paper trading recommended first)
8. **Monitor database** for trade persistence

---

## Support & Resources

- **Upstox API Docs**: https://upstox.com/developer/api-documentation
- **Upstox Developer Portal**: https://upstox.com/developer/
- **RiskLoop Architecture**: See existing Angel One, FYERS, Dhan implementations
- **WebSocket Protocol**: https://upstox.com/developer/api-documentation/get-portfolio-stream-feed/

---

## Summary

✅ **Complete OAuth2 authentication flow**  
✅ **All data fetching methods implemented**  
✅ **Order placement, modification, cancellation**  
✅ **Real-time WebSocket with trade execution detection**  
✅ **Automatic database persistence**  
✅ **Security best practices followed**  
✅ **Compatible with existing architecture**  
✅ **No breaking changes to other brokers**  

**Status**: Ready for testing and deployment  
**Requires**: Upstox API credentials for live testing  
**Next Phase**: Testing with real credentials and production deployment
