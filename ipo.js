/**
 * RiskLoop IPO Dashboard Module
 * Implements Open, Closed, and Upcoming IPOs with Mainboard/SME filters and Application flow.
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // IPO DATASETS
  // ═══════════════════════════════════════════════════════════════
  const OPEN_IPOS = [
    {
      id: 'ipo-lalithaa',
      name: 'Lalithaa Jewellery Mart',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '19 Aug',
      datesRange: '17 Aug – 19 Aug 2026',
      subscription: '0.26x',
      action: 'Apply',
      priceBand: '₹215 – ₹226',
      cutOffPrice: 226,
      lotSize: 66,
      minInvestment: 14916,
      isLastDay: false,
      logoText: 'Lalithaa',
      logoBg: '#e8f0fe',
      logoColor: '#1a73e8',
      logoIcon: '💎'
    },
    {
      id: 'ipo-horizon',
      name: 'Horizon Industrial',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '19 Aug',
      datesRange: '17 Aug – 19 Aug 2026',
      subscription: '0.03x',
      action: 'Apply',
      priceBand: '₹120 – ₹128',
      cutOffPrice: 128,
      lotSize: 115,
      minInvestment: 14720,
      isLastDay: false,
      logoText: 'Horizon',
      logoBg: '#e6f4ea',
      logoColor: '#137333',
      logoIcon: '🏭'
    },
    {
      id: 'ipo-sunshine',
      name: 'Sunshine Picture',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '20 Aug',
      datesRange: '18 Aug – 20 Aug 2026',
      subscription: '--',
      action: 'Pre-apply',
      priceBand: '₹310 – ₹325',
      cutOffPrice: 325,
      lotSize: 46,
      minInvestment: 14950,
      isLastDay: false,
      logoText: 'Sunshine',
      logoBg: '#fef7e0',
      logoColor: '#b06000',
      logoIcon: '🎬'
    },
    {
      id: 'ipo-shankesh',
      name: 'Shankesh Jewellers',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '20 Aug',
      datesRange: '18 Aug – 20 Aug 2026',
      subscription: '--',
      action: 'Pre-apply',
      priceBand: '₹85 – ₹90',
      cutOffPrice: 90,
      lotSize: 160,
      minInvestment: 14400,
      isLastDay: false,
      logoText: 'Shankesh',
      logoBg: '#fce8e6',
      logoColor: '#c5221f',
      logoIcon: '✨'
    },
    {
      id: 'ipo-gaja',
      name: 'Gaja Alternate Asset Managem...',
      fullName: 'Gaja Alternate Asset Management Limited',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '21 Aug',
      datesRange: '19 Aug – 21 Aug 2026',
      subscription: '--',
      action: 'Pre-apply',
      priceBand: '₹180 – ₹190',
      cutOffPrice: 190,
      lotSize: 78,
      minInvestment: 14820,
      isLastDay: false,
      logoText: 'GAJA',
      logoBg: '#f3e8fd',
      logoColor: '#8430ce',
      logoIcon: '📊'
    },
    {
      id: 'ipo-credent',
      name: 'Credent Connect N Care',
      type: 'sme',
      categoryLabel: 'SME',
      closingDate: '17 Aug',
      datesRange: '13 Aug – 17 Aug 2026',
      subscription: '50.03x',
      action: 'Apply',
      priceBand: '₹110 – ₹115',
      cutOffPrice: 115,
      lotSize: 1200,
      minInvestment: 138000,
      isLastDay: true,
      logoText: 'C3',
      logoBg: '#e8f0fe',
      logoColor: '#1967d2',
      logoIcon: '🏥'
    },
    {
      id: 'ipo-ens',
      name: 'ENS Enterprises',
      type: 'sme',
      categoryLabel: 'SME',
      closingDate: '18 Aug',
      datesRange: '14 Aug – 18 Aug 2026',
      subscription: '0.87x',
      action: 'Apply',
      priceBand: '₹72 – ₹76',
      cutOffPrice: 76,
      lotSize: 1600,
      minInvestment: 121600,
      isLastDay: false,
      logoText: 'ENS',
      logoBg: '#feefe3',
      logoColor: '#c26401',
      logoIcon: '⚙️'
    },
    {
      id: 'ipo-technocrats',
      name: 'Technocrats Plasma',
      type: 'sme',
      categoryLabel: 'SME',
      closingDate: '18 Aug',
      datesRange: '14 Aug – 18 Aug 2026',
      subscription: '2.37x',
      action: 'Apply',
      priceBand: '₹140 – ₹145',
      cutOffPrice: 145,
      lotSize: 1000,
      minInvestment: 145000,
      isLastDay: false,
      logoText: 'TC',
      logoBg: '#e1f5fe',
      logoColor: '#0277bd',
      logoIcon: '⚡'
    }
  ];

  const CLOSED_IPOS = [
    {
      id: 'ipo-brainbees',
      name: 'Brainbees Solutions (FirstCry)',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '08 Aug',
      subscription: '12.22x',
      action: 'Details',
      priceBand: '₹440 – ₹465',
      cutOffPrice: 465,
      lotSize: 32,
      minInvestment: 14880,
      listingGain: '+40.0%',
      logoIcon: '👶'
    },
    {
      id: 'ipo-ola',
      name: 'Ola Electric Mobility',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '06 Aug',
      subscription: '4.45x',
      action: 'Details',
      priceBand: '₹72 – ₹76',
      cutOffPrice: 76,
      lotSize: 195,
      minInvestment: 14820,
      listingGain: '+19.9%',
      logoIcon: '🛵'
    },
    {
      id: 'ipo-akums',
      name: 'Akums Drugs & Pharmaceuticals',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '01 Aug',
      subscription: '63.56x',
      action: 'Details',
      priceBand: '₹646 – ₹679',
      cutOffPrice: 679,
      lotSize: 22,
      minInvestment: 14938,
      listingGain: '+6.8%',
      logoIcon: '💊'
    },
    {
      id: 'ipo-ceigall',
      name: 'Ceigall India',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: '05 Aug',
      subscription: '13.84x',
      action: 'Details',
      priceBand: '₹380 – ₹401',
      cutOffPrice: 401,
      lotSize: 37,
      minInvestment: 14837,
      listingGain: '+4.5%',
      logoIcon: '🏗️'
    }
  ];

  const UPCOMING_IPOS = [
    {
      id: 'ipo-herofincorp',
      name: 'Hero Fincorp Limited',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: 'Sep 2026',
      subscription: 'Upcoming',
      action: 'Notify',
      priceBand: '₹900 – ₹950 (Exp)',
      cutOffPrice: 950,
      lotSize: 16,
      minInvestment: 15200,
      logoIcon: '🏍️'
    },
    {
      id: 'ipo-swiggy',
      name: 'Swiggy Limited',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: 'Sep 2026',
      subscription: 'Upcoming',
      action: 'Notify',
      priceBand: '₹370 – ₹390 (Exp)',
      cutOffPrice: 390,
      lotSize: 38,
      minInvestment: 14820,
      logoIcon: '🍔'
    },
    {
      id: 'ipo-ntpc',
      name: 'NTPC Green Energy',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: 'Oct 2026',
      subscription: 'Upcoming',
      action: 'Notify',
      priceBand: '₹105 – ₹112 (Exp)',
      cutOffPrice: 112,
      lotSize: 130,
      minInvestment: 14560,
      logoIcon: '🌱'
    },
    {
      id: 'ipo-hyundai',
      name: 'Hyundai Motor India',
      type: 'mainboard',
      categoryLabel: '',
      closingDate: 'Oct 2026',
      subscription: 'Upcoming',
      action: 'Notify',
      priceBand: '₹1,865 – ₹1,960 (Exp)',
      cutOffPrice: 1960,
      lotSize: 7,
      minInvestment: 13720,
      logoIcon: '🚗'
    }
  ];

  // State
  let _activeStatus = 'open'; // 'open' | 'closed' | 'upcoming'
  let _activeType = 'all';     // 'all' | 'mainboard' | 'sme'
  let _selectedIpo = null;

  // ═══════════════════════════════════════════════════════════════
  // RENDER TABLE
  // ═══════════════════════════════════════════════════════════════
  function renderIpoTable() {
    const tbody = document.getElementById('ipoTableBody');
    if (!tbody) return;

    let dataset = [];
    if (_activeStatus === 'open') dataset = OPEN_IPOS;
    else if (_activeStatus === 'closed') dataset = CLOSED_IPOS;
    else if (_activeStatus === 'upcoming') dataset = UPCOMING_IPOS;

    // Filter by type
    if (_activeType !== 'all') {
      dataset = dataset.filter(item => item.type === _activeType);
    }

    if (dataset.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="ipo-empty-row">
            No ${_activeType !== 'all' ? _activeType.toUpperCase() : ''} IPOs currently in ${_activeStatus} status.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = dataset.map(item => {
      const isSme = item.type === 'sme';
      const isPreApply = item.action === 'Pre-apply';
      const actionClass = isPreApply ? 'ipo-btn-preapply' : 'ipo-btn-apply';
      const actionText = item.action;

      const companyDisplay = `
        <div class="ipo-company-cell">
          <div class="ipo-logo-badge" style="background:${item.logoBg || '#f0f4f9'};color:${item.logoColor || '#1a73e8'};">
            ${item.logoIcon || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>'}
          </div>
          <div class="ipo-company-meta">
            ${isSme ? `<span class="ipo-sme-tag">SME</span>` : ''}
            <span class="ipo-company-name" title="${item.fullName || item.name}">${item.name}</span>
          </div>
        </div>
      `;

      const dateDisplay = `
        <div class="ipo-date-cell">
          <span class="ipo-date-text">${item.closingDate}</span>
          ${item.isLastDay ? `<span class="ipo-last-day-pill">Last day</span>` : ''}
        </div>
      `;

      const subsDisplay = `
        <div class="ipo-subs-cell">
          <span class="ipo-subs-text">${item.subscription}</span>
          ${item.listingGain ? `<span class="ipo-gain-pill">${item.listingGain} Gain</span>` : ''}
        </div>
      `;

      const actionDisplay = `
        <button class="ipo-action-btn ${actionClass}" data-id="${item.id}" type="button">
          ${actionText}
        </button>
      `;

      return `
        <tr class="ipo-table-row">
          <td class="ipo-td-company">${companyDisplay}</td>
          <td class="ipo-td-date">${dateDisplay}</td>
          <td class="ipo-td-subs">${subsDisplay}</td>
          <td class="ipo-td-action">${actionDisplay}</td>
        </tr>
      `;
    }).join('');

    // Attach row button listeners
    tbody.querySelectorAll('.ipo-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openIpoModal(id);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // IPO APPLY MODAL
  // ═══════════════════════════════════════════════════════════════
  function openIpoModal(id) {
    const all = [...OPEN_IPOS, ...CLOSED_IPOS, ...UPCOMING_IPOS];
    const ipo = all.find(x => x.id === id);
    if (!ipo) return;

    _selectedIpo = ipo;
    const modal = document.getElementById('ipoApplyModal');
    if (!modal) return;

    // Populate modal fields
    const nameEl = document.getElementById('ipoModalCompanyName');
    const subEl = document.getElementById('ipoModalSub');
    const pbEl = document.getElementById('ipoModalPriceBand');
    const lotEl = document.getElementById('ipoModalLotSize');
    const minInvEl = document.getElementById('ipoModalMinInv');
    const datesEl = document.getElementById('ipoModalDates');
    const logoBadge = document.getElementById('ipoModalLogoBadge');
    const totalAmount = document.getElementById('ipoTotalAmount');
    const bidPriceInp = document.getElementById('ipoBidPrice');
    const bidLotsInp = document.getElementById('ipoBidLots');
    const submitBtnText = document.getElementById('ipoSubmitBtnText');
    const toast = document.getElementById('ipoSuccessToast');

    if (nameEl) nameEl.textContent = ipo.name;
    if (subEl) subEl.textContent = `${ipo.type === 'sme' ? 'SME IPO' : 'Mainboard IPO'} · Book Built Issue`;
    if (pbEl) pbEl.textContent = ipo.priceBand;
    if (lotEl) lotEl.textContent = `${ipo.lotSize} Shares`;
    if (minInvEl) minInvEl.textContent = `₹${(ipo.minInvestment || 14000).toLocaleString('en-IN')}`;
    if (datesEl) datesEl.textContent = ipo.datesRange || `${ipo.closingDate} 2026`;
    if (logoBadge) logoBadge.innerHTML = ipo.logoIcon || '💎';
    if (toast) toast.hidden = true;

    if (bidPriceInp) bidPriceInp.value = ipo.cutOffPrice || 100;
    if (bidLotsInp) bidLotsInp.value = 1;

    updateModalTotal();

    if (submitBtnText) {
      submitBtnText.textContent = ipo.action === 'Pre-apply' ? 'Submit Pre-Application' : 'Submit IPO Application';
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function updateModalTotal() {
    if (!_selectedIpo) return;
    const bidLots = parseInt(document.getElementById('ipoBidLots')?.value) || 1;
    const bidPrice = parseFloat(document.getElementById('ipoBidPrice')?.value) || (_selectedIpo.cutOffPrice || 100);
    const total = bidLots * _selectedIpo.lotSize * bidPrice;
    const totalEl = document.getElementById('ipoTotalAmount');
    if (totalEl) {
      totalEl.textContent = `₹${Math.round(total).toLocaleString('en-IN')}`;
    }
  }

  function closeIpoModal() {
    const modal = document.getElementById('ipoApplyModal');
    if (modal) {
      modal.hidden = true;
      document.body.style.overflow = '';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  function initIpoDashboard() {
    // Status Pills (Open, Closed, Upcoming)
    const pills = document.querySelectorAll('.ipo-pill-btn');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('ipo-pill-active'));
        pill.classList.add('ipo-pill-active');
        _activeStatus = pill.getAttribute('data-status') || 'open';
        renderIpoTable();
      });
    });

    // IPO Type Dropdown (All, Mainboard, SME)
    const typeBtn = document.getElementById('ipoTypeBtn');
    const typeMenu = document.getElementById('ipoTypeMenu');
    const typeLabel = document.getElementById('ipoTypeSelectedLabel');
    const typeOpts = document.querySelectorAll('.ipo-type-opt');

    if (typeBtn && typeMenu) {
      typeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = typeMenu.hidden;
        typeMenu.hidden = !isHidden;
      });

      typeOpts.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          typeOpts.forEach(o => o.classList.remove('ipo-opt-active'));
          opt.classList.add('ipo-opt-active');
          const type = opt.getAttribute('data-type') || 'all';
          _activeType = type;
          if (typeLabel) typeLabel.textContent = opt.textContent;
          typeMenu.hidden = true;
          renderIpoTable();
        });
      });

      document.addEventListener('click', (e) => {
        if (!typeMenu.hidden && !typeBtn.contains(e.target) && !typeMenu.contains(e.target)) {
          typeMenu.hidden = true;
        }
      });
    }

    // Modal close handlers
    const closeBtn = document.getElementById('ipoApplyModalClose');
    const modal = document.getElementById('ipoApplyModal');
    if (closeBtn) closeBtn.addEventListener('click', closeIpoModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeIpoModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) closeIpoModal();
    });

    // Price / Lot inputs
    const lotsInp = document.getElementById('ipoBidLots');
    const priceInp = document.getElementById('ipoBidPrice');
    const cutoffCheck = document.getElementById('ipoCutoffCheck');

    if (lotsInp) lotsInp.addEventListener('input', updateModalTotal);
    if (priceInp) priceInp.addEventListener('input', updateModalTotal);
    if (cutoffCheck) {
      cutoffCheck.addEventListener('change', () => {
        if (cutoffCheck.checked && _selectedIpo && priceInp) {
          priceInp.value = _selectedIpo.cutOffPrice;
          updateModalTotal();
        }
      });
    }

    // Submit handler
    const submitBtn = document.getElementById('ipoSubmitBtn');
    const toast = document.getElementById('ipoSuccessToast');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const upi = document.getElementById('ipoUpiInput')?.value.trim();
        if (!upi) {
          alert('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
          return;
        }
        if (toast) toast.hidden = false;
        setTimeout(() => {
          closeIpoModal();
        }, 2200);
      });
    }

    renderIpoTable();
  }

  window.initIpoDashboard = initIpoDashboard;

  // Auto-initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIpoDashboard);
  } else {
    initIpoDashboard();
  }
})();
