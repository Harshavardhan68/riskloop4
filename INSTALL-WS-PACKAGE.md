# 📦 Installing the WebSocket Package

Phase 4 requires the `ws` package for WebSocket support. It has been added to `package.json`, but you need to install it.

---

## Problem: PowerShell Execution Policy

You encountered this error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running 
scripts is disabled on this system.
```

This is a PowerShell security setting that blocks npm from running.

---

## Solution: Enable Script Execution

### Option 1: Enable for Current User (Recommended)

Open PowerShell **as Administrator** and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

When prompted, type `Y` and press Enter.

### Option 2: Enable for Current Session Only

In your current PowerShell window:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

This only affects the current session.

---

## Then Install Dependencies

After enabling script execution:

```powershell
cd backend
npm install
```

This will install the `ws` package along with any other dependencies.

---

## Verify Installation

```powershell
npm list ws
```

**Expected output:**
```
riskloop-backend@1.0.0
└── ws@8.16.0
```

---

## Alternative: Manual Package.json Check

If you still have issues, verify `ws` is in your `package.json`:

```json
{
  "dependencies": {
    "ws": "^8.16.0",
    ...
  }
}
```

If it's there, npm install should work after fixing the execution policy.

---

## Test Backend Starts

After installation:

```powershell
npm run dev
```

**If successful, you should see:**
```
🛡️  RiskLoop Backend API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port 3000
[... API endpoints listed ...]
```

**No WebSocket-related errors = Success!** ✅

---

## If Still Having Issues

### Error: "Cannot find module 'ws'"

**Solution:**
```powershell
# Manually install ws
npm install ws --save
```

### Error: "npm not recognized"

**Cause:** Node.js not in PATH.

**Solution:**
1. Reinstall Node.js from https://nodejs.org/
2. Check "Add to PATH" during installation
3. Restart PowerShell

### Error: Permission denied

**Solution:**
```powershell
# Run as Administrator
cd backend
npm install
```

---

## Summary

1. **Enable PowerShell scripts** (one-time setup)
2. **Run `npm install` in backend folder**
3. **Verify `ws` package installed**
4. **Start backend with `npm run dev`**

That's it! Phase 4 should work after these steps.

---

**Need more help?** Check `PHASE4-QUICK-START.md` for troubleshooting.
