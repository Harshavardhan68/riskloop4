# 🚀 Quick Start Guide - Phase 3: Angel One Integration

## Prerequisites

✅ Node.js installed (v16 or higher)
✅ Angel One SmartAPI credentials (API Key, Client ID, MPIN, TOTP Secret)
✅ Backend dependencies installed
✅ Frontend files ready

---

## Step 1: Configure Angel One Credentials

### 1.1 Navigate to backend folder:
```powershell
cd "c:\Users\suman\OneDrive\Desktop\New folder\riskloop3-main\riskloop2-main\riskloop2-main\backend"
```

### 1.2 Create `.env` file from `.env.example`:
```powershell
Copy-Item .env.example .env
```

### 1.3 Edit `.env` file and add your Angel One credentials:
```env
# Angel One SmartAPI Configuration
ANGELONE_API_KEY=your_api_key_here
ANGELONE_CLIENT_ID=your_client_id_here
ANGELONE_MPIN=your_4_digit_mpin_here
ANGELONE_TOTP_SECRET=your_totp_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Where to get these credentials:**
- Login to Angel One SmartAPI Developer Portal: https://smartapi.angelbroking.com/
- Create an App to get API Key
- Client ID is your Angel One trading account ID
- MPIN is your 4-digit PIN (same as mobile app PIN)
- TOTP Secret is provided when you enable TOTP in Angel One

---

## Step 2: Start the Backend Server

### 2.1 Make sure you're in the backend folder:
```powershell
cd backend
```

### 2.2 Install dependencies (if not already done):
```powershell
npm install
```

### 2.3 Start the server:
```powershell
npm run dev
```

### 2.4 Verify backend is running:
You should see:
```
🚀 RiskLoop Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Environment: development
   Port: 3000
   Base URL: http://localhost:3000

📍 Health Check:
   http://localhost:3000/health

📍 API Endpoints:
   • POST   /api/auth/connect
   • POST   /api/auth/disconnect
   • GET    /api/auth/status/:brokerId
   • GET    /api/brokers
   • GET    /api/account/profile?brokerId=<broker>
   • GET    /api/account/funds?brokerId=<broker>
   • GET    /api/positions?brokerId=<broker>
   • GET    /api/orders?brokerId=<broker>
   • GET    /api/holdings?brokerId=<broker>
   • GET    /api/trades?brokerId=<broker>
   • POST   /api/quotes?brokerId=<broker>

💡 Test Angel One connection:
   http://localhost:3000/api/dev/angelone/test-connection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2.5 Test backend health:
Open browser and visit: http://localhost:3000/health

Expected response:
```json
{
  "success": true,
  "message": "RiskLoop Backend is healthy",
  "timestamp": "2024-..."
}
```

---

## Step 3: Open the Frontend

### 3.1 Open index.html in browser:

**Option A: Direct file open**
- Navigate to: `c:\Users\suman\OneDrive\Desktop\New folder\riskloop3-main\riskloop2-main\riskloop2-main`
- Double-click `index.html`

**Option B: VS Code Live Server (Recommended)**
- Open folder in VS Code
- Right-click `index.html`
- Select "Open with Live Server"
- Browser opens at `http://localhost:5500`

### 3.2 Verify frontend loads:
- RiskLoop UI should load
- No JavaScript errors in console (F12)
- All navigation tabs work

---

## Step 4: Connect to Angel One

### 4.1 Navigate to Journal page:
- Click "Journal" tab in navigation

### 4.2 Click "Connect Broker" button:
- Look for the globe icon button: "🌎 Connect Broker"
- Click it

### 4.3 Select Angel One:
- Broker selection modal opens
- Find "Angel One" in the list
- Click on Angel One card

### 4.4 Wait for connection:
- Toast notification: "Connecting to Angel One..."
- Backend authenticates with Angel One API (2-3 seconds)
- Success toast: "Connected to Angel One successfully!"
- Automatically redirects to Portfolio page

---

## Step 5: View Your Broker Data

### 5.1 Portfolio page now shows:
- ✅ **Account Overview** header (with Refresh/Disconnect buttons)
- ✅ **Profile section**: Client ID, Name, Email, Mobile, Exchanges
- ✅ **Funds section**: Available Margin, Used Margin, Collateral, Withdrawable
- ✅ **Positions table**: Open positions with P&L
- ✅ **Orders table**: Order book with status
- ✅ **Holdings table**: Long-term holdings
- ✅ **Trades table**: Today's executed trades

### 5.2 Interact with data:
- **Refresh button**: Reload all data from Angel One
- **Disconnect button**: Disconnect from broker

---

## Troubleshooting

### Problem: "Backend server is not running"
**Solution:**
```powershell
cd backend
npm run dev
```
Make sure you see the server startup message.

### Problem: "Authentication failed"
**Solution:**
- Check your `.env` file has correct credentials
- Verify API Key, Client ID, MPIN, TOTP Secret
- Make sure TOTP Secret is the base32 secret string (not the 6-digit code)
- Restart backend after changing `.env`

### Problem: Backend starts but connection fails
**Solution:**
```powershell
# Test Angel One connection directly
curl http://localhost:3000/api/dev/angelone/test-connection
```
Check the response for specific errors.

### Problem: CORS errors in browser console
**Solution:**
- Make sure backend is running on `http://localhost:3000`
- CORS is already configured in backend
- If using Live Server, it should work automatically
- If opening HTML file directly, CORS might block requests (use Live Server instead)

### Problem: "Module not found" error in backend
**Solution:**
```powershell
cd backend
npm install
```

### Problem: Frontend shows "Broker API not loaded"
**Solution:**
- Check browser console for errors
- Verify `broker-api.js` is loaded before `script.js` in `index.html`
- Hard refresh browser (Ctrl+Shift+R)

---

## Testing Checklist

After following the quick start:

- [ ] Backend server running on port 3000
- [ ] Health endpoint returns success: http://localhost:3000/health
- [ ] Frontend loads without errors
- [ ] Journal page loads
- [ ] "Connect Broker" button exists
- [ ] Broker modal opens when clicked
- [ ] Angel One appears in broker list
- [ ] Clicking Angel One shows "Connecting..." toast
- [ ] Connection succeeds → "Connected successfully!" toast
- [ ] Portfolio page shows account data
- [ ] Profile section shows your name/email/client ID
- [ ] Funds section shows margin details
- [ ] Tables show data (or "No data" if empty)
- [ ] Refresh button works
- [ ] Disconnect button works
- [ ] Browser console has no errors (except expected ones when testing failures)

---

## Browser Console Commands (for debugging)

Open browser console (F12) and test:

### Check if broker API is loaded:
```javascript
console.log(window.brokerAPI);
```

### Test backend health:
```javascript
await brokerAPI.checkHealth();
```

### Get available brokers:
```javascript
await brokerAPI.getBrokers();
```

### Check connection status:
```javascript
await brokerAPI.getConnectionStatus('angel-one');
```

### Manually connect (if UI doesn't work):
```javascript
await brokerAPI.connect('angel-one');
```

### View stored broker data:
```javascript
console.log(window.brokerData);
```

---

## Next Steps After Successful Connection

1. **Explore the data**: Check positions, orders, holdings in Portfolio page
2. **Test refresh**: Click refresh to reload data
3. **Test disconnect**: Disconnect and reconnect
4. **Check journal integration**: Future phase will auto-import trades to journal
5. **Review documentation**: See `PHASE3-FRONTEND-INTEGRATION.md` for complete details

---

## Support & Documentation

- **Full Integration Guide**: `PHASE3-FRONTEND-INTEGRATION.md`
- **Backend Setup**: `backend/ANGEL-ONE-SETUP.md`
- **Backend API Docs**: `backend/README.md`
- **Angel One API Docs**: https://smartapi.angelbroking.com/docs

---

## Success! 🎉

If you can see your Angel One account data in the Portfolio page, Phase 3 is complete!

You now have:
- ✅ Real Angel One integration
- ✅ Account profile and funds display
- ✅ Positions, orders, holdings, trades display
- ✅ Connection management (connect/disconnect/refresh)
- ✅ Error handling with user-friendly messages
- ✅ Secure server-side authentication

**No credentials exposed in frontend. All authentication happens server-side.**
