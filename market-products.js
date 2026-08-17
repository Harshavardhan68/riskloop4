/**
 * RiskLoop Market Products Module
 * Handles Bonds Screener, Stock Events/Dividends, and Undervalued Stocks pages.
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // 1. BONDS SCREENER DATASET & LOGIC
  // ═══════════════════════════════════════════════════════════════
  const BONDS_DATA = [
    {
      id: 'bond-satin',
      name: "Satin Finserv Aug '28",
      ytm: '12.10%',
      ytmNum: 12.10,
      tenureMonths: 23,
      tenureLabel: '23 months',
      minInvestment: 9800.79,
      minInvLabel: '₹9,800.79',
      payout: 'Quarterly',
      rating: 'A-',
      ratingTier: 'A',
      logoText: 'SFL',
      logoBg: '#fef3e6',
      logoColor: '#c26401'
    },
    {
      id: 'bond-navi',
      name: "Navi Finserv Mar '28",
      ytm: '11.00%',
      ytmNum: 11.00,
      tenureMonths: 19,
      tenureLabel: '19 months',
      minInvestment: 9980.58,
      minInvLabel: '₹9,980.58',
      payout: 'Monthly',
      rating: 'A',
      ratingTier: 'A',
      logoText: 'Navi',
      logoBg: '#e8f0fe',
      logoColor: '#1a73e8'
    },
    {
      id: 'bond-indel',
      name: "Indel Money Limited Mar '28",
      ytm: '11.40%',
      ytmNum: 11.40,
      tenureMonths: 19,
      tenureLabel: '19 months',
      minInvestment: 9832.77,
      minInvLabel: '₹9,832.77',
      payout: 'Monthly',
      rating: 'A-',
      ratingTier: 'A',
      logoText: 'Indel',
      logoBg: '#fce8e6',
      logoColor: '#c5221f'
    },
    {
      id: 'bond-iifl',
      name: "IIFL Samasta Finance Dec '28",
      ytm: '10.50%',
      ytmNum: 10.50,
      tenureMonths: 28,
      tenureLabel: '28 months',
      minInvestment: 9810.63,
      minInvLabel: '₹9,810.63',
      payout: 'Monthly',
      rating: 'AA-',
      ratingTier: 'AA',
      logoText: 'IIFL',
      logoBg: '#feefe3',
      logoColor: '#e37400'
    },
    {
      id: 'bond-namra',
      name: "Namra Finance Limited Apr '28",
      ytm: '11.30%',
      ytmNum: 11.30,
      tenureMonths: 20,
      tenureLabel: '20 months',
      minInvestment: 10080.90,
      minInvLabel: '₹10,080.90',
      payout: 'Quarterly',
      rating: 'A-',
      ratingTier: 'A',
      logoText: 'Namra',
      logoBg: '#e6f4ea',
      logoColor: '#137333'
    },
    {
      id: 'bond-profectus',
      name: "Profectus Capital Private Limited Feb '28",
      ytm: '10.65%',
      ytmNum: 10.65,
      tenureMonths: 18,
      tenureLabel: '18 months',
      minInvestment: 9832.95,
      minInvLabel: '₹9,832.95',
      payout: 'Monthly',
      rating: 'A+',
      ratingTier: 'A',
      logoText: 'PC',
      logoBg: '#fef7e0',
      logoColor: '#f29900'
    },
    {
      id: 'bond-arman',
      name: "Arman Financial Services Sep '28",
      ytm: '11.10%',
      ytmNum: 11.10,
      tenureMonths: 25,
      tenureLabel: '25 months',
      minInvestment: 10198.48,
      minInvLabel: '₹10,198.48',
      payout: 'Quarterly',
      rating: 'A-',
      ratingTier: 'A',
      logoText: 'Arman',
      logoBg: '#fce8e6',
      logoColor: '#d93025'
    },
    {
      id: 'bond-muthoot',
      name: "Muthoot Mcred Ltd. Aug '29",
      ytm: '10.50%',
      ytmNum: 10.50,
      tenureMonths: 35,
      tenureLabel: '35 months',
      minInvestment: 9839.85,
      minInvLabel: '₹9,839.85',
      payout: 'Monthly',
      rating: 'A',
      ratingTier: 'A',
      logoText: 'Muthoot',
      logoBg: '#fff8e1',
      logoColor: '#f57f17'
    }
  ];

  let _activeBondsFilters = new Set();

  function renderBondsTable() {
    const tbody = document.getElementById('bondsTableBody');
    if (!tbody) return;

    let list = [...BONDS_DATA];

    if (_activeBondsFilters.has('high-rated')) {
      list = list.filter(b => b.rating.includes('AA') || b.rating === 'A+');
    }
    if (_activeBondsFilters.has('under-10k')) {
      list = list.filter(b => b.minInvestment <= 10000);
    }
    if (_activeBondsFilters.has('tenure-1yr')) {
      list = list.filter(b => b.tenureMonths <= 12);
    }
    if (_activeBondsFilters.has('monthly')) {
      list = list.filter(b => b.payout === 'Monthly');
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="ipo-empty-row">
            No bonds matching current filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(b => {
      return `
        <tr class="ipo-table-row">
          <td class="bonds-td-company">
            <div class="ipo-company-cell">
              <div class="ipo-logo-badge" style="background:${b.logoBg};color:${b.logoColor};font-size:11px;font-weight:700;">
                ${b.logoText}
              </div>
              <span class="ipo-company-name">${b.name}</span>
            </div>
          </td>
          <td class="bonds-td-ytm">
            <span class="bonds-ytm-text">${b.ytm}</span>
          </td>
          <td class="bonds-td-tenure">
            <span class="bonds-tenure-text">${b.tenureLabel}</span>
          </td>
          <td class="bonds-td-min">
            <span class="bonds-min-text">${b.minInvLabel}</span>
          </td>
          <td class="bonds-td-payout">
            <span class="bonds-payout-text">${b.payout}</span>
          </td>
          <td class="bonds-td-rating">
            <div class="bonds-rating-cell">
              <span class="bonds-rating-dot"></span>
              <span class="bonds-rating-text">${b.rating}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function initBondsPage() {
    const filterPills = document.querySelectorAll('.bonds-pills-row .bonds-pill-btn');
    const clearBtn = document.getElementById('bondsClearFilters');

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const filter = pill.getAttribute('data-filter');
        if (_activeBondsFilters.has(filter)) {
          _activeBondsFilters.delete(filter);
          pill.classList.remove('bonds-pill-active');
        } else {
          _activeBondsFilters.add(filter);
          pill.classList.add('bonds-pill-active');
        }
        renderBondsTable();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        _activeBondsFilters.clear();
        filterPills.forEach(p => p.classList.remove('bonds-pill-active'));
        renderBondsTable();
      });
    }

    renderBondsTable();
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. STOCK EVENTS / DIVIDEND DATASET & LOGIC
  // ═══════════════════════════════════════════════════════════════
  const STOCK_EVENTS_DATA = [
    {
      company: 'Panama Petrochem',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹3.00 per share',
      logoText: 'PP',
      logoBg: '#fef3e6',
      logoColor: '#e65100'
    },
    {
      company: 'Hisar Metal Inds.',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹1.00 per share',
      logoText: 'HM',
      logoBg: '#eceff1',
      logoColor: '#37474f'
    },
    {
      company: 'Bandhan Bank',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹1.50 per share',
      logoText: 'BB',
      logoBg: '#e3f2fd',
      logoColor: '#0d47a1'
    },
    {
      company: 'Fabtech Technologies',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹0.60 per share',
      logoText: 'FT',
      logoBg: '#e0f2f1',
      logoColor: '#004d40'
    },
    {
      company: 'HUDCO',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹1.50 per share',
      logoText: 'HUDCO',
      logoBg: '#fbe9e7',
      logoColor: '#bf360c'
    },
    {
      company: 'Plastiblends India',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹3.00 per share',
      logoText: 'PBI',
      logoBg: '#f3e5f5',
      logoColor: '#6a1b9a'
    },
    {
      company: 'Silver Touch',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹0.10 per share',
      logoText: 'ST',
      logoBg: '#fff8e1',
      logoColor: '#f57f17'
    },
    {
      company: 'Yamuna Syndicate',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹500.00 per share',
      logoText: 'YS',
      logoBg: '#e8eaf6',
      logoColor: '#1a237e'
    },
    {
      company: 'Indo Count Inds',
      type: 'dividend',
      eventBadge: 'Dividend-Ex date',
      details: '₹1.50 per share',
      logoText: 'ICI',
      logoBg: '#efebe9',
      logoColor: '#4e342e'
    }
  ];

  function renderStockEventsTable() {
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) return;

    tbody.innerHTML = STOCK_EVENTS_DATA.map(item => {
      return `
        <tr class="ipo-table-row">
          <td class="events-td-company">
            <div class="ipo-company-cell">
              <div class="ipo-logo-badge" style="background:${item.logoBg};color:${item.logoColor};font-size:11px;font-weight:700;">
                ${item.logoText}
              </div>
              <span class="ipo-company-name">${item.company}</span>
            </div>
          </td>
          <td class="events-td-event">
            <span class="events-badge-pill">${item.eventBadge}</span>
          </td>
          <td class="events-td-details">
            <span class="events-details-text">${item.details}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  function initStockEventsPage() {
    renderStockEventsTable();

    // Checkbox listeners to re-filter
    const checkboxes = document.querySelectorAll('.events-sidebar-card input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', renderStockEventsTable);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. UNDERVALUED & MOMENTUM STOCKS DATASET & LOGIC
  // ═══════════════════════════════════════════════════════════════
  const UNDERVALUED_STOCKS_DATA = [
    {
      company: 'Manorama Industries',
      price: '₹1,920.60',
      change: '+183.50 (10.56%)',
      isPos: true,
      volume: '52,87,512',
      volDiff: '+236.85%',
      isVolPos: true,
      rangePct: 82,
      logoText: 'MI',
      logoBg: '#fef7e0',
      logoColor: '#b06000',
      sparkline: 'M0,18 L10,15 L20,16 L30,12 L40,8 L50,6 L60,2'
    },
    {
      company: 'Physicswallah',
      price: '₹124.34',
      change: '+7.22 (6.16%)',
      isPos: true,
      volume: '7,92,18,954',
      volDiff: '+1,586.93%',
      isVolPos: true,
      rangePct: 65,
      logoText: 'PW',
      logoBg: '#212121',
      logoColor: '#ffffff',
      sparkline: 'M0,14 L8,6 L18,12 L28,8 L38,10 L48,10 L60,8'
    },
    {
      company: 'Puravankara',
      price: '₹230.18',
      change: '+11.97 (5.49%)',
      isPos: true,
      volume: '1,87,15,015',
      volDiff: '+11,315.69%',
      isVolPos: true,
      rangePct: 62,
      logoText: 'PK',
      logoBg: '#1a237e',
      logoColor: '#ffffff',
      sparkline: 'M0,8 L10,12 L20,16 L30,15 L40,18 L50,16 L60,18'
    },
    {
      company: 'Expleo Solutions',
      price: '₹932.05',
      change: '+116.10 (14.23%)',
      isPos: true,
      volume: '38,09,298',
      volDiff: '+15,984.52%',
      isVolPos: true,
      rangePct: 78,
      logoText: '{}',
      logoBg: '#ede7f6',
      logoColor: '#5e35b1',
      sparkline: 'M0,18 L12,10 L24,6 L36,10 L48,4 L60,4'
    },
    {
      company: 'Marksans Pharma',
      price: '₹327.35',
      change: '-5.65 (1.70%)',
      isPos: false,
      volume: '1,07,35,254',
      volDiff: '-33.63%',
      isVolPos: false,
      rangePct: 88,
      logoText: 'M',
      logoBg: '#ffebee',
      logoColor: '#c62828',
      sparkline: 'M0,4 L12,12 L24,15 L36,14 L48,18 L60,16'
    },
    {
      company: 'Vikram Solar',
      price: '₹180.80',
      change: '+20.65 (12.89%)',
      isPos: true,
      volume: '3,45,57,948',
      volDiff: '+1,207.63%',
      isVolPos: true,
      rangePct: 92,
      logoText: 'VS',
      logoBg: '#fff3e0',
      logoColor: '#e65100',
      sparkline: 'M0,18 L12,14 L24,10 L36,12 L48,6 L60,2'
    },
    {
      company: 'BSE Limited',
      price: '₹3,351.20',
      change: '-95.80 (2.78%)',
      isPos: false,
      volume: '60,94,418',
      volDiff: '+37.68%',
      isVolPos: true,
      rangePct: 85,
      logoText: 'BSE',
      logoBg: '#e8f0fe',
      logoColor: '#1a73e8',
      sparkline: 'M0,6 L12,14 L24,18 L36,16 L48,19 L60,18'
    }
  ];

  function renderUndervaluedTable() {
    const tbody = document.getElementById('undervaluedTableBody');
    if (!tbody) return;

    tbody.innerHTML = UNDERVALUED_STOCKS_DATA.map(item => {
      const pColor = item.isPos ? '#48b79a' : '#ea4335';
      const vColor = item.isVolPos ? '#48b79a' : '#ea4335';

      return `
        <tr class="ipo-table-row">
          <td class="uv-td-company">
            <div class="ipo-company-cell">
              <div class="ipo-logo-badge" style="background:${item.logoBg};color:${item.logoColor};font-size:11px;font-weight:700;">
                ${item.logoText}
              </div>
              <span class="ipo-company-name">${item.company}</span>
              <svg width="60" height="22" viewBox="0 0 60 22" fill="none" style="margin-left:8px;flex-shrink:0;">
                <path d="${item.sparkline}" stroke="${pColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </td>
          <td class="uv-td-price">
            <strong style="font-family:'IBM Plex Mono',monospace;font-size:13.5px;color:var(--text);">${item.price}</strong>
          </td>
          <td class="uv-td-change">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;color:${pColor};">${item.change}</span>
          </td>
          <td class="uv-td-volume">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--text-muted);">${item.volume}</span>
          </td>
          <td class="uv-td-vol-diff">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;color:${vColor};">${item.volDiff}</span>
          </td>
          <td class="uv-td-52w">
            <div class="uv-52w-slider">
              <span class="uv-52w-label">L</span>
              <div class="uv-52w-track">
                <span class="uv-52w-pip" style="left:${item.rangePct}%;"></span>
              </div>
              <span class="uv-52w-label">H</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function initUndervaluedPage() {
    renderUndervaluedTable();
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORTS & GLOBAL INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  window.initBondsPage = initBondsPage;
  window.initStockEventsPage = initStockEventsPage;
  window.initUndervaluedPage = initUndervaluedPage;

  document.addEventListener('DOMContentLoaded', () => {
    initBondsPage();
    initStockEventsPage();
    initUndervaluedPage();
  });
})();
