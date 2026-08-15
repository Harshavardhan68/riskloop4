# 🏦 RiskLoop Multi-Broker Integration Guide

## 📋 Overview

This guide documents the multi-broker integration architecture implemented for the RiskLoop trading platform. The system supports 9 brokers with a unified API interface.

## 🎯 Architecture Summary

```
┌─────────────────────────────────────────┐
│      RiskLoop Frontend (Unchanged)       │
│         HTML/CSS/JavaScript              │
└───────────────┬─────────────────────────┘
                │
                ↓ HTTP/REST API
┌─────────────────────────────────────────┐
│      RiskLoop Backend API (NEW)          │
│        Node.js + Express.js              │
│                                          │
│  Endpoints:                              │
│  • /api/auth/connect                     │
│  • /api/account/profile                  │
│  • /api/account/funds                    │
│  • /api/positions                        │
│  • /api/orders                           │
│  • /api/holdings                         │
│  • /api/quotes                           │
│  • /api/trades                           │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│   Broker Abstraction Layer (NEW)        │
│        BrokerService.js                  │
│                                          │
│  • Adapter factory                       │
│  • Session management                    │
│  • Broker registry                       │
│  • Capability checking                   │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│     Broker Adapters (9 adapters)        │
│                                          │
│  Indian Brokers:                         │
│  • AngelOneAdapter (primary)             │
│  • FyersAdapter                          │
│  • DhanAdapter                           │
│  • UpstoxAdapter                         │
│  • ShoonyaAdapter                        │
│  • AliceBlueAdapter                      │
│  • KotakNeoAdapter                       │
│  • SamcoAdapter                          │
│                                          │
│  Forex:                                  │
│  • MT5Adapter                            │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│         Broker APIs                      │
│  (Angel One, FYERS, Dhan, etc.)         │
└─────────────────────────────────────────┘
```

## 📦 Files Created

### Backend Structure
```
backend/
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── package.json                    # Node.js dependencies
├── README.md                       # Backend documentation
│
├── src/
│   ├── models/                     # Normalized data models
│   │   ├── Account.js             # User account/profile
│   │   ├── Position.js            # Trading position
│   │   ├── Order.js               # Order details
│   │   ├── Funds.js               # Funds/margin
│   │   ├── Holding.js             # Long-term holdings
│   │   ├── Quote.js               # Market quotes
│   │   ├── Trade.js               # Trade history
│   │   └── index.js               # Models export
│   │
│   ├── brokers/                    # Broker adapters
│   │   ├── BaseBrokerAdapter.js   # Abstract base class
│   │   ├── index.js               # Adapters export
│   │   │
│   │   ├── angelone/
│   │   │   └── AngelOneAdapter.js # Angel One implementation
│   │   ├── fyers/
│   │   │   └── FyersAdapter.js    # FYERS placeholder
│   │   ├── dhan/
│   │   │   └── DhanAdapter.js     # Dhan placeholder
│   │   ├── upstox/
│   │   │   └── UpstoxAdapter.js   # Upstox placeholder
│   │   ├── shoonya/
│   │   │   └── ShoonyaAdapter.js  # Shoonya placeholder
│   │   ├── aliceblue/
│   │   │   └── AliceBlueAdapter.js # Alice Blue placeholder
│   │   ├── kotakneo/
│   │   │   └── KotakNeoAdapter.js # Kotak Neo placeholder
│   │   ├── samco/
│   │   │   └── SamcoAdapter.js    # SAMCO placeholder
│   │   └── mt5/
│   │       └── MT5Adapter.js      # MT5 placeholder
│   │
│   ├── services/
│   │   └── BrokerService.js       # Broker management service
│   │
│   ├── routes/                     # API routes
│   │   ├── auth.js                # Authentication endpoints
│   │   ├── brokers.js             # Broker listing endpoints
│   │   ├── account.js             # Account data endpoints
│   │   ├── positions.js           # Positions endpoints
│   │   ├── orders.js              # Orders endpoints
│   │   ├── holdings.js            # Holdings endpoints
│   │   ├── quotes.js              # Quotes endpoints
│   │   ├── trades.js              # Trade history endpoints
│   │   └── index.js               # Routes export
│   │
│   └── server.js                   # Express server entry
│
└── BROKER-INTEGRATION-GUIDE.md     # This file
```

**Total Files Created:** 37 files

## 🔄 Data Normalization

All broker responses are transformed into these normalized models:

### Account Model
```javascript
{
  brokerId: string,          // 'angelone', 'fyers', etc.
  brokerName: string,        // 'Angel One', 'FYERS'
  userId: string,            // Broker's user ID
  clientId: string,          // Broker's client code
  name: string,              // User's name
  email: string,             // Email address
  mobile: string,            // Mobile number
  pan: string,               // PAN (masked)
  exchanges: string[],       // ['NSE', 'BSE']
  segments: string[],        // ['EQUITY', 'DERIVATIVE']
  products: string[],        // ['CNC', 'MIS', 'NRML']
  accountStatus: string,     // 'ACTIVE', 'SUSPENDED'
  connectedAt: string,       // ISO timestamp
  metadata: object           // Broker-specific extras
}
```

### Position Model
```javascript
{
  positionId: string,
  symbol: string,            // 'RELIANCE', 'NIFTY'
  tradingSymbol: string,     // Full symbol with expiry
  exchange: string,          // 'NSE', 'BSE', 'MCX'
  segment: string,           // 'EQUITY', 'DERIVATIVE'
  product: string,           // 'CNC', 'MIS', 'NRML'
  instrumentType: string,    // 'EQ', 'FUT', 'CE', 'PE'
  quantity: number,          // +ve long, -ve short
  buyPrice: number,
  sellPrice: number,
  lastPrice: number,
  pnl: number,               // Total P&L
  realizedPnl: number,
  unrealizedPnl: number,
  pnlPercent: number,
  lotSize: number,
  value: number,
  investedValue: number,
  currentValue: number,
  metadata: object
}
```

### Order Model
```javascript
{
  orderId: string,
  symbol: string,
  exchange: string,
  orderType: string,         // 'MARKET', 'LIMIT', 'SL'
  transactionType: string,   // 'BUY', 'SELL'
  quantity: number,
  filledQuantity: number,
  pendingQuantity: number,
  price: number,
  triggerPrice: number,
  averagePrice: number,
  status: string,            // 'PENDING', 'COMPLETE', etc.
  statusMessage: string,
  validity: string,          // 'DAY', 'IOC', 'GTT'
  variety: string,           // 'REGULAR', 'AMO', 'CO'
  orderTimestamp: string,
  updateTimestamp: string,
  metadata: object
}
```

### Funds Model
```javascript
{
  segment: string,           // 'EQUITY', 'COMMODITY'
  availableMargin: number,
  usedMargin: number,
  totalMargin: number,
  openingBalance: number,
  netBalance: number,
  realizedPnl: number,
  unrealizedPnl: number,
  marginUsed: number,
  collateral: number,
  exposureMargin: number,
  spanMargin: number,
  timestamp: string,
  metadata: object
}
```

### Holding Model
```javascript
{
  symbol: string,
  tradingSymbol: string,
  isin: string,
  exchange: string,
  quantity: number,
  t1Quantity: number,
  authorizedQuantity: number,
  collateralQuantity: number,
  averagePrice: number,
  lastPrice: number,
  pnl: number,
  dayPnl: number,
  pnlPercent: number,
  investedValue: number,
  currentValue: number,
  metadata: object
}
```

### Quote Model
```javascript
{
  symbol: string,
  tradingSymbol: string,
  exchange: string,
  ltp: number,               // Last traded price
  open: number,
  high: number,
  low: number,
  close: number,
  change: number,
  changePercent: number,
  volume: number,
  bidPrice: number,
  bidQty: number,
  askPrice: number,
  askQty: number,
  upperCircuit: number,
  lowerCircuit: number,
  lotSize: number,
  timestamp: string,
  metadata: object
}
```

### Trade Model
```javascript
{
  tradeId: string,
  orderId: string,
  symbol: string,
  exchange: string,
  transactionType: string,   // 'BUY', 'SELL'
  quantity: number,
  price: number,
  tradeValue: number,
  tradeDate: string,
  tradeTime: string,
  timestamp: string,
  metadata: object
}
```

## 🔌 Broker Adapter Interface

All adapters implement these methods:

```javascript
class BrokerAdapter extends BaseBrokerAdapter {
  // Authentication
  async connect(credentials)       // Establish connection
  async disconnect()               // Clean up session

  // Capabilities
  getCapabilities()                // Return supported features
  supportsCapability(name)         // Check if feature supported

  // Data fetching
  async getProfile()               // → Account
  async getFunds()                 // → Funds
  async getPositions()             // → Position[]
  async getOrders()                // → Order[]
  async getHoldings()              // → Holding[]
  async getTradeHistory()          // → Trade[]
  async getQuotes(symbols)         // → Quote[]

  // Order operations (DISABLED IN PHASE 1)
  async placeOrder(params)         // Throws error
  async modifyOrder(id, mods)      // Throws error
  async cancelOrder(id)            // Throws error
}
```

## 🚀 Quick Start Guide

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Configure Environment

```powershell
copy .env.example .env
```

Edit `.env` - **do not add real credentials yet!**

### 3. Start Development Server

```powershell
npm run dev
```

Server starts on `http://localhost:3000`.

### 4. Test Health Endpoint

```powershell
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "RiskLoop Backend API is running",
  "timestamp": "2026-08-11T...",
  "version": "1.0.0"
}
```

## 📡 API Usage Examples

### List Available Brokers

```powershell
curl http://localhost:3000/api/brokers
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "angelone",
      "name": "Angel One",
      "type": "indian",
      "logo": "/logos/angleone.png",
      "enabled": true
    },
    // ... 8 more brokers
  ]
}
```

### Get Broker Capabilities

```powershell
curl http://localhost:3000/api/brokers/angelone/capabilities
```

Response:
```json
{
  "success": true,
  "data": {
    "brokerId": "angelone",
    "capabilities": {
      "profile": true,
      "funds": true,
      "positions": true,
      "orders": true,
      "holdings": true,
      "quotes": true,
      "tradeHistory": true,
      "placeOrder": false,
      "modifyOrder": false,
      "cancelOrder": false
    }
  }
}
```

### Connect to Broker (Placeholder)

```powershell
curl -X POST http://localhost:3000/api/auth/connect `
  -H "Content-Type: application/json" `
  -d '{\"brokerId\":\"angelone\",\"credentials\":{}}'
```

Currently returns `connected: false` (not implemented).

### Get Profile (After Connection)

```powershell
curl "http://localhost:3000/api/account/profile?brokerId=angelone"
```

Currently returns placeholder data.

## 🎯 Implementation Status

### ✅ Completed

- [x] Backend project structure
- [x] Normalized data models (7 models)
- [x] Base broker adapter interface
- [x] Broker service (abstraction layer)
- [x] API routes (8 route files)
- [x] Express server with middleware
- [x] CORS configuration
- [x] Rate limiting
- [x] Security headers (Helmet.js)
- [x] Health check endpoint
- [x] Environment variable template
- [x] Placeholder adapters (9 brokers)
- [x] Capabilities system
- [x] Session management
- [x] Error handling
- [x] Request logging
- [x] Documentation

### ⏳ TODO (Next Phase)

- [ ] Implement Angel One adapter (real API calls)
- [ ] Add JWT/session authentication
- [ ] Add database (PostgreSQL/MongoDB)
- [ ] Implement WebSocket for real-time data
- [ ] Add comprehensive error handling
- [ ] Add request/response validation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Implement FYERS adapter
- [ ] Implement other broker adapters
- [ ] Add order placement (Phase 2)
- [ ] Add order modification (Phase 2)
- [ ] Add frontend broker connection UI

## 🔐 Security Considerations

### Implemented
- ✅ Environment variables for credentials
- ✅ CORS protection
- ✅ Rate limiting (100 req/15 min)
- ✅ Helmet.js security headers
- ✅ No credentials in source code
- ✅ .env excluded from Git

### Recommended for Production
- [ ] HTTPS/TLS encryption
- [ ] JWT authentication
- [ ] OAuth2 for broker connections
- [ ] Database encryption
- [ ] API key rotation
- [ ] Audit logging
- [ ] IP whitelisting
- [ ] DDoS protection (Cloudflare)
- [ ] Secrets management (AWS Secrets Manager)

## 📝 Next Steps for Angel One Implementation

When ready to implement Angel One adapter:

1. **Get Angel One credentials**
   - Register at https://smartapi.angelbroking.com/
   - Get API Key, Client ID, Password, TOTP Secret

2. **Update .env file**
   ```
   ANGELONE_API_KEY=your_api_key
   ANGELONE_CLIENT_ID=your_client_id
   ANGELONE_PASSWORD=your_password
   ANGELONE_TOTP_SECRET=your_totp_secret
   ```

3. **Implement authentication**
   - Generate TOTP from secret
   - Call login API
   - Store access token, refresh token

4. **Implement data fetching**
   - Profile: `/rest/secure/angelbroking/user/v1/getProfile`
   - Funds: `/rest/secure/angelbroking/user/v1/getRMS`
   - Positions: `/rest/secure/angelbroking/order/v1/getPosition`
   - Orders: `/rest/secure/angelbroking/order/v1/getOrderBook`
   - Holdings: `/rest/secure/angelbroking/portfolio/v1/getHolding`
   - Trades: `/rest/secure/angelbroking/order/v1/getTradeBook`
   - Quotes: `/rest/secure/angelbroking/market/v1/quote/`

5. **Implement normalization**
   - Transform Angel One responses to internal models
   - Handle API-specific field names
   - Map status codes correctly

6. **Test thoroughly**
   - Test in sandbox environment first
   - Verify all data transformations
   - Handle error cases
   - Test rate limiting

## 🤝 Contributing

When implementing additional broker adapters:

1. Create new adapter file in `backend/src/brokers/<broker>/`
2. Extend `BaseBrokerAdapter`
3. Implement all required methods
4. Transform responses to normalized models
5. Handle errors gracefully
6. Mark unsupported capabilities in `getCapabilities()`
7. Add to exports in `backend/src/brokers/index.js`
8. Register in `BrokerService.js`
9. Add logo to frontend `/logos/` directory
10. Update documentation

## ⚠️ Important Notes

### Phase 1 Limitations
- **No order placement/modification** - Read-only operations only
- **No real broker connections** - Placeholder implementations
- **No authentication** - Session management basic
- **No database** - In-memory only
- **No WebSockets** - HTTP polling only

### Frontend NOT Modified
The existing RiskLoop frontend remains **completely unchanged**. No modifications were made to:
- `index.html`
- `styles.css`
- `script.js`
- `market-data.js`
- Any frontend files

Frontend integration will be done in a later phase.

## 📞 Support

For questions or issues:
1. Check `backend/README.md`
2. Review this guide
3. Check broker adapter implementation
4. Review normalized data models
5. Test with health check endpoint

## 📄 License

MIT License

---

**🛡️ RiskLoop Multi-Broker Integration**  
Version 1.0.0 | Phase 1 Complete | August 2026
