/* ============================================================
   PORTFOLIO MODULE - RiskLoop
   Analytics, P&L Curve, Win/Loss Scatter Plot, Long/Short Analysis,
   Daily/Behaviour Analysis, Broker-Specific Performance, Strategy Review.
   ============================================================ */

(function () {
  'use strict';

  // State
  let _activeMarket = 'india'; // 'india' or 'forex'
  let _activeTimeframe = '1M';  // '1W', '1M', '3M', '1Y', 'ALL'

  // Indian Portfolio Dataset
  const INDIA_DATA = {
    metrics: {
      winRate: 64.2,
      wins: 52,
      losses: 29,
      totalTrades: 81,
      netPnl: 93200,
      avgWin: 4320,
      avgLoss: -1850,
      bigWin: 18500,
      bigWinSymbol: 'NIFTY 24800 CE',
      bigLoss: -5200,
      bigLossSymbol: 'BANKNIFTY 51200 PE',
      avgRR: '1 : 2.33',
      profitFactor: 2.68
    },
    pnlCurve: [
      { date: '1 Jul', pnl: 0, balance: 500000 },
      { date: '5 Jul', pnl: 4200, balance: 504200 },
      { date: '9 Jul', pnl: 2400, balance: 506600 },
      { date: '14 Jul', pnl: 7800, balance: 514400 },
      { date: '18 Jul', pnl: 11900, balance: 526300 },
      { date: '23 Jul', pnl: 6200, balance: 532500 },
      { date: '28 Jul', pnl: -3600, balance: 528900 },
      { date: '31 Jul', pnl: 4800, balance: 533700 },
      { date: '4 Aug', pnl: -2100, balance: 531600 },
      { date: '8 Aug', pnl: 13500, balance: 545100 },
      { date: '12 Aug', pnl: 4500, balance: 549600 },
      { date: '16 Aug', pnl: 8700, balance: 558300 },
      { date: '20 Aug', pnl: 9700, balance: 568000 },
      { date: '24 Aug', pnl: 25200, balance: 593200 }
    ],
    scatterTrades: [
      { id: 1, date: '01 Jul', symbol: 'NIFTY CE', type: 'Options', pnl: 4200, outcome: 'win' },
      { id: 2, date: '02 Jul', symbol: 'BANKNIFTY', type: 'Options', pnl: -1800, outcome: 'loss' },
      { id: 3, date: '04 Jul', symbol: 'RELIANCE', type: 'Stock', pnl: 6750, outcome: 'win' },
      { id: 4, date: '07 Jul', symbol: 'TATASTEEL', type: 'Stock', pnl: 3100, outcome: 'win' },
      { id: 5, date: '09 Jul', symbol: 'NIFTY PE', type: 'Options', pnl: -2400, outcome: 'loss' },
      { id: 6, date: '11 Jul', symbol: 'INFY', type: 'Stock', pnl: 5500, outcome: 'win' },
      { id: 7, date: '14 Jul', symbol: 'HDFCBANK', type: 'Stock', pnl: -3200, outcome: 'loss' },
      { id: 8, date: '16 Jul', symbol: 'NIFTY CE', type: 'Options', pnl: 7800, outcome: 'win' },
      { id: 9, date: '18 Jul', symbol: 'BANKNIFTY', type: 'Options', pnl: -1500, outcome: 'loss' },
      { id: 10, date: '21 Jul', symbol: 'NIFTY 24800 CE', type: 'Options', pnl: 18500, outcome: 'win' },
      { id: 11, date: '23 Jul', symbol: 'TCS', type: 'Stock', pnl: 4100, outcome: 'win' },
      { id: 12, date: '25 Jul', symbol: 'BANKNIFTY PE', type: 'Options', pnl: -5200, outcome: 'loss' },
      { id: 13, date: '28 Jul', symbol: 'NIFTY FUT', type: 'Futures', pnl: 6200, outcome: 'win' },
      { id: 14, date: '30 Jul', symbol: 'SBIN', type: 'Stock', pnl: -1100, outcome: 'loss' },
      { id: 15, date: '01 Aug', symbol: 'NIFTY 24750 CE', type: 'Options', pnl: 4000, outcome: 'win' },
      { id: 16, date: '04 Aug', symbol: 'NIFTY 24800 CE', type: 'Options', pnl: -2625, outcome: 'loss' },
      { id: 17, date: '04 Aug', symbol: 'BANKNIFTY PE', type: 'Options', pnl: 2100, outcome: 'win' },
      { id: 18, date: '04 Aug', symbol: 'RELIANCE', type: 'Stock', pnl: -1575, outcome: 'loss' },
      { id: 19, date: '06 Aug', symbol: 'NIFTY 24900 CE', type: 'Options', pnl: 6300, outcome: 'win' },
      { id: 20, date: '08 Aug', symbol: 'NIFTY 24850 CE', type: 'Options', pnl: 4300, outcome: 'win' },
      { id: 21, date: '08 Aug', symbol: 'HDFCBANK', type: 'Stock', pnl: 2800, outcome: 'win' },
      { id: 22, date: '11 Aug', symbol: 'BANKNIFTY', type: 'Options', pnl: 4500, outcome: 'win' },
      { id: 23, date: '14 Aug', symbol: 'NIFTY 24950 CE', type: 'Options', pnl: 8700, outcome: 'win' },
      { id: 24, date: '18 Aug', symbol: 'RELIANCE FUT', type: 'Futures', pnl: 3600, outcome: 'win' },
      { id: 25, date: '20 Aug', symbol: 'BANKNIFTY CE', type: 'Options', pnl: 6100, outcome: 'win' }
    ],
    longShort: {
      long: {
        trades: 48,
        share: 59,
        winRate: 68.8,
        wins: 33,
        losses: 15,
        pnl: 68400,
        avgRR: '1 : 2.40',
        profitFactor: 2.9
      },
      short: {
        trades: 33,
        share: 41,
        winRate: 57.6,
        wins: 19,
        losses: 14,
        pnl: 24800,
        avgRR: '1 : 2.10',
        profitFactor: 2.2
      }
    },
    dailyPerformance: [
      { day: 'Mon', fullDay: 'Monday', winRate: 60.0, trades: 15, pnl: 14200 },
      { day: 'Tue', fullDay: 'Tuesday', winRate: 72.2, trades: 18, pnl: 28500 },
      { day: 'Wed', fullDay: 'Wednesday', winRate: 65.0, trades: 20, pnl: 18900 },
      { day: 'Thu', fullDay: 'Thursday', winRate: 58.8, trades: 17, pnl: 21400 },
      { day: 'Fri', fullDay: 'Friday', winRate: 52.0, trades: 11, pnl: 10200 }
    ],
    behaviour: {
      disciplineScore: 92,
      riskCompliance: 98,
      avgHoldTime: '38 mins',
      maxConsecutiveWins: 6,
      maxConsecutiveLosses: 2,
      revengeTradingFlags: 0,
      fomoAlerts: 1
    },
    instrumentPerformance: {
      stocks: {
        name: 'Stocks (Equity)',
        winRate: 68.0,
        wins: 21,
        losses: 10,
        trades: 31,
        pnl: 42600,
        avgRR: '1 : 2.2',
        profitFactor: 2.85
      },
      fo: {
        name: 'F&O (Futures & Options)',
        winRate: 49.0,
        wins: 25,
        losses: 26,
        trades: 51,
        pnl: 50600,
        avgRR: '1 : 2.45',
        profitFactor: 2.42
      }
    },
    strategies: [
      { name: 'Breakout', winRate: 76.0, trades: 25, pnl: 38200, avgRR: '1 : 2.50', pf: 3.20, status: 'Top Edge' },
      { name: 'Trend Follow', winRate: 71.4, trades: 21, pnl: 26800, avgRR: '1 : 2.60', pf: 2.80, status: 'Strong' },
      { name: 'Pullback 20EMA', winRate: 64.3, trades: 14, pnl: 14500, avgRR: '1 : 2.00', pf: 2.10, status: 'Consistent' },
      { name: 'Mean Reversion', winRate: 61.1, trades: 18, pnl: 19400, avgRR: '1 : 2.10', pf: 2.40, status: 'Moderate' },
      { name: 'Opening Range Breakout', winRate: 45.5, trades: 11, pnl: -5700, avgRR: '1 : 1.70', pf: 0.85, status: 'Review' }
    ]
  };

  // Forex Portfolio Dataset
  const FOREX_DATA = {
    metrics: {
      winRate: 66.7,
      wins: 48,
      losses: 24,
      totalTrades: 72,
      netPnl: 18570,
      avgWin: 620,
      avgLoss: -280,
      bigWin: 3450,
      bigWinSymbol: 'GBP/USD London Breakout',
      bigLoss: -950,
      bigLossSymbol: 'USD/JPY NFP Spike',
      avgRR: '1 : 2.45',
      profitFactor: 3.12
    },
    pnlCurve: [
      { date: '1 Jul', pnl: 0, balance: 50000 },
      { date: '5 Jul', pnl: 850, balance: 50850 },
      { date: '9 Jul', pnl: 1420, balance: 52270 },
      { date: '14 Jul', pnl: 2100, balance: 54370 },
      { date: '18 Jul', pnl: -640, balance: 53730 },
      { date: '23 Jul', pnl: 3450, balance: 57180 },
      { date: '28 Jul', pnl: 1850, balance: 59030 },
      { date: '4 Aug', pnl: 2400, balance: 61430 },
      { date: '8 Aug', pnl: 1920, balance: 63350 },
      { date: '12 Aug', pnl: -820, balance: 62530 },
      { date: '16 Aug', pnl: 2900, balance: 65430 },
      { date: '20 Aug', pnl: 3140, balance: 68570 }
    ],
    scatterTrades: [
      { id: 1, date: '02 Jul', symbol: 'EUR/USD', type: 'Forex Major', pnl: 650, outcome: 'win' },
      { id: 2, date: '04 Jul', symbol: 'GBP/USD', type: 'Forex Major', pnl: 820, outcome: 'win' },
      { id: 3, date: '07 Jul', symbol: 'USD/JPY', type: 'Forex Major', pnl: -450, outcome: 'loss' },
      { id: 4, date: '10 Jul', symbol: 'AUD/USD', type: 'Forex Major', pnl: 540, outcome: 'win' },
      { id: 5, date: '14 Jul', symbol: 'USD/CAD', type: 'Forex Major', pnl: -320, outcome: 'loss' },
      { id: 6, date: '17 Jul', symbol: 'GBP/USD', type: 'Forex Major', pnl: 3450, outcome: 'win' },
      { id: 7, date: '21 Jul', symbol: 'EUR/JPY', type: 'Forex Cross', pnl: 980, outcome: 'win' },
      { id: 8, date: '24 Jul', symbol: 'USD/CHF', type: 'Forex Major', pnl: -620, outcome: 'loss' },
      { id: 9, date: '28 Jul', symbol: 'EUR/USD', type: 'Forex Major', pnl: 1120, outcome: 'win' },
      { id: 10, date: '02 Aug', symbol: 'GBP/JPY', type: 'Forex Cross', pnl: 1450, outcome: 'win' },
      { id: 11, date: '05 Aug', symbol: 'USD/JPY', type: 'Forex Major', pnl: -950, outcome: 'loss' },
      { id: 12, date: '08 Aug', symbol: 'EUR/USD', type: 'Forex Major', pnl: 1850, outcome: 'win' },
      { id: 13, date: '12 Aug', symbol: 'AUD/USD', type: 'Forex Major', pnl: 720, outcome: 'win' },
      { id: 14, date: '16 Aug', symbol: 'GBP/USD', type: 'Forex Major', pnl: 2100, outcome: 'win' },
      { id: 15, date: '19 Aug', symbol: 'NZD/USD', type: 'Forex Major', pnl: -410, outcome: 'loss' }
    ],
    longShort: {
      long: {
        trades: 42,
        share: 58,
        winRate: 71.4,
        wins: 30,
        losses: 12,
        pnl: 12400,
        avgRR: '1 : 2.50',
        profitFactor: 3.4
      },
      short: {
        trades: 30,
        share: 42,
        winRate: 60.0,
        wins: 18,
        losses: 12,
        pnl: 6170,
        avgRR: '1 : 2.30',
        profitFactor: 2.6
      }
    },
    dailyPerformance: [
      { day: 'Mon', fullDay: 'Monday', winRate: 58.0, trades: 12, pnl: 2450 },
      { day: 'Tue', fullDay: 'Tuesday', winRate: 75.0, trades: 16, pnl: 5820 },
      { day: 'Wed', fullDay: 'Wednesday', winRate: 70.0, trades: 20, pnl: 4900 },
      { day: 'Thu', fullDay: 'Thursday', winRate: 68.8, trades: 16, pnl: 4100 },
      { day: 'Fri', fullDay: 'Friday', winRate: 50.0, trades: 8, pnl: 1300 }
    ],
    behaviour: {
      disciplineScore: 95,
      riskCompliance: 100,
      avgHoldTime: '2.4 hours',
      maxConsecutiveWins: 7,
      maxConsecutiveLosses: 2,
      revengeTradingFlags: 0,
      fomoAlerts: 0
    },
    sessions: [
      { name: 'New York', winRate: 47.3 },
      { name: 'London', winRate: 41.9 },
      { name: 'Asia', winRate: 52.4 }
    ],
    strategies: [
      { name: 'London Breakout', winRate: 75.0, trades: 20, pnl: 7450, avgRR: '1 : 2.70', pf: 3.60, status: 'Top Edge' },
      { name: 'NY Momentum Scalp', winRate: 68.8, trades: 16, pnl: 4200, avgRR: '1 : 2.40', pf: 2.80, status: 'Strong' },
      { name: 'Daily 20EMA Retest', winRate: 66.7, trades: 15, pnl: 3850, avgRR: '1 : 2.30', pf: 2.60, status: 'Consistent' },
      { name: 'Asian Range Reversal', winRate: 58.3, trades: 12, pnl: 2150, avgRR: '1 : 2.00', pf: 2.10, status: 'Moderate' },
      { name: 'News Straddle', winRate: 50.0, trades: 9, pnl: 920, avgRR: '1 : 1.80', pf: 1.20, status: 'Review' }
    ]
  };

  function fmtCurrency(val, isForex) {
    if (isForex) {
      const abs = Math.abs(val).toLocaleString('en-US');
      return val >= 0 ? `+$${abs}` : `-$${abs}`;
    }
    const abs = Math.abs(val).toLocaleString('en-IN');
    return val >= 0 ? `+₹${abs}` : `−₹${abs}`;
  }

  /* ── Hexagonal Radar Score Canvas Render ── */
  function renderRadarScore() {
    const canvas = document.getElementById('portfolioRadarCanvas');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = wrap.clientWidth || 280;
    const cssH = 190;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2;
    const cy = cssH / 2 + 2;
    const radius = Math.min(cx, cy) - 28;

    // 6 Axes: Consistency, Calmar Ratio, SL usage, WR, RR, Daily Return
    const axes = [
      { name: 'Consistency', angle: -Math.PI / 2, val: 0.88 },
      { name: 'Calmar Ratio', angle: -Math.PI / 6, val: 0.72 },
      { name: 'SL usage', angle: Math.PI / 6, val: 0.94 },
      { name: 'WR', angle: Math.PI / 2, val: 0.65 },
      { name: 'RR', angle: (5 * Math.PI) / 6, val: 0.92 },
      { name: 'Daily Return', angle: (-5 * Math.PI) / 6, val: 0.70 }
    ];

    // Concentric Web Hexagons (4 levels)
    const levels = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;

    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius / levels) * lvl;
      ctx.beginPath();
      for (let i = 0; i < axes.length; i++) {
        const x = cx + r * Math.cos(axes[i].angle);
        const y = cy + r * Math.sin(axes[i].angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Spokes from center
    for (let i = 0; i < axes.length; i++) {
      const x = cx + radius * Math.cos(axes[i].angle);
      const y = cy + radius * Math.sin(axes[i].angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Axis Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '600 10.5px "Space Grotesk", sans-serif';
      
      const lx = cx + (radius + 14) * Math.cos(axes[i].angle);
      const ly = cy + (radius + 14) * Math.sin(axes[i].angle);

      if (i === 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
      } else if (i === 1 || i === 2) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
      } else if (i === 3) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
      } else {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
      }
      ctx.fillText(axes[i].name, lx, ly);
    }

    // Data polygon
    ctx.beginPath();
    for (let i = 0; i < axes.length; i++) {
      const r = radius * axes[i].val;
      const x = cx + r * Math.cos(axes[i].angle);
      const y = cy + r * Math.sin(axes[i].angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Vertices dots
    for (let i = 0; i < axes.length; i++) {
      const r = radius * axes[i].val;
      const x = cx + r * Math.cos(axes[i].angle);
      const y = cy + r * Math.sin(axes[i].angle);

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  /* ── Cumulative P&L Curve Canvas Render ── */
  function renderPnlCurve(data) {
    const canvas = document.getElementById('portfolioPnlCanvas');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = wrap.clientWidth || 700;
    const cssH = 260;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const pts = data.pnlCurve;
    if (!pts || pts.length < 2) return;

    const pad = { t: 20, r: 24, b: 40, l: 60 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;

    const bals = pts.map(p => p.balance);
    const minB = Math.min(...bals);
    const maxB = Math.max(...bals);
    const span = maxB - minB || 10000;
    const lo = minB - span * 0.08;
    const hi = maxB + span * 0.08;

    const toX = idx => pad.l + (idx / (pts.length - 1)) * w;
    const toY = b => pad.t + (1 - (b - lo) / (hi - lo)) * h;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const gy = pad.t + (i / 4) * h;
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(pad.l + w, gy);
      ctx.stroke();

      const gVal = hi - (i / 4) * (hi - lo);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      const label = _activeMarket === 'forex' ? `$${Math.round(gVal / 1000)}k` : `₹${(gVal / 100000).toFixed(1)}L`;
      ctx.fillText(label, pad.l - 8, gy + 3);
    }

    // Gradient area fill under line
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + h);
    grad.addColorStop(0, 'rgba(72, 183, 154, 0.35)');
    grad.addColorStop(1, 'rgba(72, 183, 154, 0.00)');

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0].balance));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toX(i), toY(pts[i].balance));
    }
    ctx.lineTo(toX(pts.length - 1), pad.t + h);
    ctx.lineTo(toX(0), pad.t + h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0].balance));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(toX(i), toY(pts[i].balance));
    }
    ctx.strokeStyle = '#48B79A';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Data points & X labels
    pts.forEach((p, i) => {
      const cx = toX(i);
      const cy = toY(p.balance);

      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#48B79A';
      ctx.fill();
      ctx.strokeStyle = '#181e36';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (i % 2 === 0 || i === pts.length - 1) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.date, cx, pad.t + h + 20);
      }
    });
  }

  /* ── Win vs Loss Trade Scatter Plot Canvas Render ── */
  function renderScatterPlot(data) {
    const canvas = document.getElementById('portfolioScatterCanvas');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = wrap.clientWidth || 700;
    const cssH = 280;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const trades = data.scatterTrades;
    if (!trades || trades.length === 0) return;

    const pad = { t: 25, r: 30, b: 35, l: 65 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;

    // Determine max win and min loss for Y-scale
    const pnls = trades.map(t => t.pnl);
    const maxWin = Math.max(...pnls.filter(p => p > 0), 10000);
    const maxLoss = Math.abs(Math.min(...pnls.filter(p => p < 0), -5000));
    const maxAbs = Math.max(maxWin, maxLoss) * 1.15;

    const zeroY = pad.t + h / 2;
    const toX = idx => pad.l + (idx / (trades.length - 1 || 1)) * w;
    const toY = pnl => zeroY - (pnl / maxAbs) * (h / 2);

    // Background Win (Top) & Loss (Bottom) zones
    ctx.fillStyle = 'rgba(72, 183, 154, 0.04)';
    ctx.fillRect(pad.l, pad.t, w, h / 2);

    ctx.fillStyle = 'rgba(224, 104, 90, 0.04)';
    ctx.fillRect(pad.l, zeroY, w, h / 2);

    // Zero-line (Break-even Axis)
    ctx.strokeStyle = 'rgba(224, 169, 78, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.l, zeroY);
    ctx.lineTo(pad.l + w, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zero line label
    ctx.fillStyle = 'var(--accent, #e0a94e)';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0 (BE)', pad.l - 8, zeroY + 3);

    // Top & bottom grid labels
    const isFx = _activeMarket === 'forex';
    const topStep1 = maxAbs * 0.5;
    const topStep2 = maxAbs * 0.9;
    const botStep1 = -maxAbs * 0.5;
    const botStep2 = -maxAbs * 0.9;

    const fmtP = v => isFx ? `$${Math.round(v)}` : `₹${Math.round(v / 1000)}k`;

    [topStep2, topStep1, botStep1, botStep2].forEach(val => {
      const y = toY(val);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + w, y);
      ctx.stroke();

      ctx.fillStyle = val > 0 ? '#48B79A' : '#E0685A';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText((val > 0 ? '+' : '') + fmtP(val), pad.l - 8, y + 3);
    });

    // Plot trade dots
    trades.forEach((t, i) => {
      const cx = toX(i);
      const cy = toY(t.pnl);
      const isWin = t.pnl >= 0;

      // Glow circle
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = isWin ? 'rgba(72, 183, 154, 0.35)' : 'rgba(224, 104, 90, 0.35)';
      ctx.fill();

      // Solid core
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = isWin ? '#48B79A' : '#E0685A';
      ctx.fill();
      ctx.strokeStyle = '#181e36';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Time Axis Label
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Trade Sequence (Time →)', pad.l + w / 2, pad.t + h + 22);
  }

  /* ── Semi-Circle Arc Gauge Canvas Render (Screenshot 2) ── */
  function renderSemiGauge(canvasId, winRate) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = 220;
    const cssH = 125;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2;
    const cy = cssH - 10;
    const radius = 76;
    const lineWidth = 16;

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    const winRatio = Math.max(0, Math.min(100, winRate)) / 100;
    const splitAngle = Math.PI + winRatio * Math.PI;

    // 1. Green Arc (Wins portion)
    if (winRatio > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, splitAngle, false);
      ctx.strokeStyle = '#48B79A';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    // 2. Red Arc (Losses portion)
    if (winRatio < 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, splitAngle, 2 * Math.PI, false);
      ctx.strokeStyle = '#E0685A';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  /* ── Instrument Profit Analysis Canvas Render (Screenshot 1) ── */
  function renderInstrumentProfit(data) {
    const canvas = document.getElementById('instrumentProfitCanvas');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = wrap.clientWidth || 360;
    const cssH = 260;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const pad = { t: 30, r: 25, b: 40, l: 65 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;

    const isFx = _activeMarket === 'forex';
    const yMax = 100;
    const yMin = -400;
    const toY = val => pad.t + ((yMax - val) / (yMax - yMin)) * h;

    // Grid lines: $100, $0, -$100, -$200, -$300, -$400
    const steps = [100, 0, -100, -200, -300, -400];
    steps.forEach(val => {
      const gy = toY(val);
      ctx.strokeStyle = val === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash(val === 0 ? [5, 4] : [3, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(pad.l + w, gy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#6b7280';
      ctx.font = '10.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      const label = isFx ? (val >= 0 ? `$${val}.00` : `-$${Math.abs(val)}.00`) : (val >= 0 ? `₹${val}k` : `-₹${Math.abs(val)}k`);
      ctx.fillText(label, pad.l - 8, gy + 3.5);
    });

    const items = isFx ? [
      { symbol: 'XAUUSD', profit: 45, loss: -348, net: -303 },
      { symbol: 'BTCUSD', profit: 2, loss: -12, net: -10 }
    ] : [
      { symbol: 'NIFTY', profit: 80, loss: -120, net: -40 },
      { symbol: 'BANKNIFTY', profit: 95, loss: -310, net: -215 }
    ];

    const barW = Math.min(52, w / (items.length * 2.5));
    const zeroY = toY(0);

    items.forEach((it, idx) => {
      const cx = pad.l + ((idx + 0.6) / items.length) * w;

      // 1. Green top bar (profit)
      if (it.profit > 0) {
        const topY = toY(it.profit);
        const barH = zeroY - topY;
        ctx.fillStyle = '#48B79A';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(cx - barW / 2, topY, barW, barH, [8, 8, 0, 0]);
        } else {
          ctx.rect(cx - barW / 2, topY, barW, barH);
        }
        ctx.fill();
      }

      // 2. Red bottom bar (loss)
      if (it.loss < 0) {
        const botY = toY(it.loss);
        const barH = botY - zeroY;
        ctx.fillStyle = '#E0685A';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(cx - barW / 2, zeroY, barW, barH, [0, 0, 8, 8]);
        } else {
          ctx.rect(cx - barW / 2, zeroY, barW, barH);
        }
        ctx.fill();
      }

      // 3. Gray dot net marker
      const netY = toY(it.net);
      ctx.beginPath();
      ctx.arc(cx, netY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#9ca3af';
      ctx.fill();
      ctx.strokeStyle = '#181e36';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Symbol X Label
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '600 11.5px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(it.symbol, cx, pad.t + h + 22);
    });
  }

  /* ── PnL by Trade Duration Canvas Render (Screenshot 2) ── */
  function renderPnlDuration(data) {
    const canvas = document.getElementById('pnlDurationCanvas');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = wrap.clientWidth || 360;
    const cssH = 260;

    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const pad = { t: 30, r: 25, b: 40, l: 65 };
    const w = cssW - pad.l - pad.r;
    const h = cssH - pad.t - pad.b;

    // Y-Axis: +$200 to -$100
    const isFx = _activeMarket === 'forex';
    const yMax = 200;
    const yMin = -100;
    const toY = pnl => pad.t + ((yMax - pnl) / (yMax - yMin)) * h;

    // X-Axis Duration: 0 to 120 mins (2 hours)
    const maxMins = 120;
    const toX = mins => pad.l + (mins / maxMins) * w;

    // Y Grid lines
    const ySteps = [200, 150, 100, 50, 0, -50, -100];
    ySteps.forEach(val => {
      const gy = toY(val);
      ctx.strokeStyle = val === 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash(val === 0 ? [5, 4] : [2, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(pad.l + w, gy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#6b7280';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      const label = isFx ? (val >= 0 ? `$${val}.00` : `-$${Math.abs(val)}.00`) : (val >= 0 ? `₹${val}k` : `-₹${Math.abs(val)}k`);
      ctx.fillText(label, pad.l - 8, gy + 3.5);
    });

    // X Grid & Labels: 0s, 17m, 33m, 50m, 1h, 1.5h, 2h
    const xSteps = [
      { mins: 0, label: '0s' },
      { mins: 17, label: '17m' },
      { mins: 33, label: '33m' },
      { mins: 50, label: '50m' },
      { mins: 60, label: '1h' },
      { mins: 80, label: '1h' },
      { mins: 100, label: '2h' },
      { mins: 120, label: '2h' }
    ];

    xSteps.forEach(s => {
      const gx = toX(s.mins);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(gx, pad.t);
      ctx.lineTo(gx, pad.t + h);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#6b7280';
      ctx.font = '10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, gx, pad.t + h + 20);
    });

    // Scatter trade points dataset matching Screenshot 2
    const pts = [
      { m: 1, p: -25 }, { m: 2, p: 52 }, { m: 3, p: -50 }, { m: 4, p: -70 }, { m: 4, p: 115 },
      { m: 6, p: -40 }, { m: 7, p: 35 }, { m: 8, p: -60 }, { m: 9, p: -30 }, { m: 9, p: 170 },
      { m: 10, p: 48 }, { m: 11, p: -45 }, { m: 12, p: 118 }, { m: 13, p: 122 }, { m: 14, p: -38 },
      { m: 15, p: -55 }, { m: 16, p: 15 }, { m: 17, p: -20 }, { m: 18, p: -48 }, { m: 19, p: 51 },
      { m: 22, p: 88 }, { m: 25, p: 50 }, { m: 26, p: -45 }, { m: 27, p: 62 }, { m: 28, p: 148 },
      { m: 30, p: -65 }, { m: 32, p: 25 }, { m: 34, p: 124 }, { m: 36, p: 120 }, { m: 38, p: 126 },
      { m: 40, p: 38 }, { m: 42, p: 45 }, { m: 44, p: 30 }, { m: 45, p: -60 }, { m: 47, p: 38 },
      { m: 52, p: -50 }, { m: 58, p: 3 }, { m: 65, p: 50 }, { m: 75, p: 40 }, { m: 78, p: 50 },
      { m: 82, p: -58 }, { m: 115, p: 70 }, { m: 118, p: -18 }
    ];

    pts.forEach(pt => {
      const cx = toX(pt.m);
      const cy = toY(pt.p);
      const isWin = pt.p >= 0;

      ctx.beginPath();
      ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = isWin ? '#48B79A' : '#E0685A';
      ctx.fill();
    });
  }

  /* ── Weekday Performance Bars ── */
  function renderWeekdayBars(data) {
    const list = document.getElementById('portfolioWeekdayList');
    if (!list) return;

    const isFx = _activeMarket === 'forex';
    list.innerHTML = data.dailyPerformance.map(d => {
      const isProfit = d.pnl >= 0;
      return `
        <div class="portfolio-weekday-card">
          <div class="portfolio-wd-header">
            <span class="portfolio-wd-name">${d.fullDay}</span>
            <span class="portfolio-wd-trades">${d.trades} trades</span>
          </div>
          <div class="portfolio-wd-winrate">
            <div class="portfolio-wd-val">${d.winRate}% <span class="portfolio-wd-sub">win rate</span></div>
            <div class="portfolio-bar-wrap">
              <div class="portfolio-bar-fill" style="width: ${d.winRate}%;"></div>
            </div>
          </div>
          <div class="portfolio-wd-pnl ${isProfit ? 'text-profit' : 'text-loss'}">
            ${fmtCurrency(d.pnl, isFx)}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Populate DOM with Data ── */
  function updatePortfolioUI() {
    const data = _activeMarket === 'forex' ? FOREX_DATA : INDIA_DATA;
    const isFx = _activeMarket === 'forex';

    // 1. Core 7 Metric Cards
    const elWinRate = document.getElementById('pmWinRate');
    const elAvgWin = document.getElementById('pmAvgWin');
    const elAvgLoss = document.getElementById('pmAvgLoss');
    const elBigWin = document.getElementById('pmBigWin');
    const elBigLoss = document.getElementById('pmBigLoss');
    const elAvgRR = document.getElementById('pmAvgRR');
    const elProfitFactor = document.getElementById('pmProfitFactor');

    if (elWinRate) elWinRate.textContent = `${data.metrics.winRate}%`;
    if (elAvgWin) elAvgWin.textContent = fmtCurrency(data.metrics.avgWin, isFx);
    if (elAvgLoss) elAvgLoss.textContent = fmtCurrency(data.metrics.avgLoss, isFx);
    if (elBigWin) {
      elBigWin.textContent = fmtCurrency(data.metrics.bigWin, isFx);
      const sub = document.getElementById('pmBigWinSub');
      if (sub) sub.textContent = data.metrics.bigWinSymbol;
    }
    if (elBigLoss) {
      elBigLoss.textContent = fmtCurrency(data.metrics.bigLoss, isFx);
      const sub = document.getElementById('pmBigLossSub');
      if (sub) sub.textContent = data.metrics.bigLossSymbol;
    }
    if (elAvgRR) elAvgRR.textContent = data.metrics.avgRR;
    if (elProfitFactor) elProfitFactor.textContent = data.metrics.profitFactor.toFixed(2);

    // 2. Long vs Short Cards
    const ls = data.longShort;
    const elLongWr = document.getElementById('plsLongWinRate');
    const elLongPnl = document.getElementById('plsLongPnl');
    const elLongTrades = document.getElementById('plsLongTrades');
    const elLongPf = document.getElementById('plsLongPF');
    const elLongRR = document.getElementById('plsLongRR');

    if (elLongWr) elLongWr.textContent = `${ls.long.winRate}%`;
    if (elLongPnl) elLongPnl.textContent = fmtCurrency(ls.long.pnl, isFx);
    if (elLongTrades) elLongTrades.textContent = `${ls.long.trades} trades (${ls.long.wins}W · ${ls.long.losses}L)`;
    if (elLongPf) elLongPf.textContent = `PF ${ls.long.profitFactor}`;
    if (elLongRR) elLongRR.textContent = `R:R ${ls.long.avgRR}`;

    const elShortWr = document.getElementById('plsShortWinRate');
    const elShortPnl = document.getElementById('plsShortPnl');
    const elShortTrades = document.getElementById('plsShortTrades');
    const elShortPf = document.getElementById('plsShortPF');
    const elShortRR = document.getElementById('plsShortRR');

    if (elShortWr) elShortWr.textContent = `${ls.short.winRate}%`;
    if (elShortPnl) elShortPnl.textContent = fmtCurrency(ls.short.pnl, isFx);
    if (elShortTrades) elShortTrades.textContent = `${ls.short.trades} trades (${ls.short.wins}W · ${ls.short.losses}L)`;
    if (elShortPf) elShortPf.textContent = `PF ${ls.short.profitFactor}`;
    if (elShortRR) elShortRR.textContent = `R:R ${ls.short.avgRR}`;

    // 3. Behaviour Card
    const beh = data.behaviour;
    const elDiscipline = document.getElementById('pbDiscipline');
    const elHoldTime = document.getElementById('pbHoldTime');
    const elRiskCompliance = document.getElementById('pbRiskCompliance');
    const elRevenge = document.getElementById('pbRevengeFlags');

    if (elDiscipline) elDiscipline.textContent = `${beh.disciplineScore}%`;
    if (elHoldTime) elHoldTime.textContent = beh.avgHoldTime;
    if (elRiskCompliance) elRiskCompliance.textContent = `${beh.riskCompliance}%`;
    if (elRevenge) elRevenge.textContent = `${beh.revengeTradingFlags} Flags`;

    // 4. Broker-Specific Views (Indian Instrument vs Forex Session)
    const indianView = document.getElementById('portfolioIndianInstrumentView');
    const forexView = document.getElementById('portfolioForexSessionView');

    if (_activeMarket === 'india') {
      if (indianView) indianView.hidden = false;
      if (forexView) forexView.hidden = true;

      const stk = data.instrumentPerformance.stocks;
      const fo = data.instrumentPerformance.fo;

      const elStkWr = document.getElementById('pinsStockWinRate');
      const elStkPnl = document.getElementById('pinsStockPnl');
      const elStkTrades = document.getElementById('pinsStockTrades');

      if (elStkWr) elStkWr.textContent = `${stk.winRate}%`;
      if (elStkPnl) elStkPnl.textContent = fmtCurrency(stk.pnl, false);
      if (elStkTrades) elStkTrades.textContent = `${stk.trades} trades (${stk.wins}W · ${stk.losses}L)`;

      const elFoWr = document.getElementById('pinsFoWinRate');
      const elFoPnl = document.getElementById('pinsFoPnl');
      const elFoTrades = document.getElementById('pinsFoTrades');

      if (elFoWr) elFoWr.textContent = `${fo.winRate}%`;
      if (elFoPnl) elFoPnl.textContent = fmtCurrency(fo.pnl, false);
      if (elFoTrades) elFoTrades.textContent = `${fo.trades} trades (${fo.wins}W · ${fo.losses}L)`;
    } else {
      if (indianView) indianView.hidden = true;
      if (forexView) forexView.hidden = false;

      const sessionList = document.getElementById('portfolioSessionList');
      if (sessionList && data.sessions) {
        sessionList.innerHTML = data.sessions.map(s => `
          <div class="portfolio-session-row">
            <div class="portfolio-session-hdr">
              <span class="portfolio-session-name">${s.name}</span>
              <span class="portfolio-session-rate">${s.winRate}%</span>
            </div>
            <div class="portfolio-session-bar-track">
              <div class="portfolio-session-bar-fill" style="width: ${s.winRate}%;"></div>
            </div>
          </div>
        `).join('');
      }
    }

    // 5. Strategy Review Table (Last section)
    const stratTbody = document.getElementById('portfolioStrategyTableBody');
    if (stratTbody && data.strategies) {
      stratTbody.innerHTML = data.strategies.map(s => {
        const isWin = s.pnl >= 0;
        return `
          <tr>
            <td><strong>${s.name}</strong></td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <span>${s.winRate}%</span>
                <div class="portfolio-bar-wrap" style="width:60px;">
                  <div class="portfolio-bar-fill" style="width:${s.winRate}%;"></div>
                </div>
              </div>
            </td>
            <td>${s.trades}</td>
            <td>${s.avgRR}</td>
            <td>${s.pf.toFixed(2)}</td>
            <td class="${isWin ? 'text-profit' : 'text-loss'}"><strong>${fmtCurrency(s.pnl, isFx)}</strong></td>
            <td><span class="jtag ${s.status === 'Top Edge' ? 'jtag-active' : ''}">${s.status}</span></td>
          </tr>
        `;
      }).join('');
    }

    // Top Stats & Balance Trackers
    const elAccSize = document.getElementById('psAccountSize');
    const elTodayProf = document.getElementById('psTodayProfit');
    const elRadarScore = document.getElementById('psRadarScore');
    const elBalVal = document.getElementById('psBalanceVal');
    const elBalMax = document.getElementById('psBalanceMax');
    const elEqVal = document.getElementById('psEquityVal');
    const elEqMax = document.getElementById('psEquityMax');

    if (elAccSize) elAccSize.textContent = '$5,000.00';
    if (elTodayProf) elTodayProf.textContent = '$0.00';
    if (elRadarScore) elRadarScore.textContent = '2.84';
    if (elBalVal) elBalVal.textContent = '$4,631.66';
    if (elBalMax) elBalMax.textContent = '$5,065.58 Max';
    if (elEqVal) elEqVal.textContent = '$4,631.66';
    if (elEqMax) elEqMax.textContent = '$5,124.10 Max';

    // Render Canvas Charts
    renderRadarScore();
    renderPnlCurve(data);
    renderInstrumentProfit(data);
    renderPnlDuration(data);
    renderScatterPlot(data);
    renderSemiGauge('longGaugeCanvas', data.longShort.long.winRate);
    renderSemiGauge('shortGaugeCanvas', data.longShort.short.winRate);
    renderWeekdayBars(data);
  }

  /* ── Switch Broker Mode (Indian vs Forex) ── */
  function switchPortfolioBroker(type, name) {
    _activeMarket = type === 'forex' ? 'forex' : 'india';

    const pbDropdown = document.getElementById('portfolioBrokerDropdown');
    if (pbDropdown) pbDropdown.classList.remove('dropdown-open');

    const btnSpan = document.querySelector('#portfolioBrokerDropdownBtn span:not(.p-dot)');
    if (btnSpan) {
      btnSpan.textContent = name ? `Connected: ${name}` : 'Connected Brokers';
    }

    updatePortfolioUI();
  }

  window.switchPortfolioBroker = switchPortfolioBroker;

  /* ── Initialization ── */
  function initPortfolioPage() {
    // Timeframe filters
    const tfBtns = document.querySelectorAll('.portfolio-tf-btn');
    tfBtns.forEach(btn => {
      btn.onclick = () => {
        tfBtns.forEach(b => b.classList.remove('portfolio-tf-active'));
        btn.classList.add('portfolio-tf-active');
        _activeTimeframe = btn.dataset.tf || '1M';
        updatePortfolioUI();
      };
    });

    // Connected Brokers dropdown functionality (Matches Calculator Dropdown)
    const pbDropdown = document.getElementById('portfolioBrokerDropdown');
    const pbDropdownBtn = document.getElementById('portfolioBrokerDropdownBtn');

    if (pbDropdownBtn && pbDropdown && !pbDropdownBtn.dataset.initialized) {
      pbDropdownBtn.dataset.initialized = 'true';
      pbDropdownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pbDropdown.classList.toggle('dropdown-open');
      });

      document.addEventListener('click', (e) => {
        if (!pbDropdown.contains(e.target)) {
          pbDropdown.classList.remove('dropdown-open');
        }
      });
    }

    // Window resize handler
    window.addEventListener('resize', () => {
      const data = _activeMarket === 'forex' ? FOREX_DATA : INDIA_DATA;
      renderRadarScore();
      renderPnlCurve(data);
      renderInstrumentProfit(data);
      renderPnlDuration(data);
      renderScatterPlot(data);
      renderSemiGauge('longGaugeCanvas', data.longShort.long.winRate);
      renderSemiGauge('shortGaugeCanvas', data.longShort.short.winRate);
    });

    updatePortfolioUI();
  }

  window.initPortfolioPage = initPortfolioPage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolioPage);
  } else {
    initPortfolioPage();
  }
}());
