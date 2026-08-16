/* ============================================================
   FOREX MARKET MODULE — RiskLoop
   Handles Forex Economic Calendar, 24-Hour Trading Sessions,
   Session Overlaps (London-New York highlight), and Forex Rates.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     FOREX ECONOMIC CALENDAR DATA
     Major Currencies: USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD
     ============================================================ */

  const FOREX_ECONOMIC_EVENTS = {
    today: [
      {
        date: 'Today',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Core Retail Sales (MoM)',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '0.4%',
        forecast: '0.3%',
        actual: '0.5%'
      },
      {
        date: 'Today',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Retail Sales (MoM)',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '0.1%',
        forecast: '0.4%',
        actual: '0.4%'
      },
      {
        date: 'Today',
        timeUTC: '08:00',
        timeIST: '13:30',
        event: 'Claimant Count Change',
        country: 'GB',
        currency: 'GBP',
        impact: 'high',
        previous: '32.3K',
        forecast: '20.0K',
        actual: '14.5K'
      },
      {
        date: 'Today',
        timeUTC: '09:00',
        timeIST: '14:30',
        event: 'ZEW Economic Sentiment',
        country: 'EU',
        currency: 'EUR',
        impact: 'medium',
        previous: '43.7',
        forecast: '35.4',
        actual: '31.8'
      },
      {
        date: 'Today',
        timeUTC: '01:30',
        timeIST: '07:00',
        event: 'Wage Price Index (QoQ)',
        country: 'AU',
        currency: 'AUD',
        impact: 'high',
        previous: '0.8%',
        forecast: '0.9%',
        actual: '0.8%'
      },
      {
        date: 'Today',
        timeUTC: '23:50',
        timeIST: '05:20',
        event: 'Producer Price Index (YoY)',
        country: 'JP',
        currency: 'JPY',
        impact: 'medium',
        previous: '2.9%',
        forecast: '3.0%',
        actual: '3.0%'
      },
      {
        date: 'Today',
        timeUTC: '12:15',
        timeIST: '17:45',
        event: 'Housing Starts',
        country: 'CA',
        currency: 'CAD',
        impact: 'medium',
        previous: '241K',
        forecast: '245K',
        actual: '252K'
      },
      {
        date: 'Today',
        timeUTC: '18:00',
        timeIST: '23:30',
        event: 'FOMC Member Speech',
        country: 'US',
        currency: 'USD',
        impact: 'medium',
        previous: '—',
        forecast: '—',
        actual: '—'
      }
    ],
    tomorrow: [
      {
        date: 'Tomorrow',
        timeUTC: '01:30',
        timeIST: '07:00',
        event: 'Employment Change',
        country: 'AU',
        currency: 'AUD',
        impact: 'high',
        previous: '50.2K',
        forecast: '20.0K',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '01:30',
        timeIST: '07:00',
        event: 'Unemployment Rate',
        country: 'AU',
        currency: 'AUD',
        impact: 'high',
        previous: '4.1%',
        forecast: '4.1%',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Philly Fed Manufacturing Index',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '13.9',
        forecast: '5.2',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Initial Jobless Claims',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '233K',
        forecast: '235K',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Core CPI (MoM)',
        country: 'CA',
        currency: 'CAD',
        impact: 'high',
        previous: '-0.1%',
        forecast: '0.2%',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '06:30',
        timeIST: '12:00',
        event: 'Producer & Import Prices (MoM)',
        country: 'CH',
        currency: 'CHF',
        impact: 'low',
        previous: '0.0%',
        forecast: '0.1%',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '21:45',
        timeIST: '03:15',
        event: 'Producer Price Index Input (QoQ)',
        country: 'NZ',
        currency: 'NZD',
        impact: 'medium',
        previous: '0.7%',
        forecast: '0.9%',
        actual: '—'
      },
      {
        date: 'Tomorrow',
        timeUTC: '09:00',
        timeIST: '14:30',
        event: 'Trade Balance',
        country: 'EU',
        currency: 'EUR',
        impact: 'low',
        previous: '13.9B',
        forecast: '15.2B',
        actual: '—'
      }
    ],
    week: [
      {
        date: 'Aug 17',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Core Retail Sales (MoM)',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '0.4%',
        forecast: '0.3%',
        actual: '0.5%'
      },
      {
        date: 'Aug 17',
        timeUTC: '08:00',
        timeIST: '13:30',
        event: 'Claimant Count Change',
        country: 'GB',
        currency: 'GBP',
        impact: 'high',
        previous: '32.3K',
        forecast: '20.0K',
        actual: '14.5K'
      },
      {
        date: 'Aug 18',
        timeUTC: '01:30',
        timeIST: '07:00',
        event: 'Employment Change',
        country: 'AU',
        currency: 'AUD',
        impact: 'high',
        previous: '50.2K',
        forecast: '20.0K',
        actual: '—'
      },
      {
        date: 'Aug 18',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Initial Jobless Claims',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '233K',
        forecast: '235K',
        actual: '—'
      },
      {
        date: 'Aug 19',
        timeUTC: '06:00',
        timeIST: '11:30',
        event: 'Retail Sales (MoM)',
        country: 'GB',
        currency: 'GBP',
        impact: 'high',
        previous: '-1.2%',
        forecast: '0.5%',
        actual: '—'
      },
      {
        date: 'Aug 19',
        timeUTC: '09:00',
        timeIST: '14:30',
        event: 'CPI (YoY) Final',
        country: 'EU',
        currency: 'EUR',
        impact: 'high',
        previous: '2.5%',
        forecast: '2.6%',
        actual: '—'
      },
      {
        date: 'Aug 20',
        timeUTC: '23:30',
        timeIST: '05:00',
        event: 'National Core CPI (YoY)',
        country: 'JP',
        currency: 'JPY',
        impact: 'high',
        previous: '2.6%',
        forecast: '2.7%',
        actual: '—'
      },
      {
        date: 'Aug 20',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Non-Farm Payrolls (NFP)',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '206K',
        forecast: '175K',
        actual: '—'
      },
      {
        date: 'Aug 20',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Unemployment Rate',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '4.1%',
        forecast: '4.1%',
        actual: '—'
      },
      {
        date: 'Aug 20',
        timeUTC: '14:00',
        timeIST: '19:30',
        event: 'Prelim UoM Consumer Sentiment',
        country: 'US',
        currency: 'USD',
        impact: 'high',
        previous: '66.4',
        forecast: '66.9',
        actual: '—'
      },
      {
        date: 'Aug 21',
        timeUTC: '02:00',
        timeIST: '07:30',
        event: 'RBNZ Official Cash Rate Decision',
        country: 'NZ',
        currency: 'NZD',
        impact: 'high',
        previous: '5.50%',
        forecast: '5.25%',
        actual: '—'
      },
      {
        date: 'Aug 21',
        timeUTC: '12:30',
        timeIST: '18:00',
        event: 'Retail Sales (MoM)',
        country: 'CA',
        currency: 'CAD',
        impact: 'high',
        previous: '-1.8%',
        forecast: '0.3%',
        actual: '—'
      },
      {
        date: 'Aug 21',
        timeUTC: '08:30',
        timeIST: '14:00',
        event: 'SNB Chairman Speech',
        country: 'CH',
        currency: 'CHF',
        impact: 'high',
        previous: '—',
        forecast: '—',
        actual: '—'
      }
    ]
  };

  const CURRENCY_FLAGS = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    AUD: '🇦🇺',
    CAD: '🇨🇦',
    CHF: '🇨🇭',
    NZD: '🇳🇿'
  };

  /* ============================================================
     FOREX SESSIONS CONFIGURATION
     Times in UTC (24-hour format)
     ============================================================ */

  const SESSIONS = [
    {
      id: 'sydney',
      name: 'Sydney',
      city: 'Sydney, Australia',
      flag: '🇦🇺',
      openUTC: 22, // 22:00 UTC
      closeUTC: 7, // 07:00 UTC
      openMinUTC: 22 * 60,
      closeMinUTC: 7 * 60,
      openIST: '03:30',
      closeIST: '12:30',
      currencies: ['AUD', 'NZD'],
      color: '#10B981',
      accentClass: 'session-sydney'
    },
    {
      id: 'tokyo',
      name: 'Tokyo',
      city: 'Tokyo, Japan (Asian)',
      flag: '🇯🇵',
      openUTC: 0, // 00:00 UTC
      closeUTC: 9, // 09:00 UTC
      openMinUTC: 0,
      closeMinUTC: 9 * 60,
      openIST: '05:30',
      closeIST: '14:30',
      currencies: ['JPY', 'AUD', 'NZD'],
      color: '#8B5CF6',
      accentClass: 'session-tokyo'
    },
    {
      id: 'london',
      name: 'London',
      city: 'London, UK (European)',
      flag: '🇬🇧',
      openUTC: 8, // 08:00 UTC
      closeUTC: 17, // 17:00 UTC
      openMinUTC: 8 * 60,
      closeMinUTC: 17 * 60,
      openIST: '13:30',
      closeIST: '22:30',
      currencies: ['GBP', 'EUR', 'CHF'],
      color: '#3B82F6',
      accentClass: 'session-london'
    },
    {
      id: 'newyork',
      name: 'New York',
      city: 'New York, US (North American)',
      flag: '🇺🇸',
      openUTC: 13, // 13:00 UTC
      closeUTC: 22, // 22:00 UTC
      openMinUTC: 13 * 60,
      closeMinUTC: 22 * 60,
      openIST: '18:30',
      closeIST: '03:30',
      currencies: ['USD', 'CAD'],
      color: '#F59E0B',
      accentClass: 'session-newyork'
    }
  ];

  /* Major Overlaps */
  const OVERLAPS = [
    {
      id: 'london-newyork',
      name: 'London – New York Overlap',
      openUTC: 13,
      closeUTC: 17,
      openMinUTC: 13 * 60,
      closeMinUTC: 17 * 60,
      openIST: '18:30',
      closeIST: '22:30',
      badge: '⚡ Peak Market Liquidity',
      description: 'The highest volume window in global finance. Over 70% of all forex transactions occur during this 4-hour window with lowest spreads on EUR/USD, GBP/USD, and USD pairs.',
      isPrimary: true
    },
    {
      id: 'tokyo-london',
      name: 'Tokyo – London Overlap',
      openUTC: 8,
      closeUTC: 9,
      openMinUTC: 8 * 60,
      closeMinUTC: 9 * 60,
      openIST: '13:30',
      closeIST: '14:30',
      badge: '🌍 Asia–Europe Handover',
      description: 'Transition window as European traders open positions while Asian markets close.',
      isPrimary: false
    },
    {
      id: 'sydney-tokyo',
      name: 'Sydney – Tokyo Overlap',
      openUTC: 0,
      closeUTC: 7,
      openMinUTC: 0,
      closeMinUTC: 7 * 60,
      openIST: '05:30',
      closeIST: '12:30',
      badge: '🌏 Asia-Pacific Session',
      description: 'Major liquidity for AUD/USD, NZD/USD, and JPY cross pairs across Asian trading desks.',
      isPrimary: false
    }
  ];

  /* Forex Majors Rates Mock */
  const FOREX_MAJORS = [
    { pair: 'EUR/USD', name: 'Euro / US Dollar', rate: '1.0924', change: '+0.34%', positive: true, spread: '0.8', high: '1.0945', low: '1.0890' },
    { pair: 'GBP/USD', name: 'British Pound / US Dollar', rate: '1.2862', change: '+0.52%', positive: true, spread: '1.1', high: '1.2890', low: '1.2815' },
    { pair: 'USD/JPY', name: 'US Dollar / Japanese Yen', rate: '154.38', change: '-0.42%', positive: false, spread: '0.9', high: '155.10', low: '154.12' },
    { pair: 'AUD/USD', name: 'Australian Dollar / US Dollar', rate: '0.6685', change: '+0.28%', positive: true, spread: '1.2', high: '0.6710', low: '0.6655' },
    { pair: 'USD/CAD', name: 'US Dollar / Canadian Dollar', rate: '1.3670', change: '-0.15%', positive: false, spread: '1.3', high: '1.3710', low: '1.3650' },
    { pair: 'USD/CHF', name: 'US Dollar / Swiss Franc', rate: '0.8655', change: '-0.21%', positive: false, spread: '1.4', high: '0.8690', low: '0.8640' },
    { pair: 'NZD/USD', name: 'New Zealand / US Dollar', rate: '0.6042', change: '+0.19%', positive: true, spread: '1.5', high: '0.6075', low: '0.6020' },
    { pair: 'EUR/GBP', name: 'Euro / British Pound', rate: '0.8493', change: '-0.18%', positive: false, spread: '1.2', high: '0.8520', low: '0.8480' }
  ];

  /* State */
  let currentForexPeriod = 'today';
  let currentCurrencyFilter = 'ALL';
  let forexTimezoneMode = 'IST'; // 'IST' or 'UTC'
  let sessionUpdateInterval = null;

  /* ============================================================
     TIME HELPER FUNCTIONS
     ============================================================ */

  function getNowUTC() {
    const d = new Date();
    const totalMin = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
    return {
      hours: d.getUTCHours(),
      minutes: d.getUTCMinutes(),
      seconds: d.getUTCSeconds(),
      totalMinutes: totalMin,
      day: d.getUTCDay(),
      dateObj: d
    };
  }

  function getNowIST() {
    const d = new Date();
    const istOffset = 5.5 * 60; // 330 minutes
    const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
    let istMin = (utcMin + istOffset) % 1440;
    const hours = Math.floor(istMin / 60);
    const minutes = Math.floor(istMin % 60);
    return {
      hours,
      minutes,
      seconds: d.getUTCSeconds(),
      totalMinutes: istMin
    };
  }

  function isSessionOpen(session, nowMinUTC) {
    if (session.openMinUTC < session.closeMinUTC) {
      return nowMinUTC >= session.openMinUTC && nowMinUTC < session.closeMinUTC;
    } else {
      // Crosses midnight UTC (e.g. Sydney 22:00 -> 07:00)
      return nowMinUTC >= session.openMinUTC || nowMinUTC < session.closeMinUTC;
    }
  }

  function getSessionTimeRemaining(session, nowMinUTC) {
    const isOpen = isSessionOpen(session, nowMinUTC);
    if (isOpen) {
      // Minutes until close
      let diff;
      if (session.openMinUTC < session.closeMinUTC) {
        diff = session.closeMinUTC - nowMinUTC;
      } else {
        if (nowMinUTC >= session.openMinUTC) {
          diff = (1440 - nowMinUTC) + session.closeMinUTC;
        } else {
          diff = session.closeMinUTC - nowMinUTC;
        }
      }
      const h = Math.floor(diff / 60);
      const m = Math.floor(diff % 60);
      return { isOpen: true, text: `Closes in ${h}h ${m}m`, mins: diff };
    } else {
      // Minutes until open
      let diff;
      if (nowMinUTC < session.openMinUTC) {
        diff = session.openMinUTC - nowMinUTC;
      } else {
        diff = (1440 - nowMinUTC) + session.openMinUTC;
      }
      const h = Math.floor(diff / 60);
      const m = Math.floor(diff % 60);
      return { isOpen: false, text: `Opens in ${h}h ${m}m`, mins: diff };
    }
  }

  function isOverlapActive(overlap, nowMinUTC) {
    if (overlap.openMinUTC < overlap.closeMinUTC) {
      return nowMinUTC >= overlap.openMinUTC && nowMinUTC < overlap.closeMinUTC;
    } else {
      return nowMinUTC >= overlap.openMinUTC || nowMinUTC < overlap.closeMinUTC;
    }
  }

  /* ============================================================
     FOREX ECONOMIC CALENDAR COMPONENT
     ============================================================ */

  function initForexEconomicCalendar() {
    const periodButtons = document.querySelectorAll('#forexCalendarPeriodTabs .calendar-tab');
    const currencyButtons = document.querySelectorAll('#forexCurrencyFilters .forex-curr-btn');
    const viewAllBtn = document.getElementById('viewAllForexCalendarBtn');
    const tzToggleBtn = document.getElementById('forexCalendarTzToggle');

    // Period buttons (Today / Tomorrow / This Week)
    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const period = btn.getAttribute('data-period');
        if (period === currentForexPeriod) return;

        periodButtons.forEach(b => b.classList.remove('calendar-tab-active'));
        btn.classList.add('calendar-tab-active');

        currentForexPeriod = period;
        renderForexCalendar();
      });
    });

    // Currency filter buttons
    currencyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const curr = btn.getAttribute('data-currency');
        if (curr === currentCurrencyFilter) return;

        currencyButtons.forEach(b => b.classList.remove('forex-curr-btn-active'));
        btn.classList.add('forex-curr-btn-active');

        currentCurrencyFilter = curr;
        renderForexCalendar();
      });
    });

    // Timezone Toggle (IST / UTC)
    if (tzToggleBtn) {
      tzToggleBtn.addEventListener('click', () => {
        forexTimezoneMode = forexTimezoneMode === 'IST' ? 'UTC' : 'IST';
        tzToggleBtn.textContent = `Time: ${forexTimezoneMode}`;
        const timeHeader = document.getElementById('forexCalTimeHeader');
        if (timeHeader) {
          timeHeader.textContent = `Time (${forexTimezoneMode})`;
        }
        renderForexCalendar();
      });
    }

    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        // Switch to 'week' filter
        const weekTab = document.querySelector('#forexCalendarPeriodTabs [data-period="week"]');
        if (weekTab) weekTab.click();
      });
    }

    renderForexCalendar();
  }

  function renderForexCalendar() {
    const tableBody = document.getElementById('forexCalendarTableBody');
    const navDate = document.getElementById('forexCalendarNavDate');
    if (!tableBody) return;

    // Update Date Header
    if (navDate) {
      const titles = {
        today: 'Today',
        tomorrow: 'Tomorrow',
        week: 'This Week'
      };
      navDate.textContent = titles[currentForexPeriod] || 'Today';
    }

    let events = FOREX_ECONOMIC_EVENTS[currentForexPeriod] || [];

    // Filter by currency
    if (currentCurrencyFilter !== 'ALL') {
      events = events.filter(e => e.currency === currentCurrencyFilter);
    }

    if (events.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);">
            No economic events found for ${currentCurrencyFilter} during this period.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = events.map(evt => {
      const flag = CURRENCY_FLAGS[evt.currency] || '🌐';
      const timeStr = forexTimezoneMode === 'UTC' ? `${evt.timeUTC} UTC` : `${evt.timeIST} IST`;
      const impactClass = `impact-${evt.impact}`;

      let actualVal = evt.actual || '—';
      let actualStyle = '';
      if (actualVal !== '—') {
        actualStyle = 'color: var(--accent); font-weight:700;';
      }

      return `
        <tr>
          <td class="cal-col-date">
            <span class="cal-date-badge">${evt.date}</span>
          </td>
          <td class="cal-col-time">
            <span class="cal-time">${timeStr}</span>
          </td>
          <td class="cal-col-event">
            <div class="cal-event-cell">
              <span class="cal-event-title">${evt.event}</span>
            </div>
          </td>
          <td class="cal-col-country">
            <div class="cal-country">
              <span class="cal-country-flag">${flag}</span>
              <span style="font-weight:600; font-family:'IBM Plex Mono', monospace;">${evt.currency}</span>
            </div>
          </td>
          <td class="cal-col-impact">
            <span class="impact-badge ${impactClass}">${evt.impact}</span>
          </td>
          <td class="cal-col-previous cal-value-cell">${evt.previous}</td>
          <td class="cal-col-forecast cal-value-cell">${evt.forecast}</td>
          <td class="cal-col-actual cal-value-cell" style="${actualStyle}">${actualVal}</td>
        </tr>
      `;
    }).join('');
  }

  /* ============================================================
     FOREX TRADING SESSIONS & OVERLAPS COMPONENT
     ============================================================ */

  function initForexTradingSessions() {
    updateForexSessionsUI();

    if (sessionUpdateInterval) {
      clearInterval(sessionUpdateInterval);
    }
    sessionUpdateInterval = setInterval(updateForexSessionsUI, 1000);
  }

  function updateForexSessionsUI() {
    const nowUTC = getNowUTC();
    const nowIST = getNowIST();
    const nowMinUTC = nowUTC.totalMinutes;

    // 1. Clocks
    const utcClock = document.getElementById('forexClockUTC');
    const istClock = document.getElementById('forexClockIST');
    const sessionStatusBadge = document.getElementById('forexActiveStatusSummary');

    if (utcClock) {
      utcClock.textContent = `${String(nowUTC.hours).padStart(2, '0')}:${String(nowUTC.minutes).padStart(2, '0')}:${String(nowUTC.seconds).padStart(2, '0')} UTC`;
    }
    if (istClock) {
      istClock.textContent = `${String(nowIST.hours).padStart(2, '0')}:${String(nowIST.minutes).padStart(2, '0')} IST`;
    }

    // 2. Determine open sessions
    const openSessions = SESSIONS.filter(s => isSessionOpen(s, nowMinUTC));
    const activeOverlap = OVERLAPS.find(o => isOverlapActive(o, nowMinUTC));

    if (sessionStatusBadge) {
      if (activeOverlap) {
        sessionStatusBadge.className = 'forex-market-status-badge badge-overlap';
        sessionStatusBadge.innerHTML = `
          <span class="pulse-dot"></span>
          <span>${activeOverlap.badge} ACTIVE (${activeOverlap.name})</span>
        `;
      } else if (openSessions.length > 0) {
        sessionStatusBadge.className = 'forex-market-status-badge badge-open';
        sessionStatusBadge.innerHTML = `
          <span class="pulse-dot"></span>
          <span>${openSessions.length} Session${openSessions.length > 1 ? 's' : ''} Open (${openSessions.map(s => s.name).join(', ')})</span>
        `;
      } else {
        sessionStatusBadge.className = 'forex-market-status-badge badge-closed';
        sessionStatusBadge.innerHTML = `<span>Market Quiet / Off-Hours</span>`;
      }
    }

    // 3. Render Session Cards
    renderSessionCards(nowMinUTC);

    // 4. Render 24-Hour Timeline Bar & Needle
    renderTimelineNeedle(nowMinUTC);

    // 5. Update Overlaps Highlight Banner
    renderOverlapsBanner(nowMinUTC);
  }

  function renderSessionCards(nowMinUTC) {
    const container = document.getElementById('forexSessionCardsGrid');
    if (!container) return;

    container.innerHTML = SESSIONS.map(session => {
      const open = isSessionOpen(session, nowMinUTC);
      const timerInfo = getSessionTimeRemaining(session, nowMinUTC);
      const statusBadge = open
        ? `<span class="session-card-status status-open"><span class="pulse-dot-sm"></span> OPEN</span>`
        : `<span class="session-card-status status-closed">CLOSED</span>`;

      const cardClass = open ? 'forex-session-card card-open' : 'forex-session-card card-closed';

      return `
        <div class="${cardClass}">
          <div class="session-card-top">
            <div class="session-card-identity">
              <span class="session-flag">${session.flag}</span>
              <div>
                <h3 class="session-name">${session.name}</h3>
                <span class="session-city">${session.city}</span>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class="session-card-times">
            <div class="time-block">
              <span class="time-label">Local (IST)</span>
              <span class="time-val">${session.openIST} – ${session.closeIST}</span>
            </div>
            <div class="time-block">
              <span class="time-label">UTC</span>
              <span class="time-val">${String(session.openUTC).padStart(2, '0')}:00 – ${String(session.closeUTC).padStart(2, '0')}:00</span>
            </div>
          </div>

          <div class="session-card-bottom">
            <div class="session-timer ${open ? 'timer-open' : 'timer-closed'}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${timerInfo.text}</span>
            </div>
            <div class="session-currencies">
              ${session.currencies.map(c => `<span class="currency-tag">${c}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTimelineNeedle(nowMinUTC) {
    const needle = document.getElementById('forexTimelineNeedle');
    const label = document.getElementById('forexTimelineNeedleLabel');
    if (!needle) return;

    const percent = Math.max(0, Math.min(100, (nowMinUTC / 1440) * 100));
    needle.style.left = `${percent}%`;

    if (label) {
      const h = Math.floor(nowMinUTC / 60);
      const m = Math.floor(nowMinUTC % 60);
      label.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} UTC`;
    }
  }

  function renderOverlapsBanner(nowMinUTC) {
    const londonNyOverlap = OVERLAPS.find(o => o.id === 'london-newyork');
    const isLondonNyActive = isOverlapActive(londonNyOverlap, nowMinUTC);

    const overlapCard = document.getElementById('forexLondonNyCard');
    const liveIndicator = document.getElementById('londonNyLiveBadge');

    if (overlapCard) {
      if (isLondonNyActive) {
        overlapCard.classList.add('overlap-card-active');
      } else {
        overlapCard.classList.remove('overlap-card-active');
      }
    }

    if (liveIndicator) {
      liveIndicator.hidden = !isLondonNyActive;
    }
  }

  /* ============================================================
     FOREX MAJORS & NEWS
     ============================================================ */

  function renderForexMajors() {
    const tbody = document.getElementById('forexMajorsTableBody');
    if (!tbody) return;

    tbody.innerHTML = FOREX_MAJORS.map(m => {
      const changeClass = m.positive ? 'rate-positive' : 'rate-negative';
      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--text); font-size:13px;">${m.pair}</div>
            <div style="font-size:11px; color:var(--text-muted);">${m.name}</div>
          </td>
          <td style="font-family:'IBM Plex Mono', monospace; font-weight:700; font-size:13px; color:var(--text);">${m.rate}</td>
          <td>
            <span class="rate-change-badge ${changeClass}">${m.change}</span>
          </td>
          <td style="font-family:'IBM Plex Mono', monospace; font-size:11.5px; color:var(--text-muted);">${m.spread} pips</td>
          <td style="font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--text-muted);">${m.high} / ${m.low}</td>
        </tr>
      `;
    }).join('');
  }

  /* ============================================================
     FOREX PAIR CORRELATIONS MODULE
     ============================================================ */

  const CORRELATION_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/JPY'];

  const CORRELATION_DATA = {
    '1D': {
      'EUR/USD': { 'EUR/USD': 1.00, 'GBP/USD': 0.86, 'USD/JPY': -0.34, 'USD/CHF': -0.94, 'AUD/USD': 0.78, 'USD/CAD': -0.76, 'NZD/USD': 0.73, 'EUR/JPY': 0.65 },
      'GBP/USD': { 'EUR/USD': 0.86, 'GBP/USD': 1.00, 'USD/JPY': -0.28, 'USD/CHF': -0.89, 'AUD/USD': 0.81, 'USD/CAD': -0.71, 'NZD/USD': 0.77, 'EUR/JPY': 0.58 },
      'USD/JPY': { 'EUR/USD': -0.34, 'GBP/USD': -0.28, 'USD/JPY': 1.00, 'USD/CHF': 0.48, 'AUD/USD': -0.22, 'USD/CAD': 0.39, 'NZD/USD': -0.19, 'EUR/JPY': 0.82 },
      'USD/CHF': { 'EUR/USD': -0.94, 'GBP/USD': -0.89, 'USD/JPY': 0.48, 'USD/CHF': 1.00, 'AUD/USD': -0.79, 'USD/CAD': 0.78, 'NZD/USD': -0.74, 'EUR/JPY': -0.42 },
      'AUD/USD': { 'EUR/USD': 0.78, 'GBP/USD': 0.81, 'USD/JPY': -0.22, 'USD/CHF': -0.79, 'AUD/USD': 1.00, 'USD/CAD': -0.72, 'NZD/USD': 0.91, 'EUR/JPY': 0.59 },
      'USD/CAD': { 'EUR/USD': -0.76, 'GBP/USD': -0.71, 'USD/JPY': 0.39, 'USD/CHF': 0.78, 'AUD/USD': -0.72, 'USD/CAD': 1.00, 'NZD/USD': -0.69, 'EUR/JPY': -0.36 },
      'NZD/USD': { 'EUR/USD': 0.73, 'GBP/USD': 0.77, 'USD/JPY': -0.19, 'USD/CHF': -0.74, 'AUD/USD': 0.91, 'USD/CAD': -0.69, 'NZD/USD': 1.00, 'EUR/JPY': 0.54 },
      'EUR/JPY': { 'EUR/USD': 0.65, 'GBP/USD': 0.58, 'USD/JPY': 0.82, 'USD/CHF': -0.42, 'AUD/USD': 0.59, 'USD/CAD': -0.36, 'NZD/USD': 0.54, 'EUR/JPY': 1.00 }
    },
    '1W': {
      'EUR/USD': { 'EUR/USD': 1.00, 'GBP/USD': 0.88, 'USD/JPY': -0.31, 'USD/CHF': -0.92, 'AUD/USD': 0.75, 'USD/CAD': -0.79, 'NZD/USD': 0.70, 'EUR/JPY': 0.62 },
      'GBP/USD': { 'EUR/USD': 0.88, 'GBP/USD': 1.00, 'USD/JPY': -0.25, 'USD/CHF': -0.87, 'AUD/USD': 0.83, 'USD/CAD': -0.74, 'NZD/USD': 0.79, 'EUR/JPY': 0.60 },
      'USD/JPY': { 'EUR/USD': -0.31, 'GBP/USD': -0.25, 'USD/JPY': 1.00, 'USD/CHF': 0.44, 'AUD/USD': -0.18, 'USD/CAD': 0.42, 'NZD/USD': -0.15, 'EUR/JPY': 0.85 },
      'USD/CHF': { 'EUR/USD': -0.92, 'GBP/USD': -0.87, 'USD/JPY': 0.44, 'USD/CHF': 1.00, 'AUD/USD': -0.76, 'USD/CAD': 0.81, 'NZD/USD': -0.71, 'EUR/JPY': -0.38 },
      'AUD/USD': { 'EUR/USD': 0.75, 'GBP/USD': 0.83, 'USD/JPY': -0.18, 'USD/CHF': -0.76, 'AUD/USD': 1.00, 'USD/CAD': -0.70, 'NZD/USD': 0.93, 'EUR/JPY': 0.61 },
      'USD/CAD': { 'EUR/USD': -0.79, 'GBP/USD': -0.74, 'USD/JPY': 0.42, 'USD/CHF': 0.81, 'AUD/USD': -0.70, 'USD/CAD': 1.00, 'NZD/USD': -0.66, 'EUR/JPY': -0.32 },
      'NZD/USD': { 'EUR/USD': 0.70, 'GBP/USD': 0.79, 'USD/JPY': -0.15, 'USD/CHF': -0.71, 'AUD/USD': 0.93, 'USD/CAD': -0.66, 'NZD/USD': 1.00, 'EUR/JPY': 0.57 },
      'EUR/JPY': { 'EUR/USD': 0.62, 'GBP/USD': 0.60, 'USD/JPY': 0.85, 'USD/CHF': -0.38, 'AUD/USD': 0.61, 'USD/CAD': -0.32, 'NZD/USD': 0.57, 'EUR/JPY': 1.00 }
    },
    '1M': {
      'EUR/USD': { 'EUR/USD': 1.00, 'GBP/USD': 0.84, 'USD/JPY': -0.40, 'USD/CHF': -0.95, 'AUD/USD': 0.73, 'USD/CAD': -0.82, 'NZD/USD': 0.68, 'EUR/JPY': 0.59 },
      'GBP/USD': { 'EUR/USD': 0.84, 'GBP/USD': 1.00, 'USD/JPY': -0.35, 'USD/CHF': -0.85, 'AUD/USD': 0.79, 'USD/CAD': -0.76, 'NZD/USD': 0.75, 'EUR/JPY': 0.55 },
      'USD/JPY': { 'EUR/USD': -0.40, 'GBP/USD': -0.35, 'USD/JPY': 1.00, 'USD/CHF': 0.52, 'AUD/USD': -0.28, 'USD/CAD': 0.45, 'NZD/USD': -0.24, 'EUR/JPY': 0.88 },
      'USD/CHF': { 'EUR/USD': -0.95, 'GBP/USD': -0.85, 'USD/JPY': 0.52, 'USD/CHF': 1.00, 'AUD/USD': -0.74, 'USD/CAD': 0.84, 'NZD/USD': -0.69, 'EUR/JPY': -0.35 },
      'AUD/USD': { 'EUR/USD': 0.73, 'GBP/USD': 0.79, 'USD/JPY': -0.28, 'USD/CHF': -0.74, 'AUD/USD': 1.00, 'USD/CAD': -0.68, 'NZD/USD': 0.90, 'EUR/JPY': 0.56 },
      'USD/CAD': { 'EUR/USD': -0.82, 'GBP/USD': -0.76, 'USD/JPY': 0.45, 'USD/CHF': 0.84, 'AUD/USD': -0.68, 'USD/CAD': 1.00, 'NZD/USD': -0.64, 'EUR/JPY': -0.30 },
      'NZD/USD': { 'EUR/USD': 0.68, 'GBP/USD': 0.75, 'USD/JPY': -0.24, 'USD/CHF': -0.69, 'AUD/USD': 0.90, 'USD/CAD': -0.64, 'NZD/USD': 1.00, 'EUR/JPY': 0.52 },
      'EUR/JPY': { 'EUR/USD': 0.59, 'GBP/USD': 0.55, 'USD/JPY': 0.88, 'USD/CHF': -0.35, 'AUD/USD': 0.56, 'USD/CAD': -0.30, 'NZD/USD': 0.52, 'EUR/JPY': 1.00 }
    },
    '3M': {
      'EUR/USD': { 'EUR/USD': 1.00, 'GBP/USD': 0.81, 'USD/JPY': -0.45, 'USD/CHF': -0.96, 'AUD/USD': 0.70, 'USD/CAD': -0.85, 'NZD/USD': 0.65, 'EUR/JPY': 0.52 },
      'GBP/USD': { 'EUR/USD': 0.81, 'GBP/USD': 1.00, 'USD/JPY': -0.41, 'USD/CHF': -0.82, 'AUD/USD': 0.76, 'USD/CAD': -0.79, 'NZD/USD': 0.72, 'EUR/JPY': 0.50 },
      'USD/JPY': { 'EUR/USD': -0.45, 'GBP/USD': -0.41, 'USD/JPY': 1.00, 'USD/CHF': 0.58, 'AUD/USD': -0.33, 'USD/CAD': 0.49, 'NZD/USD': -0.29, 'EUR/JPY': 0.91 },
      'USD/CHF': { 'EUR/USD': -0.96, 'GBP/USD': -0.82, 'USD/JPY': 0.58, 'USD/CHF': 1.00, 'AUD/USD': -0.71, 'USD/CAD': 0.87, 'NZD/USD': -0.65, 'EUR/JPY': -0.31 },
      'AUD/USD': { 'EUR/USD': 0.70, 'GBP/USD': 0.76, 'USD/JPY': -0.33, 'USD/CHF': -0.71, 'AUD/USD': 1.00, 'USD/CAD': -0.65, 'NZD/USD': 0.88, 'EUR/JPY': 0.51 },
      'USD/CAD': { 'EUR/USD': -0.85, 'GBP/USD': -0.79, 'USD/JPY': 0.49, 'USD/CHF': 0.87, 'AUD/USD': -0.65, 'USD/CAD': 1.00, 'NZD/USD': -0.61, 'EUR/JPY': -0.27 },
      'NZD/USD': { 'EUR/USD': 0.65, 'GBP/USD': 0.72, 'USD/JPY': -0.29, 'USD/CHF': -0.65, 'AUD/USD': 0.88, 'USD/CAD': -0.61, 'NZD/USD': 1.00, 'EUR/JPY': 0.48 },
      'EUR/JPY': { 'EUR/USD': 0.52, 'GBP/USD': 0.50, 'USD/JPY': 0.91, 'USD/CHF': -0.31, 'AUD/USD': 0.51, 'USD/CAD': -0.27, 'NZD/USD': 0.48, 'EUR/JPY': 1.00 }
    }
  };

  let currentCorrTimeframe = '1D';

  function initForexCorrelation() {
    const tfButtons = document.querySelectorAll('#forexCorrTimeframeTabs .corr-timeframe-btn');
    tfButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tf = btn.getAttribute('data-tf');
        if (tf === currentCorrTimeframe) return;

        tfButtons.forEach(b => b.classList.remove('corr-tf-active'));
        btn.classList.add('corr-tf-active');

        currentCorrTimeframe = tf;
        renderCorrelationMatrix();
      });
    });

    renderCorrelationMatrix();
  }

  function getCorrClass(val) {
    if (val >= 0.99) return 'corr-self';
    if (val >= 0.70) return 'corr-strong-pos';
    if (val >= 0.30) return 'corr-mod-pos';
    if (val > -0.30) return 'corr-neutral';
    if (val > -0.70) return 'corr-mod-neg';
    return 'corr-strong-neg';
  }

  function renderCorrelationMatrix() {
    const tbody = document.getElementById('forexCorrelationTableBody');
    if (!tbody) return;

    const data = CORRELATION_DATA[currentCorrTimeframe] || CORRELATION_DATA['1D'];

    tbody.innerHTML = CORRELATION_PAIRS.map(rowPair => {
      const rowData = data[rowPair] || {};
      const cellsHtml = CORRELATION_PAIRS.map(colPair => {
        const val = rowData[colPair] !== undefined ? rowData[colPair] : 0;
        const valStr = val === 1.00 ? '1.00' : (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
        const corrClass = getCorrClass(val);
        return `<td class="${corrClass}" title="${rowPair} vs ${colPair}: ${valStr}">${valStr}</td>`;
      }).join('');

      return `
        <tr>
          <td>${rowPair}</td>
          ${cellsHtml}
        </tr>
      `;
    }).join('');
  }

  /* ============================================================
     FOREX COMMENTS COMPONENT
     ============================================================ */

  const DEFAULT_FOREX_COMMENTS = [
    {
      id: 'fx_c1',
      username: 'Alex Vance',
      avatar: 'AV',
      isPro: true,
      time: '25m ago',
      content: 'EUR/USD is testing 1.0920 support ahead of today’s US Retail Sales. If US data comes in hotter than 0.4%, expect a swift dip towards 1.0880.',
      likes: 18,
      isLiked: false,
      replies: [
        {
          id: 'fx_r1',
          username: 'Sophia Ray',
          avatar: 'SR',
          isPro: false,
          time: '12m ago',
          content: 'Agreed. London session volume is building up. Watch the 13:00 UTC overlap start.',
          likes: 5,
          isLiked: false
        }
      ]
    },
    {
      id: 'fx_c2',
      username: 'Kenji Sato',
      avatar: 'KS',
      isPro: false,
      time: '1h ago',
      content: 'GBP/JPY broke 198.50 on solid Tokyo handover momentum. Strong +0.82 correlation with USD/JPY giving high conviction.',
      likes: 12,
      isLiked: false,
      replies: []
    },
    {
      id: 'fx_c3',
      username: 'Elena Rostova',
      avatar: 'ER',
      isPro: true,
      time: '2h ago',
      content: 'Remember that EUR/USD and USD/CHF have a -0.94 inverse correlation. Do not double up on dollar shorts without sizing down.',
      likes: 27,
      isLiked: true,
      replies: []
    }
  ];

  function getForexComments() {
    try {
      const stored = localStorage.getItem('riskloop_forex_comments');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored forex comments:', e);
    }
    return DEFAULT_FOREX_COMMENTS;
  }

  function saveForexComments(comments) {
    try {
      localStorage.setItem('riskloop_forex_comments', JSON.stringify(comments));
    } catch (e) {
      console.error('Error saving forex comments:', e);
    }
  }

  let forexComments = getForexComments();
  let forexCommentSort = 'recent';

  function initForexComments() {
    const postBtn = document.getElementById('forexPostCommentBtn');
    const textarea = document.getElementById('forexCommentTextarea');
    const charCounter = document.getElementById('forexCharCounter');
    const sortSelect = document.getElementById('forexCommentSortSelect');
    const refreshBtn = document.getElementById('forexCommentRefreshBtn');
    const emojiBtn = document.getElementById('forexEmojiBtn');

    if (textarea && charCounter) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCounter.textContent = `${len}/2000`;
        if (len > 2000) charCounter.style.color = '#ef4444';
        else if (len > 1800) charCounter.style.color = '#f59e0b';
        else charCounter.style.color = '#9198b4';
      });

      textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          postForexComment();
        }
      });
    }

    if (postBtn) {
      postBtn.addEventListener('click', postForexComment);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        forexCommentSort = e.target.value;
        renderForexComments();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        forexComments = getForexComments();
        renderForexComments();
      });
    }

    if (emojiBtn && textarea) {
      emojiBtn.addEventListener('click', () => {
        const emojis = ['🚀', '📈', '📉', '⚡', '🔥', '🛡️', '📊', '💰'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        textarea.value += ` ${randomEmoji} `;
        textarea.focus();
        textarea.dispatchEvent(new Event('input'));
      });
    }

    renderForexComments();
  }

  function postForexComment() {
    const textarea = document.getElementById('forexCommentTextarea');
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content) {
      alert('Please enter a comment before posting.');
      return;
    }

    if (content.length > 2000) {
      alert('Comment exceeds 2000 character limit.');
      return;
    }

    const newComment = {
      id: 'fx_' + Date.now(),
      username: 'ForexTrader_' + Math.floor(Math.random() * 900 + 100),
      avatar: 'FT',
      isPro: true,
      time: 'Just now',
      content: content,
      likes: 0,
      isLiked: false,
      replies: []
    };

    forexComments.unshift(newComment);
    saveForexComments(forexComments);

    textarea.value = '';
    const charCounter = document.getElementById('forexCharCounter');
    if (charCounter) charCounter.textContent = '0/2000';

    renderForexComments();
  }

  function toggleLikeForexComment(commentId) {
    forexComments = forexComments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1
        };
      }
      return c;
    });
    saveForexComments(forexComments);
    renderForexComments();
  }

  function renderForexComments() {
    const feed = document.getElementById('forexCommentsFeed');
    if (!feed) return;

    let list = [...forexComments];
    if (forexCommentSort === 'liked') {
      list.sort((a, b) => b.likes - a.likes);
    }

    if (list.length === 0) {
      feed.innerHTML = `
        <div style="text-align:center; padding:30px; color:var(--text-muted);">
          No comments yet. Be the first to share a Forex trade note!
        </div>
      `;
      return;
    }

    feed.innerHTML = list.map(c => {
      const proBadge = c.isPro ? '<span class="user-badge-pro">PRO</span>' : '';
      const likeBtnClass = c.isLiked ? 'action-btn-liked' : '';

      const repliesHtml = c.replies && c.replies.length > 0 ? `
        <div class="comment-replies">
          ${c.replies.map(r => `
            <div class="comment-item comment-reply">
              <div class="comment-avatar">
                <div class="avatar-initials">${r.avatar}</div>
              </div>
              <div class="comment-content">
                <div class="comment-author">
                  <span class="author-name">${r.username}</span>
                  <span class="comment-time">${r.time}</span>
                </div>
                <div class="comment-text">${r.content}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div class="comment-item" id="comment-${c.id}">
          <div class="comment-avatar">
            <div class="avatar-initials">${c.avatar}</div>
          </div>
          <div class="comment-content">
            <div class="comment-header-row">
              <div class="comment-author">
                <span class="author-name">${c.username}</span>
                ${proBadge}
                <span class="comment-time">${c.time}</span>
              </div>
            </div>
            <div class="comment-text">${c.content}</div>
            <div class="comment-actions">
              <button class="comment-action-btn ${likeBtnClass}" onclick="window.likeForexComment('${c.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${c.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <span>${c.likes}</span>
              </button>
            </div>
            ${repliesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  window.likeForexComment = toggleLikeForexComment;

  /* ============================================================
     INIT & EXPORT
     ============================================================ */

  function initForexMarket() {
    const forexWrapper = document.getElementById('forexMarketWrapper');
    if (!forexWrapper) return;

    console.log('Initializing Forex Market sections...');
    initForexEconomicCalendar();
    initForexTradingSessions();
    renderForexMajors();
    initForexCorrelation();
    initForexComments();
  }

  window.initForexMarket = initForexMarket;

  // Listen to custom market change event
  window.addEventListener('marketViewChanged', (e) => {
    if (e.detail && e.detail.market === 'forex') {
      initForexMarket();
    }
  });

})();
