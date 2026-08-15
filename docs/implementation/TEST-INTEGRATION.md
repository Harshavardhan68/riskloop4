# 🧪 Phase 3 Integration Testing Guide

## Test Environment Setup

### Prerequisites Checklist:
- [ ] Backend running on `http://localhost:3000`
- [ ] Angel One credentials in `backend/.env`
- [ ] Frontend opened in browser
- [ ] Browser console open (F12)

---

## Test Suite 1: Backend API Tests

### Test 1.1: Backend Health Check
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/health" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "message": "RiskLoop Backend API is running",
  "timestamp": "2026-08-11T...",
  "version": "1.0.0"
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.2: Get Available Brokers
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/brokers" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "angelone",
      "name": "Angel One",
      "type": "indian",
      "logo": "/logos/angelone.png",
      "capabilities": {...}
    },
    ...
  ]
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.3: Check Angel One Connection Status (Before Connect)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/status/angelone" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "brokerId": "angelone",
    "connected": false
  }
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.4: Connect to Angel One
```powershell
$body = @{
    brokerId = "angelone"
    credentials = @{}
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/connect" -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Connected to Angel One",
  "data": {
    "brokerId": "angelone",
    "brokerName": "Angel One",
    "connected": true
  }
}
```

**Possible Errors:**
- Authentication failed → Check credentials in .env
- TOTP error → Check TOTP_SECRET is correct
- Network error → Check internet connection

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.5: Get Profile (After Connect)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/account/profile?brokerId=angelone" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "brokerId": "angelone",
    "clientId": "A123456",
    "name": "Your Name",
    "email": "your@email.com",
    "mobile": "9876543210",
    "exchanges": ["NSE", "BSE", "NFO"]
  }
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.6: Get Funds
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/account/funds?brokerId=angelone" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "brokerId": "angelone",
    "availableMargin": 50000.00,
    "usedMargin": 10000.00,
    "collateral": 0.00,
    "withdrawableBalance": 40000.00
  }
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.7: Get Positions
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/positions?brokerId=angelone" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "brokerId": "angelone",
      "symbol": "NIFTY26AUG24FUT",
      "exchange": "NFO",
      "product": "INTRADAY",
      "side": "BUY",
      "quantity": 50,
      "averagePrice": 24500.00,
      "ltp": 24550.00,
      "pnl": 2500.00
    }
  ]
}
```

**Note:** Empty array `[]` if no positions.

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.8: Get Orders
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/orders?brokerId=angelone" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "data": []
}
```

**Note:** Empty array if no orders today.

**Result:** ✅ Pass / ❌ Fail

---

### Test 1.9: Disconnect
```powershell
$body = @{
    brokerId = "angelone"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/disconnect" -Method POST -Body $body -ContentType "application/json" | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Disconnected successfully"
}
```

**Result:** ✅ Pass / ❌ Fail

---

## Test Suite 2: Frontend UI Tests

### Test 2.1: Page Load
**Steps:**
1. Open frontend in browser
2. Open browser console (F12)
3. Check for errors

**Expected:**
- No JavaScript errors
- All pages load (Calculator, Market, Journal, Portfolio, About)
- Navigation works

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.2: Broker Modal
**Steps:**
1. Navigate to Journal page
2. Click "Connect Broker" button (globe icon)
3. Broker modal should open

**Expected:**
- Modal opens with broker grid
- All brokers listed (Angel One, FYERS, Dhan, etc.)
- Search box functional
- Close button works

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.3: Broker API Loaded
**Steps:**
1. Open browser console
2. Run: `console.log(window.brokerAPI)`

**Expected:**
```javascript
BrokerAPI {
  connectedBrokers: Map(0) {},
  listeners: Map(0) {},
  fetch: ƒ,
  checkHealth: ƒ,
  connect: ƒ,
  ...
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.4: Backend Health Check (Frontend)
**Steps:**
1. Open browser console
2. Run: `await window.brokerAPI.checkHealth()`

**Expected:**
```javascript
true
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.5: Get Brokers (Frontend)
**Steps:**
1. Open browser console
2. Run: `await window.brokerAPI.getBrokers()`

**Expected:**
```javascript
[
  {
    id: "angelone",
    name: "Angel One",
    type: "indian",
    ...
  },
  ...
]
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.6: Connect to Angel One (UI)
**Steps:**
1. Click "Connect Broker" in Journal page
2. Select "Angel One"
3. Wait for connection

**Expected:**
- Toast: "Connecting to Angel One..."
- Toast: "Connected to Angel One successfully!"
- Redirects to Portfolio page
- Portfolio shows account data

**Verify Console Output:**
```javascript
Selected broker: Angel One
✓ Loaded Angel One data: {
  profile: 'Yes',
  funds: 'Yes',
  positions: 0,
  orders: 0,
  holdings: 0,
  trades: 0
}
```

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.7: Portfolio Data Display
**Steps:**
1. After connection, check Portfolio page

**Expected Sections:**
- ✅ Account Overview header
- ✅ Profile section with client details
- ✅ Funds section with margin
- ✅ Positions table (or "No open positions")
- ✅ Orders table (or "No orders")
- ✅ Holdings table (or "No holdings")
- ✅ Trades table (or "No trades today")

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.8: Refresh Data
**Steps:**
1. In Portfolio page, click "Refresh" button
2. Watch browser console for API calls

**Expected:**
- Data reloads from backend
- Console shows API calls:
  - GET /api/account/profile
  - GET /api/account/funds
  - GET /api/positions
  - GET /api/orders
  - GET /api/holdings
  - GET /api/trades

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.9: Disconnect (UI)
**Steps:**
1. In Portfolio page, click "Disconnect" button
2. Confirm disconnect

**Expected:**
- Toast: "Disconnected successfully"
- Portfolio page returns to "Coming Soon" state
- `window.brokerData['angel-one']` is deleted

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.10: Error Handling (Backend Down)
**Steps:**
1. Stop backend server
2. Try to connect to Angel One

**Expected:**
- Error toast: "Backend server is not running. Please start the backend with 'npm run dev' in the backend folder."
- No JavaScript console errors (error is caught)

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.11: Error Handling (Invalid Credentials)
**Steps:**
1. Edit backend/.env with invalid credentials
2. Restart backend
3. Try to connect

**Expected:**
- Error toast with authentication error message
- Connection fails gracefully

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.12: Other Brokers (Not Implemented)
**Steps:**
1. Open broker modal
2. Select "FYERS" (or any broker except Angel One)

**Expected:**
- Alert: "FYERS integration coming soon. Currently only Angel One is available."
- Modal stays open

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.13: Existing Pages Work
**Steps:**
1. Test each navigation tab:
   - Calculator → F&O calculator works
   - Market → Market status page works
   - Journal → Journal page works
   - Portfolio → Portfolio page works
   - About → About page works

**Expected:**
- All pages load without errors
- No functionality broken

**Result:** ✅ Pass / ❌ Fail

---

### Test 2.14: Mobile Responsive
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on mobile viewport (375px)

**Expected:**
- Broker modal works on mobile
- Data tables scroll horizontally
- Toast notifications positioned correctly
- All buttons accessible

**Result:** ✅ Pass / ❌ Fail

---

## Test Suite 3: Data Validation

### Test 3.1: Profile Data Accuracy
**Steps:**
1. Connect to Angel One
2. Compare profile data with Angel One mobile app

**Verify:**
- Client ID matches
- Name matches
- Email matches
- Mobile number matches

**Result:** ✅ Pass / ❌ Fail

---

### Test 3.2: Funds Data Accuracy
**Steps:**
1. Compare funds data with Angel One app

**Verify:**
- Available Margin matches (approximately)
- Used Margin matches
- Total matches

**Note:** Small differences acceptable due to timing.

**Result:** ✅ Pass / ❌ Fail

---

### Test 3.3: Positions Data Accuracy
**Steps:**
1. If you have open positions, verify them

**Verify:**
- Symbol names correct
- Quantities match
- Average prices match
- P&L calculation correct

**Result:** ✅ Pass / ❌ Fail

---

## Test Suite 4: Security Tests

### Test 4.1: Credentials Not Exposed
**Steps:**
1. Open browser DevTools → Network tab
2. Connect to Angel One
3. Check all network requests

**Expected:**
- No API keys in request headers
- No MPIN in request body
- No TOTP secret in requests
- Only `brokerId` sent to backend

**Result:** ✅ Pass / ❌ Fail

---

### Test 4.2: JWT Tokens Not Exposed
**Steps:**
1. After connection, check:
   - `window.brokerData`
   - `window.brokerAPI`
   - Network responses

**Expected:**
- No JWT tokens in frontend code
- No JWT tokens in console logs
- No JWT tokens in browser storage (localStorage/sessionStorage)

**Result:** ✅ Pass / ❌ Fail

---

### Test 4.3: HTTPS in Production (Future)
**Note:** Currently running on localhost (HTTP). In production, must use HTTPS.

**Result:** N/A (Development only)

---

## Test Results Summary

### Backend API Tests:
- [ ] 1.1 Health Check
- [ ] 1.2 Get Brokers
- [ ] 1.3 Connection Status
- [ ] 1.4 Connect to Angel One
- [ ] 1.5 Get Profile
- [ ] 1.6 Get Funds
- [ ] 1.7 Get Positions
- [ ] 1.8 Get Orders
- [ ] 1.9 Disconnect

### Frontend UI Tests:
- [ ] 2.1 Page Load
- [ ] 2.2 Broker Modal
- [ ] 2.3 Broker API Loaded
- [ ] 2.4 Backend Health Check
- [ ] 2.5 Get Brokers
- [ ] 2.6 Connect to Angel One
- [ ] 2.7 Portfolio Data Display
- [ ] 2.8 Refresh Data
- [ ] 2.9 Disconnect
- [ ] 2.10 Error Handling (Backend Down)
- [ ] 2.11 Error Handling (Invalid Creds)
- [ ] 2.12 Other Brokers
- [ ] 2.13 Existing Pages Work
- [ ] 2.14 Mobile Responsive

### Data Validation Tests:
- [ ] 3.1 Profile Accuracy
- [ ] 3.2 Funds Accuracy
- [ ] 3.3 Positions Accuracy

### Security Tests:
- [ ] 4.1 Credentials Not Exposed
- [ ] 4.2 JWT Tokens Not Exposed

---

## Quick Test Script (Browser Console)

Run this in browser console after loading frontend:

```javascript
// Phase 3 Integration Test Suite
console.log('🧪 Starting Phase 3 Integration Tests...');

async function runTests() {
  const results = [];
  
  // Test 1: Broker API loaded
  console.log('Test 1: Broker API loaded');
  const test1 = typeof window.brokerAPI !== 'undefined';
  results.push({ test: 'Broker API loaded', pass: test1 });
  console.log(test1 ? '✅ Pass' : '❌ Fail');
  
  // Test 2: Backend health
  console.log('Test 2: Backend health');
  const test2 = await window.brokerAPI.checkHealth();
  results.push({ test: 'Backend health', pass: test2 });
  console.log(test2 ? '✅ Pass' : '❌ Fail');
  
  // Test 3: Get brokers
  console.log('Test 3: Get brokers');
  const brokers = await window.brokerAPI.getBrokers();
  const test3 = Array.isArray(brokers) && brokers.length > 0;
  results.push({ test: 'Get brokers', pass: test3 });
  console.log(test3 ? '✅ Pass' : '❌ Fail');
  
  // Test 4: Angel One exists
  console.log('Test 4: Angel One exists');
  const test4 = brokers.some(b => b.id === 'angelone');
  results.push({ test: 'Angel One exists', pass: test4 });
  console.log(test4 ? '✅ Pass' : '❌ Fail');
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.table(results);
  
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('✅ All tests passed! Ready to connect to Angel One.');
  } else {
    console.log('❌ Some tests failed. Check configuration.');
  }
}

runTests();
```

---

## Expected Output

If all tests pass, you should see:
```
🧪 Starting Phase 3 Integration Tests...
Test 1: Broker API loaded
✅ Pass
Test 2: Backend health
✅ Pass
Test 3: Get brokers
✅ Pass
Test 4: Angel One exists
✅ Pass

📊 Test Summary:
┌─────────┬────────────────────────┬──────┐
│ (index) │         test           │ pass │
├─────────┼────────────────────────┼──────┤
│    0    │ 'Broker API loaded'    │ true │
│    1    │ 'Backend health'       │ true │
│    2    │ 'Get brokers'          │ true │
│    3    │ 'Angel One exists'     │ true │
└─────────┴────────────────────────┴──────┘

4/4 tests passed
✅ All tests passed! Ready to connect to Angel One.
```

---

## Troubleshooting Failed Tests

### Backend Health Fails
→ Check backend is running: `npm run dev` in backend folder

### Get Brokers Fails
→ Check backend routes are configured correctly

### Angel One Exists Fails
→ Check BrokerService has Angel One registered

### Connection Fails
→ Check .env credentials are correct

---

## Phase 3 Complete ✅

If all tests pass, Phase 3 is successfully implemented!

**Next:** Use the integration in real trading scenarios.
