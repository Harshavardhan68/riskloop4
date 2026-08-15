# 🚀 Phase 4 Quick Start Guide

## Prerequisites

✅ Phase 1, 2, and 3 completed  
✅ Backend running on `http://localhost:3000`  
✅ Angel One credentials in `backend/.env`  
✅ `ws` package installed in backend

---

## Step 1: Install WebSocket Package

The `ws` package has been added to `package.json`. You need to install it:

```powershell
cd backend

# If npm commands work:
npm install

# If PowerShell execution policy blocks npm:
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again:
npm install
```

**Verify installation:**
```powershell
npm list ws
# Should show: ws@8.16.0 (or similar)
```

---

## Step 2: Start Backend

```powershell
cd backend
npm run dev
```

**Expected output:**
```
🛡️  RiskLoop Backend API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port 3000
🏥 Health check: http://localhost:3000/health

📍 API Endpoints:
   • POST   /api/websocket/connect
   • POST   /api/websocket/subscribe/market-data
   • POST   /api/websocket/subscribe/order-feed
   • GET    /api/websocket/trades
   [... other endpoints ...]
```

---

## Step 3: Open Frontend

Open `index.html` in browser (or use Live Server in VS Code).

---

## Step 4: Connect to Angel One

1. Navigate to **Journal** page
2. Click **"Connect Broker"** button
3. Select **Angel One**
4. Wait for connection (~3 seconds)

**What happens:**
1. Backend authenticates with Angel One REST API
2. WebSocket connection established automatically
3. Order feed subscribed
4. Ready to receive real-time updates

---

## Step 5: Verify WebSocket Connection

### Option A: Browser Console

Open browser console (F12) and run:

```javascript
// Check WebSocket status
await window.webSocketClient.getStatus('angelone');
```

**Expected output:**
```javascript
{
  success: true,
  data: {
    brokerId: "angelone",
    brokerName: "Angel One",
    isConnected: true,
    connectionState: "CONNECTED",
    reconnectAttempts: 0,
    subscriptions: 0
  }
}
```

### Option B: Backend Logs

Check backend terminal for:
```
[Angel One WebSocket] Connecting to Angel One WebSocket...
[Angel One WebSocket] WebSocket connection established
[Angel One WebSocket] Subscribed to order feed
```

---

## Step 6: Test Market Data (Optional)

Subscribe to RELIANCE stock for real-time prices:

```javascript
// Subscribe to RELIANCE LTP
await window.webSocketClient.subscribeMarketData('angelone', [
  { exchange: 'NSE_CM', token: '2885', symbol: 'RELIANCE' }
], 'LTP');

// Listen for price updates
window.webSocketClient.onMarketData('NSE_CM:2885', (data) => {
  console.log('RELIANCE LTP:', data.ltp, 'at', data.timestamp);
});
```

**Expected:**
- Real-time LTP updates every few seconds
- Console logs showing price changes

---

## Step 7: Test Trade Execution Tracking

### IMPORTANT: This requires a REAL order execution

**Scenario: Place order through Angel One app**

1. Open Angel One mobile app or web
2. Place a small test order (e.g., 1 share)
3. Wait for order execution
4. Check RiskLoop

**In Browser Console:**
```javascript
// Listen for executions
window.webSocketClient.onExecution((tradeData) => {
  console.log('🎯 NEW TRADE EXECUTION:', tradeData);
  console.log('Symbol:', tradeData.symbol);
  console.log('Side:', tradeData.transactionType);
  console.log('Quantity:', tradeData.quantity);
  console.log('Price:', tradeData.price);
  console.log('Is Partial Fill:', tradeData.isPartialFill);
});

// Check all trades
const trades = await window.webSocketClient.getTrades('angelone');
console.log('All trades:', trades.data);
```

**Expected:**
- Trade appears ONLY after broker execution
- Trade data matches actual execution
- No duplicate trades
- Partial fills tracked correctly

---

## Step 8: Verify Trade Synchronization

Check that REST API trades and WebSocket trades are synchronized:

```javascript
// Get REST API trades
const restTrades = await window.brokerAPI.getTrades('angelone');
console.log('REST trades:', restTrades.data.length);

// Get WebSocket trades
const wsTrades = await window.webSocketClient.getTrades('angelone');
console.log('WebSocket trades:', wsTrades.data.length);

// Should be the same count (no duplicates)
```

---

## 🎯 Quick Test Checklist

- [ ] Backend running on port 3000
- [ ] `ws` package installed
- [ ] Frontend loads without errors
- [ ] Connect to Angel One succeeds
- [ ] WebSocket status shows "CONNECTED"
- [ ] Backend logs show WebSocket connection
- [ ] No errors in browser console
- [ ] Market data subscription works (optional)
- [ ] Order feed subscribed automatically
- [ ] Trades sync correctly (requires real execution)

---

## 🚨 Troubleshooting

### Problem: "Cannot find module 'ws'"

**Solution:**
```powershell
cd backend
npm install ws --save
```

### Problem: "WebSocket connection failed"

**Cause:** Backend not connected to Angel One or invalid tokens.

**Solution:**
1. Check backend logs for authentication errors
2. Verify `.env` credentials are correct
3. Try disconnecting and reconnecting

### Problem: "WebSocket not connected"

**Cause:** WebSocket connection not established yet.

**Solution:**
1. Wait 2-3 seconds after broker connection
2. Check WebSocket status: `await window.webSocketClient.getStatus('angelone')`
3. If disconnected, try: `await window.webSocketClient.connect('angelone')`

### Problem: "No trade executions showing"

**Cause:** No actual broker executions have occurred.

**Solution:**
- This is CORRECT behavior - trades only appear after actual executions
- Place a real order through Angel One app to test
- Check order feed for order status updates (not trades)

### Problem: Duplicate trades appearing

**Solution:**
- Check backend logs for: `[TradeExecutionService] Duplicate execution ignored`
- If duplicates still appear, report as bug with execution IDs

---

## 📊 What to Expect

### After Connection:

✅ **WebSocket Connected**
- Connection state: CONNECTED
- Order feed: Subscribed
- Ready for market data subscriptions

✅ **Order Updates (Real-Time)**
- Order placed → Order status update received
- Order pending/open/rejected → Status tracked
- Order filled → Execution event fired

✅ **Trade Executions (Actual Only)**
- Broker executes order → Trade created in RiskLoop
- Partial fill → Trade updated with each execution
- Duplicate executions → Automatically prevented
- REST + WebSocket → Synchronized (no duplicates)

### What NOT to Expect:

❌ **Instant UI Updates**
- Portfolio page doesn't auto-refresh yet
- Must navigate away and back to see new trades
- Future enhancement: Real-time UI updates

❌ **Trades Without Executions**
- Orders don't become trades until filled
- Pending orders show in orders list, not trades
- This is CORRECT behavior per requirements

❌ **Direct WebSocket to Browser**
- Frontend polls backend, doesn't connect directly to Angel One
- Adds 2-5 second delay but simpler and more secure
- Future enhancement: Server-Sent Events or direct WebSocket

---

## 🎉 Success Indicators

You know Phase 4 is working when:

1. ✅ Backend starts without errors
2. ✅ WebSocket status shows "CONNECTED"
3. ✅ Order feed subscribed automatically
4. ✅ Market data subscriptions work (if tested)
5. ✅ Real broker executions create trades in RiskLoop
6. ✅ No duplicate trades
7. ✅ Partial fills tracked correctly
8. ✅ REST and WebSocket trades match

---

## 📚 Next Steps

After verifying Phase 4 works:

1. **Test with real trading** (carefully, with small quantities)
2. **Monitor for issues** (check logs, console)
3. **Document any bugs** (execution IDs, timestamps, error messages)
4. **Plan Phase 5** (UI real-time updates, live P&L)

---

## 🆘 Need Help?

1. Check `PHASE4-WEBSOCKET-INTEGRATION.md` for full documentation
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify Angel One credentials in `.env`
5. Ensure backend is running and healthy: `http://localhost:3000/health`

---

**Phase 4 is complete and ready to test!** 🚀

Start the backend, connect to Angel One, and verify WebSocket connection works.
