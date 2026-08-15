# RiskLoop - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1️⃣ Update CDN URL

Open `market-data.js` (line 9) and replace with your GitHub info:

```javascript
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/data/';
```

---

### 2️⃣ Test Locally

Open `index.html` in a browser:
- Navigate to Market page
- Open browser console (F12)
- You should see: `✅ Market page initialized successfully`

**Note**: Data will load from your CDN once you push to GitHub.

---

### 3️⃣ Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - RiskLoop with market data"

# Create repo on GitHub first, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### 4️⃣ Enable GitHub Actions

1. Go to repo **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - Select **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**
3. Click **Save**

---

### 5️⃣ Trigger First Update

1. Go to **Actions** tab
2. Select **"Update Market Data"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait ~1 minute for completion

---

### 6️⃣ Deploy to Netlify

#### Option A: Netlify UI
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repo
4. Build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/` (root)
5. Click **Deploy**

#### Option B: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --dir=. --prod
```

---

## ✅ Verify Everything Works

### Check 1: Market Status
Navigate to Market page → Should show NSE/BSE as Open or Closed based on current time.

### Check 2: News Loading
Market page → Top News section → Should show 5 articles with timestamps.

### Check 3: Economic Calendar
Market page → Should show upcoming events sorted by date.

### Check 4: F&O Updates
Market page → Should show:
- Next weekly/monthly expiry dates
- Lot size changes (3 instruments)
- Ban list (2 stocks or "No stocks in ban")

### Check 5: Console Logs
Open browser console (F12):
```
✅ Market page initialized successfully
```

No red errors should appear.

---

## 🔄 How Updates Work

**Automatic Updates via GitHub Actions:**

| Data | Update Frequency | Workflow |
|------|-----------------|----------|
| News | Every 2 hours | `update-news.yml` |
| Ban List | Daily (3:45 PM IST) | `update-market-data.yml` |
| Lot Sizes | Daily (3:45 PM IST) | `update-market-data.yml` |

**Manual Updates:**
1. Go to **Actions** tab
2. Select workflow
3. **Run workflow** button

---

## 🐛 Common Issues

### Issue: "Unable to load market status"

**Solution**: 
- Wait 5 minutes after first push (CDN sync delay)
- Check CDN_BASE URL is correct in `market-data.js`
- Verify repo is **public** on GitHub

---

### Issue: GitHub Actions not running

**Solution**:
- Enable Actions: **Settings** → **Actions** → Enable
- Grant permissions: **Settings** → **Actions** → **Read and write**
- Manually trigger first time

---

### Issue: Old data showing

**Solution**:
- Check **Actions** tab → Verify workflows succeeded
- Add `?v=timestamp` to URL to bypass cache
- Wait 5-10 minutes for CDN refresh

---

## 📱 Mobile Testing

RiskLoop is fully responsive. Test on:
- Mobile phone (hamburger menu)
- Tablet (icons only navigation)
- Desktop (full navigation)

---

## 🎯 Next Steps

1. **Customize data sources**: Edit `scripts/fetch-market-news.js` to add RSS feeds
2. **Adjust update frequency**: Edit `.github/workflows/*.yml` cron schedules
3. **Add more instruments**: Update `data/expiry-rules.json` for new instruments
4. **Manual updates**: Manually edit JSON files and commit for immediate updates

---

## 📚 Full Documentation

See [MARKET-DATA-SETUP.md](./MARKET-DATA-SETUP.md) for:
- Detailed architecture
- Data file schemas
- Advanced customization
- Troubleshooting guide

---

## 🆘 Need Help?

**Browser Console** (F12) shows detailed logs:
- ✅ Success messages
- ⚠️ Warnings (fallback to existing data)
- ❌ Errors (with stack traces)

**GitHub Actions Logs**:
- **Actions** tab → Select workflow → Click on run → View logs

---

## ✨ You're All Set!

Your RiskLoop Market page now:
- ✅ Fetches live data from CDN
- ✅ Updates automatically via GitHub Actions
- ✅ Works as static site (no backend needed)
- ✅ Deploys to Netlify in seconds

Happy trading! 📊💹
