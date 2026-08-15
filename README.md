# 🛡️ RiskLoop

**Premium Position Size Calculator & Market Intelligence Dashboard**

A professional trading tool for calculating position sizes, managing risk, and staying updated with live market data—all without a backend server.

---

## ✨ Features

### 📊 Position Size Calculator
- **Stocks Calculator**: Calculate optimal position size for equity trades
- **F&O Calculator**: Advanced position sizing for derivatives
- Risk-based position sizing (1%, 2%, 3% risk per trade)
- Support for 200+ NSE instruments (Nifty, BankNifty, stocks)
- Real-time calculations with visual feedback

### 📈 Market Intelligence (NEW!)
- **Market Status**: Live NSE/BSE open/closed with holiday calendar
- **Top News**: Real-time market news from multiple sources
- **Economic Calendar**: RBI meetings, CPI, GDP, Fed events
- **F&O Updates**: Weekly/monthly expiry, ban list, lot size changes

### 🎨 Premium UI/UX
- Glassmorphism design with dark/light theme
- Fully responsive (desktop, tablet, mobile)
- Smooth animations and transitions
- Loading states and error handling

---

## 🚀 Quick Start

### 1. Update Configuration
Edit `market-data.js` line 9:
```javascript
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/data/';
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Enable GitHub Actions
Settings → Actions → Enable + Grant write permissions

### 4. Deploy
Deploy to Netlify, Vercel, or GitHub Pages (no build needed!)

📖 **Full Setup Guide**: [QUICK-START.md](./QUICK-START.md)

---

## 📁 Project Structure

```
riskloop/
├── index.html              # Main HTML (all pages)
├── styles.css              # Global styles
├── script.js               # Calculator logic + routing
├── market-data.js          # Market data module (NEW)
│
├── data/                   # JSON data files (NEW)
│   ├── market-status-config.json
│   ├── nse-holidays.json
│   ├── expiry-rules.json
│   ├── economic-calendar.json
│   ├── fno-ban-list.json
│   ├── lot-sizes.json
│   └── market-news.json
│
├── scripts/                # Data fetching scripts (NEW)
│   ├── fetch-market-news.js
│   ├── fetch-ban-list.js
│   └── fetch-lot-sizes.js
│
├── .github/workflows/      # Automation (NEW)
│   ├── update-market-data.yml
│   └── update-news.yml
│
└── docs/
    ├── README.md           # This file
    ├── QUICK-START.md      # 5-minute setup
    ├── MARKET-DATA-SETUP.md # Full documentation
    ├── DEPLOYMENT-CHECKLIST.md
    └── IMPLEMENTATION-SUMMARY.md
```

---

## 🏗️ Architecture

### No Backend Required!
```
GitHub Repo → jsDelivr CDN → Browser
     ↑                           ↓
GitHub Actions          market-data.js
(Auto-updates)        (Fetches & Renders)
```

### Key Principles
✅ **Static Site**: Pure HTML/CSS/JS (no build step)  
✅ **Data-Driven**: All data in JSON files  
✅ **Automated**: GitHub Actions update data on schedule  
✅ **Fast**: Global CDN delivery via jsDelivr  
✅ **Maintainable**: Separation of data, logic, and UI  

---

## 🤖 Automated Data Updates

| Data | Frequency | Source |
|------|-----------|--------|
| Market News | Every 2 hours | RSS feeds → JSON |
| F&O Ban List | Daily (3:45 PM IST) | NSE official API/CSV |
| Lot Sizes | Daily (3:45 PM IST) | NSE contract files |
| Holidays | Manual (annually) | NSE calendar |
| Economic Calendar | Manual (as needed) | RBI, US Fed schedules |

Powered by **GitHub Actions** (free for public repos).

---

## 📊 Market Data Features

### 1. Market Status
Shows real-time NSE/BSE open/closed status:
- Calculates live using trading hours + holiday calendar
- Not hardcoded! Dynamic based on config files
- Animated pulse dot when market is open

### 2. Top News
Aggregates market news from multiple sources:
- Economic Times, Business Standard, Mint, Moneycontrol
- Categories: Market, RBI, SEBI, Earnings, IPO
- Updates every 2 hours during trading

### 3. Economic Calendar
Track important economic events:
- RBI monetary policy meetings
- CPI, GDP releases
- US Fed events
- Impact level indicators (High/Medium/Low)

### 4. F&O Updates
Essential derivatives information:
- **Weekly Expiry**: Next Thursday (configurable per instrument)
- **Monthly Expiry**: Last Thursday of month
- **Ban List**: Stocks in F&O ban period
- **Lot Sizes**: Recent changes with old vs new comparison

---

## 🔧 Tech Stack

**Frontend**:
- HTML5, CSS3 (with CSS Grid & Flexbox)
- Vanilla JavaScript (ES6+)
- No frameworks (lightweight, fast)

**Data Layer**:
- JSON files for all data
- Fetch API for requests
- jsDelivr CDN for delivery

**Automation**:
- GitHub Actions for scheduled updates
- Node.js scripts for data fetching
- RSS Parser for news aggregation

**Deployment**:
- Netlify (recommended)
- GitHub Pages
- Vercel
- Any static hosting

---

## 🎯 Why No Backend?

### Traditional Approach:
```
Browser → API Server → Database → Data Sources
         (costs $$$)  (needs maintenance)
```

### Our Approach:
```
Browser → CDN → JSON files (updated by GitHub Actions)
         (FREE)  (auto-maintained)
```

**Benefits**:
✅ Zero server costs  
✅ Infinite scalability (CDN handles traffic)  
✅ Simple deployment (just push to GitHub)  
✅ No database management  
✅ Fast (CDN edge caching)  
✅ Reliable (99.99% uptime)  

---

## 📱 Responsive Design

### Desktop (≥1024px)
- Full navigation bar
- Multi-column layouts
- Expanded cards

### Tablet (768px - 1023px)
- Compressed navigation
- 2-column grid layouts
- Optimized spacing

### Mobile (<768px)
- Hamburger menu
- Single-column layouts
- Touch-optimized buttons
- Vertical stacking

---

## 🔐 Data Sources

All data from **official public sources**:

| Data Type | Source | Method |
|-----------|--------|--------|
| F&O Ban List | NSE Circulars | Official API endpoint |
| Lot Sizes | NSE | Contract file (CSV) |
| Market News | Multiple RSS | RSS Parser → JSON |
| Holidays | NSE Calendar | Manual entry |
| Trading Hours | NSE Rules | Config file |

**No web scraping!** All official endpoints documented by exchanges.

---

## 🧪 Testing

### Local Testing
```bash
# Open index.html in browser
# Navigate to Market page (#market)
# Open console (F12)
# Look for: ✅ Market page initialized successfully
```

### Data Testing
```javascript
// Test individual modules in console
const config = await fetchMarketStatusConfig();
const status = isMarketOpen(config.nse, holidays);
console.log('Market Status:', status);
```

### Browser Testing
Test on:
- Chrome, Firefox, Safari, Edge
- Desktop, tablet, mobile viewports
- Dark and light themes

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK-START.md](./QUICK-START.md) | 5-minute setup guide |
| [MARKET-DATA-SETUP.md](./MARKET-DATA-SETUP.md) | Complete technical documentation |
| [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) | Step-by-step deployment |
| [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) | Architecture overview |

---

## 🐛 Troubleshooting

### Issue: 404 from CDN
**Fix**: Wait 10 minutes after first push for CDN sync

### Issue: GitHub Actions not running
**Fix**: Enable Actions + grant write permissions in Settings

### Issue: Stale data
**Fix**: Check Actions tab for workflow errors, manually trigger

### Issue: Wrong market status
**Fix**: Verify `nse-holidays.json` has current year

See [MARKET-DATA-SETUP.md](./MARKET-DATA-SETUP.md) for detailed troubleshooting.

---

## 🛠️ Customization

### Add News Source
Edit `scripts/fetch-market-news.js`:
```javascript
const RSS_FEEDS = [
  { url: 'https://...', source: 'New Source', category: 'market' }
];
```

### Change Update Schedule
Edit `.github/workflows/update-news.yml`:
```yaml
schedule:
  - cron: '0 */1 * * *'  # Every hour
```

### Add Economic Event
Edit `data/economic-calendar.json`:
```json
{
  "date": "2026-08-01",
  "title": "RBI Policy Meeting",
  "impact": "high"
}
```

---

## 🚧 Roadmap

- [ ] Portfolio tracker
- [ ] Trade journal with screenshots
- [ ] Strategy backtester
- [ ] Options chain analyzer
- [ ] Technical indicators
- [ ] Alerts & notifications
- [ ] Mobile app (PWA)

---

## 📄 License

MIT License - Free to use and modify

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Submit pull request

---

## ⚠️ Disclaimer

**Educational Use Only**

This tool is for educational and informational purposes. Not financial advice. Always:
- Do your own research
- Consult a financial advisor
- Trade at your own risk
- Use proper risk management

Markets involve risk. Past performance ≠ future results.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
- **Docs**: Check documentation files in this repo
- **Updates**: Star the repo to get notified of updates

---

## 🎉 Credits

Built with ❤️ for the trading community

**Data Sources**:
- NSE India
- Economic Times
- Business Standard
- RBI
- US Federal Reserve

**Technology**:
- jsDelivr CDN
- GitHub Actions
- RSS Parser

---

## ⭐ Star This Repo

If you find RiskLoop useful, please star the repo! It helps others discover the project.

---

**🛡️ RiskLoop** - Trade Smart, Risk Less

[Live Demo](#) | [Documentation](./QUICK-START.md) | [Report Bug](https://github.com/YOUR_USERNAME/YOUR_REPO/issues)
