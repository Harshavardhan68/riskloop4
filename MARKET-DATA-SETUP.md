# RiskLoop Market Data Setup Guide

This guide explains how the Market page fetches and displays live data from JSON files hosted on GitHub via CDN.

## 📐 Architecture

```
GitHub Repo (Main Branch)
  └── data/*.json files
       ↓
  jsdelivr CDN (https://cdn.jsdelivr.net/gh/USER/REPO@main/data/...)
       ↓
  Browser fetches JSON (No backend needed!)
       ↓
  market-data.js processes and renders data
```

**Key Principle**: Data, Business Logic, and UI are separated into modules.

---

## 🗂️ Data Files Structure

### 1. **expiry-rules.json**
Defines which day each instrument expires (configurable, not hardcoded).

```json
{
  "weeklyExpiry": {
    "NIFTY": "Thursday",
    "BANKNIFTY": "Wednesday"
  },
  "monthlyExpiry": {
    "default": "Thursday",
    "rule": "lastThursday"
  }
}
```

**Why?** NSE periodically changes expiry days. This config updates without code changes.

---

### 2. **market-status-config.json**
Trading hours and weekday rules.

```json
{
  "nse": {
    "tradingHours": { "start": "09:15", "end": "15:30" },
    "tradingDays": [1, 2, 3, 4, 5]
  }
}
```

---

### 3. **nse-holidays.json**
List of trading holidays for the year.

```json
{
  "year": 2026,
  "holidays": [
    { "date": "2026-01-26", "name": "Republic Day", "type": "national" }
  ]
}
```

**Market Status Calculation**: JavaScript computes open/closed live using BOTH files.

---

### 4. **economic-calendar.json**
Upcoming economic events.

```json
{
  "events": [
    {
      "date": "2026-07-15",
      "time": "10:00",
      "title": "RBI Monetary Policy Meeting",
      "impact": "high"
    }
  ]
}
```

---

### 5. **fno-ban-list.json**
Stocks currently in F&O ban period.

```json
{
  "banList": [
    { "symbol": "ZOMATO", "entryDate": "2026-07-10" }
  ]
}
```

**Updated by**: GitHub Actions (daily, from NSE official data).

---

### 6. **lot-sizes.json**
Current lot sizes and recent changes.

```json
{
  "instruments": [
    { "symbol": "NIFTY", "lotSize": 65, "previousLotSize": 75 }
  ],
  "recentChanges": [
    { "symbol": "NIFTY", "oldSize": 75, "newSize": 65 }
  ]
}
```

**Updated by**: GitHub Actions (daily, from NSE contract files).

---

### 7. **market-news.json**
Latest market news from RSS feeds.

```json
{
  "articles": [
    {
      "title": "Nifty hits all-time high",
      "category": "market",
      "publishedAt": "2026-07-14T12:30:00Z"
    }
  ]
}
```

**Updated by**: GitHub Actions (every 2 hours, RSS to JSON conversion).

---

## ⚙️ Setup Instructions

### Step 1: Update CDN Base URL

Edit `market-data.js` line 9:

```javascript
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME@main/data/';
```

Replace:
- `YOUR_GITHUB_USERNAME` → Your GitHub username
- `YOUR_REPO_NAME` → Your repository name

**Example**:
```javascript
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/johndoe/riskloop@main/data/';
```

---

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit with market data setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### Step 3: Enable GitHub Actions

1. Go to your GitHub repo → **Settings** → **Actions** → **General**
2. Enable **"Read and write permissions"** for workflows
3. Check **"Allow GitHub Actions to create and approve pull requests"**

---

### Step 4: Install Script Dependencies (for Actions)

The `scripts/` folder contains Node.js scripts that run in GitHub Actions.

**Local testing (optional)**:
```bash
cd scripts
npm install
node fetch-market-news.js
```

**GitHub Actions will automatically run these on schedule.**

---

## 🤖 GitHub Actions Workflows

### Workflow 1: `update-market-data.yml`
**Runs**: Monday-Friday at 3:45 PM IST (10:15 AM UTC)  
**Updates**:
- F&O Ban List
- Lot Sizes
- Market News

**Cron Schedule**: `15 10 * * 1-5`

⚠️ **Note**: GitHub Actions cron can lag several minutes. Fine for daily data, not for real-time.

---

### Workflow 2: `update-news.yml`
**Runs**: Every 2 hours during trading hours  
**Updates**: Market News only

**Cron Schedule**: `0 4,6,8,10 * * 1-5` (9:30 AM, 11:30 AM, 1:30 PM, 3:30 PM IST)

---

## 🔄 How Data Updates Work

1. **GitHub Actions runs on schedule** (cron job)
2. **Scripts fetch data** from NSE official endpoints (CSV/API)
3. **Converts to JSON** and writes to `data/` folder
4. **Commits changes** back to the repo (if data changed)
5. **jsDelivr CDN refreshes** automatically (within minutes)
6. **Browser fetches updated JSON** next time page loads

---

## 📊 Data Sources

### F&O Ban List
- **Source**: NSE Circulars / Official F&O Segment API
- **Method**: Public API endpoint (not HTML scraping)
- **Frequency**: Daily

### Lot Sizes
- **Source**: NSE Contract Files (`fo_mktlots.csv`)
- **Method**: Official CSV file download
- **Frequency**: Daily

### Market News
- **Source**: RSS Feeds (Economic Times, Business Standard, etc.)
- **Method**: RSS Parser → JSON conversion
- **Frequency**: Every 2 hours
- **Why JSON?**: Avoids CORS issues (can't fetch RSS client-side)

---

## 🧪 Testing

### Test Data Loading

1. Open browser console
2. Navigate to Market page
3. Check console logs:
   ```
   ✅ Market page initialized successfully
   ```

### Test Individual Modules

Open `market-data.js` and add:
```javascript
// Test market status
const config = await fetchMarketStatusConfig();
const holidays = await fetchNSEHolidays();
const status = isMarketOpen(config.nse, holidays.holidays);
console.log('Market Status:', status);
```

---

## 🐛 Troubleshooting

### Issue: 404 Error from CDN

**Problem**: `https://cdn.jsdelivr.net/gh/...` returns 404  
**Solution**: 
1. Check repo is **public**
2. Verify `data/` folder exists in `main` branch
3. Wait 5-10 minutes for CDN to sync
4. Try purge cache: Add `?v=timestamp` to URL

---

### Issue: CORS Error

**Problem**: "Access-Control-Allow-Origin" error  
**Solution**: 
- ✅ Use `cdn.jsdelivr.net` (has CORS headers)
- ❌ Don't use `raw.githubusercontent.com` (no CORS)

---

### Issue: GitHub Actions Not Running

**Problem**: Workflow never triggers  
**Solution**:
1. Check **Actions** tab → Enable workflows
2. Go to **Settings** → **Actions** → Grant write permissions
3. Manually trigger: **Actions** → Select workflow → **Run workflow**

---

### Issue: Stale Data

**Problem**: Data not updating even after workflow runs  
**Solution**:
1. Check workflow logs for errors
2. Verify data files changed in commit history
3. CDN cache: Add `?v=$(date +%s)` to force refresh

---

## 📝 Customization

### Add New News Source

Edit `scripts/fetch-market-news.js`:

```javascript
const RSS_FEEDS = [
  {
    url: 'https://example.com/rss',
    source: 'Example News',
    category: 'market'
  }
];
```

---

### Change Update Frequency

Edit `.github/workflows/update-news.yml`:

```yaml
schedule:
  - cron: '0 */1 * * *'  # Every hour
```

**Cron syntax**: `minute hour day month weekday`

---

### Add New Data Source

1. Create `data/new-data.json`
2. Add fetch function to `market-data.js`:
   ```javascript
   async function fetchNewData() {
     return await fetchMarketData('new-data.json');
   }
   ```
3. Create script: `scripts/fetch-new-data.js`
4. Update workflow to run script

---

## 🚀 Deployment

### Deploy to Netlify

1. Connect GitHub repo to Netlify
2. Build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/` (root)
3. Deploy! (Static site, no build needed)

### Deploy to GitHub Pages

```bash
# In repo settings
Settings → Pages → Source: main branch → /root
```

Site will be at: `https://username.github.io/repo-name/`

---

## 📊 Performance

**CDN Benefits**:
- ⚡ Fast global delivery (jsDelivr has 100+ POPs)
- 💰 Free for open source projects
- 🔒 HTTPS by default
- 📦 Automatic compression (gzip/brotli)

**Load Times**:
- JSON files: ~50-200ms (CDN cached)
- All market data: ~500ms total (parallel fetching)

---

## 🔐 Security

### Data Validation

`market-data.js` includes error handling:
- Network failures → Keep existing data
- Invalid JSON → Show error state
- Missing fields → Graceful fallback

### No Sensitive Data

All data files are public. Never commit:
- ❌ API keys
- ❌ User data
- ❌ Authentication tokens

---

## 📚 Further Reading

- [jsDelivr Documentation](https://www.jsdelivr.com/)
- [GitHub Actions Cron](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [NSE Official Website](https://www.nseindia.com/)

---

## ✅ Checklist

- [ ] Update CDN_BASE in `market-data.js`
- [ ] Push code to GitHub
- [ ] Enable GitHub Actions
- [ ] Grant write permissions to workflows
- [ ] Test on Market page
- [ ] Verify workflows run successfully
- [ ] Deploy to Netlify/GitHub Pages

---

## 🆘 Need Help?

Check the browser console for detailed error messages:
```javascript
console.log('✅ Market page initialized successfully');
// or
console.error('❌ Error initializing market page:', error);
```

All data fetching, calculations, and rendering are logged for debugging.
