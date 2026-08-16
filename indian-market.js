/* ============================================================
   INDIAN MARKET MODULE
   Handles Top Movers, Sectors, Stocks in News, F&O Update, 
   and Earnings sections for the Indian Market page
   ============================================================ */

(function() {
  'use strict';

  /* ============================================================
     MOCK DATA
     Replace with real API calls when backend is ready
     ============================================================ */

  const MOCK_GAINERS = [
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3842.50, change: 5.23, chart: [3650, 3680, 3720, 3750, 3780, 3820, 3842] },
    { symbol: 'INFY', name: 'Infosys', price: 1567.80, change: 4.87, chart: [1490, 1510, 1530, 1545, 1555, 1560, 1568] },
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2845.30, change: 4.12, chart: [2730, 2750, 2780, 2800, 2820, 2835, 2845] },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1642.90, change: 3.78, chart: [1580, 1595, 1610, 1625, 1635, 1640, 1643] },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1087.65, change: 3.45, chart: [1050, 1060, 1070, 1078, 1083, 1086, 1088] },
    { symbol: 'WIPRO', name: 'Wipro', price: 456.20, change: 3.21, chart: [441, 445, 448, 451, 454, 455, 456] },
    { symbol: 'AXISBANK', name: 'Axis Bank', price: 1134.80, change: 2.98, chart: [1102, 1110, 1118, 1125, 1130, 1133, 1135] },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1523.40, change: 2.67, chart: [1483, 1495, 1505, 1512, 1518, 1521, 1523] },
  ];

  const MOCK_LOSERS = [
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 134.25, change: -4.56, chart: [141, 139, 137, 136, 135, 134.5, 134.25] },
    { symbol: 'ZOMATO', name: 'Zomato', price: 187.90, change: -3.89, chart: [195, 193, 191, 189.5, 188.5, 188, 187.9] },
    { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2567.30, change: -3.45, chart: [2658, 2640, 2610, 2590, 2575, 2570, 2567] },
    { symbol: 'COALINDIA', name: 'Coal India', price: 423.80, change: -3.12, chart: [437, 433, 430, 427, 425, 424, 423.8] },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', price: 278.45, change: -2.87, chart: [286, 284, 282, 280, 279, 278.5, 278.45] },
    { symbol: 'NTPC', name: 'NTPC Limited', price: 356.90, change: -2.54, chart: [366, 363, 360, 358, 357, 357, 356.9] },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', price: 612.70, change: -2.23, chart: [626, 622, 618, 615, 614, 613, 612.7] },
    { symbol: 'VEDL', name: 'Vedanta Limited', price: 423.50, change: -2.01, chart: [432, 429, 427, 425, 424, 423.8, 423.5] },
  ];

  const MOCK_SECTORS = [
    { name: 'IT', icon: '💻', gainers: 18, losers: 5, change: 3.45, totalStocks: 23 },
    { name: 'Financial Services', icon: '🏦', gainers: 12, losers: 8, change: 2.87, totalStocks: 20 },
    { name: 'Pharma', icon: '💊', gainers: 9, losers: 6, change: 1.76, totalStocks: 15 },
    { name: 'Auto', icon: '🚗', gainers: 7, losers: 9, change: -1.23, totalStocks: 16 },
    { name: 'FMCG', icon: '🛒', gainers: 6, losers: 10, change: -0.87, totalStocks: 16 },
    { name: 'Metals', icon: '⚒️', gainers: 4, losers: 12, change: -2.54, totalStocks: 16 },
  ];

  const MOCK_STOCKS_NEWS = [
    { company: 'RELIANCE', headline: 'Announces ₹75,000 crore capex for green energy projects', sentiment: 'positive' },
    { company: 'TCS', headline: 'Wins $2.3 billion deal from European banking consortium', sentiment: 'positive' },
    { company: 'ZOMATO', headline: 'Reports narrowing losses but misses revenue estimates', sentiment: 'neutral' },
    { company: 'TATASTEEL', headline: 'Faces pressure from falling steel prices in China', sentiment: 'negative' },
    { company: 'INFY', headline: 'Upgrades full-year revenue guidance amid strong demand', sentiment: 'positive' },
  ];

  const MOCK_FO_DATA = [
    { name: 'NIFTY 50 Futures', value: '24,857.30', change: 1.23 },
    { name: 'NIFTY Bank Futures', value: '52,134.80', change: 2.45 },
    { name: 'India VIX', value: '12.45', change: -3.21 },
  ];

  const MOCK_EARNINGS = [
    { symbol: 'HDFCBANK', name: 'HDFC Bank', date: 'Aug 16, 2026', tentative: false },
    { symbol: 'INFY', name: 'Infosys', date: 'Aug 17, 2026', tentative: true },
    { symbol: 'WIPRO', name: 'Wipro', date: 'Aug 18, 2026', tentative: true },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', date: 'Aug 19, 2026', tentative: false },
    { symbol: 'RELIANCE', name: 'Reliance Industries', date: 'Aug 20, 2026', tentative: true },
  ];

  const MOCK_ECONOMIC_EVENTS = {
    today: [
      { 
        date: 'Aug 14', 
        time: '10:00 AM', 
        event: 'RBI Monetary Policy Meeting', 
        country: 'IN', 
        impact: 'high', 
        previous: '6.50%', 
        forecast: '6.50%', 
        actual: '—' 
      },
      { 
        date: 'Aug 14', 
        time: '5:30 PM', 
        event: 'Industrial Production (YoY)', 
        country: 'IN', 
        impact: 'medium', 
        previous: '5.8%', 
        forecast: '6.2%', 
        actual: '—' 
      },
    ],
    tomorrow: [
      { 
        date: 'Aug 15', 
        time: '11:00 AM', 
        event: 'WPI Data Release', 
        country: 'IN', 
        impact: 'medium', 
        previous: '3.36%', 
        forecast: '3.50%', 
        actual: '—' 
      },
      { 
        date: 'Aug 15', 
        time: '2:30 PM', 
        event: 'Manufacturing PMI', 
        country: 'IN', 
        impact: 'low', 
        previous: '57.5', 
        forecast: '58.0', 
        actual: '—' 
      },
    ],
    week: [
      { 
        date: 'Aug 14', 
        time: '10:00 AM', 
        event: 'RBI Monetary Policy Meeting', 
        country: 'IN', 
        impact: 'high', 
        previous: '6.50%', 
        forecast: '6.50%', 
        actual: '—' 
      },
      { 
        date: 'Aug 15', 
        time: '11:00 AM', 
        event: 'WPI Data Release', 
        country: 'IN', 
        impact: 'medium', 
        previous: '3.36%', 
        forecast: '3.50%', 
        actual: '—' 
      },
      { 
        date: 'Aug 16', 
        time: '5:30 PM', 
        event: 'CPI Data Release', 
        country: 'IN', 
        impact: 'high', 
        previous: '4.75%', 
        forecast: '4.90%', 
        actual: '—' 
      },
      { 
        date: 'Aug 18', 
        time: '9:00 AM', 
        event: 'Current Account Balance', 
        country: 'IN', 
        impact: 'medium', 
        previous: '-8.2B', 
        forecast: '-7.8B', 
        actual: '—' 
      },
      { 
        date: 'Aug 20', 
        time: '3:30 PM', 
        event: 'Services PMI', 
        country: 'IN', 
        impact: 'low', 
        previous: '60.4', 
        forecast: '60.8', 
        actual: '—' 
      },
    ]
  };

  const TRADING_SESSIONS = [
    { name: 'Pre-Open', start: '9:00', end: '9:15', status: 'pre', type: 'equity' },
    { name: 'NSE', start: '9:15', end: '15:30', status: 'open', type: 'equity' },
    { name: 'BSE', start: '9:15', end: '15:30', status: 'open', type: 'equity' },
    { name: 'Equity F&O', start: '9:15', end: '15:30', status: 'open', type: 'fo' },
    { name: 'MCX Commodity', start: '9:00', end: '23:30', status: 'open', type: 'commodity' },
  ];

  /* ============================================================
     UTILITY FUNCTIONS
     ============================================================ */

  function getCurrentISTTime() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    return {
      hours: istTime.getHours(),
      minutes: istTime.getMinutes(),
      totalMinutes: istTime.getHours() * 60 + istTime.getMinutes()
    };
  }

  function timeStringToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function isSessionActive(session, currentTime) {
    const startMinutes = timeStringToMinutes(session.start);
    const endMinutes = timeStringToMinutes(session.end);
    
    // Handle overnight sessions (like MCX)
    if (endMinutes < startMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
    
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }

  function getSessionStatus(session, currentTime) {
    if (session.name === 'Pre-Open') {
      return isSessionActive(session, currentTime) ? 'pre' : 'closed';
    }
    return isSessionActive(session, currentTime) ? 'open' : 'closed';
  }

  /* ============================================================
     ECONOMIC CALENDAR (INDIA)
     ============================================================ */

  let currentCalendarPeriod = 'today';

  function initEconomicCalendar() {
    const todayTab = document.querySelector('[data-period="today"]');
    const tomorrowTab = document.querySelector('[data-period="tomorrow"]');
    const weekTab = document.querySelector('[data-period="week"]');
    const viewAllBtn = document.getElementById('viewAllCalendarBtn');

    if (!todayTab || !tomorrowTab || !weekTab) return;

    // Tab click handlers
    todayTab.addEventListener('click', () => {
      if (currentCalendarPeriod === 'today') return;
      setActiveCalendarTab(todayTab, [tomorrowTab, weekTab]);
      currentCalendarPeriod = 'today';
      loadCalendarData('today');
    });

    tomorrowTab.addEventListener('click', () => {
      if (currentCalendarPeriod === 'tomorrow') return;
      setActiveCalendarTab(tomorrowTab, [todayTab, weekTab]);
      currentCalendarPeriod = 'tomorrow';
      loadCalendarData('tomorrow');
    });

    weekTab.addEventListener('click', () => {
      if (currentCalendarPeriod === 'week') return;
      setActiveCalendarTab(weekTab, [todayTab, tomorrowTab]);
      currentCalendarPeriod = 'week';
      loadCalendarData('week');
    });

    // View all button
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        console.log('View all calendar events clicked');
        // TODO: Navigate to full economic calendar page
      });
    }

    // Initial load
    loadCalendarData('today');
  }

  function setActiveCalendarTab(activeTab, otherTabs) {
    activeTab.classList.add('calendar-tab-active');
    otherTabs.forEach(tab => tab.classList.remove('calendar-tab-active'));
  }

  function loadCalendarData(period) {
    const tbody = document.getElementById('calendarTableBody');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="calendar-loading">
          <div class="loading-spinner"></div>
          <span>Loading ${period} events...</span>
        </td>
      </tr>
    `;

    // Simulate API call
    setTimeout(() => {
      const events = MOCK_ECONOMIC_EVENTS[period] || [];
      renderCalendarTable(tbody, events);
    }, 400);
  }

  function renderCalendarTable(tbody, events) {
    if (events.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="calendar-loading">
            <span>No events scheduled</span>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = events.map(event => {
      const impactClass = `impact-${event.impact}`;
      const impactLabel = event.impact.charAt(0).toUpperCase() + event.impact.slice(1);

      return `
        <tr>
          <td class="cal-col-date">
            <div class="cal-date-badge">
              <strong>${event.date}</strong>
            </div>
          </td>
          <td class="cal-col-time">
            <span class="cal-time">${event.time}</span>
          </td>
          <td class="cal-col-event">
            <div class="cal-event-cell">
              <div class="cal-event-title">${event.event}</div>
            </div>
          </td>
          <td class="cal-col-country">
            <div class="cal-country">
              <span class="cal-country-flag">🇮🇳</span>
              <span>${event.country}</span>
            </div>
          </td>
          <td class="cal-col-impact">
            <span class="impact-badge ${impactClass}">${impactLabel}</span>
          </td>
          <td class="cal-col-previous">
            <div class="cal-value-cell">${event.previous}</div>
          </td>
          <td class="cal-col-forecast">
            <div class="cal-value-cell">${event.forecast}</div>
          </td>
          <td class="cal-col-actual">
            <div class="cal-value-cell cal-actual">${event.actual}</div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ============================================================
     TRADING SESSIONS TIMELINE
     ============================================================ */

  function initTradingSessions() {
    const clock = document.getElementById('sessionsClock');
    const date = document.getElementById('sessionsDate');
    const sessionsRows = document.getElementById('sessionsRows');
    const currentTimeIndicator = document.getElementById('sessionsCurrentTime');

    if (!sessionsRows) return;

    // Update clock and sessions status
    function updateClockAndSessions() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        hour12: false 
      });
      const dateStr = now.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      if (clock) clock.textContent = timeStr;
      if (date) date.textContent = dateStr;

      // Update sessions with current status
      const currentTime = getCurrentISTTime();
      renderTradingSessionsWithStatus(sessionsRows, currentTime.totalMinutes);

      // Update current time indicator
      updateCurrentTimeIndicator(currentTime.totalMinutes);
    }

    // Initial render and setup interval
    updateClockAndSessions();
    setInterval(updateClockAndSessions, 1000);
  }

  function renderTradingSessionsWithStatus(container, currentTimeMinutes) {
    container.innerHTML = TRADING_SESSIONS.map(session => {
      const currentStatus = getSessionStatus(session, currentTimeMinutes);
      const statusClass = `session-status-${currentStatus}`;
      const statusLabel = currentStatus === 'pre' ? 'PRE' : 
                         currentStatus === 'open' ? 'OPEN' : 'CLOSED';

      return `
        <div class="session-row">
          <div class="session-label">
            ${session.name}
            <span class="session-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="session-timeline">
            ${renderSessionPeriodWithStatus(session, currentStatus)}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSessionPeriodWithStatus(session, currentStatus) {
    const startHour = parseInt(session.start.split(':')[0]);
    const startMin = parseInt(session.start.split(':')[1]);
    const endHour = parseInt(session.end.split(':')[0]);
    const endMin = parseInt(session.end.split(':')[1]);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    // Timeline now spans from 9:00 AM (540 minutes) to 23:30 (1410 minutes) = 870 minutes total
    const timelineStart = 9 * 60; // 9:00 AM
    const timelineEnd = 23.5 * 60; // 23:30
    const timelineSpan = timelineEnd - timelineStart;
    
    const left = ((startMinutes - timelineStart) / timelineSpan) * 100;
    let width;
    
    // Handle overnight sessions (MCX)
    if (endMinutes < startMinutes) {
      // For overnight sessions, calculate to end of timeline
      width = ((timelineEnd - startMinutes) / timelineSpan) * 100;
    } else {
      width = ((endMinutes - startMinutes) / timelineSpan) * 100;
    }

    const periodClass = `session-period-${currentStatus}`;
    const timeLabel = `${session.start} - ${session.end}`;

    return `
      <div class="session-period ${periodClass}" style="left: ${Math.max(0, left)}%; width: ${Math.max(1, width)}%;">
        ${width > 15 ? timeLabel : ''}
      </div>
    `;
  }

  function updateCurrentTimeIndicator(currentTimeMinutes) {
    const currentTimeIndicator = document.getElementById('sessionsCurrentTime');
    if (!currentTimeIndicator) return;

    // Timeline spans from 9:00 AM to 23:30
    const timelineStart = 9 * 60; // 9:00 AM
    const timelineEnd = 23.5 * 60; // 23:30
    const timelineSpan = timelineEnd - timelineStart;
    
    // Only show indicator if current time is within the timeline range
    if (currentTimeMinutes >= timelineStart && currentTimeMinutes <= timelineEnd) {
      const position = ((currentTimeMinutes - timelineStart) / timelineSpan) * 100;
      currentTimeIndicator.style.left = `${position}%`;
      currentTimeIndicator.hidden = false;
    } else {
      currentTimeIndicator.hidden = true;
    }
  }

  /* ============================================================
     CHART RENDERING (Mini Sparklines)
     ============================================================ */

  function renderMiniChart(canvas, data, isPositive) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 4;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate dimensions
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Find min and max
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Calculate points
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight
    }));

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    
    ctx.strokeStyle = isPositive ? 
      getComputedStyle(document.documentElement).getPropertyValue('--profit').trim() :
      getComputedStyle(document.documentElement).getPropertyValue('--danger').trim();
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw area fill
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    
    ctx.fillStyle = isPositive ? 
      'rgba(72, 183, 154, 0.1)' :
      'rgba(224, 104, 90, 0.1)';
    ctx.fill();
  }

  function renderMiniChart(canvas, data, isPositive) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 4;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate dimensions
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Find min and max
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Calculate points
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight
    }));

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    
    ctx.strokeStyle = isPositive ? 
      getComputedStyle(document.documentElement).getPropertyValue('--profit').trim() :
      getComputedStyle(document.documentElement).getPropertyValue('--danger').trim();
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw area fill
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    
    ctx.fillStyle = isPositive ? 
      'rgba(72, 183, 154, 0.1)' :
      'rgba(224, 104, 90, 0.1)';
    ctx.fill();
  }

  /* ============================================================
     TOP MOVERS TODAY
     ============================================================ */

  let currentMoversType = 'gainers';

  function initTopMovers() {
    const gainersTab = document.querySelector('[data-type="gainers"]');
    const losersTab = document.querySelector('[data-type="losers"]');
    const viewAllBtn = document.getElementById('viewAllMoversBtn');
    const viewAllText = document.getElementById('viewAllMoversText');

    if (!gainersTab || !losersTab) return;

    // Tab click handlers
    gainersTab.addEventListener('click', () => {
      if (currentMoversType === 'gainers') return;
      
      gainersTab.classList.add('movers-tab-active');
      losersTab.classList.remove('movers-tab-active');
      currentMoversType = 'gainers';
      viewAllText.textContent = 'View all gainers';
      
      loadMoversData('gainers');
    });

    losersTab.addEventListener('click', () => {
      if (currentMoversType === 'losers') return;
      
      losersTab.classList.add('movers-tab-active');
      gainersTab.classList.remove('movers-tab-active');
      currentMoversType = 'losers';
      viewAllText.textContent = 'View all losers';
      
      loadMoversData('losers');
    });

    // View all button
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        console.log(`View all ${currentMoversType} clicked`);
        // TODO: Navigate to full movers page or open modal
      });
    }

    // Initial load
    loadMoversData('gainers');
  }

  function loadMoversData(type) {
    const tbody = document.getElementById('moversTableBody');
    if (!tbody) return;

    // Show loading state
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="movers-loading">
          <div class="loading-spinner"></div>
          <span>Loading ${type}...</span>
        </td>
      </tr>
    `;

    // Simulate API call
    setTimeout(() => {
      const data = type === 'gainers' ? MOCK_GAINERS : MOCK_LOSERS;
      renderMoversTable(tbody, data);
    }, 500);
  }

  function renderMoversTable(tbody, data) {
    tbody.innerHTML = data.map(stock => {
      const isPositive = stock.change > 0;
      const changeSymbol = isPositive ? '+' : '';
      const changeClass = isPositive ? 'positive' : 'negative';
      const arrowIcon = isPositive ? 
        '<svg class="change-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>' :
        '<svg class="change-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

      return `
        <tr>
          <td class="movers-col-company">
            <div class="company-cell">
              <div class="company-logo">${stock.symbol.substring(0, 2)}</div>
              <div class="company-info">
                <div class="company-name">${stock.name}</div>
                <div class="company-symbol">${stock.symbol}</div>
              </div>
            </div>
          </td>
          <td class="movers-col-chart">
            <div class="mini-chart">
              <canvas width="120" height="40" data-chart='${JSON.stringify(stock.chart)}' data-positive="${isPositive}"></canvas>
            </div>
          </td>
          <td class="movers-col-price">
            <div class="price-cell">₹${stock.price.toFixed(2)}</div>
          </td>
          <td class="movers-col-change">
            <div class="change-cell ${changeClass}">
              ${arrowIcon}
              <span>${changeSymbol}${Math.abs(stock.change).toFixed(2)}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Render charts after DOM update
    setTimeout(() => {
      const canvases = tbody.querySelectorAll('canvas[data-chart]');
      canvases.forEach(canvas => {
        const data = JSON.parse(canvas.getAttribute('data-chart'));
        const isPositive = canvas.getAttribute('data-positive') === 'true';
        renderMiniChart(canvas, data, isPositive);
      });
    }, 0);
  }

  /* ============================================================
     SECTORS TRENDING TODAY
     ============================================================ */

  function initSectors() {
    const sectorsList = document.getElementById('sectorsList');
    const viewAllBtn = document.getElementById('viewAllSectorsBtn');

    if (!sectorsList) return;

    // Show loading
    sectorsList.innerHTML = `
      <div class="sectors-loading">
        <div class="loading-spinner"></div>
        <span>Loading sector data...</span>
      </div>
    `;

    // Simulate API call
    setTimeout(() => {
      renderSectors(sectorsList, MOCK_SECTORS);
    }, 600);

    // View all button
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        console.log('View all sectors clicked');
        // TODO: Navigate to full sectors page
      });
    }
  }

  function renderSectors(container, sectors) {
    container.innerHTML = sectors.map(sector => {
      const isPositive = sector.change > 0;
      const changeClass = isPositive ? 'positive' : 'negative';
      const changeSymbol = isPositive ? '+' : '';
      
      // Calculate bar percentages
      const gainersPercent = (sector.gainers / sector.totalStocks) * 100;
      const losersPercent = (sector.losers / sector.totalStocks) * 100;

      return `
        <div class="sector-card">
          <div class="sector-icon">${sector.icon}</div>
          <div class="sector-content">
            <div class="sector-header">
              <div class="sector-name">${sector.name}</div>
              <div class="sector-stats">
                <span class="sector-gainers">↑ ${sector.gainers}</span>
                <span class="sector-losers">↓ ${sector.losers}</span>
              </div>
            </div>
            <div class="sector-bar-container">
              <div class="sector-bar">
                <div class="sector-bar-gain" style="width: ${gainersPercent}%"></div>
                <div class="sector-bar-loss" style="width: ${losersPercent}%"></div>
              </div>
            </div>
          </div>
          <div class="sector-change ${changeClass}">${changeSymbol}${Math.abs(sector.change).toFixed(2)}%</div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     STOCKS IN NEWS TODAY
     ============================================================ */

  function initStocksNews() {
    const newsList = document.getElementById('stocksNewsList');
    const viewAllBtn = document.getElementById('viewAllStocksNewsBtn');

    if (!newsList) return;

    // Show loading
    newsList.innerHTML = `
      <div class="stocks-news-loading">
        <div class="loading-spinner"></div>
        <span>Loading news...</span>
      </div>
    `;

    // Simulate API call
    setTimeout(() => {
      renderStocksNews(newsList, MOCK_STOCKS_NEWS);
    }, 700);

    // View all button
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        console.log('View all stocks news clicked');
        // TODO: Navigate to full news page
      });
    }
  }

  function renderStocksNews(container, news) {
    container.innerHTML = news.map(item => {
      const sentimentClass = `sentiment-${item.sentiment}`;
      const sentimentLabel = item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1);

      return `
        <div class="stock-news-item">
          <div class="stock-news-header">
            <div class="stock-news-company">${item.company}</div>
            <div class="sentiment-badge ${sentimentClass}">${sentimentLabel}</div>
          </div>
          <div class="stock-news-headline">${item.headline}</div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     F&O UPDATE
     ============================================================ */

  function initFOUpdate() {
    const foList = document.getElementById('foUpdateList');
    const viewAllBtn = document.getElementById('viewAllFOBtn');

    if (!foList) return;

    // Show loading
    foList.innerHTML = `
      <div class="fo-update-loading">
        <div class="loading-spinner"></div>
        <span>Loading F&O data...</span>
      </div>
    `;

    // Simulate API call
    setTimeout(() => {
      renderFOUpdate(foList, MOCK_FO_DATA);
    }, 800);

    // View all button
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        console.log('View all F&O clicked');
        // TODO: Navigate to full F&O page
      });
    }
  }

  function renderFOUpdate(container, data) {
    container.innerHTML = data.map(item => {
      const isPositive = item.change > 0;
      const changeClass = isPositive ? 'positive' : 'negative';
      const changeSymbol = isPositive ? '+' : '';

      return `
        <div class="fo-update-item">
          <div class="fo-update-name">${item.name}</div>
          <div class="fo-update-details">
            <div class="fo-update-value">${item.value}</div>
            <div class="fo-update-change ${changeClass}">${changeSymbol}${Math.abs(item.change).toFixed(2)}%</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     EARNINGS THIS WEEK
     ============================================================ */

  function initEarnings() {
    const earningsList = document.getElementById('earningsList');
    const viewAllBtn = document.getElementById('viewAllEarningsBtn');

    if (!earningsList) return;

    // Show loading
    earningsList.innerHTML = `
      <div class="earnings-loading">
        <div class="loading-spinner"></div>
        <span>Loading earnings...</span>
      </div>
    `;

    // Simulate API call
    setTimeout(() => {
      renderEarnings(earningsList, MOCK_EARNINGS);
    }, 900);

    // View all button
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        console.log('View all earnings clicked');
        // TODO: Navigate to full earnings calendar
      });
    }
  }

  function renderEarnings(container, earnings) {
    container.innerHTML = earnings.map(item => {
      const tentativeBadge = item.tentative ? 
        '<span class="earnings-tentative">Tentative</span>' : '';

      return `
        <div class="earnings-item">
          <div class="earnings-logo">${item.symbol.substring(0, 2)}</div>
          <div class="earnings-content">
            <div class="earnings-company">${item.name}</div>
            <div class="earnings-date">
              ${item.date}
              ${tentativeBadge}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  function initIndianMarket() {
    // Check if we're on the market page and Indian market is visible
    const indianMarketWrapper = document.getElementById('indianMarketWrapper');
    if (!indianMarketWrapper) return;

    console.log('Initializing Indian Market sections...');

    // Initialize all sections
    initEconomicCalendar();
    initTradingSessions();
    initTopMovers();
    initSectors();
    initStocksNews();
    initFOUpdate();
    initEarnings();
  }

  window.initIndianMarket = initIndianMarket;

  /* ============================================================
     AUTO-INIT & HOOK INTO MARKET PAGE
     ============================================================ */

  // Hook into existing market page initialization
  const originalInit = window.initializeMarketPage;
  window.initializeMarketPage = function() {
    if (originalInit) originalInit.apply(this, arguments);
    
    // Small delay to ensure DOM is ready
    setTimeout(initIndianMarket, 100);
  };

  // Initialize if already on market page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const marketPage = document.getElementById('marketPage');
      if (marketPage && !marketPage.hidden) {
        initIndianMarket();
      }
    });
  } else {
    const marketPage = document.getElementById('marketPage');
    if (marketPage && !marketPage.hidden) {
      initIndianMarket();
    }
  }

})();
