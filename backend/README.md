# RiskLoop Backend API

Multi-broker integration backend for RiskLoop trading platform.

## 🏗️ Architecture

```
Frontend (RiskLoop UI)
    ↓
Backend API (Express.js)
    ↓
Broker Service (Abstraction Layer)
    ↓
Broker Adapters (9 brokers)
    ↓
Broker APIs (Angel One, FYERS, etc.)
```

## 📦 Supported Brokers

### Indian Brokers
- **Angel One** (SmartAPI) - Primary implementation target
- **FYERS**
- **Dhan**
- **Upstox**
- **Shoonya** (Finvasia)
- **Alice Blue**
- **Kotak Neo**
- **SAMCO**

### Forex Brokers
- **MetaTrader 5** (MT5)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` with your credentials (if implementing a real broker).

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`.

### 4. Check Health

```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/connect` - Connect to broker
- `POST /api/auth/disconnect` - Disconnect from broker
- `GET /api/auth/status/:brokerId` - Check connection status

### Brokers

- `GET /api/brokers` - List all brokers
- `GET /api/brokers/indian` - List Indian brokers
- `GET /api/brokers/forex` - List Forex brokers
- `GET /api/brokers/:brokerId/capabilities` - Get broker capabilities

### Account

- `GET /api/account/profile?brokerId=<id>` - Get user profile
- `GET /api/account/funds?brokerId=<id>` - Get funds/margin

### Positions & Orders

- `GET /api/positions?brokerId=<id>` - Get positions
- `GET /api/orders?brokerId=<id>` - Get order book
- `GET /api/holdings?brokerId=<id>` - Get holdings
- `GET /api/trades?brokerId=<id>` - Get trade history

### Market Data

- `POST /api/quotes?brokerId=<id>` - Get quotes
  - Body: `{ "symbols": ["RELIANCE", "TCS"] }`

## 🔒 Security

- **Never commit .env file** - Contains broker credentials
- API keys, secrets, passwords stored in environment variables
- No credentials in source code
- CORS protection enabled
- Rate limiting applied
- Helmet.js security headers

## 📂 Project Structure

```
backend/
├── src/
│   ├── models/           # Normalized data models
│   │   ├── Account.js
│   │   ├── Position.js
│   │   ├── Order.js
│   │   ├── Funds.js
│   │   ├── Holding.js
│   │   ├── Quote.js
│   │   └── Trade.js
│   │
│   ├── brokers/          # Broker adapters
│   │   ├── BaseBrokerAdapter.js
│   │   ├── angelone/
│   │   ├── fyers/
│   │   ├── dhan/
│   │   ├── upstox/
│   │   ├── shoonya/
│   │   ├── aliceblue/
│   │   ├── kotakneo/
│   │   ├── samco/
│   │   └── mt5/
│   │
│   ├── services/         # Business logic
│   │   └── BrokerService.js
│   │
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── brokers.js
│   │   ├── account.js
│   │   ├── positions.js
│   │   ├── orders.js
│   │   ├── holdings.js
│   │   ├── quotes.js
│   │   └── trades.js
│   │
│   └── server.js         # Express app
│
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🎯 Normalized Data Models

All broker responses are transformed into consistent internal models:

### Account
```javascript
{
  brokerId, brokerName, userId, clientId,
  name, email, mobile, pan,
  exchanges, segments, products,
  accountStatus
}
```

### Position
```javascript
{
  symbol, exchange, segment, product,
  quantity, buyPrice, sellPrice, lastPrice,
  pnl, realizedPnl, unrealizedPnl
}
```

### Order
```javascript
{
  orderId, symbol, exchange, orderType,
  transactionType, quantity, price,
  status, filledQuantity, averagePrice
}
```

### Funds
```javascript
{
  segment, availableMargin, usedMargin,
  totalMargin, realizedPnl, unrealizedPnl
}
```

## 🔌 Broker Adapter Interface

All broker adapters extend `BaseBrokerAdapter` and implement:

- `connect(credentials)` - Authenticate with broker
- `disconnect()` - Clean up session
- `getProfile()` - Fetch user profile
- `getFunds()` - Fetch available funds
- `getPositions()` - Fetch current positions
- `getOrders()` - Fetch order book
- `getHoldings()` - Fetch holdings
- `getTradeHistory()` - Fetch trade history
- `getQuotes(symbols)` - Fetch market quotes

## ⚠️ Phase 1 Limitations

**Order placement/modification is DISABLED:**
- `placeOrder()` - Not implemented
- `modifyOrder()` - Not implemented
- `cancelOrder()` - Not implemented

Read-only operations only in this phase.

## 🧪 Testing Endpoints

### Get Available Brokers
```bash
curl http://localhost:3000/api/brokers
```

### Check Broker Capabilities
```bash
curl http://localhost:3000/api/brokers/angelone/capabilities
```

### Connect to Broker (Placeholder)
```bash
curl -X POST http://localhost:3000/api/auth/connect \
  -H "Content-Type: application/json" \
  -d '{"brokerId":"angelone","credentials":{}}'
```

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev
```

Uses `nodemon` for auto-restart on file changes.

### Run in Production
```bash
npm start
```

## 📝 Adding a New Broker

1. Create adapter file: `src/brokers/newbroker/NewBrokerAdapter.js`
2. Extend `BaseBrokerAdapter`
3. Implement all required methods
4. Add to `src/brokers/index.js`
5. Register in `BrokerService.js`
6. Add environment variables to `.env.example`

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

### CORS Errors
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500,https://yourdomain.com
```

### Module Not Found
```bash
# Ensure dependencies are installed
npm install
```

## 📚 Next Steps

1. **Implement Angel One adapter** (real API calls)
2. **Add authentication middleware** (JWT/session-based)
3. **Add database** (store sessions, cache data)
4. **Implement WebSocket** (real-time quotes)
5. **Add order placement** (Phase 2)
6. **Implement other brokers** (FYERS, Dhan, etc.)

## 🤝 Contributing

When implementing a broker adapter:
1. Follow the existing adapter structure
2. Transform all responses to normalized models
3. Handle errors gracefully
4. Log important events
5. Mark unsupported capabilities in `getCapabilities()`

## 📄 License

MIT License

## ⚠️ Disclaimer

This is an integration layer. Always:
- Test in broker's sandbox/paper trading environment first
- Never store sensitive credentials in code
- Follow broker's API usage guidelines
- Implement proper error handling
- Use at your own risk
