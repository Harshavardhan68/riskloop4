/* ============================================================
   DATA LAYER
   Isolated from UI + business logic so lot sizes can be
   refreshed (e.g. from an NSE/BSE circular feed) without ever
   touching calculation code below.
   Index lot sizes verified against circulars as of Jul 2026.
   Stock-level entries are representative sample values — always
   confirm against the live NSE/BSE contract file before trading.
   ============================================================ */
const INSTRUMENT_DB = [
  { symbol: "NIFTY", name: "Nifty 50", exchange: "NSE", type: "Index", lotSize: 65, updated: "2026-01-27" },
  { symbol: "BANKNIFTY", name: "Nifty Bank", exchange: "NSE", type: "Index", lotSize: 30, updated: "2026-01-27" },
  { symbol: "FINNIFTY", name: "Nifty Financial Services", exchange: "NSE", type: "Index", lotSize: 60, updated: "2026-01-27" },
  { symbol: "MIDCPNIFTY", name: "Nifty Midcap Select", exchange: "NSE", type: "Index", lotSize: 120, updated: "2025-10-28" },
  { symbol: "NIFTYNXT50", name: "Nifty Next 50", exchange: "NSE", type: "Index", lotSize: 25, updated: "2025-04-01" },
  { symbol: "SENSEX", name: "S&P BSE Sensex", exchange: "BSE", type: "Index", lotSize: 20, updated: "2025-06-01" },
  { symbol: "BANKEX", name: "S&P BSE Bankex", exchange: "BSE", type: "Index", lotSize: 15, updated: "2025-06-01" },
  { symbol: "RELIANCE", name: "Reliance Industries", exchange: "NSE", type: "Stock", lotSize: 500, updated: "2025-04-01" },
  { symbol: "TCS", name: "Tata Consultancy Services", exchange: "NSE", type: "Stock", lotSize: 175, updated: "2025-04-01" },
  { symbol: "HDFCBANK", name: "HDFC Bank", exchange: "NSE", type: "Stock", lotSize: 550, updated: "2025-04-01" },
  { symbol: "ICICIBANK", name: "ICICI Bank", exchange: "NSE", type: "Stock", lotSize: 700, updated: "2025-04-01" },
  { symbol: "INFY", name: "Infosys", exchange: "NSE", type: "Stock", lotSize: 400, updated: "2025-04-01" },
  { symbol: "SBIN", name: "State Bank of India", exchange: "NSE", type: "Stock", lotSize: 1500, updated: "2025-04-01" },
  { symbol: "AXISBANK", name: "Axis Bank", exchange: "NSE", type: "Stock", lotSize: 625, updated: "2025-04-01" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", exchange: "NSE", type: "Stock", lotSize: 400, updated: "2025-04-01" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", exchange: "NSE", type: "Stock", lotSize: 950, updated: "2025-04-01" },
  { symbol: "ITC", name: "ITC Limited", exchange: "NSE", type: "Stock", lotSize: 1600, updated: "2025-04-01" },
  { symbol: "LT", name: "Larsen & Toubro", exchange: "NSE", type: "Stock", lotSize: 150, updated: "2025-04-01" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", exchange: "NSE", type: "Stock", lotSize: 300, updated: "2025-04-01" },
  { symbol: "MARUTI", name: "Maruti Suzuki India", exchange: "NSE", type: "Stock", lotSize: 50, updated: "2025-04-01" },
  { symbol: "TATAMOTORS", name: "Tata Motors", exchange: "NSE", type: "Stock", lotSize: 1425, updated: "2025-04-01" },
  { symbol: "TATASTEEL", name: "Tata Steel", exchange: "NSE", type: "Stock", lotSize: 5500, updated: "2025-04-01" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", exchange: "NSE", type: "Stock", lotSize: 350, updated: "2025-04-01" },
  { symbol: "WIPRO", name: "Wipro", exchange: "NSE", type: "Stock", lotSize: 1500, updated: "2025-04-01" },
  { symbol: "ADANIENT", name: "Adani Enterprises", exchange: "NSE", type: "Stock", lotSize: 300, updated: "2025-04-01" },
  { symbol: "ADANIPORTS", name: "Adani Ports & SEZ", exchange: "NSE", type: "Stock", lotSize: 800, updated: "2025-04-01" },
  { symbol: "ASIANPAINT", name: "Asian Paints", exchange: "NSE", type: "Stock", lotSize: 200, updated: "2025-04-01" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", exchange: "NSE", type: "Stock", lotSize: 125, updated: "2025-04-01" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv", exchange: "NSE", type: "Stock", lotSize: 500, updated: "2025-04-01" },
  { symbol: "HCLTECH", name: "HCL Technologies", exchange: "NSE", type: "Stock", lotSize: 700, updated: "2025-04-01" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement", exchange: "NSE", type: "Stock", lotSize: 50, updated: "2025-04-01" },
  { symbol: "TITAN", name: "Titan Company", exchange: "NSE", type: "Stock", lotSize: 200, updated: "2025-04-01" },
  { symbol: "NTPC", name: "NTPC Limited", exchange: "NSE", type: "Stock", lotSize: 2700, updated: "2025-04-01" },
  { symbol: "POWERGRID", name: "Power Grid Corp", exchange: "NSE", type: "Stock", lotSize: 2700, updated: "2025-04-01" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", exchange: "NSE", type: "Stock", lotSize: 3850, updated: "2025-04-01" },
  { symbol: "COALINDIA", name: "Coal India", exchange: "NSE", type: "Stock", lotSize: 2100, updated: "2025-04-01" },
  { symbol: "JSWSTEEL", name: "JSW Steel", exchange: "NSE", type: "Stock", lotSize: 1000, updated: "2025-04-01" },
  { symbol: "HINDALCO", name: "Hindalco Industries", exchange: "NSE", type: "Stock", lotSize: 1400, updated: "2025-04-01" },
  { symbol: "GRASIM", name: "Grasim Industries", exchange: "NSE", type: "Stock", lotSize: 275, updated: "2025-04-01" },
  { symbol: "DRREDDY", name: "Dr Reddy's Laboratories", exchange: "NSE", type: "Stock", lotSize: 625, updated: "2025-04-01" },
  { symbol: "CIPLA", name: "Cipla", exchange: "NSE", type: "Stock", lotSize: 650, updated: "2025-04-01" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories", exchange: "NSE", type: "Stock", lotSize: 200, updated: "2025-04-01" },
  { symbol: "EICHERMOT", name: "Eicher Motors", exchange: "NSE", type: "Stock", lotSize: 175, updated: "2025-04-01" },
  { symbol: "M&M", name: "Mahindra & Mahindra", exchange: "NSE", type: "Stock", lotSize: 350, updated: "2025-04-01" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", exchange: "NSE", type: "Stock", lotSize: 75, updated: "2025-04-01" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp", exchange: "NSE", type: "Stock", lotSize: 150, updated: "2025-04-01" },
  { symbol: "NESTLEIND", name: "Nestle India", exchange: "NSE", type: "Stock", lotSize: 250, updated: "2025-04-01" },
  { symbol: "BRITANNIA", name: "Britannia Industries", exchange: "NSE", type: "Stock", lotSize: 200, updated: "2025-04-01" },
  { symbol: "TECHM", name: "Tech Mahindra", exchange: "NSE", type: "Stock", lotSize: 600, updated: "2025-04-01" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", exchange: "NSE", type: "Stock", lotSize: 900, updated: "2025-04-01" },
  { symbol: "SBILIFE", name: "SBI Life Insurance", exchange: "NSE", type: "Stock", lotSize: 750, updated: "2025-04-01" },
  { symbol: "HDFCLIFE", name: "HDFC Life Insurance", exchange: "NSE", type: "Stock", lotSize: 1100, updated: "2025-04-01" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals", exchange: "NSE", type: "Stock", lotSize: 125, updated: "2025-04-01" },
  { symbol: "DLF", name: "DLF Limited", exchange: "NSE", type: "Stock", lotSize: 1650, updated: "2025-04-01" },
  { symbol: "VEDL", name: "Vedanta Limited", exchange: "NSE", type: "Stock", lotSize: 2300, updated: "2025-04-01" },
  { symbol: "ZOMATO", name: "Eternal (Zomato)", exchange: "NSE", type: "Stock", lotSize: 3425, updated: "2025-04-01" },
  { symbol: "PIDILITIND", name: "Pidilite Industries", exchange: "NSE", type: "Stock", lotSize: 250, updated: "2025-04-01" },
  { symbol: "SHREECEM", name: "Shree Cement", exchange: "NSE", type: "Stock", lotSize: 25, updated: "2025-04-01" },
  { symbol: "TRENT", name: "Trent Limited", exchange: "NSE", type: "Stock", lotSize: 275, updated: "2025-04-01" },
];

/* ============================================================
   BUSINESS LOGIC LAYER
   Pure functions — no DOM. Unit-testable in isolation and
   reusable by future modules (margin estimator, R:R calculator,
   portfolio-level sizing) mentioned in the brief.
   ============================================================ */
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/* ============================================================
   F&O CHARGES CALCULATION
   ─────────────────────────────────────────────────────────────
   Parameters
     buyTurnover   – lots × lotSize × entryPrice  (buy side)
     sellTurnover  – lots × lotSize × exitPrice   (sell side, approx entry−stopLoss)
     contractType  – 'futures' | 'options'
     instrumentType– 'Index' | 'Stock'
     exchange      – 'NSE' | 'BSE'

   Rates source: NSE/BSE published schedules (2024-25).
   No DP charges for F&O (no demat debit on futures/options).
   ─────────────────────────────────────────────────────────────
*/
function calcFoCharges(buyTurnover, sellTurnover, contractType, instrumentType, exch = 'NSE') {
  const totalTurnover = buyTurnover + sellTurnover;

  // ── Brokerage ────────────────────────────────────────────────────
  // ₹20 flat per order leg × 2 legs = ₹40 per round-trip
  const brokerage = 40;

  // ── STT / CTT ────────────────────────────────────────────────────
  // Futures (Stock): 0.0125% on SELL side turnover
  // Futures (Index): 0.0125% on SELL side turnover (same rate post-Budget 2024)
  // Options (Stock): 0.125% on SELL side PREMIUM turnover
  // Options (Index): 0.1%   on SELL side PREMIUM turnover
  // NOTE: For options the "turnover" passed in is already premium-based (entryPrice = premium)
  let stt;
  if (contractType === 'futures') {
    stt = round2(sellTurnover * 0.000125);           // 0.0125% on sell-side
  } else {
    // options
    const optRate = instrumentType === 'Index' ? 0.001 : 0.00125;
    stt = round2(sellTurnover * optRate);
  }

  // ── Exchange Transaction Charges ─────────────────────────────────
  // Futures NSE: 0.00173% | BSE: 0.00173%
  // Options NSE: 0.03503% | BSE: 0.0322%
  let exchRate;
  if (contractType === 'futures') {
    exchRate = 0.0000173;
  } else {
    exchRate = exch === 'BSE' ? 0.000322 : 0.0003503;
  }
  const exchangeCharge = round2(totalTurnover * exchRate);

  // ── SEBI Charges ─────────────────────────────────────────────────
  // ₹10 per crore = 0.0001% on total turnover
  const sebi = round2(totalTurnover * 0.000001);

  // ── GST ──────────────────────────────────────────────────────────
  // 18% on (Brokerage + Exchange Charges + SEBI Charges)
  const gst = round2((brokerage + exchangeCharge + sebi) * 0.18);

  // ── Stamp Duty ───────────────────────────────────────────────────
  // Buy side only.
  // Futures: 0.002% of buy turnover
  // Options: 0.003% of buy turnover
  const stampRate = contractType === 'futures' ? 0.00002 : 0.00003;
  const stampDuty = round2(buyTurnover * stampRate);

  // No DP charges for F&O
  const total = round2(brokerage + stt + exchangeCharge + sebi + gst + stampDuty);

  return { brokerage, stt, exchange: exchangeCharge, sebi, gst, stampDuty, total };
}

function calculatePositionSize({ accountSize, riskPct, stopLossPoints, lotSize, contractType = 'futures', instrumentType = 'Index', exchange = 'NSE' }) {
  const moneyAtRisk = accountSize * (riskPct / 100);
  const maxShares = moneyAtRisk / stopLossPoints;
  // Guard against floating point creep (e.g. 6.999999999 instead of 7)
  const safeMaxShares = Math.floor(round2(maxShares) + 1e-9);
  const lots = Math.floor(safeMaxShares / lotSize);
  const shares = lots * lotSize;
  const actualRiskRaw = shares * stopLossPoints;
  const unusedRisk = moneyAtRisk - actualRiskRaw;
  const utilisation = moneyAtRisk > 0 ? (actualRiskRaw / moneyAtRisk) * 100 : 0;

  // Charges: use moneyAtRisk as turnover proxy (conservative estimate)
  const buyTurnover  = round2(moneyAtRisk);
  const sellTurnover = round2(moneyAtRisk);
  const charges = lots >= 1
    ? calcFoCharges(buyTurnover, sellTurnover, contractType, instrumentType, exchange)
    : { brokerage: 0, stt: 0, exchange: 0, sebi: 0, gst: 0, stampDuty: 0, total: 0 };

  return {
    moneyAtRisk: round2(moneyAtRisk),
    maxShares: safeMaxShares,
    lots,
    shares,
    actualRisk: round2(actualRiskRaw),
    unusedRisk: round2(unusedRisk),
    utilisation: round2(utilisation),
    charges,
    contractType,
    tradable: lots >= 1,
  };
}

function validateInputs({ instrument, accountSize, riskPct, stopLossPoints }) {
  const errors = {};
  if (!instrument) errors.instrument = "Select an instrument to continue.";

  if (accountSize === "" || accountSize === null) errors.accountSize = "Enter your account size.";
  else if (Number(accountSize) <= 0) errors.accountSize = "Account size must be greater than 0.";

  if (riskPct === "" || riskPct === null) errors.riskPct = "Enter a risk percentage.";
  else if (Number(riskPct) <= 0) errors.riskPct = "Risk percentage must be greater than 0.";
  else if (Number(riskPct) > 100) errors.riskPct = "Risk percentage can't exceed 100%.";

  if (stopLossPoints === "" || stopLossPoints === null) errors.stopLossPoints = "Enter stop-loss points.";
  else if (Number(stopLossPoints) <= 0) errors.stopLossPoints = "Stop-loss must be greater than 0.";

  return errors;
}

function inr(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function inrPlain(n) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* ============================================================
   APP STATE
   ============================================================ */
const state = {
  theme: "dark",
  instrument: null,
  accountSize: "",
  riskPct: "",
  stopLossPoints: "",
  contractType: "futures",
  touched: false,
  comboOpen: false,
  query: "",
  highlight: 0,
};

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const el = {
  body: document.body,
  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon"),
  themeLabel: document.getElementById("themeLabel"),

  instrumentField: document.getElementById("instrumentField"),
  comboWrap: document.getElementById("comboWrap"),
  comboInput: document.getElementById("instrument-search"),
  comboBadge: document.getElementById("comboBadge"),
  comboChevron: document.getElementById("comboChevron"),
  comboList: document.getElementById("instrument-listbox"),
  instrumentError: document.getElementById("instrument-error"),

  accountWrap: document.getElementById("accountWrap"),
  accountInput: document.getElementById("account-size"),
  accountError: document.getElementById("account-size-error"),

  riskWrap: document.getElementById("riskWrap"),
  riskInput: document.getElementById("risk-pct"),
  riskError: document.getElementById("risk-pct-error"),

  stopWrap: document.getElementById("stopWrap"),
  stopInput: document.getElementById("stop-loss"),
  stopError: document.getElementById("stop-loss-error"),

  contractFutures: document.getElementById("fo-contract-futures"),
  contractOptions: document.getElementById("fo-contract-options"),

  calcBtn: document.getElementById("calcBtn"),
  resetBtn: document.getElementById("resetBtn"),
  lotHint: document.getElementById("lotHint"),
  lotHintText: document.getElementById("lotHintText"),

  emptyState: document.getElementById("emptyState"),
  ticketContainer: document.getElementById("ticketContainer"),
};

/* ============================================================
   ICONS (inline SVG strings, reused across dynamic markup)
   ============================================================ */
const ICONS = {
  alert: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
};

/* ============================================================
   INSTRUMENT COMBOBOX
   ============================================================ */
function filteredInstruments() {
  const q = state.query.trim().toUpperCase();
  if (!q) return INSTRUMENT_DB;
  return INSTRUMENT_DB.filter(
    (i) => i.symbol.includes(q) || i.name.toUpperCase().includes(q)
  );
}

// Tracks the query signature the list markup was built for, so DOM nodes
// are only rebuilt when the actual item set changes — never on hover.
// Rebuilding on every mouseenter destroyed and recreated the hovered node
// mid-interaction, which could silently swallow the click meant to select
// an instrument.
let lastListSignature = null;

function renderCombo() {
  const items = filteredInstruments().slice(0, 40);

  el.comboWrap.classList.toggle("combo-open", state.comboOpen);
  el.comboChevron.classList.toggle("flip", state.comboOpen);
  el.comboInput.setAttribute("aria-expanded", String(state.comboOpen));

  if (state.instrument && !state.comboOpen) {
    el.comboInput.placeholder = `${state.instrument.symbol} — ${state.instrument.name}`;
    el.comboBadge.hidden = false;
    el.comboBadge.textContent = `${state.instrument.exchange} · ${state.instrument.type}`;
  } else {
    el.comboBadge.hidden = true;
  }

  if (!state.comboOpen) {
    el.comboList.hidden = true;
    el.comboList.innerHTML = "";
    lastListSignature = null;
    return;
  }

  el.comboList.hidden = false;

  const signature = state.query.trim().toUpperCase();

  if (signature !== lastListSignature) {
    lastListSignature = signature;

    if (items.length === 0) {
      el.comboList.innerHTML = `<li class="combo-empty">No instrument matches "${escapeHtml(state.query)}"</li>`;
    } else {
      el.comboList.innerHTML = items
        .map((item, idx) => {
          const selected = state.instrument && state.instrument.symbol === item.symbol;
          return `
            <li role="option" data-idx="${idx}" data-symbol="${item.symbol}"
                aria-selected="${selected}" class="combo-item">
              <div class="combo-item-main">
                <span class="combo-item-symbol">${item.symbol}</span>
                <span class="combo-item-name">${escapeHtml(item.name)}</span>
              </div>
              <div class="combo-item-meta">
                <span class="tag">${item.exchange}</span>
                <span class="lot-pill">${item.lotSize}/lot</span>
              </div>
            </li>`;
        })
        .join("");

      // Wire item interactions once per rebuild. Highlight state after this
      // is applied separately via class toggling, never a full re-render.
      el.comboList.querySelectorAll(".combo-item").forEach((li) => {
        li.addEventListener("mouseenter", () => {
          state.highlight = Number(li.dataset.idx);
          applyHighlight();
        });
        li.addEventListener("click", () => {
          selectInstrument(li.dataset.symbol);
        });
      });
    }
  }

  applyHighlight();
}

function applyHighlight() {
  el.comboList.querySelectorAll(".combo-item").forEach((li, idx) => {
    li.classList.toggle("combo-item-active", idx === state.highlight);
  });
}

function selectInstrument(symbol) {
  const item = INSTRUMENT_DB.find((i) => i.symbol === symbol);
  if (!item) return;
  state.instrument = item;
  state.query = "";
  state.comboOpen = false;
  el.comboInput.value = "";
  renderCombo();
  renderErrors();
  renderLotHint();
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

el.comboInput.addEventListener("focus", () => {
  state.comboOpen = true;
  renderCombo();
});

el.comboInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  state.highlight = 0;
  state.comboOpen = true;
  renderCombo();
});

el.comboInput.addEventListener("keydown", (e) => {
  const items = filteredInstruments().slice(0, 40);
  if (!state.comboOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
    state.comboOpen = true;
    renderCombo();
    return;
  }
  if (!state.comboOpen) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.highlight = Math.min(state.highlight + 1, items.length - 1);
    renderCombo();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.highlight = Math.max(state.highlight - 1, 0);
    renderCombo();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (items[state.highlight]) selectInstrument(items[state.highlight].symbol);
  } else if (e.key === "Escape") {
    state.comboOpen = false;
    renderCombo();
  }
});

document.addEventListener("mousedown", (e) => {
  if (!el.instrumentField.contains(e.target)) {
    state.comboOpen = false;
    renderCombo();
  }
});

/* ============================================================
   NUMBER INPUTS
   ============================================================ */
el.accountInput.addEventListener("input", (e) => {
  state.accountSize = e.target.value;
  renderErrors();
});
el.riskInput.addEventListener("input", (e) => {
  state.riskPct = e.target.value;
  renderErrors();
});
el.stopInput.addEventListener("input", (e) => {
  state.stopLossPoints = e.target.value;
  renderErrors();
});

[el.contractFutures, el.contractOptions].forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) state.contractType = radio.value;
  });
});

/* ============================================================
   VALIDATION / ERROR RENDERING
   ============================================================ */
function currentErrors() {
  if (!state.touched) return {};
  return validateInputs({
    instrument: state.instrument,
    accountSize: state.accountSize,
    riskPct: state.riskPct,
    stopLossPoints: state.stopLossPoints,
  });
}

function renderErrors() {
  const errors = currentErrors();

  setFieldError(el.instrumentField, el.instrumentError, errors.instrument, () => {
    el.comboWrap.classList.toggle("field-error", !!errors.instrument);
  });
  setFieldError(el.accountWrap, el.accountError, errors.accountSize, () => {
    el.accountWrap.classList.toggle("field-error", !!errors.accountSize);
  });
  setFieldError(el.riskWrap, el.riskError, errors.riskPct, () => {
    el.riskWrap.classList.toggle("field-error", !!errors.riskPct);
  });
  setFieldError(el.stopWrap, el.stopError, errors.stopLossPoints, () => {
    el.stopWrap.classList.toggle("field-error", !!errors.stopLossPoints);
  });
}

function setFieldError(wrapEl, msgEl, message, applyClass) {
  applyClass();
  if (message) {
    msgEl.hidden = false;
    msgEl.innerHTML = `${ICONS.alert}${escapeHtml(message)}`;
  } else {
    msgEl.hidden = true;
    msgEl.innerHTML = "";
  }
}

function renderLotHint() {
  if (state.instrument) {
    el.lotHint.hidden = false;
    el.lotHintText.innerHTML = `${state.instrument.symbol} lot size: <b>${state.instrument.lotSize} shares</b> · data as of ${state.instrument.updated}`;
  } else {
    el.lotHint.hidden = true;
  }
}

/* ============================================================
   RESULT RENDERING
   ============================================================ */
function buildRef(instrument, inputs) {
  const raw = instrument.symbol + inputs.accountSize + inputs.riskPct;
  let hash = 7;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return "K" + Math.abs(hash).toString(36).toUpperCase().slice(0, 7);
}

function renderResult(result, instrument, inputs) {
  el.emptyState.hidden = true;

  if (!result.tradable) {
    el.ticketContainer.innerHTML = `
      <div class="ticket ticket-blocked">
        <div class="ticket-head">
          ${ICONS.shield}
          <span>Position blocked</span>
        </div>
        <p class="blocked-msg">
          Your selected risk is too small to trade even one lot of this instrument.
          Increase your account size, increase your risk percentage, or reduce your stop-loss.
        </p>
        <div class="blocked-meta">
          <span>Money at risk: ${inr(result.moneyAtRisk)}</span>
          <span>Needed for 1 lot: ${instrument.lotSize} shares × stop-loss points</span>
        </div>
      </div>`;
    return;
  }

  const ref = buildRef(instrument, inputs);
  const pct = Math.max(0, Math.min(100, result.utilisation));
  const c = result.charges;
  const riskAmount = result.moneyAtRisk;
  const actualRisk = round2(riskAmount - c.total);

  el.ticketContainer.innerHTML = `
    <div class="ticket">
      <div class="ticket-head">
        <div class="ticket-head-left">
          ${ICONS.shield}
          <span>Contract Note</span>
        </div>
        <span class="ticket-ref">REF ${ref}</span>
      </div>

      <div class="ticket-instrument">
        <span class="ticket-symbol">${instrument.symbol}</span>
        <span class="ticket-exchange">${instrument.exchange} · ${instrument.type}</span>
      </div>

      <div class="ticket-hero">
        <span class="ticket-hero-label">Recommended lots</span>
        <span class="ticket-hero-value">${result.lots}</span>
        <span class="ticket-hero-sub">${result.shares.toLocaleString("en-IN")} shares · ${instrument.lotSize}/lot</span>
      </div>

      <div class="gauge">
        <div class="gauge-track"><div class="gauge-fill" style="width:${pct}%"></div></div>
        <div class="gauge-labels">
          <span><span class="dot dot-used"></span>Deployed ${inrPlain(result.actualRisk)}</span>
          <span><span class="dot dot-unused"></span>Idle ${inrPlain(result.unusedRisk)}</span>
        </div>
      </div>

      <div class="perforation" role="presentation"></div>

      <dl class="ticket-rows">
        <div class="ticket-row">
          <dt>Risk Amount</dt>
          <dd>${inr(riskAmount)}</dd>
        </div>
        <div class="ticket-row">
          <dt>Actual Risk</dt>
          <dd class="dd-strong">${inr(actualRisk)}</dd>
        </div>
        <div class="ticket-row ticket-row-charges">
          <dt class="charges-dt">
            <span>Charges</span>
            <button
              class="charges-info-btn"
              aria-label="View charges breakdown"
              aria-expanded="false"
              type="button"
            >ⓘ</button>
          </dt>
          <dd>${inr(c.total)}</dd>
        </div>
      </dl>

      <div class="charges-breakdown" aria-hidden="true" hidden>
        <p class="charges-formula">Risk Amount = Actual Risk + Total Charges</p>
        <dl class="charges-list">
          <div class="charges-item"><dt>Brokerage</dt><dd>${inr(c.brokerage)}</dd></div>
          <div class="charges-item"><dt>STT/CTT</dt><dd>${inr(c.stt)}</dd></div>
          <div class="charges-item"><dt>Exchange Charges</dt><dd>${inr(c.exchange)}</dd></div>
          <div class="charges-item"><dt>SEBI Charges</dt><dd>${inr(c.sebi)}</dd></div>
          <div class="charges-item"><dt>GST (18%)</dt><dd>${inr(c.gst)}</dd></div>
          <div class="charges-item"><dt>Stamp Duty</dt><dd>${inr(c.stampDuty)}</dd></div>
          <div class="charges-item charges-item-total"><dt>Total Charges</dt><dd>${inr(c.total)}</dd></div>
        </dl>
        <p class="charges-formula charges-formula-example">
          ${inr(riskAmount)} = ${inr(actualRisk)} + ${inr(c.total)}
        </p>
      </div>
    </div>`;
}

function clearResult() {
  el.ticketContainer.innerHTML = "";
  el.emptyState.hidden = false;
}

/* Charges breakdown toggle — delegated on F&O ticket container */
el.ticketContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".charges-info-btn");
  if (!btn) return;
  const ticket = btn.closest(".ticket");
  if (!ticket) return;
  const breakdown = ticket.querySelector(".charges-breakdown");
  if (!breakdown) return;
  const isOpen = !breakdown.hidden;
  breakdown.hidden = isOpen;
  breakdown.setAttribute("aria-hidden", String(isOpen));
  btn.setAttribute("aria-expanded", String(!isOpen));
  btn.classList.toggle("charges-info-btn--active", !isOpen);
});

/* ============================================================
   ACTIONS
   ============================================================ */
el.calcBtn.addEventListener("click", () => {
  state.touched = true;
  const errors = validateInputs({
    instrument: state.instrument,
    accountSize: state.accountSize,
    riskPct: state.riskPct,
    stopLossPoints: state.stopLossPoints,
  });
  renderErrors();

  if (Object.keys(errors).length > 0) {
    clearResult();
    return;
  }

  const result = calculatePositionSize({
    accountSize: Number(state.accountSize),
    riskPct: Number(state.riskPct),
    stopLossPoints: Number(state.stopLossPoints),
    lotSize: state.instrument.lotSize,
    contractType: state.contractType,
    instrumentType: state.instrument.type,
    exchange: state.instrument.exchange,
  });

  renderResult(result, state.instrument, {
    accountSize: state.accountSize,
    riskPct: state.riskPct,
    stopLossPoints: state.stopLossPoints,
  });
});

el.resetBtn.addEventListener("click", () => {
  state.instrument = null;
  state.accountSize = "";
  state.riskPct = "";
  state.stopLossPoints = "";
  state.contractType = "futures";
  state.touched = false;
  state.query = "";
  state.comboOpen = false;

  el.comboInput.value = "";
  el.comboInput.placeholder = "Search NIFTY, RELIANCE, BANKEX…";
  el.accountInput.value = "";
  el.riskInput.value = "";
  el.stopInput.value = "";
  el.contractFutures.checked = true;

  renderCombo();
  renderErrors();
  renderLotHint();
  clearResult();
});

/* ============================================================
   THEME TOGGLE
   ============================================================ */
const SUN_ICON = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>`;
const MOON_ICON = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>`;

el.themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  el.body.setAttribute("data-theme", state.theme);
  el.themeToggle.setAttribute("aria-label", `Switch to ${state.theme === "dark" ? "light" : "dark"} mode`);
  el.themeIcon.innerHTML = state.theme === "dark" ? SUN_ICON : MOON_ICON;
  el.themeLabel.textContent = state.theme === "dark" ? "Light" : "Dark";
});

/* ============================================================
   INIT
   ============================================================ */
renderCombo();
renderErrors();
renderLotHint();

/* ============================================================
   PAGE ROUTING
   Simple hash-based routing for single-page navigation
   ============================================================ */
const PAGES = {
  home: 'home',
  market: 'market',
  'calculator-stock': 'calculator-stock',
  'calculator-fo': 'calculator-fo',
  'calculator-forex': 'calculator-forex',
  'calculator-crypto': 'calculator-crypto',
  strategies: 'strategies',
  portfolio: 'portfolio',
  journal: 'journal',
  about: 'about'
};

function getCurrentPage() {
  const hash = window.location.hash.slice(1) || 'calculator-stock';
  return PAGES[hash] || 'calculator-stock';
}

function showPage(pageName) {
  // Get all page elements
  const homePage = document.getElementById('homePage');
  const marketPage = document.getElementById('marketPage');
  const calculatorPage = document.getElementById('calculatorPage');
  const strategiesPage = document.getElementById('strategiesPage');
  const portfolioPage = document.getElementById('portfolioPage');
  const journalPage = document.getElementById('journalPage');
  const aboutPage = document.getElementById('aboutPage');
  const calculatorDisclaimer = document.getElementById('calculatorDisclaimer');

  const stockCalculator = document.getElementById('stockCalculator');
  const foCalculator = document.getElementById('foCalculator');
  const forexCalculator = document.getElementById('forexCalculator');
  const cryptoCalculator = document.getElementById('cryptoCalculator');

  // Hide all pages
  homePage.hidden = true;
  marketPage.hidden = true;
  calculatorPage.hidden = true;
  strategiesPage.hidden = true;
  portfolioPage.hidden = true;
  journalPage.hidden = true;
  aboutPage.hidden = true;
  calculatorDisclaimer.hidden = true;

  // Hide all calculator sub-views
  if (stockCalculator)  stockCalculator.hidden  = true;
  if (foCalculator)     foCalculator.hidden      = true;
  if (forexCalculator)  forexCalculator.hidden   = true;
  if (cryptoCalculator) cryptoCalculator.hidden  = true;

  // Show requested page
  switch(pageName) {
    case 'home':
      homePage.hidden = false;
      break;
    case 'market':
      marketPage.hidden = false;
      break;
    case 'calculator-stock':
      calculatorPage.hidden = false;
      calculatorDisclaimer.hidden = false;
      stockCalculator.hidden = false;
      break;
    case 'calculator-fo':
      calculatorPage.hidden = false;
      calculatorDisclaimer.hidden = false;
      foCalculator.hidden = false;
      break;
    case 'calculator-forex':
      calculatorPage.hidden = false;
      calculatorDisclaimer.hidden = false;
      if (forexCalculator) forexCalculator.hidden = false;
      break;
    case 'calculator-crypto':
      calculatorPage.hidden = false;
      calculatorDisclaimer.hidden = false;
      if (cryptoCalculator) cryptoCalculator.hidden = false;
      break;
    case 'strategies':
      strategiesPage.hidden = false;
      break;
    case 'portfolio':
      portfolioPage.hidden = false;
      break;
    case 'journal':
      journalPage.hidden = false;
      break;
    case 'about':
      aboutPage.hidden = false;
      break;
    default:
      calculatorPage.hidden = false;
      calculatorDisclaimer.hidden = false;
      stockCalculator.hidden = false;
  }

  // Update active nav tab
  const isCalculatorPage = pageName === 'calculator-stock' || pageName === 'calculator-fo'
    || pageName === 'calculator-forex' || pageName === 'calculator-crypto';
  
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const tabHref = tab.getAttribute('href')?.slice(1);
    tab.classList.remove('nav-tab-active');
  });
  
  // Update dropdown button active state
  const calculatorDropdownBtn = document.getElementById('calculatorDropdownBtn');
  if (isCalculatorPage && calculatorDropdownBtn) {
    calculatorDropdownBtn.classList.add('nav-tab-active');
  }
  
  // Update regular nav tabs
  document.querySelectorAll('.nav-tab:not(.nav-tab-dropdown)').forEach(tab => {
    const tabHref = tab.getAttribute('href')?.slice(1);
    if (tabHref === pageName) {
      tab.classList.add('nav-tab-active');
    }
  });
  
  // Update dropdown items
  document.querySelectorAll('.dropdown-item').forEach(item => {
    const itemHref = item.getAttribute('href')?.slice(1);
    if (itemHref === pageName) {
      item.classList.add('dropdown-item-active');
    } else {
      item.classList.remove('dropdown-item-active');
    }
  });

  // Close mobile menu if open
  const navTabs = document.getElementById('mainNav');
  if (navTabs) {
    navTabs.classList.remove('mobile-open');
  }
  
  const menuIcon = document.querySelector('.menu-icon');
  const closeIcon = document.querySelector('.close-icon');
  if (menuIcon && closeIcon) {
    menuIcon.hidden = false;
    closeIcon.hidden = true;
  }
  
  // Close dropdown
  const calculatorDropdown = document.getElementById('calculatorDropdown');
  if (calculatorDropdown) {
    calculatorDropdown.classList.remove('dropdown-open');
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function initRouting() {
  // Handle navigation clicks
  document.querySelectorAll('.nav-tab:not(.nav-tab-dropdown)').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.getAttribute('href').slice(1);
      window.location.hash = page;
    });
  });
  
  // Handle dropdown item clicks
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.getAttribute('href').slice(1);
      window.location.hash = page;
    });
  });

  // Handle hash changes
  window.addEventListener('hashchange', () => {
    const page = getCurrentPage();
    showPage(page);
  });

  // Dropdown functionality
  const calculatorDropdown = document.getElementById('calculatorDropdown');
  const calculatorDropdownBtn = document.getElementById('calculatorDropdownBtn');
  const calculatorDropdownMenu = document.getElementById('calculatorDropdownMenu');

  if (calculatorDropdownBtn && calculatorDropdown) {
    // Toggle dropdown on click
    calculatorDropdownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      calculatorDropdown.classList.toggle('dropdown-open');
    });

    // Desktop: Open on hover
    if (window.innerWidth > 768) {
      calculatorDropdown.addEventListener('mouseenter', () => {
        calculatorDropdown.classList.add('dropdown-open');
      });

      calculatorDropdown.addEventListener('mouseleave', () => {
        calculatorDropdown.classList.remove('dropdown-open');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!calculatorDropdown.contains(e.target)) {
        calculatorDropdown.classList.remove('dropdown-open');
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const menuIcon = document.querySelector('.menu-icon');
  const closeIcon = document.querySelector('.close-icon');

  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('mobile-open');
      const isOpen = mainNav.classList.contains('mobile-open');
      menuIcon.hidden = isOpen;
      closeIcon.hidden = !isOpen;
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mainNav.classList.remove('mobile-open');
        menuIcon.hidden = false;
        closeIcon.hidden = true;
      }
    });
  }

  // Show initial page
  const initialPage = getCurrentPage();
  showPage(initialPage);
  
  // Initialize market page if it's the current page
  if (initialPage === 'market') {
    initializeMarketPage();
  }
}

// Re-initialize market page when navigating to it
window.addEventListener('hashchange', () => {
  const page = getCurrentPage();
  if (page === 'market') {
    setTimeout(() => initializeMarketPage(), 100);
  }
});

// Initialize routing after DOM is ready
initRouting();

/* ============================================================
   MARKET TAB SWITCHING (India / Forex)
   ============================================================ */
(function() {
  'use strict';

  const indiaTab = document.getElementById('indiaTab');
  const forexTab = document.getElementById('forexTab');
  const sessionsHeading = document.getElementById('sessionsHeading');

  if (!indiaTab || !forexTab) return;

  let currentMarket = 'india'; // Default to India

  function switchMarket(market) {
    if (currentMarket === market) return;
    currentMarket = market;

    if (market === 'india') {
      // Show India tab as active
      indiaTab.classList.add('market-tab-active');
      forexTab.classList.remove('market-tab-active');
      
      // Update section heading
      if (sessionsHeading) {
        sessionsHeading.textContent = 'Trading Sessions';
      }
      
    } else {
      // Show Forex tab as active
      forexTab.classList.add('market-tab-active');
      indiaTab.classList.remove('market-tab-active');
      
      // Update section heading
      if (sessionsHeading) {
        sessionsHeading.textContent = 'Forex Sessions';
      }
    }
    
    // Store current market for other modules to reference
    window.currentMarketView = market;
    
    // Trigger sessions rebuild
    const rebuildEvent = new CustomEvent('marketViewChanged', { detail: { market } });
    window.dispatchEvent(rebuildEvent);
  }

  // Set initial state (India selected)
  switchMarket('india');

  // Tab click handlers
  if (indiaTab) indiaTab.addEventListener('click', () => switchMarket('india'));
  if (forexTab) forexTab.addEventListener('click', () => switchMarket('forex'));
}());

/* ============================================================
   STOCK CALCULATOR
   Position sizing for stock trading (cash market)
   ============================================================ */

// Stock-only instruments database — sourced from instruments.js (NSE_STOCKS)
const STOCK_DB = (typeof STOCK_INSTRUMENTS !== 'undefined') ? STOCK_INSTRUMENTS : INSTRUMENT_DB.filter(i => i.type === 'Stock');

// Stock calculator state
const stockState = {
  instrument: null,
  accountSize: '',
  riskPct: '',
  riskPerShare: '',
  tradeType: 'delivery',
  touched: false,
  comboOpen: false,
  query: '',
  highlight: 0,
};

// DOM references for stock calculator
const stockEl = {
  instrumentField: document.getElementById('stockInstrumentField'),
  comboWrap: document.getElementById('stockComboWrap'),
  comboInput: document.getElementById('stock-instrument-search'),
  comboBadge: document.getElementById('stockComboBadge'),
  comboChevron: document.getElementById('stockComboChevron'),
  comboList: document.getElementById('stock-instrument-listbox'),
  instrumentError: document.getElementById('stock-instrument-error'),

  accountWrap: document.getElementById('stockAccountWrap'),
  accountInput: document.getElementById('stock-account-size'),
  accountError: document.getElementById('stock-account-size-error'),

  riskWrap: document.getElementById('stockRiskWrap'),
  riskInput: document.getElementById('stock-risk-pct'),
  riskError: document.getElementById('stock-risk-pct-error'),

  stopWrap: document.getElementById('stockStopWrap'),
  stopInput: document.getElementById('stock-stop-loss'),
  stopError: document.getElementById('stock-stop-loss-error'),

  tradeTypeDelivery: document.getElementById('stock-trade-delivery'),
  tradeTypeIntraday: document.getElementById('stock-trade-intraday'),

  calcBtn: document.getElementById('stockCalcBtn'),
  resetBtn: document.getElementById('stockResetBtn'),
  hint: document.getElementById('stockHint'),
  hintText: document.getElementById('stockHintText'),

  emptyState: document.getElementById('stockEmptyState'),
  ticketContainer: document.getElementById('stockTicketContainer'),
};

/* Stock Calculator Functions */

/* Stock Charges Calculation
   ─────────────────────────────────────────────────────────────────────
   Parameters
     buyTurnover  – buy-side trade value  (shares × entry price)
     sellTurnover – sell-side trade value (shares × exit/stop price)
                    Pass 0 if not yet known; charges still apply on buy leg.
     tradeType    – 'delivery' | 'intraday'
     exchange     – 'NSE' | 'BSE'  (defaults to NSE)

   All rates are current NSE/BSE published schedules (2024-25).
   ─────────────────────────────────────────────────────────────────────
*/
function calcStockCharges(buyTurnover, sellTurnover = 0, tradeType = 'delivery', exch = 'NSE') {
  const totalTurnover = buyTurnover + sellTurnover;

  // ── Brokerage ─────────────────────────────────────────────────────
  // ₹20 flat per executed order leg × 2 legs (buy + sell) = ₹40 per round-trip
  const brokerage = 40; // ₹20 buy + ₹20 sell

  // ── STT ───────────────────────────────────────────────────────────
  // Delivery: 0.1% on BOTH buy and sell turnover
  // Intraday: 0.025% on SELL turnover only
  let stt;
  if (tradeType === 'delivery') {
    stt = round2(totalTurnover * 0.001);          // 0.1% on total
  } else {
    stt = round2(sellTurnover * 0.00025);          // 0.025% on sell only
  }

  // ── Exchange Transaction Charges ──────────────────────────────────
  // NSE: 0.00297% on total turnover (cash segment)
  // BSE: 0.00375% on total turnover (cash segment)
  const exchRate = exch === 'BSE' ? 0.0000375 : 0.0000297;
  const exchangeCharge = round2(totalTurnover * exchRate);

  // ── SEBI Charges ──────────────────────────────────────────────────
  // ₹10 per crore of turnover = 0.0001% on total turnover
  const sebi = round2(totalTurnover * 0.000001);

  // ── GST ───────────────────────────────────────────────────────────
  // 18% on (Brokerage + Exchange Charges + SEBI Charges)
  const gst = round2((brokerage + exchangeCharge + sebi) * 0.18);

  // ── Stamp Duty ────────────────────────────────────────────────────
  // Buy side only.
  // Delivery: 0.015% of buy turnover
  // Intraday: 0.003% of buy turnover
  const stampRate = tradeType === 'delivery' ? 0.00015 : 0.00003;
  const stampDuty = round2(buyTurnover * stampRate);

  // ── DP Charges ────────────────────────────────────────────────────
  // Delivery SELL only: ₹13.5 + 18% GST = ₹15.93 per scrip per day (CDSL)
  // Not applicable for intraday (no demat debit).
  const dpCharges = tradeType === 'delivery' ? round2(13.5 * 1.18) : 0;

  const total = round2(brokerage + stt + exchangeCharge + sebi + gst + stampDuty + dpCharges);

  return { brokerage, stt, exchange: exchangeCharge, sebi, gst, stampDuty, dpCharges, total };
}

function calculateStockPositionSize({ accountSize, riskPct, riskPerShare, entryPrice, tradeType = 'delivery' }) {
  const riskAmount = round2(accountSize * (riskPct / 100));

  // shares based purely on risk sizing
  const shares = Math.floor(riskAmount / riskPerShare);

  // Buy turnover: shares × entry price; fall back to riskAmount when entry price unknown
  const buyTurnover = (entryPrice && entryPrice > 0)
    ? shares * entryPrice
    : riskAmount;

  // Sell turnover: shares × (entry price − risk per share) approximates exit at stop
  const sellTurnover = (entryPrice && entryPrice > 0)
    ? shares * Math.max(0, entryPrice - riskPerShare)
    : riskAmount;

  const charges = calcStockCharges(buyTurnover, sellTurnover, tradeType);

  // Actual money at risk = budgeted risk minus what charges eat
  const actualRisk = round2(riskAmount - charges.total);
  const tradable = shares >= 1;

  return {
    riskAmount,
    shares,
    actualRisk,
    charges,
    tradeType,
    tradable,
  };
}

function validateStockInputs({ instrument, accountSize, riskPct, riskPerShare }) {
  const errors = {};
  if (!instrument) errors.instrument = "Select a stock to continue.";

  if (accountSize === "" || accountSize === null) errors.accountSize = "Enter your account size.";
  else if (Number(accountSize) <= 0) errors.accountSize = "Account size must be greater than 0.";

  if (riskPct === "" || riskPct === null) errors.riskPct = "Enter a risk percentage.";
  else if (Number(riskPct) <= 0) errors.riskPct = "Risk percentage must be greater than 0.";
  else if (Number(riskPct) > 100) errors.riskPct = "Risk percentage can't exceed 100%.";

  if (riskPerShare === "" || riskPerShare === null) errors.riskPerShare = "Enter risk per share.";
  else if (Number(riskPerShare) <= 0) errors.riskPerShare = "Risk per share must be greater than 0.";

  return errors;
}

/* Stock Combobox */
let lastStockListSignature = null;

function filteredStocks() {
  const q = stockState.query.trim().toUpperCase();
  if (!q) return STOCK_DB;
  return STOCK_DB.filter(
    (i) => i.symbol.includes(q) || i.name.toUpperCase().includes(q)
  );
}

function renderStockCombo() {
  const items = filteredStocks().slice(0, 40);

  stockEl.comboWrap.classList.toggle("combo-open", stockState.comboOpen);
  stockEl.comboChevron.classList.toggle("flip", stockState.comboOpen);
  stockEl.comboInput.setAttribute("aria-expanded", String(stockState.comboOpen));

  if (stockState.instrument && !stockState.comboOpen) {
    stockEl.comboInput.placeholder = `${stockState.instrument.symbol} — ${stockState.instrument.name}`;
    stockEl.comboBadge.hidden = false;
    stockEl.comboBadge.textContent = `${stockState.instrument.exchange} · Stock`;
  } else {
    stockEl.comboBadge.hidden = true;
  }

  if (!stockState.comboOpen) {
    stockEl.comboList.hidden = true;
    stockEl.comboList.innerHTML = "";
    lastStockListSignature = null;
    return;
  }

  stockEl.comboList.hidden = false;

  const signature = stockState.query.trim().toUpperCase();

  if (signature !== lastStockListSignature) {
    lastStockListSignature = signature;

    if (items.length === 0) {
      stockEl.comboList.innerHTML = `<li class="combo-empty">No stock matches "${escapeHtml(stockState.query)}"</li>`;
    } else {
      stockEl.comboList.innerHTML = items
        .map((item, idx) => {
          const selected = stockState.instrument && stockState.instrument.symbol === item.symbol;
          return `
            <li role="option" data-idx="${idx}" data-symbol="${item.symbol}"
                aria-selected="${selected}" class="combo-item">
              <div class="combo-item-main">
                <span class="combo-item-symbol">${item.symbol}</span>
                <span class="combo-item-name">${escapeHtml(item.name)}</span>
              </div>
              <div class="combo-item-meta">
                <span class="tag">${item.exchange}</span>
              </div>
            </li>`;
        })
        .join("");

      stockEl.comboList.querySelectorAll(".combo-item").forEach((li) => {
        li.addEventListener("mouseenter", () => {
          stockState.highlight = Number(li.dataset.idx);
          applyStockHighlight();
        });
        li.addEventListener("click", () => {
          selectStock(li.dataset.symbol);
        });
      });
    }
  }

  applyStockHighlight();
}

function applyStockHighlight() {
  stockEl.comboList.querySelectorAll(".combo-item").forEach((li, idx) => {
    li.classList.toggle("combo-item-active", idx === stockState.highlight);
  });
}

function selectStock(symbol) {
  const item = STOCK_DB.find((i) => i.symbol === symbol);
  if (!item) return;
  stockState.instrument = item;
  stockState.query = "";
  stockState.comboOpen = false;
  stockEl.comboInput.value = "";
  renderStockCombo();
  renderStockErrors();
  renderStockHint();
}

stockEl.comboInput.addEventListener("focus", () => {
  stockState.comboOpen = true;
  renderStockCombo();
});

stockEl.comboInput.addEventListener("input", (e) => {
  stockState.query = e.target.value;
  stockState.highlight = 0;
  stockState.comboOpen = true;
  renderStockCombo();
});

stockEl.comboInput.addEventListener("keydown", (e) => {
  const items = filteredStocks().slice(0, 40);
  if (!stockState.comboOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
    stockState.comboOpen = true;
    renderStockCombo();
    return;
  }
  if (!stockState.comboOpen) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    stockState.highlight = Math.min(stockState.highlight + 1, items.length - 1);
    renderStockCombo();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    stockState.highlight = Math.max(stockState.highlight - 1, 0);
    renderStockCombo();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (items[stockState.highlight]) selectStock(items[stockState.highlight].symbol);
  } else if (e.key === "Escape") {
    stockState.comboOpen = false;
    renderStockCombo();
  }
});

document.addEventListener("mousedown", (e) => {
  if (!stockEl.instrumentField.contains(e.target)) {
    stockState.comboOpen = false;
    renderStockCombo();
  }
});

/* Stock Input Handlers */
stockEl.accountInput.addEventListener("input", (e) => {
  stockState.accountSize = e.target.value;
  renderStockErrors();
});

stockEl.riskInput.addEventListener("input", (e) => {
  stockState.riskPct = e.target.value;
  renderStockErrors();
});

stockEl.stopInput.addEventListener("input", (e) => {
  stockState.riskPerShare = e.target.value;
  renderStockErrors();
});

/* Stock Validation */
function currentStockErrors() {
  if (!stockState.touched) return {};
  return validateStockInputs({
    instrument: stockState.instrument,
    accountSize: stockState.accountSize,
    riskPct: stockState.riskPct,
    riskPerShare: stockState.riskPerShare,
  });
}

function renderStockErrors() {
  const errors = currentStockErrors();

  setFieldError(stockEl.instrumentField, stockEl.instrumentError, errors.instrument, () => {
    stockEl.comboWrap.classList.toggle("field-error", !!errors.instrument);
  });
  setFieldError(stockEl.accountWrap, stockEl.accountError, errors.accountSize, () => {
    stockEl.accountWrap.classList.toggle("field-error", !!errors.accountSize);
  });
  setFieldError(stockEl.riskWrap, stockEl.riskError, errors.riskPct, () => {
    stockEl.riskWrap.classList.toggle("field-error", !!errors.riskPct);
  });
  setFieldError(stockEl.stopWrap, stockEl.stopError, errors.riskPerShare, () => {
    stockEl.stopWrap.classList.toggle("field-error", !!errors.riskPerShare);
  });
}

function renderStockHint() {
  if (stockState.instrument) {
    stockEl.hint.hidden = false;
    stockEl.hintText.innerHTML = `${stockState.instrument.symbol} · <b>${stockState.instrument.name}</b> · Listed on ${stockState.instrument.exchange}`;
  } else {
    stockEl.hint.hidden = true;
  }
}

/* Stock Result Rendering */
function renderStockResult(result, instrument, inputs) {
  stockEl.emptyState.hidden = true;

  if (!result.tradable) {
    stockEl.ticketContainer.innerHTML = `
      <div class="ticket ticket-blocked">
        <div class="ticket-head">
          ${ICONS.shield}
          <span>Position blocked</span>
        </div>
        <p class="blocked-msg">
          Your selected risk is too small to buy even one share with this risk per share.
          Increase your account size, increase your risk percentage, or reduce your risk per share.
        </p>
        <div class="blocked-meta">
          <span>Risk amount: ${inr(result.riskAmount)}</span>
          <span>Risk per share: ${inr(inputs.riskPerShare)}</span>
        </div>
      </div>`;
    return;
  }

  const ref = buildRef(instrument, inputs);
  const c = result.charges;

  stockEl.ticketContainer.innerHTML = `
    <div class="ticket">
      <div class="ticket-head">
        <div class="ticket-head-left">
          ${ICONS.shield}
          <span>Position Summary</span>
        </div>
        <span class="ticket-ref">REF ${ref}</span>
      </div>

      <div class="ticket-instrument">
        <span class="ticket-symbol">${instrument.symbol}</span>
        <span class="ticket-exchange">${instrument.exchange} · Stock</span>
      </div>

      <div class="ticket-hero">
        <span class="ticket-hero-label">Recommended shares</span>
        <span class="ticket-hero-value">${result.shares.toLocaleString("en-IN")}</span>
        <span class="ticket-hero-sub">Risk per share: ${inr(inputs.riskPerShare)}</span>
      </div>

      <div class="perforation" role="presentation"></div>

      <dl class="ticket-rows">
        <div class="ticket-row">
          <dt>Risk Amount</dt>
          <dd>${inr(result.riskAmount)}</dd>
        </div>
        <div class="ticket-row">
          <dt>Actual Risk</dt>
          <dd class="dd-strong">${inr(result.actualRisk)}</dd>
        </div>
        <div class="ticket-row ticket-row-charges">
          <dt class="charges-dt">
            <span>Charges</span>
            <button
              class="charges-info-btn"
              aria-label="View charges breakdown"
              aria-expanded="false"
              type="button"
            >ⓘ</button>
          </dt>
          <dd>${inr(c.total)}</dd>
        </div>
      </dl>

      <div class="charges-breakdown" aria-hidden="true" hidden>
        <p class="charges-formula">Risk Amount = Actual Risk + Total Charges</p>
        <dl class="charges-list">
          <div class="charges-item"><dt>Brokerage</dt><dd>${inr(c.brokerage)}</dd></div>
          <div class="charges-item"><dt>STT</dt><dd>${inr(c.stt)}</dd></div>
          <div class="charges-item"><dt>Exchange</dt><dd>${inr(c.exchange)}</dd></div>
          <div class="charges-item"><dt>SEBI</dt><dd>${inr(c.sebi)}</dd></div>
          <div class="charges-item"><dt>GST</dt><dd>${inr(c.gst)}</dd></div>
          <div class="charges-item"><dt>Stamp Duty</dt><dd>${inr(c.stampDuty)}</dd></div>
          ${result.tradeType === 'delivery' ? `<div class="charges-item"><dt>DP Charges</dt><dd>${inr(c.dpCharges)}</dd></div>` : ''}
          <div class="charges-item charges-item-total"><dt>Total Charges</dt><dd>${inr(c.total)}</dd></div>
        </dl>
        <p class="charges-formula charges-formula-example">
          ${inr(result.riskAmount)} = ${inr(result.actualRisk)} + ${inr(c.total)}
        </p>
      </div>
    </div>`;
}

function clearStockResult() {
  stockEl.ticketContainer.innerHTML = "";
  stockEl.emptyState.hidden = false;
}

/* Charges breakdown toggle — delegated on the ticket container */
stockEl.ticketContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".charges-info-btn");
  if (!btn) return;

  const ticket = btn.closest(".ticket");
  if (!ticket) return;

  const breakdown = ticket.querySelector(".charges-breakdown");
  if (!breakdown) return;

  const isOpen = !breakdown.hidden;
  breakdown.hidden = isOpen;
  breakdown.setAttribute("aria-hidden", String(isOpen));
  btn.setAttribute("aria-expanded", String(!isOpen));
  btn.classList.toggle("charges-info-btn--active", !isOpen);
});

/* Trade type toggle */
[stockEl.tradeTypeDelivery, stockEl.tradeTypeIntraday].forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) stockState.tradeType = radio.value;
  });
});

/* Stock Actions */
stockEl.calcBtn.addEventListener("click", () => {
  stockState.touched = true;
  const errors = validateStockInputs({
    instrument: stockState.instrument,
    accountSize: stockState.accountSize,
    riskPct: stockState.riskPct,
    riskPerShare: stockState.riskPerShare,
  });
  renderStockErrors();

  if (Object.keys(errors).length > 0) {
    clearStockResult();
    return;
  }

  const result = calculateStockPositionSize({
    accountSize: Number(stockState.accountSize),
    riskPct: Number(stockState.riskPct),
    riskPerShare: Number(stockState.riskPerShare),
    tradeType: stockState.tradeType,
  });

  renderStockResult(result, stockState.instrument, {
    accountSize: stockState.accountSize,
    riskPct: stockState.riskPct,
    riskPerShare: stockState.riskPerShare,
    tradeType: stockState.tradeType,
  });
});

stockEl.resetBtn.addEventListener("click", () => {
  stockState.instrument = null;
  stockState.accountSize = "";
  stockState.riskPct = "";
  stockState.riskPerShare = "";
  stockState.tradeType = "delivery";
  stockState.touched = false;
  stockState.query = "";
  stockState.comboOpen = false;

  stockEl.comboInput.value = "";
  stockEl.comboInput.placeholder = "Search RELIANCE, TCS, HDFCBANK…";
  stockEl.accountInput.value = "";
  stockEl.riskInput.value = "";
  stockEl.stopInput.value = "";
  stockEl.tradeTypeDelivery.checked = true;

  renderStockCombo();
  renderStockErrors();
  renderStockHint();
  clearStockResult();
});

/* Initialize Stock Calculator */
renderStockCombo();
renderStockErrors();
renderStockHint();


/* ============================================================
   JOURNAL MODE NAV
   When the Journal page is active, toggle .journal-mode on the
   <header> so the full nav collapses and only a solo Journal tab
   appears below the brand. Clicking the Back button (or
   navigating away via hash change) restores the full nav.
   ============================================================ */
(function () {
  const header       = document.querySelector('.app-header');
  const exitBtn      = document.getElementById('journalExitBtn');
  const journalHash  = 'journal';

  function enterJournalMode() {
    header.classList.add('journal-mode');
  }

  function exitJournalMode() {
    header.classList.remove('journal-mode');
  }

  // Back button — navigate to the default calculator page
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      window.location.hash = 'calculator-stock';
    });
  }

  // Intercept the Journal nav-tab click before the hash changes
  const journalNavTab = document.querySelector('.nav-tab[href="#journal"]');
  if (journalNavTab) {
    journalNavTab.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = journalHash;
      // enterJournalMode is also called by the hashchange handler below,
      // but calling it immediately avoids a one-frame flicker.
      enterJournalMode();
    });
  }

  // React to hash changes (forward / back navigation, direct URL)
  function syncJournalMode() {
    const page = (window.location.hash.slice(1) || '').toLowerCase();
    if (page === journalHash) {
      enterJournalMode();
    } else {
      exitJournalMode();
    }
  }

  window.addEventListener('hashchange', syncJournalMode);

  // Sync on first load in case the URL already points to #journal
  syncJournalMode();
}());


/* ============================================================
   JOURNAL CALENDAR
   Self-contained module. Renders a monthly calendar grid with
   per-day trade data, weekly sidebar aggregates, and month-
   level summary pills. The "Add Trade Note" button on the
   dashboard switches to the calendar view; the Back button
   returns to the dashboard.
   ============================================================ */
(function () {

  /* ----------------------------------------------------------
     Sample trade data — keyed by ISO date string YYYY-MM-DD.
     Each entry: { trades: number, pnl: number (₹) }
     Replace / extend with real persisted data later.
  ---------------------------------------------------------- */
  const TRADE_DATA = {
    // July 2026
    '2026-07-01': { trades: 2, pnl:  4200 },
    '2026-07-02': { trades: 1, pnl: -1800 },
    '2026-07-03': { trades: 3, pnl:  6750 },
    '2026-07-07': { trades: 2, pnl:  3100 },
    '2026-07-08': { trades: 1, pnl: -2400 },
    '2026-07-09': { trades: 2, pnl:  5500 },
    '2026-07-10': { trades: 1, pnl:  1200 },
    '2026-07-11': { trades: 3, pnl: -3200 },
    '2026-07-14': { trades: 2, pnl:  7800 },
    '2026-07-15': { trades: 1, pnl:  2600 },
    '2026-07-16': { trades: 2, pnl: -1500 },
    '2026-07-17': { trades: 3, pnl:  9400 },
    '2026-07-18': { trades: 2, pnl:  4100 },
    '2026-07-21': { trades: 1, pnl: -2800 },
    '2026-07-22': { trades: 2, pnl:  3900 },
    '2026-07-23': { trades: 2, pnl:  6200 },
    '2026-07-24': { trades: 3, pnl: -1100 },
    '2026-07-25': { trades: 2, pnl:  8300 },
    '2026-07-28': { trades: 1, pnl:  2200 },
    '2026-07-29': { trades: 2, pnl: -3600 },
    '2026-07-30': { trades: 2, pnl:  4800 },
    '2026-07-31': { trades: 1, pnl:  1700 },
    // August 2026
    '2026-08-01': { trades: 2, pnl:  5200 },
    '2026-08-04': { trades: 3, pnl: -2100 },
    '2026-08-05': { trades: 1, pnl:  3800 },
    '2026-08-06': { trades: 2, pnl:  6400 },
    '2026-08-07': { trades: 1, pnl: -1900 },
    '2026-08-08': { trades: 3, pnl:  7100 },
    '2026-08-11': { trades: 2, pnl:  4500 },
    '2026-08-12': { trades: 1, pnl: -3300 },
    '2026-08-13': { trades: 2, pnl:  5900 },
    '2026-08-14': { trades: 3, pnl:  8700 },
    '2026-08-15': { trades: 1, pnl: -1200 },
    '2026-08-18': { trades: 2, pnl:  3600 },
    '2026-08-19': { trades: 2, pnl: -2700 },
    '2026-08-20': { trades: 3, pnl:  6100 },
    '2026-08-21': { trades: 1, pnl:  2900 },
    '2026-08-22': { trades: 2, pnl:  4400 },
  };

  // Publish TRADE_DATA so the performance chart module can read it
  window.__rlTradeData = TRADE_DATA;

  /* ----------------------------------------------------------
     State
  ---------------------------------------------------------- */
  const today = new Date();
  const calState = {
    year:  today.getFullYear(),
    month: today.getMonth(),   // 0-indexed
  };

  /* ----------------------------------------------------------
     DOM refs — resolved lazily after page load
  ---------------------------------------------------------- */
  function dom(id) { return document.getElementById(id); }

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  function isoDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function formatPnl(val) {
    const abs = Math.abs(val).toLocaleString('en-IN');
    return val >= 0 ? `+₹${abs}` : `−₹${abs}`;
  }

  function formatPnlShort(val) {
    const abs = Math.abs(val);
    const str = abs >= 1000 ? `₹${(abs / 1000).toFixed(1)}k` : `₹${abs}`;
    return val >= 0 ? `+${str}` : `−${str}`;
  }

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const DAY_MS = 86400000;

  /* ----------------------------------------------------------
     Week range helper — returns { start: Date, end: Date }
     for the ISO week that contains `date` (Mon–Sun).
  ---------------------------------------------------------- */
  function weekBounds(date) {
    const d = new Date(date);
    const dow = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
    const mon = new Date(d - dow * DAY_MS);
    const sun = new Date(+mon + 6 * DAY_MS);
    return { start: mon, end: sun };
  }

  /* ----------------------------------------------------------
     Aggregate trade data for a date range [startDate, endDate]
  ---------------------------------------------------------- */
  function aggregateRange(startDate, endDate) {
    let totalPnl = 0;
    let tradingDays = 0;
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const key = isoDate(cur.getFullYear(), cur.getMonth(), cur.getDate());
      if (TRADE_DATA[key]) {
        totalPnl += TRADE_DATA[key].pnl;
        tradingDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return { totalPnl, tradingDays };
  }

  /* ----------------------------------------------------------
     renderCalendar — builds the grid and sidebar for calState
  ---------------------------------------------------------- */
  function renderCalendar() {
    const { year, month } = calState;

    // Month label
    dom('jcalMonthLabel').textContent = `${MONTH_NAMES[month]} ${year}`;

    // First day of month (0=Sun … 6=Sat → convert to Mon-based 0-6)
    const firstDate = new Date(year, month, 1);
    const firstDow  = (firstDate.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Compute month totals
    const monthStart = new Date(year, month, 1);
    const monthEnd   = new Date(year, month, daysInMonth);
    const { totalPnl: mPnl, tradingDays: mDays } = aggregateRange(monthStart, monthEnd);

    // Update summary pills
    const pnlEl = dom('jcalTotalPnl');
    pnlEl.textContent = mDays > 0 ? formatPnl(mPnl) : '₹0';
    pnlEl.className = 'jcal-pill-value ' +
      (mPnl > 0 ? 'jcal-pill-profit' : mPnl < 0 ? 'jcal-pill-loss' : 'jcal-pill-neutral');
    dom('jcalTradingDays').textContent = mDays;

    // Build grid cells
    const grid = dom('jcalGrid');
    grid.innerHTML = '';

    const todayKey = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
    const totalCells = firstDow + daysInMonth;
    const rows = Math.ceil(totalCells / 7);

    for (let cell = 0; cell < rows * 7; cell++) {
      const dayNum = cell - firstDow + 1;
      const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const cellDate = isCurrentMonth ? new Date(year, month, dayNum) : null;
      const cellDow  = cell % 7; // 0=Mon … 6=Sun
      const isWeekend = cellDow >= 5;

      const key = isCurrentMonth ? isoDate(year, month, dayNum) : null;
      const data = key && TRADE_DATA[key];
      const isToday = key === todayKey;

      const div = document.createElement('button');
      div.className = [
        'jcal-day',
        !isCurrentMonth ? 'jcal-day-empty' : '',
        isWeekend && isCurrentMonth ? 'jcal-day-weekend' : '',
        isToday ? 'jcal-day-today' : '',
        data ? (data.pnl >= 0 ? 'jcal-day-profit' : 'jcal-day-loss') : '',
      ].filter(Boolean).join(' ');

      div.setAttribute('type', 'button');
      if (isCurrentMonth) {
        div.setAttribute('data-date', key);
        div.setAttribute('aria-label',
          `${dayNum} ${MONTH_NAMES[month]} ${year}${data ? ` · ${data.trades} trade${data.trades > 1 ? 's' : ''} · ${formatPnl(data.pnl)}` : ''}`
        );
      } else {
        div.setAttribute('aria-hidden', 'true');
        div.setAttribute('disabled', 'true');
      }

      if (isCurrentMonth) {
        div.innerHTML = `
          <span class="jcal-day-num">${dayNum}</span>
          ${data ? `
            <span class="jcal-day-trades">${data.trades} trade${data.trades > 1 ? 's' : ''}</span>
            <span class="jcal-day-pnl ${data.pnl >= 0 ? 'jcal-day-pnl-pos' : 'jcal-day-pnl-neg'}">
              ${formatPnlShort(data.pnl)}
            </span>
          ` : ''}
        `;

        // Click handler — placeholder for future trade entry UI
        div.addEventListener('click', () => onDayClick(key, dayNum, data));
      }

      grid.appendChild(div);
    }

    // Build weekly sidebar
    renderWeeklySidebar(year, month, daysInMonth);

    // Refresh the performance chart whenever the calendar re-renders
    if (typeof window.renderPerformanceChart === 'function') {
      window.renderPerformanceChart();
    }
  }

  /* ----------------------------------------------------------
     renderWeeklySidebar — one card per ISO week that overlaps
     the current month.
  ---------------------------------------------------------- */
  function renderWeeklySidebar(year, month, daysInMonth) {
    const list = dom('jcalWeeksList');
    list.innerHTML = '';

    const seen = new Set();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const { start, end } = weekBounds(date);
      const key = start.toISOString().slice(0, 10);
      if (seen.has(key)) continue;
      seen.add(key);

      // Clamp to month boundaries for display
      const dispStart = start.getMonth() === month ? start : new Date(year, month, 1);
      const dispEnd   = end.getMonth()   === month ? end   : new Date(year, month, daysInMonth);

      const { totalPnl, tradingDays } = aggregateRange(dispStart, dispEnd);

      const fmtDate = (dt) => `${dt.getDate()} ${MONTH_NAMES[dt.getMonth()].slice(0, 3)}`;

      const card = document.createElement('div');
      card.className = 'jcal-week-card';
      card.innerHTML = `
        <div class="jcal-week-range">${fmtDate(dispStart)} – ${fmtDate(dispEnd)}</div>
        <div class="jcal-week-pnl ${totalPnl >= 0 ? 'jcal-week-profit' : 'jcal-week-loss'}">
          ${tradingDays > 0 ? formatPnl(totalPnl) : '—'}
        </div>
        <div class="jcal-week-meta">
          ${tradingDays} trading day${tradingDays !== 1 ? 's' : ''}
        </div>
      `;
      list.appendChild(card);
    }
  }

  /* ----------------------------------------------------------
     Day click handler — opens the Add Trade form
  ---------------------------------------------------------- */
  function onDayClick(dateKey) {
    showTradeForm(dateKey);
  }

  /* ----------------------------------------------------------
     Trade Form — state & helpers
  ---------------------------------------------------------- */
  let _formDateKey = null;   // currently-open date
  let _selectedOutcome = null;
  const _selectedPsychTags = new Set();

  const MONTH_NAMES_FULL = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  function parseDateKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  }

  function formatDateLabel(key) {
    const { year, month, day } = parseDateKey(key);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const date = new Date(year, month, day);
    return `${days[date.getDay()]}, ${day} ${MONTH_NAMES_FULL[month]} ${year}`;
  }

  /* ------ Auto-compute Risk Ratio from Entry / SL / TP ------ */
  function updateRR() {
    const entry = parseFloat(dom('jtfEntry').value);
    const sl    = parseFloat(dom('jtfSL').value);
    const tp    = parseFloat(dom('jtfTP').value);
    const rrEl  = dom('jtfRR');
    if (entry > 0 && sl > 0 && tp > 0 && Math.abs(entry - sl) > 0) {
      const risk   = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      rrEl.value = (reward / risk).toFixed(2);
    } else {
      rrEl.value = '';
    }
  }

  /* ------ Screenshot preview + AI auto-fill ------ */
  function initScreenshotPreview() {
    const input     = dom('jtfScreenshot');
    const preview   = dom('jtfPreviewImg');
    const idle      = dom('jtfUploadIdle');
    const removeBtn = dom('jtfRemoveImg');
    const zone      = dom('jtfUploadZone');

    // ── AI banner state helpers ──────────────────────────────
    const banner   = dom('jtfAiBanner');
    const aiLoad   = dom('jtfAiLoading');
    const aiPoor   = dom('jtfAiPoor');
    const aiErr    = dom('jtfAiError');
    const aiRes    = dom('jtfAiResults');

    function showBannerState(state) {
      // state: 'loading' | 'poor' | 'error' | 'results' | 'hidden'
      banner.hidden  = state === 'hidden';
      aiLoad.hidden  = state !== 'loading';
      aiPoor.hidden  = state !== 'poor';
      aiErr.hidden   = state !== 'error';
      aiRes.hidden   = state !== 'results';
    }

    // Dismiss results banner
    const dismissBtn = dom('jtfAiDismiss');
    if (dismissBtn) dismissBtn.addEventListener('click', () => showBannerState('hidden'));

    // ── API key modal ────────────────────────────────────────
    const API_KEY_STORAGE = 'riskloop_gemini_key';
    function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }

    const cfgBtn       = dom('jtfAiCfgBtn');
    const apiModal     = dom('jtfApiModal');
    const apiKeyInput  = dom('jtfApiKeyInput');
    const apiSaveBtn   = dom('jtfApiSaveBtn');
    const apiCancelBtn = dom('jtfApiCancelBtn');
    const apiClose     = dom('jtfApiModalClose');

    function openApiModal() {
      if (apiKeyInput) apiKeyInput.value = getApiKey();
      if (apiModal)    apiModal.hidden = false;
    }
    function closeApiModal() {
      if (apiModal) apiModal.hidden = true;
    }

    if (cfgBtn)       cfgBtn.addEventListener('click', openApiModal);
    if (apiClose)     apiClose.addEventListener('click', closeApiModal);
    if (apiCancelBtn) apiCancelBtn.addEventListener('click', closeApiModal);
    if (apiSaveBtn) {
      apiSaveBtn.addEventListener('click', () => {
        const key = apiKeyInput ? apiKeyInput.value.trim() : '';
        if (key) {
          localStorage.setItem(API_KEY_STORAGE, key);
          closeApiModal();
          // If a preview is already showing, re-run analysis
          if (preview && !preview.hidden && preview.src) {
            runAiAnalysis(preview.src);
          }
        } else {
          localStorage.removeItem(API_KEY_STORAGE);
          closeApiModal();
        }
      });
    }
    // Close modal on overlay click
    if (apiModal) {
      apiModal.addEventListener('click', (e) => {
        if (e.target === apiModal) closeApiModal();
      });
    }

    // ── AI field mapping ─────────────────────────────────────
    // Maps Gemini JSON keys → { fieldId, label, applyFn }
    const FIELD_MAP = {
      symbol:    { label: 'Symbol',      apply: v => { dom('jtfSymbol').value = v; } },
      setup:     { label: 'Setup',       apply: v => { dom('jtfSetup').value  = v; } },
      entry:     { label: 'Entry',       apply: v => { dom('jtfEntry').value  = v; updateRR(); } },
      stop_loss: { label: 'Stop Loss',   apply: v => { dom('jtfSL').value     = v; updateRR(); } },
      take_profit:{ label: 'Take Profit',apply: v => { dom('jtfTP').value     = v; updateRR(); } },
      direction: {
        label: 'Direction',
        apply: v => {
          const notes = dom('jtfNotes');
          const dir   = String(v).toUpperCase();
          if (notes && !notes.value) notes.value = `Direction: ${dir}`;
        }
      },
      outcome: {
        label: 'Outcome',
        apply: v => {
          const val = String(v).toLowerCase();
          const map = { win: 'Win', loss: 'Loss', be: 'BE', 'break even': 'BE' };
          const key = map[val];
          if (key) {
            const btn = dom(`jtfOutcome${key}`);
            if (btn) btn.click();
          }
        }
      },
    };

    // ── Run analysis via Gemini Vision ───────────────────────
    async function runAiAnalysis(dataUrl) {
      const apiKey = getApiKey();
      if (!apiKey) {
        dom('jtfAiErrorMsg').textContent = 'Add your Gemini API key to enable auto-fill.';
        showBannerState('error');
        return;
      }

      showBannerState('loading');

      // Strip the data URL prefix to get raw base64
      const base64 = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/png';

      const prompt = `You are a trading chart analyst. Carefully examine this TradingView chart screenshot and extract trade information.

Return ONLY valid JSON with these exact keys (omit any key you cannot confidently identify — never guess):
{
  "symbol": "instrument ticker or name visible on chart",
  "entry": numeric_price_only,
  "stop_loss": numeric_price_only,
  "take_profit": numeric_price_only,
  "direction": "BUY or SELL",
  "outcome": "WIN or LOSS or BE (if trade result is visible)",
  "setup": "brief description of visible pattern or setup",
  "quality": "GOOD or POOR (image clarity for extraction)",
  "confidence": {
    "symbol": 0-100,
    "entry": 0-100,
    "stop_loss": 0-100,
    "take_profit": 0-100,
    "direction": 0-100,
    "outcome": 0-100,
    "setup": 0-100
  }
}

Rules:
- Only include a field if confidence >= 60
- Use numeric values only for prices (no currency symbols, no commas)
- If quality is POOR, return only {"quality":"POOR"}
- Return raw JSON only, no markdown, no explanation`;

      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: base64 } }
                ]
              }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
            })
          }
        );

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({}));
          const msg = errBody?.error?.message || `API error ${resp.status}`;
          if (resp.status === 400 || resp.status === 403) {
            dom('jtfAiErrorMsg').textContent = 'Invalid or expired API key. Click Configure to update.';
          } else {
            dom('jtfAiErrorMsg').textContent = msg;
          }
          showBannerState('error');
          return;
        }

        const data = await resp.json();
        const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON — strip any markdown fences
        const jsonStr = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        let parsed;
        try { parsed = JSON.parse(jsonStr); }
        catch { showBannerState('poor'); return; }

        if (!parsed || parsed.quality === 'POOR' || Object.keys(parsed).length === 0) {
          showBannerState('poor');
          return;
        }

        // Apply fields and build confidence chips
        const confidence = parsed.confidence || {};
        const chips = dom('jtfAiChips');
        if (chips) chips.innerHTML = '';
        let filled = 0;

        Object.entries(FIELD_MAP).forEach(([key, cfg]) => {
          const val  = parsed[key];
          const conf = confidence[key] ?? 100;
          if (val === undefined || val === null || val === '') return;
          if (conf < 60) return;

          try { cfg.apply(String(val).trim()); } catch(_) { return; }

          filled++;
          if (chips) {
            const chip = document.createElement('div');
            chip.className = 'jtf-ai-chip';
            const tier = conf >= 90 ? 'high' : conf >= 75 ? 'mid' : 'low';
            chip.innerHTML = `
              <span class="jtf-ai-chip-label">${cfg.label}</span>
              <span class="jtf-ai-chip-val">${String(val).trim()}</span>
              <span class="jtf-ai-conf jtf-ai-conf-${tier}">${conf}%</span>`;
            chips.appendChild(chip);
          }
        });

        if (filled === 0) { showBannerState('poor'); return; }

        const countEl = dom('jtfAiFieldCount');
        if (countEl) countEl.textContent = filled;
        showBannerState('results');

      } catch (err) {
        dom('jtfAiErrorMsg').textContent = err.message || 'Network error. Check your connection.';
        showBannerState('error');
      }
    }

    // ── Preview + trigger analysis ───────────────────────────
    function clearPreview() {
      preview.hidden = true;
      preview.src    = '';
      idle.hidden    = false;
      removeBtn.hidden = true;
      input.value    = '';
      showBannerState('hidden');
    }

    function loadFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src    = e.target.result;
        preview.hidden = false;
        idle.hidden    = true;
        removeBtn.hidden = false;
        runAiAnalysis(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    input.addEventListener('change', () => loadFile(input.files[0]));
    removeBtn.addEventListener('click', clearPreview);

    // Drag-and-drop
    zone.addEventListener('dragover',  (e) => { e.preventDefault(); zone.classList.add('jtf-upload-drag'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('jtf-upload-drag'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('jtf-upload-drag');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        loadFile(file);
      }
    });
  }

  /* ------ Outcome buttons ------ */
  function initOutcomeBtns() {
    ['Win', 'Loss', 'BE'].forEach(val => {
      const btn = dom(`jtfOutcome${val}`);
      if (!btn) return;
      btn.addEventListener('click', () => {
        _selectedOutcome = btn.dataset.val;
        document.querySelectorAll('.jtf-outcome-btn').forEach(b =>
          b.classList.toggle('jtf-outcome-active', b === btn)
        );
        dom('jtfOutcomeErr').hidden = true;
      });
    });
  }

  /* ------ Psychology tag toggles ------ */
  function initPsychTags() {
    document.querySelectorAll('.jtf-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        if (_selectedPsychTags.has(tag)) {
          _selectedPsychTags.delete(tag);
          btn.classList.remove('jtf-tag-active');
        } else {
          _selectedPsychTags.add(tag);
          btn.classList.add('jtf-tag-active');
        }
      });
    });
  }

  /* ------ Validation ------ */
  function showFieldErr(id, msg) {
    const el = dom(id);
    el.textContent = msg;
    el.hidden = false;
  }
  function clearFieldErr(id) { dom(id).hidden = true; }

  function validateForm() {
    let valid = true;
    ['jtfSymbolErr','jtfSetupErr','jtfEntryErr','jtfSLErr','jtfTPErr','jtfPnlErr','jtfOutcomeErr']
      .forEach(id => clearFieldErr(id));

    if (!dom('jtfSymbol').value.trim()) {
      showFieldErr('jtfSymbolErr', 'Enter a symbol.'); valid = false;
    }
    if (!dom('jtfSetup').value.trim()) {
      showFieldErr('jtfSetupErr', 'Enter a trade setup.'); valid = false;
    }
    const entry = parseFloat(dom('jtfEntry').value);
    if (!entry || entry <= 0) {
      showFieldErr('jtfEntryErr', 'Enter a valid entry price.'); valid = false;
    }
    const sl = parseFloat(dom('jtfSL').value);
    if (!sl || sl <= 0) {
      showFieldErr('jtfSLErr', 'Enter a valid stop loss.'); valid = false;
    }
    const tp = parseFloat(dom('jtfTP').value);
    if (!tp || tp <= 0) {
      showFieldErr('jtfTPErr', 'Enter a valid take profit.'); valid = false;
    }
    const pnl = dom('jtfPnl').value.trim();
    if (pnl === '' || isNaN(parseFloat(pnl))) {
      showFieldErr('jtfPnlErr', 'Enter the realised P&L.'); valid = false;
    }
    if (!_selectedOutcome) {
      showFieldErr('jtfOutcomeErr', 'Select an outcome.'); valid = false;
    }
    return valid;
  }

  /* ------ Reset form to blank state ------ */
  function resetForm() {
    ['jtfSymbol','jtfEntry','jtfSL','jtfTP','jtfPnl','jtfMistakes','jtfNotes'].forEach(id => {
      const el = dom(id);
      if (el) el.value = '';
    });
    dom('jtfSetup').value = '';
    dom('jtfRR').value = '';
    _selectedOutcome = null;
    _selectedPsychTags.clear();
    document.querySelectorAll('.jtf-outcome-btn').forEach(b => b.classList.remove('jtf-outcome-active'));
    document.querySelectorAll('.jtf-tag-btn').forEach(b => b.classList.remove('jtf-tag-active'));
    // Reset screenshot
    dom('jtfPreviewImg').hidden = true;
    dom('jtfPreviewImg').src = '';
    dom('jtfUploadIdle').hidden = false;
    dom('jtfRemoveImg').hidden = true;
    dom('jtfScreenshot').value = '';
    // Hide AI banner
    const banner = dom('jtfAiBanner');
    if (banner) banner.hidden = true;
    // Clear errors
    ['jtfSymbolErr','jtfSetupErr','jtfEntryErr','jtfSLErr','jtfTPErr','jtfPnlErr','jtfOutcomeErr']
      .forEach(id => clearFieldErr(id));
  }

  /* ------ Save handler ------ */
  function saveTradeEntry() {
    if (!validateForm()) return;

    const pnl    = parseFloat(dom('jtfPnl').value);
    const key    = _formDateKey;
    const existing = TRADE_DATA[key];

    if (existing) {
      // Append to existing day
      existing.trades += 1;
      existing.pnl    += pnl;
    } else {
      TRADE_DATA[key] = { trades: 1, pnl };
    }

    // Navigate back to calendar, re-render so the day cell updates
    showCalendarFromForm();
  }

  /* ----------------------------------------------------------
     View switching — trade form
  ---------------------------------------------------------- */
  function showTradeForm(dateKey) {
    _formDateKey = dateKey;
    resetForm();
    dom('jtfDateLabel').textContent = formatDateLabel(dateKey);
    dom('journalCalendar').hidden   = true;
    dom('journalTradeForm').hidden  = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showCalendarFromForm() {
    dom('journalTradeForm').hidden = true;
    dom('journalCalendar').hidden  = false;
    renderCalendar();   // renderCalendar now also calls renderPerformanceChart()
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ----------------------------------------------------------
     View switching
  ---------------------------------------------------------- */
  function showCalendar() {
    dom('journalDashboard').hidden = true;
    dom('journalCalendar').hidden  = false;
    renderCalendar();   // renderCalendar already calls renderPerformanceChart()
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showDashboard() {
    dom('journalCalendar').hidden   = true;
    dom('journalTradeForm').hidden  = true;
    dom('journalDashboard').hidden  = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ----------------------------------------------------------
     Wire up buttons once DOM is ready
  ---------------------------------------------------------- */
  function initJournalCalendar() {
    // "Add Trade Note" button on dashboard hero card
    const addBtn = document.querySelector('#journalDashboard .jbtn-primary');
    if (addBtn) addBtn.addEventListener('click', showCalendar);

    // Back button in calendar header
    const backBtn = dom('jcalBackBtn');
    if (backBtn) backBtn.addEventListener('click', showDashboard);

    // Trade form — Cancel and Save
    const cancelBtn = dom('jtfCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', showCalendarFromForm);

    const saveBtn = dom('jtfSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveTradeEntry);

    // RR auto-compute
    ['jtfEntry', 'jtfSL', 'jtfTP'].forEach(id => {
      dom(id).addEventListener('input', updateRR);
    });

    // Screenshot, outcome buttons, psych tags
    initScreenshotPreview();
    initOutcomeBtns();
    initPsychTags();

    // Month navigation
    dom('jcalPrevBtn').addEventListener('click', () => {
      calState.month--;
      if (calState.month < 0) { calState.month = 11; calState.year--; }
      renderCalendar();
    });

    dom('jcalNextBtn').addEventListener('click', () => {
      calState.month++;
      if (calState.month > 11) { calState.month = 0; calState.year++; }
      renderCalendar();
    });

    dom('jcalTodayBtn').addEventListener('click', () => {
      calState.year  = today.getFullYear();
      calState.month = today.getMonth();
      renderCalendar();
    });

    // Reset to dashboard whenever the user navigates away from #journal
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.slice(1);
      if (page !== 'journal') {
        dom('journalTradeForm').hidden = true;
        showDashboard();
      }
    });
  }

  // Run after existing initRouting() has fired
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJournalCalendar);
  } else {
    initJournalCalendar();
  }

}());


/* ============================================================
   PERFORMANCE CHART
   Cumulative Account Balance line chart.
   Data source: window.__rlTradeData (published by journal IIFE).
   Formula: balance[n] = balance[n-1] + pnl[n],  base = ₹5,00,000.
   Triggered automatically by renderCalendar() on every change.
   ============================================================ */
(function () {

  /* ── Config ─────────────────────────────────────────────── */
  const ACCOUNT_BASE = 500000;  // ₹5,00,000 starting balance

  /* ── State ──────────────────────────────────────────────── */
  let _from        = null;  // Date | null — filter lower bound
  let _to          = null;  // Date | null — filter upper bound
  let _pts         = [];    // computed chart points
  let _animFrame   = null;

  /* ── Helpers ─────────────────────────────────────────────── */
  function getData()   { return window.__rlTradeData || {}; }

  function parseKey(k) {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function fmtDate(d) {
    const M = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
  }

  function fmtInr(n) {
    const abs = Math.abs(Math.round(n)).toLocaleString('en-IN');
    return (n < 0 ? '−' : '') + '₹' + abs;
  }

  // Resolve a CSS colour to rgba via off-screen canvas (works for any format)
  function toRgba(cssColor, alpha) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d');
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* ── Build chart points ───────────────────────────────────
     1. Sort all TRADE_DATA keys chronologically.
     2. Accumulate pre-range days so the window starts from
        the correct carry-forward balance.
     3. Push one point per trading day inside [_from, _to].
     4. Prepend a "Day 0" baseline anchor.
  ─────────────────────────────────────────────────────────── */
  function buildPoints() {
    const td   = getData();
    const keys = Object.keys(td).sort();

    const eod = new Date(); eod.setHours(23, 59, 59, 999);
    const lo  = _from || null;
    const hi  = _to   || eod;

    // Carry-forward balance for days before the window
    let carry = ACCOUNT_BASE;
    keys.forEach(k => {
      const d = parseKey(k);
      if (lo && d < lo) carry += td[k].pnl;
    });

    const baseBal = carry;
    const result  = [];
    let   running = baseBal;

    keys.forEach(k => {
      const d = parseKey(k);
      if (lo && d < lo) return;
      if (d > hi)       return;
      running += td[k].pnl;
      result.push({ date: d, balance: running, pnl: td[k].pnl });
    });

    // Prepend baseline so the line always has a left anchor
    if (result.length > 0) {
      result.unshift({ date: null, balance: baseBal, pnl: 0 });
    }
    return result;
  }

  /* ── Stats ── */
  function calcStats(pts) {
    if (pts.length < 2) return null;
    const start = pts[0].balance;
    const end   = pts[pts.length - 1].balance;
    const net   = end - start;
    const ret   = ((net / start) * 100).toFixed(2);
    let peak = start, dd = 0;
    pts.forEach(p => {
      if (p.balance > peak) peak = p.balance;
      const cur = peak - p.balance;
      if (cur > dd) dd = cur;
    });
    return { start, end, net, ret, maxDD: dd };
  }

  /* ── Pills ── */
  function setPill(id, text, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className   = 'jperf-pill-value' + (cls ? ' ' + cls : '');
  }

  function updatePills(stats) {
    if (!stats) {
      ['jperfCurBal','jperfNetChange','jperfReturn','jperfDrawdown']
        .forEach(id => setPill(id, '—'));
      return;
    }
    setPill('jperfCurBal',    fmtInr(stats.end));
    setPill('jperfNetChange', (stats.net >= 0 ? '+' : '') + fmtInr(stats.net),
            stats.net >= 0 ? 'jperf-profit' : 'jperf-loss');
    setPill('jperfReturn',    (stats.ret >= 0 ? '+' : '') + stats.ret + '%',
            stats.ret >= 0 ? 'jperf-profit' : 'jperf-loss');
    setPill('jperfDrawdown',  stats.maxDD > 0 ? fmtInr(-stats.maxDD) : '₹0',
            stats.maxDD > 0 ? 'jperf-loss' : '');
  }

  /* ── Draw ─────────────────────────────────────────────────
     Full canvas render. progress 0→1 animates the line draw.
  ─────────────────────────────────────────────────────────── */
  function drawChart(pts, progress) {
    const canvas = document.getElementById('jperfCanvas');
    if (!canvas) return;

    const wrap = canvas.parentElement;
    const dpr  = window.devicePixelRatio || 1;
    const cssW = wrap.clientWidth  || 600;
    const cssH = Math.max(240, Math.min(360, cssW * 0.38));

    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (pts.length < 2) return;

    // Read CSS theme vars
    const cs   = getComputedStyle(document.documentElement);
    const g    = v => cs.getPropertyValue(v).trim();
    const cMut = g('--text-muted') || '#9198B4';
    const cPro = g('--profit')     || '#48B79A';
    const cDng = g('--danger')     || '#E0685A';
    const cSr2 = g('--surface-2')  || '#1E2440';
    const cBg  = g('--bg')         || '#1B2036';

    const profitLine = pts[pts.length - 1].balance >= pts[0].balance;
    const lineClr    = profitLine ? cPro : cDng;

    // Layout
    const PAD = { t: 24, r: 24, b: 52, l: 82 };
    const W   = cssW - PAD.l - PAD.r;
    const H   = cssH - PAD.t - PAD.b;

    const bals = pts.map(p => p.balance);
    const minB = Math.min(...bals);
    const maxB = Math.max(...bals);
    const span = maxB - minB || Math.abs(minB) * 0.1 || 10000;
    const lo   = minB - span * 0.1;
    const hi   = maxB + span * 0.1;
    const yR   = hi - lo;

    const toX = i   => PAD.l + (i / (pts.length - 1)) * W;
    const toY = bal => PAD.t + H - ((bal - lo) / yR) * H;

    // Grid lines + Y labels
    const GRIDS = 5;
    for (let g2 = 0; g2 <= GRIDS; g2++) {
      const frac = g2 / GRIDS;
      const y    = PAD.t + H * frac;
      const val  = hi - yR * frac;

      ctx.save();
      ctx.strokeStyle = cSr2;
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(PAD.l, y);
      ctx.lineTo(PAD.l + W, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle    = cMut;
      ctx.font         = '500 10px Inter, sans-serif';
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(fmtInr(val), PAD.l - 10, y);
      ctx.restore();
    }

    // X-axis date labels (skip baseline at index 0)
    const tradePts = pts.slice(1);
    const xStep    = Math.max(1, Math.floor(tradePts.length / 6));
    ctx.save();
    ctx.fillStyle    = cMut;
    ctx.font         = '500 10px Inter, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    tradePts.forEach((p, idx) => {
      if (idx % xStep !== 0 || !p.date) return;
      const realIdx = idx + 1;
      ctx.fillText(
        `${p.date.getDate()}/${p.date.getMonth() + 1}`,
        toX(realIdx),
        PAD.t + H + 10
      );
    });
    ctx.restore();

    // Animate: draw up to visibleEnd
    const visEnd = Math.max(1, Math.round((pts.length - 1) * progress));

    // Gradient fill
    const grd = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + H);
    grd.addColorStop(0,    toRgba(lineClr, 0.22));
    grd.addColorStop(0.7,  toRgba(lineClr, 0.05));
    grd.addColorStop(1,    toRgba(lineClr, 0));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0].balance));
    for (let i = 1; i <= visEnd; i++) ctx.lineTo(toX(i), toY(pts[i].balance));
    ctx.lineTo(toX(visEnd), PAD.t + H);
    ctx.lineTo(toX(0),      PAD.t + H);
    ctx.closePath();
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();

    // Line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0].balance));
    for (let i = 1; i <= visEnd; i++) ctx.lineTo(toX(i), toY(pts[i].balance));
    ctx.strokeStyle = lineClr;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.restore();

    // Dots
    ctx.save();
    for (let i = 0; i <= visEnd; i++) {
      ctx.beginPath();
      ctx.arc(toX(i), toY(pts[i].balance), i === 0 ? 3 : 4, 0, Math.PI * 2);
      ctx.fillStyle   = lineClr;
      ctx.fill();
      ctx.strokeStyle = cBg;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // Cache for hover handler
    canvas._pts    = pts;
    canvas._PAD    = PAD;
    canvas._W      = W;
    canvas._H      = H;
    canvas._toX    = toX;
    canvas._toY    = toY;
    canvas._lClr   = lineClr;
    canvas._cBg    = cBg;
    canvas._cMut   = cMut;
  }

  /* ── Animate ── */
  function animate(pts) {
    if (_animFrame) cancelAnimationFrame(_animFrame);
    const DUR = 750;
    const t0  = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - t0) / DUR);
      drawChart(pts, 1 - Math.pow(1 - p, 3));  // ease-out cubic
      if (p < 1) _animFrame = requestAnimationFrame(frame);
    }
    _animFrame = requestAnimationFrame(frame);
  }

  /* ── Tooltip ── */
  function showTip(px, py, point, wrap) {
    const tip = document.getElementById('jperfTooltip');
    if (!tip) return;

    const dateEl = document.getElementById('jperfTooltipDate');
    const balEl  = document.getElementById('jperfTooltipBal');
    const pnlEl  = document.getElementById('jperfTooltipPnl');

    if (dateEl) dateEl.textContent = point.date ? fmtDate(point.date) : 'Starting Balance';
    if (balEl)  balEl.textContent  = 'Balance: ' + fmtInr(point.balance);

    if (pnlEl) {
      if (point.pnl) {
        pnlEl.textContent = 'Day P&L: ' + (point.pnl > 0 ? '+' : '') + fmtInr(point.pnl);
        pnlEl.className   = 'jperf-tooltip-pnl ' + (point.pnl >= 0 ? 'jperf-profit' : 'jperf-loss');
        pnlEl.hidden = false;
      } else {
        pnlEl.hidden = true;
      }
    }

    tip.hidden = false;
    const tw = tip.offsetWidth  || 155;
    const th = tip.offsetHeight || 72;
    let left = px + 16;
    let top  = py - th - 14;
    if (left + tw > wrap.clientWidth - 8) left = px - tw - 16;
    if (top < 4) top = py + 14;
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';
  }

  /* ── Hover handler ── */
  function initHover() {
    const canvas = document.getElementById('jperfCanvas');
    if (!canvas) return;

    function onMove(cx, cy) {
      const pts = canvas._pts;
      if (!pts || pts.length < 2) return;

      const rect = canvas.getBoundingClientRect();
      const mx   = cx - rect.left;
      const toX  = canvas._toX;
      const toY  = canvas._toY;
      const PAD  = canvas._PAD;

      let best = 0, bestD = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const d = Math.abs(toX(i) - mx);
        if (d < bestD) { bestD = d; best = i; }
      }

      const p  = pts[best];
      const px = toX(best);
      const py = toY(p.balance);

      drawChart(pts, 1);

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);

      // Vertical guide line
      ctx.strokeStyle = canvas._cMut + '55';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, PAD.t);
      ctx.lineTo(px, PAD.t + canvas._H);
      ctx.stroke();

      // Large highlight dot
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle   = canvas._lClr;
      ctx.fill();
      ctx.strokeStyle = canvas._cBg;
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      showTip(px, py, p, canvas.parentElement);
    }

    canvas.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener('mouseleave', () => {
      const tip = document.getElementById('jperfTooltip');
      if (tip) tip.hidden = true;
      if (_pts.length >= 2) drawChart(_pts, 1);
    });
  }

  /* ── Main render ── */
  function renderPerformanceChart() {
    _pts = buildPoints();

    const emptyEl  = document.getElementById('jperfEmpty');
    const canvasEl = document.getElementById('jperfCanvas');
    if (!emptyEl || !canvasEl) return;

    if (_pts.length < 2) {
      emptyEl.hidden  = false;
      canvasEl.hidden = true;
      updatePills(null);
      return;
    }

    emptyEl.hidden  = true;
    canvasEl.hidden = false;
    updatePills(calcStats(_pts));
    animate(_pts);
  }

  /* ── Pick Date Range popover ── */
  function fmtLabel() {
    if (!_from && !_to) return 'All time';
    const M = ['Jan','Feb','Mar','Apr','May','Jun',
               'Jul','Aug','Sep','Oct','Nov','Dec'];
    const f = d => `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
    if (_from && _to)  return `${f(_from)} → ${f(_to)}`;
    if (_from)         return `From ${f(_from)}`;
    return `Until ${f(_to)}`;
  }

  function initPickControls() {
    const pickBtn   = document.getElementById('jperfPickBtn');
    const popover   = document.getElementById('jperfPickPopover');
    const fromInput = document.getElementById('jperfFrom');
    const toInput   = document.getElementById('jperfTo');
    const applyBtn  = document.getElementById('jperfPickApply');
    const clearBtn  = document.getElementById('jperfPickClear');
    const labelEl   = document.getElementById('jperfPickLabel');
    if (!pickBtn || !popover) return;

    const chevron = () => pickBtn.querySelector('.jperf-pick-chevron');

    pickBtn.addEventListener('click', e => {
      e.stopPropagation();
      const opening = popover.hidden;
      popover.hidden = !opening;
      const ch = chevron();
      if (ch) ch.style.transform = opening ? 'rotate(180deg)' : '';
    });

    document.addEventListener('click', e => {
      if (!popover.hidden && !pickBtn.contains(e.target) && !popover.contains(e.target)) {
        popover.hidden = true;
        const ch = chevron();
        if (ch) ch.style.transform = '';
      }
    });

    applyBtn.addEventListener('click', () => {
      _from = fromInput && fromInput.value ? new Date(fromInput.value + 'T00:00:00') : null;
      _to   = toInput   && toInput.value   ? new Date(toInput.value   + 'T23:59:59') : null;
      if (labelEl) labelEl.textContent = fmtLabel();
      popover.hidden = true;
      const ch = chevron(); if (ch) ch.style.transform = '';
      renderPerformanceChart();
    });

    clearBtn.addEventListener('click', () => {
      _from = null; _to = null;
      if (fromInput) fromInput.value = '';
      if (toInput)   toInput.value   = '';
      if (labelEl)   labelEl.textContent = 'All time';
      popover.hidden = true;
      const ch = chevron(); if (ch) ch.style.transform = '';
      renderPerformanceChart();
    });
  }

  /* ── Resize ── */
  let _resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeT);
    _resizeT = setTimeout(() => {
      if (_pts.length >= 2) drawChart(_pts, 1);
    }, 120);
  });

  /* ── Bootstrap ── */
  window.renderPerformanceChart = renderPerformanceChart;

  function init() {
    initPickControls();
    initHover();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());


/* ============================================================
   FOREX CALCULATOR
   FOREX_DB and CRYPTO_DB are now defined in instruments.js
   (loaded before this file). The const declarations here are
   kept as no-op guards so this file remains valid if loaded
   standalone in a test environment.
   ============================================================ */
if (typeof FOREX_DB === 'undefined') {
  console.warn('instruments.js not loaded — FOREX_DB unavailable');
}
if (typeof CRYPTO_DB === 'undefined') {
  console.warn('instruments.js not loaded — CRYPTO_DB unavailable');
}

/* ============================================================
   SHARED GENERIC CALCULATOR FACTORY
   ============================================================ */
function createGenericCalculator(prefix, db) {
  const g = id => document.getElementById(id);
  const el = {
    instrumentField: g(prefix + 'InstrumentField'),
    comboWrap:       g(prefix + 'ComboWrap'),
    comboInput:      g(prefix + '-instrument-search'),
    comboBadge:      g(prefix + 'ComboBadge'),
    comboChevron:    g(prefix + 'ComboChevron'),
    comboList:       g(prefix + '-instrument-listbox'),
    instrumentError: g(prefix + '-instrument-error'),
    accountWrap:     g(prefix + 'AccountWrap'),
    accountInput:    g(prefix + '-account-size'),
    accountError:    g(prefix + '-account-size-error'),
    riskWrap:        g(prefix + 'RiskWrap'),
    riskInput:       g(prefix + '-risk-pct'),
    riskError:       g(prefix + '-risk-pct-error'),
    stopWrap:        g(prefix + 'StopWrap'),
    stopInput:       g(prefix + '-stop-loss'),
    stopError:       g(prefix + '-stop-loss-error'),
    calcBtn:         g(prefix + 'CalcBtn'),
    resetBtn:        g(prefix + 'ResetBtn'),
    hint:            g(prefix + 'Hint'),
    hintText:        g(prefix + 'HintText'),
    emptyState:      g(prefix + 'EmptyState'),
    ticketContainer: g(prefix + 'TicketContainer'),
  };

  if (!el.comboInput || !el.calcBtn) return;

  const st = {
    instrument: null,
    accountSize: '', riskPct: '', stopLoss: '',
    touched: false, comboOpen: false, query: '', highlight: 0,
  };

  /* ── Helpers ── */
  function usd(n) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(n);
  }
  function roundDp(n, dp) {
    const f = Math.pow(10, dp);
    return Math.round((n + Number.EPSILON) * f) / f;
  }

  /* ── Dynamic stop-loss label + ? tooltip ── */
  function updateStopLabel() {
    const field = el.stopWrap && el.stopWrap.closest('.field');
    const lbl   = field && field.querySelector('.field-label');
    if (!lbl) return;

    const instr = st.instrument;
    const unit  = instr ? instr.stopUnit : null;

    // Unit badge HTML
    const badgeHtml = unit
      ? `<span style="display:inline-flex;align-items:center;font-size:9px;font-weight:700;
            letter-spacing:0.07em;text-transform:uppercase;vertical-align:middle;
            background:rgba(224,169,78,0.13);color:var(--accent);
            border-radius:5px;padding:2px 7px;margin-left:7px;">${unit.toUpperCase()}</span>`
      : '';

    // ? icon — only shown when instrument is selected
    const iconHtml = instr
      ? `<button type="button" class="sl-info-btn" id="${prefix}SlInfoBtn"
            aria-label="Stop-loss unit info" aria-describedby="${prefix}SlTooltip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
          </button>`
      : '';

    lbl.innerHTML = `Stop-loss${badgeHtml}${iconHtml} <span class="req">*</span>`;

    // Build tooltip content
    const tvNote = 'TradingView displays stop-loss in Points. RiskLoop automatically converts Points to Pips based on the selected instrument, so you can enter the value exactly as shown on your TradingView chart.';
    const instrTip = instr && instr.tvTip ? instr.tvTip : '';

    // Upsert tooltip element
    let tip = field.querySelector('.sl-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'sl-tooltip';
      tip.setAttribute('role', 'tooltip');
      tip.id = prefix + 'SlTooltip';
      lbl.style.position = 'relative';
      lbl.appendChild(tip);
    }
    tip.innerHTML = instrTip
      ? `<strong class="sl-tooltip-conversion">${instrTip}</strong><span class="sl-tooltip-note">${tvNote}</span>`
      : `<span class="sl-tooltip-note">${tvNote}</span>`;

    // Wire ? button events (re-query since innerHTML was replaced)
    const btn = lbl.querySelector('.sl-info-btn');
    if (btn) {
      // Toggle on click/tap (works on both desktop and mobile)
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = lbl.classList.toggle('sl-tooltip-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      // Hover on desktop
      btn.addEventListener('mouseenter', () => {
        lbl.classList.add('sl-tooltip-open');
        btn.setAttribute('aria-expanded', 'true');
      });
      btn.addEventListener('mouseleave', e => {
        // Keep open if moving into the tooltip itself
        if (!tip.contains(e.relatedTarget)) {
          lbl.classList.remove('sl-tooltip-open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      tip.addEventListener('mouseleave', () => {
        lbl.classList.remove('sl-tooltip-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    }

    // Close on outside click
    document.addEventListener('click', function closeOnOutside(e) {
      if (!lbl.contains(e.target)) {
        lbl.classList.remove('sl-tooltip-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Helper hint below the input
    let hintEl = field.querySelector('.stop-unit-hint');
    if (!hintEl) {
      hintEl = document.createElement('p');
      hintEl.className = 'stop-unit-hint';
      hintEl.style.cssText = 'font-size:11.5px;color:var(--text-muted);margin:6px 0 0;line-height:1.5;';
      el.stopWrap.insertAdjacentElement('afterend', hintEl);
    }
    if (!unit) { hintEl.hidden = true; return; }
    const examples = {
      pips:               'Enter the stop-loss distance in pips.',
      points:             'Enter the stop-loss distance in points.',
      'price difference': 'Enter the price difference in USD (e.g. 500 for a $500 stop on BTC).',
    };
    hintEl.textContent = examples[unit] || `Measurement: ${unit}.`;
    hintEl.hidden = false;
  }

  /* ── Lot size formula ──────────────────────────────────────
     lots = riskAmount / (stopDistance × pipValuePerLot)
  ─────────────────────────────────────────────────────────── */
  function calcLotSize(instr, accountSize, riskPct, stopLoss) {
    const riskAmount       = roundDp(accountSize * (riskPct / 100), 2);
    const pipValuePerLot   = instr.pipValue;
    const rawLots          = riskAmount / (stopLoss * pipValuePerLot);
    const lots             = roundDp(rawLots, 3);
    const pipValueTrade    = roundDp(lots * pipValuePerLot, 4);
    const actualRisk       = roundDp(lots * stopLoss * pipValuePerLot, 2);
    const unusedRisk       = roundDp(riskAmount - actualRisk, 2);
    const utilisation      = riskAmount > 0 ? roundDp((actualRisk / riskAmount) * 100, 1) : 0;
    return { riskAmount, rawLots, lots, pipValueTrade, actualRisk, unusedRisk, utilisation };
  }

  /* ── Combo ── */
  function filteredInstruments() {
    const q = st.query.trim().toLowerCase();
    if (!q) return db;
    return db.filter(i => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
  }

  function renderCombo() {
    const list = el.comboList;
    if (st.instrument && !st.comboOpen) {
      el.comboInput.value = '';
      el.comboInput.placeholder = st.instrument.symbol;
      el.comboBadge.textContent = st.instrument.type;
      el.comboBadge.hidden = false;
      el.comboChevron.classList.add('flip');
    } else {
      el.comboBadge.hidden = true;
      el.comboChevron.classList.remove('flip');
    }
    el.comboWrap.classList.toggle('combo-open', st.comboOpen);
    el.comboInput.setAttribute('aria-expanded', st.comboOpen ? 'true' : 'false');
    if (!st.comboOpen) { list.hidden = true; return; }
    list.hidden = false;

    const items = filteredInstruments().slice(0, 40);
    if (!items.length) { list.innerHTML = '<li class="combo-empty">No results</li>'; return; }

    list.innerHTML = items.map((item, idx) => `
      <li class="combo-item${idx === st.highlight ? ' combo-item-active' : ''}"
          role="option" data-symbol="${item.symbol}" tabindex="-1">
        <div class="combo-item-main">
          <span class="combo-item-symbol">${item.symbol}</span>
          <span class="combo-item-name">${item.name}</span>
        </div>
        <div class="combo-item-meta">
          <span class="tag">${item.type}</span>
        </div>
      </li>`).join('');

    list.querySelectorAll('.combo-item').forEach(li => {
      li.addEventListener('mousedown', e => { e.preventDefault(); selectInstrument(li.dataset.symbol); });
    });
  }

  function selectInstrument(symbol) {
    const item = db.find(i => i.symbol === symbol);
    if (!item) return;
    st.instrument = item;
    st.query = ''; st.comboOpen = false;
    el.comboInput.value = '';
    renderCombo();
    updateStopLabel();
    renderErrors();
    renderHint();
  }

  /* ── Combo events ── */
  el.comboInput.addEventListener('focus', () => { st.comboOpen = true; renderCombo(); });
  el.comboInput.addEventListener('input', e => {
    st.query = e.target.value;
    st.highlight = 0;
    st.comboOpen = true;
    renderCombo();
  });
  el.comboInput.addEventListener('keydown', e => {
    const items = filteredInstruments().slice(0, 40);
    if (!st.comboOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      st.comboOpen = true; renderCombo(); return;
    }
    if (!st.comboOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); st.highlight = Math.min(st.highlight+1, items.length-1); renderCombo(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); st.highlight = Math.max(st.highlight-1, 0); renderCombo(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[st.highlight]) selectInstrument(items[st.highlight].symbol); }
    else if (e.key === 'Escape') { st.comboOpen = false; renderCombo(); }
  });
  document.addEventListener('mousedown', e => {
    if (el.instrumentField && !el.instrumentField.contains(e.target)) {
      st.comboOpen = false; renderCombo();
    }
  });

  /* ── Validation ── */
  function validate() {
    const errors = {};
    if (!st.instrument) errors.instrument = 'Select an instrument to continue.';
    if (!st.accountSize || Number(st.accountSize) <= 0) errors.accountSize = 'Enter a valid account size.';
    if (!st.riskPct || Number(st.riskPct) <= 0 || Number(st.riskPct) > 100)
      errors.riskPct = 'Enter a risk % between 0 and 100.';
    if (!st.stopLoss || Number(st.stopLoss) <= 0) errors.stopLoss = 'Enter a valid stop-loss.';
    return errors;
  }

  function setErr(wrap, errEl, msg) {
    if (msg) { errEl.innerHTML = msg; errEl.hidden = false; wrap.classList.add('field-error'); }
    else      { errEl.innerHTML = ''; errEl.hidden = true;  wrap.classList.remove('field-error'); }
  }

  function renderErrors() {
    if (!st.touched) return;
    const e = validate();
    setErr(el.comboWrap,    el.instrumentError, e.instrument);
    setErr(el.accountWrap,  el.accountError,    e.accountSize);
    setErr(el.riskWrap,     el.riskError,       e.riskPct);
    setErr(el.stopWrap,     el.stopError,       e.stopLoss);
  }

  function renderHint() {
    if (st.instrument) {
      el.hint.hidden = false;
      el.hintText.textContent = st.instrument.symbol + ' · ' + st.instrument.name + ' · ' + st.instrument.exchange;
    } else { el.hint.hidden = true; }
  }

  /* ── Input events ── */
  el.accountInput.addEventListener('input', e => { st.accountSize = e.target.value; renderErrors(); });
  el.riskInput.addEventListener('input',    e => { st.riskPct     = e.target.value; renderErrors(); });
  el.stopInput.addEventListener('input',    e => { st.stopLoss    = e.target.value; renderErrors(); });

  /* ── Calculate ── */
  el.calcBtn.addEventListener('click', () => {
    st.touched = true;
    const errors = validate();
    renderErrors();
    if (Object.keys(errors).length) { clearResult(); return; }

    const instr      = st.instrument;
    const accountSize = Number(st.accountSize);
    const riskPct    = Number(st.riskPct);
    const stopLoss   = Number(st.stopLoss);
    const minLot     = instr.minLot;
    const unit       = instr.stopUnit;

    const { riskAmount, rawLots, lots, pipValueTrade, actualRisk, unusedRisk, utilisation } =
      calcLotSize(instr, accountSize, riskPct, stopLoss);

    el.emptyState.hidden = true;

    /* Below minimum — helpful warning, not a hard block */
    if (lots < minLot) {
      el.ticketContainer.innerHTML = `
        <div class="ticket ticket-blocked">
          <div class="ticket-head">${ICONS.shield}<span>Below minimum lot size</span></div>
          <p class="blocked-msg">
            Calculated size is <strong>${rawLots.toFixed(4)} lots</strong>,
            below the broker minimum of <strong>${minLot} lots</strong>.
          </p>
          <p class="blocked-msg" style="margin-top:6px;">To make this trade viable:</p>
          <ul style="margin:4px 0 10px 18px;font-size:12.5px;color:var(--text-muted);line-height:1.9;">
            <li>Increase risk % (currently ${riskPct}%)</li>
            <li>Reduce stop-loss distance (currently ${stopLoss} ${unit})</li>
            <li>Use a larger account size</li>
          </ul>
          <div class="blocked-meta">
            <span>Money at risk: ${usd(riskAmount)}</span>
            <span>Calculated: ${rawLots.toFixed(4)} lots</span>
            <span>Minimum: ${minLot} lots</span>
          </div>
        </div>`;
      return;
    }

    const lotsDisplay = lots < 0.1
      ? lots.toFixed(3)
      : lots < 1 ? lots.toFixed(2) : lots.toFixed(2);
    const valueLabel = unit === 'pips' ? 'Pip value (trade)' : 'Point value (trade)';

    el.ticketContainer.innerHTML = `
      <div class="ticket">
        <div class="ticket-head">
          <div class="ticket-head-left">${ICONS.shield}<span>Position Summary</span></div>
        </div>
        <div class="ticket-instrument">
          <span class="ticket-symbol">${instr.symbol}</span>
          <span class="ticket-exchange">${instr.name} · ${instr.type}</span>
        </div>
        <div class="ticket-hero">
          <span class="ticket-hero-label">Lot Size</span>
          <span class="ticket-hero-value">${lotsDisplay}</span>
          <span class="ticket-hero-sub">${stopLoss} ${unit} stop &nbsp;·&nbsp; ${usd(pipValueTrade)}/${unit}</span>
        </div>
        <div class="gauge">
          <div class="gauge-track"><div class="gauge-fill" style="width:${Math.min(utilisation,100)}%"></div></div>
          <div class="gauge-labels">
            <span><span class="dot dot-used"></span>At risk ${usd(actualRisk)}</span>
            <span><span class="dot dot-unused"></span>Unused ${usd(unusedRisk)}</span>
          </div>
        </div>
        <div class="perforation" role="presentation"></div>
        <dl class="ticket-rows">
          <div class="ticket-row"><dt>Money at risk</dt><dd>${usd(riskAmount)}</dd></div>
          <div class="ticket-row"><dt>${valueLabel}</dt><dd>${usd(pipValueTrade)}/${unit}</dd></div>
          <div class="ticket-row"><dt>Lot size</dt><dd>${lotsDisplay} lots</dd></div>
        </dl>
      </div>`;
  });

  function clearResult() {
    el.ticketContainer.innerHTML = '';
    el.emptyState.hidden = false;
  }

  /* ── Reset ── */
  el.resetBtn.addEventListener('click', () => {
    Object.assign(st, { instrument:null, accountSize:'', riskPct:'', stopLoss:'',
      touched:false, comboOpen:false, query:'', highlight:0 });
    el.comboInput.value = '';
    el.accountInput.value = '';
    el.riskInput.value = '';
    el.stopInput.value = '';
    ['instrumentError','accountError','riskError','stopError'].forEach(k => {
      if (el[k]) { el[k].innerHTML = ''; el[k].hidden = true; }
    });
    [el.comboWrap, el.accountWrap, el.riskWrap, el.stopWrap].forEach(w => {
      if (w) w.classList.remove('field-error');
    });
    updateStopLabel();
    renderCombo();
    renderHint();
    clearResult();
  });

  /* ── Init ── */
  renderCombo();
  renderHint();
  updateStopLabel();
}

/* Wire up both calculators */
createGenericCalculator('forex',  FOREX_DB);
createGenericCalculator('crypto', CRYPTO_DB);


/* ============================================================
   INDIAN MARKET SESSIONS TIMELINE  v2
   Professional horizontal timeline, RiskLoop dark theme.
   ============================================================ */
(function () {
  'use strict';

  /* ── time helpers ── */
  const toMin = (h, m) => h * 60 + m;

  function nowIST() {
    const d = new Date();
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 5.5 * 3600000);
  }

  function todayISO() {
    const d = nowIST();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function fmtHHMM(min) {
    const h = Math.floor(min / 60), m = min % 60;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${h%12||12}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  function fmtDur(min) {
    if (min <= 0) return '—';
    const h = Math.floor(min/60), m = min%60;
    return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
  }

  function nextWeekdayLabel(dow) {
    const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    // dow 0=Sun … 6=Sat; find next Mon–Fri
    let next = dow;
    do { next = (next + 1) % 7; } while (next === 0 || next === 6);
    return names[next];
  }

  /* ── data ── */
  const NSE_HOLIDAYS = [
    '2026-01-26','2026-03-14','2026-03-30','2026-04-02','2026-04-06',
    '2026-04-10','2026-04-21','2026-05-01','2026-06-28','2026-07-28',
    '2026-08-15','2026-09-16','2026-10-02','2026-10-24','2026-11-12',
    '2026-11-13','2026-11-30','2026-12-25',
  ];

  /* Indian Sessions — open/close in minutes from midnight IST */
  const INDIAN_SESSIONS = [
    { id:'preopen', label:'Pre-Open',       open: toMin(9,0),  close: toMin(9,15),  color:'#8B5CF6', mcx:false },
    { id:'equity',  label:'NSE / BSE',      open: toMin(9,15), close: toMin(15,30), color:'#3B82F6', mcx:false },
    { id:'fo',      label:'Equity F&O',     open: toMin(9,15), close: toMin(15,40), color:'#06B6D4', mcx:false },
    { id:'mcx',     label:'MCX Commodity',  open: toMin(9,0),  close: toMin(23,30), color:'#F59E0B', mcx:true  },
  ];

  /* Forex Sessions — open/close in minutes from midnight UTC */
  const FOREX_SESSIONS = [
    { id:'sydney',    label:'Sydney',       open: toMin(22,0),  close: toMin(7,0),   color:'#10B981', forex:true },
    { id:'tokyo',     label:'Tokyo',        open: toMin(0,0),   close: toMin(9,0),   color:'#8B5CF6', forex:true },
    { id:'london',    label:'London',       open: toMin(8,0),   close: toMin(17,0),  color:'#3B82F6', forex:true },
    { id:'newyork',   label:'New York',     open: toMin(13,0),  close: toMin(22,0),  color:'#F59E0B', forex:true },
  ];

  /* Get active sessions based on market view */
  function getActiveSessions() {
    const marketView = window.currentMarketView || 'india';
    return marketView === 'forex' ? FOREX_SESSIONS : INDIAN_SESSIONS;
  }

  /* Timeline window: varies based on market */
  let T_START, T_END, T_SPAN, TICKS;

  function initTimelineParams() {
    const marketView = window.currentMarketView || 'india';
    
    if (marketView === 'forex') {
      /* Forex: 24-hour UTC timeline */
      T_START = toMin(0, 0);
      T_END = toMin(24, 0);
      T_SPAN = T_END - T_START;
      
      /* Axis ticks every 3 hours for 24h view */
      TICKS = [];
      for (let h = 0; h <= 24; h += 3) {
        TICKS.push({ min: toMin(h, 0), label: `${h}:00 UTC` });
      }
    } else {
      /* India: 9:00 AM – 11:30 PM IST */
      T_START = toMin(9, 0);
      T_END = toMin(23, 30);
      T_SPAN = T_END - T_START;
      
      /* Axis ticks (every hour 9–23, plus 23:30) */
      TICKS = [];
      for (let h = 9; h <= 23; h++) {
        const hour12 = h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        TICKS.push({ min: toMin(h, 0), label: `${hour12} ${ampm}` });
      }
      TICKS.push({ min: toMin(23, 30), label: '11:30 PM' });
    }
  }

  /* percent of timeline for a given minute */
  const pct = min => Math.max(0, Math.min(100, (min - T_START) / T_SPAN * 100));

  /* ── status ── */
  function getStatus(session, nowMin, isHoliday, isSat, isSun) {
    // Forex sessions ignore holidays and operate 24/5
    if (session.forex) {
      // Forex is off on weekends only
      if (isSat || isSun) return 'off';
      
      // Handle sessions that cross midnight (like Sydney 22:00-07:00)
      if (session.open > session.close) {
        // Session crosses midnight
        if (nowMin >= session.open || nowMin < session.close) return 'open';
        if (nowMin < session.open && session.open - nowMin <= 60) return 'soon';
        return 'closed';
      }
      
      // Normal session
      if (nowMin >= session.open && nowMin < session.close) return 'open';
      if (nowMin < session.open && session.open - nowMin <= 60) return 'soon';
      return 'closed';
    }
    
    // Indian sessions
    const equityOff = isHoliday || isSat || isSun;
    const mcxOff    = isHoliday || isSun;

    if (!session.mcx && equityOff) return 'off';
    if ( session.mcx && mcxOff)    return 'off';

    if (nowMin >= session.open && nowMin < session.close) return 'open';
    if (nowMin < session.open && session.open - nowMin <= 15) return 'soon';
    return 'closed';
  }

  /* ── DOM refs ── */
  const $ = id => document.getElementById(id);
  const axisEl   = $('mstAxis');
  const rowsEl   = $('mstRows');
  const needleEl = $('mstNeedle');
  const clockEl  = $('mstClock');
  const dateEl   = $('mstDate');
  const bannerEl = $('mstClosedBanner');
  const banTitleEl = $('mstClosedTitle');
  const banSubEl   = $('mstClosedSub');
  const tipEl    = $('mstTooltip');
  const tipName  = $('mstTipName');
  const tipBadge = $('mstTipBadge');
  const tipOpen  = $('mstTipOpen');
  const tipClose = $('mstTipClose');
  const tipCdLbl = $('mstTipCdLbl');
  const tipCd    = $('mstTipCd');

  if (!axisEl || !rowsEl) return;

  /* ── build static DOM once ── */
  function buildStatic() {
    /* Initialize timeline parameters based on current market view */
    initTimelineParams();
    const SESSIONS = getActiveSessions();
    
    /* Axis ticks */
    axisEl.innerHTML = '';
    TICKS.forEach(t => {
      const span = document.createElement('span');
      span.className = 'mst-tick';
      span.textContent = t.label;
      span.style.left = pct(t.min) + '%';
      axisEl.appendChild(span);
    });

    /* Session rows */
    rowsEl.innerHTML = '';
    SESSIONS.forEach(sess => {
      const row = document.createElement('div');
      row.className = 'mst-row';

      const lbl = document.createElement('div');
      lbl.className = 'mst-row-lbl';
      lbl.textContent = sess.label;

      const track = document.createElement('div');
      track.className = 'mst-track';

      const bar = document.createElement('div');
      bar.className = 'mst-bar';
      bar.id = 'mstBar_' + sess.id;
      bar.style.left    = pct(sess.open)  + '%';
      bar.style.width   = (pct(sess.close) - pct(sess.open)) + '%';
      /* background + glow driven by mst-bar-{status} CSS class, set in update() */

      const barText = document.createElement('span');
      barText.className = 'mst-bar-text';
      barText.textContent = sess.label;

      const dot = document.createElement('div');
      dot.className = 'mst-dot';
      dot.id = 'mstDot_' + sess.id;

      bar.appendChild(barText);
      /* dot lives on the track (not inside bar) so it can extend beyond bar edge */
      dot.style.position = 'absolute';
      track.appendChild(bar);
      track.appendChild(dot);
      row.appendChild(lbl);
      row.appendChild(track);
      rowsEl.appendChild(row);

      /* tooltip events */
      bar.addEventListener('mouseenter', e => showTip(sess, bar, e));
      bar.addEventListener('mousemove',  e => positionTip(bar, e));
      bar.addEventListener('mouseleave', () => { if (tipEl) tipEl.hidden = true; });
      bar.addEventListener('touchstart', e => { e.stopPropagation(); showTip(sess, bar, e); }, { passive:true });
    });

    document.addEventListener('click', () => { if (tipEl) tipEl.hidden = true; });
  }

  /* ── tooltip (TradingView-style positioning) ── */
  function showTip(sess, barEl, e) {
    const ist     = nowIST();
    const nowMin  = ist.getHours()*60 + ist.getMinutes();
    const iso     = todayISO();
    const isHol   = NSE_HOLIDAYS.includes(iso);
    const isSat   = ist.getDay() === 6;
    const isSun   = ist.getDay() === 0;
    const status  = getStatus(sess, nowMin, isHol, isSat, isSun);

    tipName.textContent = sess.label;

    const labels = { open:'OPEN', soon:'OPENING SOON', closed:'CLOSED', off:'MARKET HOLIDAY' };
    const classes = { open:'mst-tip-badge-open', soon:'mst-tip-badge-soon', closed:'mst-tip-badge-closed', off:'mst-tip-badge-off' };
    tipBadge.textContent = labels[status] || status;
    tipBadge.className = 'mst-tip-badge ' + (classes[status] || 'mst-tip-badge-off');

    tipOpen.textContent  = fmtHHMM(sess.open) + ' IST';
    tipClose.textContent = fmtHHMM(sess.close) + ' IST';

    if (status === 'open') {
      tipCdLbl.textContent = 'Closes In';
      tipCd.textContent    = fmtDur(sess.close - nowMin);
    } else if (status === 'soon') {
      tipCdLbl.textContent = 'Opens In';
      tipCd.textContent    = fmtDur(sess.open - nowMin);
    } else {
      tipCdLbl.textContent = '';
      tipCd.textContent    = '—';
    }

    tipEl.hidden = false;
    positionTip(barEl, e);
  }

  function positionTip(barEl, e) {
    if (!tipEl || tipEl.hidden) return;
    const card = $('mstCard');
    if (!card) return;

    // Get card and bar positions
    const cardRect = card.getBoundingClientRect();
    const barRect = barEl.getBoundingClientRect();
    
    // Get tooltip dimensions
    const tw = tipEl.offsetWidth || 220;
    const th = tipEl.offsetHeight || 110;
    
    // Calculate available space in all directions (relative to CARD, not viewport)
    const spaceRight = cardRect.right - barRect.right;
    const spaceLeft = barRect.left - cardRect.left;
    const spaceBelow = cardRect.bottom - barRect.bottom;
    const spaceAbove = barRect.top - cardRect.top;
    
    let lx, ly;
    const gap = 12; // Gap between bar and tooltip
    
    // Strategy 1: Try to position to the RIGHT of the bar (default)
    if (spaceRight >= tw + gap) {
      lx = (barRect.right - cardRect.left) + gap;
      ly = (barRect.top - cardRect.top);
      
      // Adjust vertical position if tooltip would overflow card bottom
      if (ly + th > cardRect.height) {
        ly = cardRect.height - th - 16;
      }
      // Ensure it doesn't go above card top
      if (ly < 16) {
        ly = 16;
      }
    }
    // Strategy 2: If not enough space right, try LEFT
    else if (spaceLeft >= tw + gap) {
      lx = (barRect.left - cardRect.left) - tw - gap;
      ly = (barRect.top - cardRect.top);
      
      // Adjust vertical position if tooltip would overflow card bottom
      if (ly + th > cardRect.height) {
        ly = cardRect.height - th - 16;
      }
      // Ensure it doesn't go above card top
      if (ly < 16) {
        ly = 16;
      }
    }
    // Strategy 3: Fallback to BELOW, but CONSTRAIN to card bounds
    else {
      lx = (barRect.left - cardRect.left);
      ly = (barRect.bottom - cardRect.top) + gap;
      
      // Ensure tooltip doesn't overflow card bottom
      if (ly + th > cardRect.height - 16) {
        // If no space below, try above but ONLY within card
        const lyAbove = (barRect.top - cardRect.top) - th - gap;
        if (lyAbove >= 16) {
          ly = lyAbove;
        } else {
          // Force below but clip to card bounds
          ly = cardRect.height - th - 16;
        }
      }
      
      // Horizontal adjustment within card bounds
      if (lx + tw > cardRect.width - 16) {
        lx = cardRect.width - tw - 16;
      }
      if (lx < 16) {
        lx = 16;
      }
    }
    
    // Final safety: absolutely ensure tooltip stays within card bounds
    if (lx < 0) lx = 16;
    if (ly < 0) ly = 16;
    if (lx + tw > cardRect.width) lx = cardRect.width - tw - 16;
    if (ly + th > cardRect.height) ly = cardRect.height - th - 16;
    
    tipEl.style.left = lx + 'px';
    tipEl.style.top  = ly + 'px';
  }

  /* ── update live state ── */
  function update() {
    const SESSIONS = getActiveSessions();
    const ist    = nowIST();
    const nowMin = ist.getHours()*60 + ist.getMinutes();
    const iso    = todayISO();
    const isHol  = NSE_HOLIDAYS.includes(iso);
    const isSat  = ist.getDay() === 6;
    const isSun  = ist.getDay() === 0;
    const isOff  = isHol || isSat || isSun;

    /* dots + bar status classes */
    SESSIONS.forEach(sess => {
      const dot = $('mstDot_' + sess.id);
      const bar = $('mstBar_' + sess.id);
      if (!dot || !bar) return;

      const status = getStatus(sess, nowMin, isHol, isSat, isSun);

      // Update dot class
      dot.className = 'mst-dot mst-dot-' + status;

      // Update bar class — drives fill/outline styling
      bar.className = bar.className
        .replace(/\bmst-bar-(open|closed|soon|off)\b/g, '')
        .trim()
        + ' mst-bar-' + status;

      // Position dot OUTSIDE bar end on the track, with 6px gap
      // bar.style.left and bar.style.width are %-based; convert to px via track width
      const track = bar.parentElement;
      if (track) {
        const trackW   = track.offsetWidth;
        const barRight = (parseFloat(bar.style.left) + parseFloat(bar.style.width)) / 100 * trackW;
        const dotSize  = dot.offsetWidth || 28;
        dot.style.left = (barRight + 6) + 'px';
        dot.style.removeProperty('right');
      }
    });

    /* needle */
    const scrollWrap = $('mstScrollWrap');
    if (needleEl && scrollWrap) {
      if (nowMin >= T_START && nowMin <= T_END) {
        needleEl.hidden = false;
        const labelColW = parseInt(getComputedStyle(scrollWrap.querySelector('.mst-label-col')).width) || 130;
        const trackW    = scrollWrap.offsetWidth - labelColW;
        const leftPx    = labelColW + (pct(nowMin)/100) * trackW;
        /* account for scroll offset */
        needleEl.style.left = leftPx + 'px';
        /* make needle full height of scroll-wrap */
        needleEl.style.height = (rowsEl.offsetHeight + 28) + 'px';
        needleEl.style.top    = '0';
      } else {
        needleEl.hidden = true;
      }
    }

    /* closed banner */
    if (isOff) {
      bannerEl.hidden = false;
      banTitleEl.textContent = 'Market Closed';
      const dow = ist.getDay();
      const reason = isHol ? 'NSE Holiday' : isSat ? 'Saturday' : 'Sunday';
      banSubEl.textContent = `${reason} — Next trading day: ${nextWeekdayLabel(dow)}, 9:00 AM IST`;
    } else {
      bannerEl.hidden = true;
    }
  }

  /* ── clocks (1s interval) ── */
  function tickClock() {
    const ist = nowIST();
    const h24 = ist.getHours();
    const h12 = h24 === 0 ? 12 : (h24 > 12 ? h24 - 12 : h24);
    const ampm = h24 < 12 ? 'AM' : 'PM';
    const mm  = String(ist.getMinutes()).padStart(2,'0');
    const ss  = String(ist.getSeconds()).padStart(2,'0');
    if (clockEl) clockEl.textContent = `${h12}:${mm}:${ss} ${ampm} IST`;
    if (dateEl)  dateEl.textContent  = ist.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  }

  /* ── init ── */
  let _started = false;
  function init() {
    if (_started) { update(); return; }
    _started = true;
    buildStatic();
    update();
    tickClock();
    setInterval(tickClock, 1000);
    setInterval(update,    60000);
  }

  /* Rebuild sessions when market view changes */
  window.addEventListener('marketViewChanged', () => {
    _started = false; // Reset to allow rebuild
    init();
  });

  /* hook into market page init */
  const _origInit = window.initializeMarketPage;
  window.initializeMarketPage = function() {
    if (_origInit) _origInit.apply(this, arguments);
    init();
  };

  /* immediate if already on market page */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if ($('marketPage') && !$('marketPage').hidden) init();
    });
  } else {
    if ($('marketPage') && !$('marketPage').hidden) init();
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash.slice(1) === 'market') setTimeout(init, 60);
  });

}());


/* ============================================================
   FOREX TIMEZONE SELECTOR & CONVERSION
   ============================================================ */
const FOREX_TIMEZONES = {
  'Exchange': [
    { id: 'exchange', name: 'Exchange (Auto)', offset: 0 }
  ],
  'UTC': [
    { id: 'utc', name: 'UTC', offset: 0 }
  ],
  'North America': [
    { id: 'america/new_york', name: 'New York', offset: -5 },
    { id: 'america/toronto', name: 'Toronto', offset: -5 },
    { id: 'america/chicago', name: 'Chicago', offset: -6 },
    { id: 'america/mexico_city', name: 'Mexico City', offset: -6 },
    { id: 'america/denver', name: 'Denver', offset: -7 },
    { id: 'america/phoenix', name: 'Phoenix', offset: -7 },
    { id: 'america/los_angeles', name: 'Los Angeles', offset: -8 },
    { id: 'america/vancouver', name: 'Vancouver', offset: -8 },
    { id: 'america/anchorage', name: 'Anchorage', offset: -9 },
    { id: 'pacific/honolulu', name: 'Honolulu', offset: -10 }
  ],
  'South America': [
    { id: 'america/bogota', name: 'Bogotá', offset: -5 },
    { id: 'america/lima', name: 'Lima', offset: -5 },
    { id: 'america/caracas', name: 'Caracas', offset: -4 },
    { id: 'america/santiago', name: 'Santiago', offset: -3 },
    { id: 'america/argentina/buenos_aires', name: 'Buenos Aires', offset: -3 },
    { id: 'america/sao_paulo', name: 'São Paulo', offset: -3 },
    { id: 'america/halifax', name: 'Halifax', offset: -4 }
  ],
  'Europe': [
    { id: 'europe/london', name: 'London', offset: 0 },
    { id: 'europe/dublin', name: 'Dublin', offset: 0 },
    { id: 'europe/lisbon', name: 'Lisbon', offset: 0 },
    { id: 'europe/paris', name: 'Paris', offset: 1 },
    { id: 'europe/amsterdam', name: 'Amsterdam', offset: 1 },
    { id: 'europe/brussels', name: 'Brussels', offset: 1 },
    { id: 'europe/berlin', name: 'Berlin', offset: 1 },
    { id: 'europe/frankfurt', name: 'Frankfurt', offset: 1 },
    { id: 'europe/madrid', name: 'Madrid', offset: 1 },
    { id: 'europe/rome', name: 'Rome', offset: 1 },
    { id: 'europe/zurich', name: 'Zurich', offset: 1 },
    { id: 'europe/vienna', name: 'Vienna', offset: 1 },
    { id: 'europe/stockholm', name: 'Stockholm', offset: 1 },
    { id: 'europe/copenhagen', name: 'Copenhagen', offset: 1 },
    { id: 'europe/oslo', name: 'Oslo', offset: 1 },
    { id: 'europe/helsinki', name: 'Helsinki', offset: 2 },
    { id: 'europe/athens', name: 'Athens', offset: 2 },
    { id: 'europe/istanbul', name: 'Istanbul', offset: 3 },
    { id: 'europe/moscow', name: 'Moscow', offset: 3 }
  ],
  'Middle East & Africa': [
    { id: 'asia/dubai', name: 'Dubai', offset: 4 },
    { id: 'asia/abu_dhabi', name: 'Abu Dhabi', offset: 4 },
    { id: 'asia/riyadh', name: 'Riyadh', offset: 3 },
    { id: 'asia/qatar', name: 'Doha', offset: 3 },
    { id: 'asia/kuwait', name: 'Kuwait', offset: 3 },
    { id: 'asia/muscat', name: 'Muscat', offset: 4 },
    { id: 'asia/jerusalem', name: 'Jerusalem', offset: 2 },
    { id: 'africa/cairo', name: 'Cairo', offset: 2 },
    { id: 'africa/johannesburg', name: 'Johannesburg', offset: 2 },
    { id: 'africa/nairobi', name: 'Nairobi', offset: 3 }
  ],
  'Asia': [
    { id: 'asia/kolkata', name: 'Mumbai (IST)', offset: 5.5 },
    { id: 'asia/karachi', name: 'Karachi', offset: 5 },
    { id: 'asia/dhaka', name: 'Dhaka', offset: 6 },
    { id: 'asia/colombo', name: 'Colombo', offset: 5.5 },
    { id: 'asia/kathmandu', name: 'Kathmandu', offset: 5.75 },
    { id: 'asia/bangkok', name: 'Bangkok', offset: 7 },
    { id: 'asia/jakarta', name: 'Jakarta', offset: 7 },
    { id: 'asia/singapore', name: 'Singapore', offset: 8 },
    { id: 'asia/kuala_lumpur', name: 'Kuala Lumpur', offset: 8 },
    { id: 'asia/hong_kong', name: 'Hong Kong', offset: 8 },
    { id: 'asia/shanghai', name: 'Shanghai', offset: 8 },
    { id: 'asia/beijing', name: 'Beijing', offset: 8 },
    { id: 'asia/taipei', name: 'Taipei', offset: 8 },
    { id: 'asia/seoul', name: 'Seoul', offset: 9 },
    { id: 'asia/tokyo', name: 'Tokyo', offset: 9 },
    { id: 'asia/manila', name: 'Manila', offset: 8 }
  ],
  'Oceania': [
    { id: 'australia/perth', name: 'Perth', offset: 8 },
    { id: 'australia/adelaide', name: 'Adelaide', offset: 9.5 },
    { id: 'australia/darwin', name: 'Darwin', offset: 9.5 },
    { id: 'australia/brisbane', name: 'Brisbane', offset: 10 },
    { id: 'australia/sydney', name: 'Sydney', offset: 10 },
    { id: 'australia/melbourne', name: 'Melbourne', offset: 10 },
    { id: 'australia/canberra', name: 'Canberra', offset: 10 },
    { id: 'australia/hobart', name: 'Hobart', offset: 10 },
    { id: 'pacific/auckland', name: 'Auckland', offset: 12 },
    { id: 'pacific/wellington', name: 'Wellington', offset: 12 }
  ]
};

// Flatten for search
const FOREX_TZ_FLAT = [];
Object.keys(FOREX_TIMEZONES).forEach(group => {
  FOREX_TIMEZONES[group].forEach(tz => {
    FOREX_TZ_FLAT.push({ ...tz, group });
  });
});

// Get selected timezone from localStorage or default to UTC
function getForexTimezone() {
  const stored = localStorage.getItem('forexTimezone');
  if (stored) {
    const found = FOREX_TZ_FLAT.find(tz => tz.id === stored);
    if (found) return found;
  }
  return FOREX_TZ_FLAT.find(tz => tz.id === 'utc');
}

// Save timezone to localStorage
function setForexTimezone(tzId) {
  localStorage.setItem('forexTimezone', tzId);
}

// Format offset for display (e.g., +5.5 → UTC+5:30, -8 → UTC-8)
function formatOffset(offset) {
  if (offset === 0) return 'UTC';
  const sign = offset > 0 ? '+' : '';
  const hours = Math.floor(Math.abs(offset));
  const mins = Math.round((Math.abs(offset) % 1) * 60);
  return mins > 0 ? `UTC${sign}${offset > 0 ? hours : -hours}:${String(mins).padStart(2,'0')}` : `UTC${sign}${offset}`;
}


/* ============================================================
   FOREX MARKET SESSIONS TIMELINE - CLASSIC DESIGN
   24-hour horizontal axis with proper session overlaps
   Shows local time inside bars, current time indicator line
   ============================================================ */
(function () {
  'use strict';

  /* ── helpers ── */
  const toMin = (h, m) => h * 60 + m;

  function utcNowMin() {
    const d = new Date();
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }

  function fmtTime(min) {
    // normalise to 0–1439
    const normalized = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  function fmtDur(min) {
    if (min <= 0) return '—';
    const h = Math.floor(min / 60), m = min % 60;
    return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
  }

  /* ── Timeline axis: 00:00 – 24:00 ── */
  const AXIS_START = 0;
  const AXIS_END   = 1440;
  const AXIS_SPAN  = 1440;

  const pct = min => Math.max(0, Math.min(100, (min - AXIS_START) / AXIS_SPAN * 100));

  /* ── Status ── */
  function getStatus(sess, nowMin) {
    const { open, close } = sess;
    // Sessions that cross midnight
    if (open > close) {
      const isOpen = nowMin >= open || nowMin < close;
      if (isOpen) return 'open';
      // "soon" — within 15 min before open
      const minsUntilOpen = nowMin < open ? open - nowMin : (1440 - nowMin) + open;
      if (minsUntilOpen <= 15) return 'soon';
      return 'closed';
    }
    if (nowMin >= open && nowMin < close) return 'open';
    if (nowMin < open && open - nowMin <= 15) return 'soon';
    return 'closed';
  }

  function minsUntilChange(sess, nowMin) {
    const { open, close } = sess;
    const status = getStatus(sess, nowMin);
    if (status === 'open') {
      return open > close
        ? (nowMin >= open ? (1440 - nowMin) + close : close - nowMin)
        : close - nowMin;
    }
    if (status === 'soon' || status === 'closed') {
      return open > close
        ? (nowMin < open ? open - nowMin : (1440 - nowMin) + open)
        : open - nowMin;
    }
    return 0;
  }


  /* ── DOM refs ── */
  const $ = id => document.getElementById(id);
  const axisEl   = $('fxtAxis');
  const rowsEl   = $('fxtRows');
  const needleEl = $('fxtNeedle');
  const clockEl  = $('fxtClock');
  const tipEl    = $('fxtTooltip');
  const tipName  = $('fxtTipName');
  const tipBadge = $('fxtTipBadge');
  const tipOpen  = $('fxtTipOpen');
  const tipClose = $('fxtTipClose');
  const tipCdLbl = $('fxtTipCdLbl');
  const tipCd    = $('fxtTipCd');

  if (!axisEl || !rowsEl) return;

  /* ── Timezone Selector ── */
  let currentTimezone = getForexTimezone();
  const tzWrap = $('fxtTzWrap');
  const tzBtn = $('fxtTzBtn');
  const tzLabel = $('fxtTzLabel');
  const tzChevron = $('fxtTzChevron');
  const tzDropdown = $('fxtTzDropdown');
  const tzSearch = $('fxtTzSearch');
  const tzList = $('fxtTzList');

  function renderTimezoneList(filter = '') {
    if (!tzList) return;
    const query = filter.trim().toLowerCase();
    tzList.innerHTML = '';

    Object.keys(FOREX_TIMEZONES).forEach(groupName => {
      const items = FOREX_TIMEZONES[groupName].filter(tz =>
        tz.name.toLowerCase().includes(query) || tz.id.toLowerCase().includes(query)
      );

      if (items.length === 0) return;

      const group = document.createElement('div');
      group.className = 'fxt-tz-group';

      const title = document.createElement('div');
      title.className = 'fxt-tz-group-title';
      title.textContent = groupName;
      group.appendChild(title);

      items.forEach(tz => {
        const item = document.createElement('div');
        item.className = 'fxt-tz-item';
        if (tz.id === currentTimezone.id) item.classList.add('active');
        item.dataset.tzId = tz.id;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = tz.name;

        const offsetSpan = document.createElement('span');
        offsetSpan.className = 'fxt-tz-item-offset';
        offsetSpan.textContent = formatOffset(tz.offset);

        item.appendChild(nameSpan);
        item.appendChild(offsetSpan);

        item.addEventListener('click', () => selectTimezone(tz));

        group.appendChild(item);
      });

      tzList.appendChild(group);
    });

    if (tzList.children.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'fxt-tz-no-results';
      noResults.textContent = 'No timezones found';
      tzList.appendChild(noResults);
    }
  }

  function selectTimezone(tz) {
    currentTimezone = tz;
    setForexTimezone(tz.id);
    if (tzLabel) tzLabel.textContent = tz.name;
    closeTimezoneDropdown();
    renderTimezoneList();
    
    // Update tooltip instantly if it's showing (without moving bars)
    updateTooltipTimezone();
    
    // Rebuild timeline (axis labels and bar local times, bars DON'T move)
    rebuildTimeline();
  }

  function openTimezoneDropdown() {
    if (!tzDropdown || !tzBtn) return;
    tzDropdown.hidden = false;
    tzBtn.setAttribute('aria-expanded', 'true');
    if (tzSearch) {
      tzSearch.value = '';
      tzSearch.focus();
    }
    renderTimezoneList();
  }

  function closeTimezoneDropdown() {
    if (!tzDropdown || !tzBtn) return;
    tzDropdown.hidden = true;
    tzBtn.setAttribute('aria-expanded', 'false');
  }

  if (tzBtn) {
    tzBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tzDropdown && tzDropdown.hidden) {
        openTimezoneDropdown();
      } else {
        closeTimezoneDropdown();
      }
    });
  }

  if (tzSearch) {
    tzSearch.addEventListener('input', (e) => {
      renderTimezoneList(e.target.value);
    });
    tzSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeTimezoneDropdown();
    });
  }

  document.addEventListener('click', (e) => {
    if (tzWrap && !tzWrap.contains(e.target)) {
      closeTimezoneDropdown();
    }
  });

  // Initialize timezone label
  if (tzLabel) tzLabel.textContent = currentTimezone.name;

  // Convert UTC minutes to current timezone minutes
  function convertToTimezone(utcMin) {
    const offsetMins = Math.round(currentTimezone.offset * 60);
    let converted = utcMin + offsetMins;
    converted = ((converted % 1440) + 1440) % 1440;
    return converted;
  }

  // Get session local time for display inside bar
  function getSessionLocalTime(sessionId) {
    const now = new Date();
    const cities = {
      'sydney': 'Australia/Sydney',
      'tokyo': 'Asia/Tokyo',
      'london': 'Europe/London',
      'newyork': 'America/New_York'
    };
    
    const cityTz = cities[sessionId];
    if (!cityTz) return '';
    
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: cityTz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return formatter.format(now) + ' local';
    } catch (e) {
      return '';
    }
  }

  // Update axis labels for current timezone (evenly spaced 24-hour markers)
  function getAxisTicks() {
    const ticks = [];
    // Show hour markers: 12 AM, 2, 4, 6, 8, 10, 12 PM, 2, 4, 6, 8, 10
    for (let h = 0; h < 24; h += 2) {
      const utcMin = h * 60;
      const convertedMin = convertToTimezone(utcMin);
      const hour24 = Math.floor(convertedMin / 60);
      const hour12 = hour24 === 0 ? 12 : (hour24 > 12 ? hour24 - 12 : hour24);
      const ampm = hour24 < 12 ? 'AM' : 'PM';
      const label = h === 0 || h === 12 ? `${hour12} ${ampm}` : `${hour12}`;
      ticks.push({ min: utcMin, label: label });
    }
    return ticks;
  }

(function() {
  'use strict';

  /* ── Time range: 9 AM to 9 PM IST (12 hours) ── */
  const T_START = 9 * 60;      // 9:00 AM = 540 minutes
  const T_END   = 21 * 60;     // 9:00 PM = 1260 minutes
  const T_SPAN  = T_END - T_START; // 720 minutes (12 hours)

  const toMin = (h, m) => h * 60 + m;
  const utcNowMin = () => { const d = new Date(); return d.getUTCHours() * 60 + d.getUTCMinutes(); };
  const fmtTime = min => { const h = Math.floor(min / 60) % 24; const m = min % 60; const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h); const ampm = h < 12 ? 'AM' : 'PM'; return `${h12}:${String(m).padStart(2, '0')} ${ampm}`; };
  const fmtDur = mins => { if (mins < 0) mins = 0; const h = Math.floor(mins / 60); const m = mins % 60; if (h > 0) return `${h}h ${m}m`; return `${m}m`; };

  /* Percent of timeline for a given minute (relative to T_START–T_END) */
  const pct = min => {
    // Normalize to IST display range (9 AM – 9 PM)
    let normalized = min;
    // Handle midnight crossover
    if (min < T_START) normalized = min + 1440; // Add 24 hours
    return Math.max(0, Math.min(100, (normalized - T_START) / T_SPAN * 100));
  };

  /* Axis ticks (every 2 hours from 9 AM to 9 PM) */
  const TICKS = [];
  for (let h = 9; h <= 21; h += 2) {
    const hour12 = h > 12 ? h - 12 : h;
    const ampm = h < 12 ? 'AM' : 'PM';
    TICKS.push({ min: toMin(h, 0), label: `${hour12} ${ampm}` });
  }

  /* Forex timezone storage */
  const FOREX_TZ_KEY = 'forexTimezone';
  function getForexTimezone() {
    const stored = localStorage.getItem(FOREX_TZ_KEY);
    if (stored) {
      for (const group of Object.values(FOREX_TIMEZONES)) {
        const found = group.find(tz => tz.id === stored);
        if (found) return found;
      }
    }
    return FOREX_TIMEZONES['Asia'][0]; // Default to Mumbai IST (asia/kolkata)
  }
  function setForexTimezone(id) {
    localStorage.setItem(FOREX_TZ_KEY, id);
  }

  function formatOffset(offset) {
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const mins = Math.round((absOffset - hours) * 60);
    return `UTC${sign}${hours}${mins > 0 ? ':' + String(mins).padStart(2, '0') : ''}`;
  }

  /* Helper: Convert timezone ID to proper IANA format for Intl API */
  function normalizeTimezoneId(id) {
    // Convert lowercase timezone IDs to proper case for Intl API
    // e.g., 'asia/kolkata' -> 'Asia/Kolkata'
    if (!id) return 'UTC';
    const parts = id.split('/');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('/');
  }

  /* Helper: Check if DST is active for a timezone */
  function isDST(date, timezone) {
    try {
      const jan = new Date(date.getFullYear(), 0, 1);
      const jul = new Date(date.getFullYear(), 6, 1);
      
      const getOffset = (d) => {
        const str = d.toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' });
        return str;
      };
      
      const janStr = getOffset(jan);
      const julStr = getOffset(jul);
      const curStr = getOffset(date);
      
      // DST is active if current offset matches summer (July)
      return curStr === julStr && janStr !== julStr;
    } catch (e) {
      return false;
    }
  }

  /* Get session times in UTC based on current DST status */
  function getSessionTimesUTC() {
    const now = new Date();
    const londonDST = isDST(now, normalizeTimezoneId('europe/london'));
    const nyDST = isDST(now, normalizeTimezoneId('america/new_york'));

    return [
      {
        id: 'sydney', 
        label: 'Sydney',
        // 5:00 AM – 2:00 PM IST = 23:30 – 08:30 UTC (crosses midnight)
        openUTC: toMin(23, 30), 
        closeUTC: toMin(8, 30),
        openIST: toMin(5, 0),
        closeIST: toMin(14, 0),
        color: '#38D298',
      },
      {
        id: 'tokyo',  
        label: 'Tokyo',
        // 5:30 AM – 2:30 PM IST = 00:00 – 09:00 UTC
        openUTC: toMin(0, 0), 
        closeUTC: toMin(9, 0),
        openIST: toMin(5, 30),
        closeIST: toMin(14, 30),
        color: '#38D298',
      },
      {
        id: 'london', 
        label: 'London',
        // Summer (DST): 12:30 PM – 9:30 PM IST = 07:00 – 16:00 UTC
        // Winter: 1:30 PM – 10:30 PM IST = 08:00 – 17:00 UTC
        openUTC: londonDST ? toMin(7, 0) : toMin(8, 0),
        closeUTC: londonDST ? toMin(16, 0) : toMin(17, 0),
        openIST: londonDST ? toMin(12, 30) : toMin(13, 30),
        closeIST: londonDST ? toMin(21, 30) : toMin(22, 30),
        color: '#38D298',
      },
      {
        id: 'newyork', 
        label: 'New York',
        // Summer (DST): 5:30 PM – 2:30 AM IST = 12:00 – 21:00 UTC
        // Winter: 6:30 PM – 3:30 AM IST = 13:00 – 22:00 UTC
        openUTC: nyDST ? toMin(12, 0) : toMin(13, 0),
        closeUTC: nyDST ? toMin(21, 0) : toMin(22, 0),
        openIST: nyDST ? toMin(17, 30) : toMin(18, 30),
        closeIST: nyDST ? toMin(2, 30) : toMin(3, 30), // Crosses midnight
        color: '#38D298',
      },
    ];
  }

  /* Store original sessions */
  let SESSIONS_UTC = getSessionTimesUTC();

  /* Get session status based on UTC time */
  function getStatus(sess, nowMinUTC) {
    const open = sess.openUTC;
    const close = sess.closeUTC;
    
    // Handle midnight crossing
    if (open > close) {
      // Session crosses midnight (e.g., Sydney 23:30 - 08:30)
      if (nowMinUTC >= open || nowMinUTC < close) return 'open';
      if (nowMinUTC < open && open - nowMinUTC <= 15) return 'soon';
    } else {
      // Normal session within same day
      if (nowMinUTC >= open && nowMinUTC < close) return 'open';
      if (nowMinUTC < open && open - nowMinUTC <= 15) return 'soon';
    }
    return 'closed';
  }

  /* ── DOM refs ── */
  const $ = id => document.getElementById(id);
  const axisEl   = $('fxtAxis');
  const rowsEl   = $('fxtRows');
  const needleEl = $('fxtNeedle');
  const clockEl  = $('fxtClock');
  const tipEl    = $('fxtTooltip');
  const tipName  = $('fxtTipName');
  const tipBadge = $('fxtTipBadge');
  const tipOpen  = $('fxtTipOpen');
  const tipClose = $('fxtTipClose');
  const tipCdLbl = $('fxtTipCdLbl');
  const tipCd    = $('fxtTipCd');

  if (!axisEl || !rowsEl) return;

  /* ── Timezone Selector ── */
  let currentTimezone = getForexTimezone();
  const tzWrap = $('fxtTzWrap');
  const tzBtn = $('fxtTzBtn');
  const tzLabel = $('fxtTzLabel');
  const tzChevron = $('fxtTzChevron');
  const tzDropdown = $('fxtTzDropdown');
  const tzSearch = $('fxtTzSearch');
  const tzList = $('fxtTzList');

  function renderTimezoneList(filter = '') {
    if (!tzList) return;
    const query = filter.trim().toLowerCase();
    tzList.innerHTML = '';

    Object.keys(FOREX_TIMEZONES).forEach(groupName => {
      const items = FOREX_TIMEZONES[groupName].filter(tz =>
        tz.name.toLowerCase().includes(query) || tz.id.toLowerCase().includes(query)
      );

      if (items.length === 0) return;

      const group = document.createElement('div');
      group.className = 'fxt-tz-group';

      const title = document.createElement('div');
      title.className = 'fxt-tz-group-title';
      title.textContent = groupName;
      group.appendChild(title);

      items.forEach(tz => {
        const item = document.createElement('div');
        item.className = 'fxt-tz-item';
        if (tz.id === currentTimezone.id) item.classList.add('active');
        item.dataset.tzId = tz.id;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = tz.name;

        const offsetSpan = document.createElement('span');
        offsetSpan.className = 'fxt-tz-item-offset';
        offsetSpan.textContent = formatOffset(tz.offset);

        item.appendChild(nameSpan);
        item.appendChild(offsetSpan);

        item.addEventListener('click', () => selectTimezone(tz));

        group.appendChild(item);
      });

      tzList.appendChild(group);
    });

    if (tzList.children.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'fxt-tz-no-results';
      noResults.textContent = 'No timezones found';
      tzList.appendChild(noResults);
    }
  }

  function selectTimezone(tz) {
    currentTimezone = tz;
    setForexTimezone(tz.id);
    if (tzLabel) tzLabel.textContent = tz.name;
    closeTimezoneDropdown();
    renderTimezoneList();
    
    // Update tooltip instantly if it's showing
    updateTooltipTimezone();
    
    // Update clock
    tickClock();
    
    // Update needle position immediately when timezone changes
    updateNeedle();
  }

  function openTimezoneDropdown() {
    if (!tzDropdown || !tzBtn) return;
    tzDropdown.hidden = false;
    tzBtn.setAttribute('aria-expanded', 'true');
    if (tzSearch) {
      tzSearch.value = '';
      tzSearch.focus();
    }
    renderTimezoneList();
  }

  function closeTimezoneDropdown() {
    if (!tzDropdown || !tzBtn) return;
    tzDropdown.hidden = true;
    tzBtn.setAttribute('aria-expanded', 'false');
  }

  if (tzBtn) {
    tzBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tzDropdown && tzDropdown.hidden) {
        openTimezoneDropdown();
      } else {
        closeTimezoneDropdown();
      }
    });
  }

  if (tzSearch) {
    tzSearch.addEventListener('input', (e) => {
      renderTimezoneList(e.target.value);
    });
    tzSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeTimezoneDropdown();
    });
  }

  document.addEventListener('click', (e) => {
    if (tzWrap && !tzWrap.contains(e.target)) {
      closeTimezoneDropdown();
    }
  });

  // Initialize timezone label
  if (tzLabel) tzLabel.textContent = currentTimezone.name;

  // Convert UTC minutes to current timezone minutes
  function convertToTimezone(utcMin) {
    const offsetMins = Math.round(currentTimezone.offset * 60);
    let converted = utcMin + offsetMins;
    converted = ((converted % 1440) + 1440) % 1440;
    return converted;
  }

  /* ── Build static DOM ── */
  function buildStatic() {
    /* Axis ticks */
    axisEl.innerHTML = '';
    TICKS.forEach(t => {
      const span = document.createElement('span');
      span.className = 'fxt-tick';
      span.textContent = t.label;
      span.style.left = pct(t.min) + '%';
      axisEl.appendChild(span);
    });

    /* Session rows */
    rowsEl.innerHTML = '';
    SESSIONS_UTC.forEach(sess => {
      const row = document.createElement('div');
      row.className = 'fxt-row';

      const lbl = document.createElement('div');
      lbl.className = 'fxt-row-lbl';
      lbl.textContent = sess.label;

      const track = document.createElement('div');
      track.className = 'fxt-track';

      // Check if session crosses midnight in IST display
      const openIST = sess.openIST;
      const closeIST = sess.closeIST;
      
      if (closeIST < openIST) {
        // Session crosses midnight - create two segments
        // Segment 1: from open to end of day (9 PM)
        const bar1 = document.createElement('div');
        bar1.className = 'fxt-bar';
        bar1.id = `fxtBar_${sess.id}_0`;
        bar1.style.left = pct(openIST) + '%';
        bar1.style.width = (pct(T_END) - pct(openIST)) + '%';
        bar1.dataset.sessId = sess.id;
        track.appendChild(bar1);

        // Segment 2: from start of day (9 AM) to close
        const bar2 = document.createElement('div');
        bar2.className = 'fxt-bar';
        bar2.id = `fxtBar_${sess.id}_1`;
        bar2.style.left = pct(T_START) + '%';
        bar2.style.width = (pct(closeIST) - pct(T_START)) + '%';
        bar2.dataset.sessId = sess.id;
        track.appendChild(bar2);

        // Dot after second segment
        const dot = document.createElement('div');
        dot.className = 'fxt-dot';
        dot.id = `fxtDot_${sess.id}`;
        dot.style.position = 'absolute';
        track.appendChild(dot);

        // Add event listeners to both segments
        [bar1, bar2].forEach(bar => {
          bar.addEventListener('mouseenter', e => showTip(sess, bar, e));
          bar.addEventListener('mousemove', e => positionTip(bar, e));
          bar.addEventListener('mouseleave', () => { if (tipEl) tipEl.hidden = true; currentTooltipSession = null; });
          bar.addEventListener('touchstart', e => { e.stopPropagation(); showTip(sess, bar, e); }, { passive: true });
        });
      } else {
        // Normal session within display range
        const bar = document.createElement('div');
        bar.className = 'fxt-bar';
        bar.id = `fxtBar_${sess.id}_0`;
        bar.style.left = pct(openIST) + '%';
        bar.style.width = (pct(closeIST) - pct(openIST)) + '%';
        bar.dataset.sessId = sess.id;

        const dot = document.createElement('div');
        dot.className = 'fxt-dot';
        dot.id = `fxtDot_${sess.id}`;
        dot.style.position = 'absolute';

        track.appendChild(bar);
        track.appendChild(dot);

        bar.addEventListener('mouseenter', e => showTip(sess, bar, e));
        bar.addEventListener('mousemove', e => positionTip(bar, e));
        bar.addEventListener('mouseleave', () => { if (tipEl) tipEl.hidden = true; currentTooltipSession = null; });
        bar.addEventListener('touchstart', e => { e.stopPropagation(); showTip(sess, bar, e); }, { passive: true });
      }

      row.appendChild(lbl);
      row.appendChild(track);
      rowsEl.appendChild(row);
    });

    document.addEventListener('click', () => { if (tipEl) tipEl.hidden = true; });
  }

  /* ── Tooltip (TradingView-style, timezone-aware) ── */
  let currentTooltipSession = null;

  function showTip(sess, barEl, e) {
    currentTooltipSession = sess;
    const nowMin = utcNowMin();
    const status = getStatus(sess, nowMin);

    tipName.textContent = sess.label + ' Session';
    
    // Convert UTC session times to selected timezone for TOOLTIP ONLY
    const openConverted = convertToTimezone(sess.openUTC);
    const closeConverted = convertToTimezone(sess.closeUTC);
    const crossesMidnight = openConverted > closeConverted;
    
    const tzName = currentTimezone.name;
    tipOpen.textContent = fmtTime(openConverted) + ' ' + tzName;
    
    if (crossesMidnight) {
      tipClose.textContent = fmtTime(closeConverted) + ' (Next Day) ' + tzName;
    } else {
      tipClose.textContent = fmtTime(closeConverted) + ' ' + tzName;
    }

    const labels = { open: 'OPEN', soon: 'OPENING SOON', closed: 'CLOSED' };
    const classes = { open: 'fxt-tip-badge-open', soon: 'fxt-tip-badge-soon', closed: 'fxt-tip-badge-closed' };
    tipBadge.textContent = labels[status] || status;
    tipBadge.className = 'fxt-tip-badge ' + (classes[status] || 'fxt-tip-badge-closed');

    // Calculate time until change
    let minsUntilChange = 0;
    if (status === 'open') {
      tipCdLbl.textContent = 'Closes In';
      minsUntilChange = sess.closeUTC - nowMin;
      if (minsUntilChange < 0) minsUntilChange += 1440;
    } else if (status === 'soon') {
      tipCdLbl.textContent = 'Opens In';
      minsUntilChange = sess.openUTC - nowMin;
      if (minsUntilChange < 0) minsUntilChange += 1440;
    } else {
      tipCdLbl.textContent = '';
      tipCd.textContent = '—';
    }

    if (status === 'open' || status === 'soon') {
      tipCd.textContent = fmtDur(minsUntilChange);
    }

    tipEl.hidden = false;
    positionTip(barEl, e);
  }

  function positionTip(barEl, e) {
    if (!tipEl || tipEl.hidden) return;
    const card = $('fxtCard');
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const barRect = barEl.getBoundingClientRect();
    
    const tw = tipEl.offsetWidth || 220;
    const th = tipEl.offsetHeight || 110;
    
    const spaceRight = cardRect.right - barRect.right;
    const spaceLeft = barRect.left - cardRect.left;
    
    let lx, ly;
    const gap = 12;
    
    if (spaceRight >= tw + gap) {
      lx = (barRect.right - cardRect.left) + gap;
      ly = (barRect.top - cardRect.top);
      
      if (ly + th > cardRect.height) {
        ly = cardRect.height - th - 16;
      }
      if (ly < 16) {
        ly = 16;
      }
    }
    else if (spaceLeft >= tw + gap) {
      lx = (barRect.left - cardRect.left) - tw - gap;
      ly = (barRect.top - cardRect.top);
      
      if (ly + th > cardRect.height) {
        ly = cardRect.height - th - 16;
      }
      if (ly < 16) {
        ly = 16;
      }
    }
    else {
      lx = (barRect.left - cardRect.left);
      ly = (barRect.bottom - cardRect.top) + gap;
      
      if (ly + th > cardRect.height - 16) {
        const lyAbove = (barRect.top - cardRect.top) - th - gap;
        if (lyAbove >= 16) {
          ly = lyAbove;
        } else {
          ly = cardRect.height - th - 16;
        }
      }
      
      if (lx + tw > cardRect.width - 16) {
        lx = cardRect.width - tw - 16;
      }
      if (lx < 16) {
        lx = 16;
      }
    }
    
    if (lx < 0) lx = 16;
    if (ly < 0) ly = 16;
    if (lx + tw > cardRect.width) lx = cardRect.width - tw - 16;
    if (ly + th > cardRect.height) ly = cardRect.height - th - 16;
    
    tipEl.style.left = lx + 'px';
    tipEl.style.top = ly + 'px';
  }

  function updateTooltipTimezone() {
    if (!currentTooltipSession || !tipEl || tipEl.hidden) return;
    
    const sess = currentTooltipSession;
    const openConverted = convertToTimezone(sess.openUTC);
    const closeConverted = convertToTimezone(sess.closeUTC);
    const crossesMidnight = openConverted > closeConverted;
    const tzName = currentTimezone.name;
    
    tipOpen.textContent = fmtTime(openConverted) + ' ' + tzName;
    
    if (crossesMidnight) {
      tipClose.textContent = fmtTime(closeConverted) + ' (Next Day) ' + tzName;
    } else {
      tipClose.textContent = fmtTime(closeConverted) + ' ' + tzName;
    }
  }

  /* ── Update live state ── */
  function update() {
    const nowMin = utcNowMin();

    SESSIONS_UTC.forEach(sess => {
      const status = getStatus(sess, nowMin);

      // Update all bar segments for this session
      const bar0 = $(`fxtBar_${sess.id}_0`);
      const bar1 = $(`fxtBar_${sess.id}_1`);
      
      if (bar0) bar0.className = 'fxt-bar fxt-bar-' + status;
      if (bar1) bar1.className = 'fxt-bar fxt-bar-' + status;

      // Update status dot
      const dot = $(`fxtDot_${sess.id}`);
      if (dot) {
        dot.className = 'fxt-dot fxt-dot-' + status;
        
        // Position dot directly at the end of the LAST bar segment (no gap)
        const lastBar = bar1 || bar0; // Use second segment if it exists, otherwise first
        if (lastBar) {
          const track = lastBar.parentElement;
          if (track) {
            const trackW = track.offsetWidth;
            const barRight = (parseFloat(lastBar.style.left) + parseFloat(lastBar.style.width)) / 100 * trackW;
            // Position dot directly at bar end (no gap, matching Indian Market)
            dot.style.left = barRight + 'px';
            dot.style.removeProperty('right');
          }
        }
      }
    });

    // Update needle position (called every second from tickClock)
    updateNeedle();
  }

  /* ── Update needle position to match clock time ── */
  function updateNeedle() {
    const scrollWrap = $('fxtScrollWrap');
    if (!needleEl || !scrollWrap) return;

    // Get current time directly in the selected timezone using Intl API
    const now = new Date();
    
    try {
      // Format the time in the selected timezone (normalize ID for Intl API)
      const tzId = normalizeTimezoneId(currentTimezone.id);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzId,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      const parts = formatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
      
      // Calculate total minutes with seconds precision
      const currentMin = hour * 60 + minute;
      const currentMinWithSeconds = currentMin + (second / 60);
      
      // Check if current time is within display range (9 AM - 9 PM)
      if (currentMin >= T_START && currentMin <= T_END) {
        needleEl.hidden = false;
        const labelColW = parseInt(getComputedStyle(scrollWrap.querySelector('.fxt-label-col')).width) || 130;
        const trackW = scrollWrap.offsetWidth - labelColW;
        
        // Position needle based on time with seconds precision
        const leftPx = labelColW + (pct(currentMinWithSeconds) / 100) * trackW;
        needleEl.style.left = leftPx + 'px';
        
        /* Make needle full height of rows */
        needleEl.style.height = (rowsEl.offsetHeight + 28) + 'px';
        needleEl.style.top = '0';
      } else {
        needleEl.hidden = true;
      }
    } catch (e) {
      // Fallback to UTC conversion if timezone API fails
      console.error('Timezone API error:', e);
      const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
      const utcSec = now.getUTCSeconds();
      const convertedMin = convertToTimezone(utcMin);
      const convertedMinWithSeconds = convertedMin + (utcSec / 60);
      
      if (convertedMin >= T_START && convertedMin <= T_END) {
        needleEl.hidden = false;
        const labelColW = parseInt(getComputedStyle(scrollWrap.querySelector('.fxt-label-col')).width) || 130;
        const trackW = scrollWrap.offsetWidth - labelColW;
        const leftPx = labelColW + (pct(convertedMinWithSeconds) / 100) * trackW;
        needleEl.style.left = leftPx + 'px';
        needleEl.style.height = (rowsEl.offsetHeight + 28) + 'px';
        needleEl.style.top = '0';
      } else {
        needleEl.hidden = true;
      }
    }
  }

  /* ── Clock (1s) ── */
  function tickClock() {
    const now = new Date();
    
    try {
      // Get time directly in selected timezone using Intl API (normalize ID)
      const tzId = normalizeTimezoneId(currentTimezone.id);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzId,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      const parts = formatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
      
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      const ss = String(second).padStart(2, '0');
      
      if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
    } catch (e) {
      // Fallback to UTC conversion
      console.error('Timezone API error:', e);
      const utcMin = now.getUTCHours() * 60 + now.getUTCMinutes();
      const convertedMin = convertToTimezone(utcMin);
      const h = Math.floor(convertedMin / 60);
      const m = convertedMin % 60;
      const s = now.getUTCSeconds();
      
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const ss = String(s).padStart(2, '0');
      
      if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
    }
    
    // Update needle position every second to stay synchronized with clock
    updateNeedle();
  }

  /* ── Init ── */
  let _started = false;
  function init() {
    if (_started) { 
      update(); 
      return; 
    }
    _started = true;
    buildStatic();
    update();
    tickClock();
    setInterval(tickClock, 1000);
    setInterval(() => {
      update();
    }, 10000); // Update every 10 seconds
  }

  /* Hook into market page init */
  const _origInit = window.initializeMarketPage;
  window.initializeMarketPage = function () {
    if (_origInit) _origInit.apply(this, arguments);
    init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if ($('marketPage') && !$('marketPage').hidden) init();
    });
  } else {
    if ($('marketPage') && !$('marketPage').hidden) init();
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash.slice(1) === 'market') setTimeout(init, 60);
  });

}());
  function isDST(date, timezone) {
    // For simplicity, we check if the timezone offset is different from standard offset
    // DST typically runs from March to November in Northern Hemisphere
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const janOffset = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeStyle: 'full' }).format(jan);
    const julOffset = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeStyle: 'full' }).format(jul);
    const currentOffset = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeStyle: 'full' }).format(date);
    
    // Simple heuristic: if current offset matches July (summer), DST is active
    return currentOffset !== janOffset;
  }

  /* Get session times in UTC based on current DST status */
  function getSessionTimesUTC() {
    const now = new Date();
    const londonDST = isDST(now, 'Europe/London');
    const nyDST = isDST(now, 'America/New_York');

    return [
      {
        id: 'sydney', 
        label: 'Sydney',
        // 5:00 AM – 2:00 PM IST = 23:30 – 08:30 UTC (crosses midnight)
        open: toMin(23, 30), 
        close: toMin(8, 30),
        color: '#38D298',
      },
      {
        id: 'tokyo',  
        label: 'Tokyo',
        // 5:30 AM – 2:30 PM IST = 00:00 – 09:00 UTC
        open: toMin(0, 0), 
        close: toMin(9, 0),
        color: '#38D298',
      },
      {
        id: 'london', 
        label: 'London',
        // Summer (DST): 12:30 PM – 9:30 PM IST = 07:00 – 16:00 UTC
        // Winter: 1:30 PM – 10:30 PM IST = 08:00 – 17:00 UTC
        open: londonDST ? toMin(7, 0) : toMin(8, 0),
        close: londonDST ? toMin(16, 0) : toMin(17, 0),
        color: '#38D298',
      },
      {
        id: 'newyork', 
        label: 'New York',
        // Summer (DST): 5:30 PM – 2:30 AM IST = 12:00 – 21:00 UTC
        // Winter: 6:30 PM – 3:30 AM IST = 13:00 – 22:00 UTC
        open: nyDST ? toMin(12, 0) : toMin(13, 0),
        close: nyDST ? toMin(21, 0) : toMin(22, 0),
        color: '#38D298',
      },
    ];
  }

  /* Store original UTC sessions - updated for DST */
  let SESSIONS_UTC = getSessionTimesUTC();

  // Create display sessions with segments for rendering
  function getDisplaySessions() {
    return SESSIONS_UTC.map(sess => {
      const segs = [];
      // Check if session crosses midnight in UTC
      if (sess.open > sess.close) {
        // Split into two segments for rendering
        segs.push({ start: sess.open, end: 1440 });
        segs.push({ start: 0, end: sess.close });
      } else {
        segs.push({ start: sess.open, end: sess.close });
      }

      return {
        ...sess,
        segs,
        crossesMidnight: sess.open > sess.close
      };
    });
  }

  // Active sessions (FIXED - never recalculated on timezone change)
  const SESSIONS = getDisplaySessions();
  let TICKS = getAxisTicks();

  function rebuildTimeline() {
    // Rebuild ticks only, bars stay the same
    TICKS = getAxisTicks();
    rebuildAxisOnly();
    update();
  }

  function rebuildAxisOnly() {
    // Rebuild axis labels
    axisEl.innerHTML = '';
    TICKS.forEach(t => {
      const div = document.createElement('div');
      div.className = 'fxt-tick';
      div.textContent = t.label;
      // Position tick absolutely
      div.style.left = pct(t.min) + '%';
      axisEl.appendChild(div);
    });
  }


  /* ── Build static DOM ── */
  function buildStatic() {
    /* Axis ticks */
    rebuildAxisOnly();

    /* Rows — one per session with status dots */
    rowsEl.innerHTML = '';
    SESSIONS.forEach(sess => {
      const row = document.createElement('div');
      row.className = 'fxt-row';

      const lbl = document.createElement('div');
      lbl.className = 'fxt-row-lbl';
      lbl.textContent = sess.label;

      const track = document.createElement('div');
      track.className = 'fxt-track';

      /* Create bar(s) for session */
      sess.segs.forEach((seg, i) => {
        const bar = document.createElement('div');
        bar.className = 'fxt-bar';
        bar.id = `fxtBar_${sess.id}_${i}`;

        bar.style.left = pct(seg.start) + '%';
        bar.style.width = (pct(seg.end) - pct(seg.start)) + '%';

        bar.dataset.sessId = sess.id;
        bar.addEventListener('mouseenter', e => showTip(sess, bar, e));
        bar.addEventListener('mousemove',  e => positionTip(bar, e));
        bar.addEventListener('mouseleave', () => { 
          if (tipEl) tipEl.hidden = true; 
          currentTooltipSession = null;
        });
        bar.addEventListener('touchstart', e => { e.stopPropagation(); showTip(sess, bar, e); }, { passive: true });

        track.appendChild(bar);

        // Add status dot OUTSIDE bar (after last segment only)
        if (i === sess.segs.length - 1) {
          const dot = document.createElement('div');
          dot.className = 'fxt-dot';
          dot.id = `fxtDot_${sess.id}`;
          track.appendChild(dot);
        }
      });

      row.appendChild(lbl);
      row.appendChild(track);
      rowsEl.appendChild(row);
    });

    document.addEventListener('click', () => { if (tipEl) tipEl.hidden = true; });
  }

  /* ── Tooltip (TradingView-style, timezone-aware) ── */
  let currentTooltipSession = null; // Track which session tooltip is showing

  function showTip(sess, barEl, e) {
    currentTooltipSession = sess; // Store reference for timezone updates
    const nowMin = utcNowMin();
    const status = getStatus(sess, nowMin);
    const mins   = minsUntilChange(sess, nowMin);

    tipName.textContent  = sess.label + ' Session';
    
    // Convert UTC session times to selected timezone for TOOLTIP ONLY
    // Session bars NEVER move, only tooltip times change
    const openConverted = convertToTimezone(sess.open);
    const closeConverted = convertToTimezone(sess.close);
    const crossesMidnight = openConverted > closeConverted;
    
    // Show timezone name in tooltip
    const tzName = currentTimezone.name;
    tipOpen.textContent  = fmtTime(openConverted) + ' ' + tzName;
    
    // Show "(Next Day)" if session crosses midnight in selected timezone
    if (crossesMidnight) {
      tipClose.textContent = fmtTime(closeConverted) + ' (Next Day) ' + tzName;
    } else {
      tipClose.textContent = fmtTime(closeConverted) + ' ' + tzName;
    }

    const labels  = { open:'OPEN', soon:'OPENING SOON', closed:'CLOSED' };
    const classes = { open:'fxt-tip-badge-open', soon:'fxt-tip-badge-soon', closed:'fxt-tip-badge-closed' };
    tipBadge.textContent = labels[status] || status;
    tipBadge.className   = 'fxt-tip-badge ' + (classes[status] || '');

    // Calculate countdown in the context of selected timezone
    const nowConverted = convertToTimezone(nowMin);
    const minsInTz = minsUntilChange(sess, nowConverted);

    if (status === 'open')         { tipCdLbl.textContent = 'Closes In'; tipCd.textContent = fmtDur(mins); }
    else if (status === 'soon')    { tipCdLbl.textContent = 'Opens In';  tipCd.textContent = fmtDur(mins); }
    else                           { tipCdLbl.textContent = '';          tipCd.textContent = '—'; }

    tipEl.hidden = false;
    positionTip(barEl, e);
  }

  function positionTip(barEl, e) {
    if (!tipEl || tipEl.hidden) return;
    const card = $('fxtCard');
    if (!card) return;

    // Get card and bar positions
    const cardRect = card.getBoundingClientRect();
    const barRect = barEl.getBoundingClientRect();
    
    // Get tooltip dimensions
    const tw = tipEl.offsetWidth || 220;
    const th = tipEl.offsetHeight || 110;
    
    // Calculate available space in all directions (relative to CARD, not viewport)
    const spaceRight = cardRect.right - barRect.right;
    const spaceLeft = barRect.left - cardRect.left;
    const spaceBelow = cardRect.bottom - barRect.bottom;
    const spaceAbove = barRect.top - cardRect.top;
    
    let lx, ly;
    const gap = 12; // Gap between bar and tooltip
    
    // Strategy 1: Try to position to the RIGHT of the bar (default)
    if (spaceRight >= tw + gap) {
      lx = (barRect.right - cardRect.left) + gap;
      ly = (barRect.top - cardRect.top);
      
      // Adjust vertical position if tooltip would overflow card bottom
      if (ly + th > cardRect.height) {
        ly = cardRect.height - th - 16;
      }
      // Ensure it doesn't go above card top
      if (ly < 16) {
        ly = 16;
      }
    }
    // Strategy 2: If not enough space right, try LEFT
    else if (spaceLeft >= tw + gap) {
      lx = (barRect.left - cardRect.left) - tw - gap;
      ly = (barRect.top - cardRect.top);
      
      // Adjust vertical position if tooltip would overflow card bottom
      if (ly + th > cardRect.height) {
        ly = cardRect.height - th - 16;
      }
      // Ensure it doesn't go above card top
      if (ly < 16) {
        ly = 16;
      }
    }
    // Strategy 3: Fallback to BELOW, but CONSTRAIN to card bounds
    else {
      lx = (barRect.left - cardRect.left);
      ly = (barRect.bottom - cardRect.top) + gap;
      
      // Ensure tooltip doesn't overflow card bottom
      if (ly + th > cardRect.height - 16) {
        // If no space below, try above but ONLY within card
        const lyAbove = (barRect.top - cardRect.top) - th - gap;
        if (lyAbove >= 16) {
          ly = lyAbove;
        } else {
          // Force below but clip to card bounds
          ly = cardRect.height - th - 16;
        }
      }
      
      // Horizontal adjustment within card bounds
      if (lx + tw > cardRect.width - 16) {
        lx = cardRect.width - tw - 16;
      }
      if (lx < 16) {
        lx = 16;
      }
    }
    
    // Final safety: absolutely ensure tooltip stays within card bounds
    if (lx < 0) lx = 16;
    if (ly < 0) ly = 16;
    if (lx + tw > cardRect.width) lx = cardRect.width - tw - 16;
    if (ly + th > cardRect.height) ly = cardRect.height - th - 16;
    
    tipEl.style.left = lx + 'px';
    tipEl.style.top  = ly + 'px';
  }

  // Function to update tooltip times when timezone changes (without repositioning)
  function updateTooltipTimezone() {
    if (!currentTooltipSession || !tipEl || tipEl.hidden) return;
    
    const sess = currentTooltipSession;
    const openConverted = convertToTimezone(sess.open);
    const closeConverted = convertToTimezone(sess.close);
    const crossesMidnight = openConverted > closeConverted;
    const tzName = currentTimezone.name;
    
    tipOpen.textContent = fmtTime(openConverted) + ' ' + tzName;
    
    if (crossesMidnight) {
      tipClose.textContent = fmtTime(closeConverted) + ' (Next Day) ' + tzName;
    } else {
      tipClose.textContent = fmtTime(closeConverted) + ' ' + tzName;
    }
  }

  /* ── Update live state ── */
  function update() {
    const nowMin = utcNowMin();

    SESSIONS.forEach(sess => {
      const status = getStatus(sess, nowMin);

      /* Update all bar segments for this session */
      sess.segs.forEach((seg, i) => {
        const bar = $(`fxtBar_${sess.id}_${i}`);
        if (bar) {
          bar.className = 'fxt-bar fxt-bar-' + status;
        }
      });

      /* Update status dot (only for last segment) */
      const dot = $(`fxtDot_${sess.id}`);
      if (dot) {
        dot.className = 'fxt-dot fxt-dot-' + status;
        
        // Position dot after the rightmost bar segment
        const lastSegIndex = sess.segs.length - 1;
        const lastBar = $(`fxtBar_${sess.id}_${lastSegIndex}`);
        if (lastBar) {
          const track = lastBar.parentElement;
          if (track) {
            const trackRect = track.getBoundingClientRect();
            const barRect = lastBar.getBoundingClientRect();
            const dotLeft = (barRect.right - trackRect.left) + 6; // 6px gap after bar
            dot.style.left = dotLeft + 'px';
          }
        }
      }
    });

    /* Needle - position based on current time in selected timezone */
    const scrollWrap = $('fxtScrollWrap');
    if (needleEl && scrollWrap) {
      const trackW = scrollWrap.offsetWidth;
      if (trackW > 0) {
        // Show needle at converted timezone position
        const convertedNowMin = convertToTimezone(nowMin);
        needleEl.hidden = false;
        needleEl.style.left = (pct(convertedNowMin) / 100 * trackW) + 'px';
      }
    }
  }

  /* ── Clock (1s) ── */
  function tickClock() {
    const d = new Date();
    const utcMin = d.getUTCHours() * 60 + d.getUTCMinutes();
    const convertedMin = convertToTimezone(utcMin);
    const h = Math.floor(convertedMin / 60);
    const m = convertedMin % 60;
    const s = d.getUTCSeconds();
    
    const hh = String(h).padStart(2,'0');
    const mm = String(m).padStart(2,'0');
    const ss = String(s).padStart(2,'0');
    
    if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
  }

  /* ── Init ── */
  let _started = false;
  function init() {
    if (_started) { 
      update(); 
      return; 
    }
    _started = true;
    buildStatic();
    update();
    tickClock();
    setInterval(tickClock, 1000);
    setInterval(() => {
      update();
    }, 10000); // Update every 10 seconds
  }

  /* Hook into market page init */
  const _origInit = window.initializeMarketPage;
  window.initializeMarketPage = function () {
    if (_origInit) _origInit.apply(this, arguments);
    init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if ($('marketPage') && !$('marketPage').hidden) init();
    });
  } else {
    if ($('marketPage') && !$('marketPage').hidden) init();
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash.slice(1) === 'market') setTimeout(init, 60);
  });

}());


/* ============================================================
   BROKER SELECTION MODAL
   ============================================================ */
(function() {
  'use strict';

  // Indian and Forex brokers with local logo files
  const BROKERS = [
    { id: 'fyers', name: 'FYERS', logo: '../logos/fyers.png' },
    { id: 'angel-one', name: 'Angel One', logo: '../logos/angleone.png' },
    { id: 'dhan', name: 'Dhan', logo: '../logos/dhan.png' },
    { id: 'upstox', name: 'Upstox', logo: '../logos/upstocks.png' },
    { id: 'shoonya', name: 'Shoonya', logo: '../logos/shoonya.png' },
    { id: 'alice-blue', name: 'Alice Blue', logo: '../logos/aliceblue.png' },
    { id: 'kotak-neo', name: 'Kotak Neo', logo: '../logos/kotak neo.png' },
    { id: 'samco', name: 'SAMCO', logo: '../logos/samco.png' },
    { id: 'mt5', name: 'MetaTrader 5', logo: '../logos/MetaTrader_5.png', isMetaTrader: true },
    { id: 'ic-markets', name: 'IC Markets', logo: '../logos/ic markets.png', mt5Broker: true },
    { id: 'pepperstone', name: 'Pepperstone', logo: '../logos/pepperstone.png', mt5Broker: true },
    { id: 'fp-markets', name: 'FP Markets', logo: '../logos/fp markets.png', mt5Broker: true },
    { id: 'xm', name: 'XM', logo: '../logos/XM-logo.jpg', mt5Broker: true },
    { id: 'fxtm', name: 'FXTM', logo: '../logos/fxtm-logo-r-dark.png', mt5Broker: true },
    { id: 'vantage', name: 'Vantage', logo: '../logos/vantage.png', mt5Broker: true },
    { id: 'exness', name: 'Exness', logo: '../logos/exness.jpg', mt5Broker: true },
    { id: 'fusion-markets', name: 'Fusion Markets', logo: '../logos/fusion market.png', mt5Broker: true },
  ];

  // DOM elements
  const modal = document.getElementById('brokerModal');
  const modalClose = document.getElementById('brokerModalClose');
  const searchInput = document.getElementById('brokerSearchInput');
  const modalContent = document.getElementById('brokerModalContent');
  const connectBrokerBtn = document.querySelector('.jbtn-ghost');

  if (!modal || !connectBrokerBtn) return;

  let filteredBrokers = [...BROKERS];

  // Render broker cards
  function renderBrokers(brokers) {
    if (brokers.length === 0) {
      modalContent.innerHTML = '<div class="broker-no-results">No brokers found</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'broker-cards-grid';

    brokers.forEach(broker => {
      const card = document.createElement('div');
      card.className = 'broker-card';
      card.dataset.brokerId = broker.id;

      const logo = document.createElement('div');
      logo.className = 'broker-card-logo';
      
      // Create img element for broker logo
      const img = document.createElement('img');
      img.src = broker.logo;
      img.alt = broker.name + ' logo';
      img.className = 'broker-logo-img';
      img.onerror = function() {
        // Fallback if image doesn't load - show first letter
        this.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.className = 'broker-logo-fallback';
        fallback.textContent = broker.name.charAt(0);
        logo.appendChild(fallback);
      };
      logo.appendChild(img);

      const name = document.createElement('div');
      name.className = 'broker-card-name';
      name.textContent = broker.name;

      card.appendChild(logo);
      card.appendChild(name);
      grid.appendChild(card);

      // Click handler for broker selection
      card.addEventListener('click', () => {
        selectBroker(broker);
      });
    });

    modalContent.innerHTML = '';
    modalContent.appendChild(grid);
  }

  // Open modal
  function openModal() {
    modal.hidden = false;
    searchInput.value = '';
    filteredBrokers = [...BROKERS];
    renderBrokers(filteredBrokers);
    searchInput.focus();
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  // Select broker
  async function selectBroker(broker) {
    console.log('Selected broker:', broker.name);
    
    // Only Angel One is currently implemented
    if (broker.id !== 'angel-one') {
      alert(`${broker.name} integration coming soon.\n\nCurrently only Angel One is available.`);
      return;
    }

    // Check if already connected
    if (window.brokerAPI && window.brokerAPI.isConnected(broker.id)) {
      showBrokerDashboard(broker.id);
      closeModal();
      return;
    }

    // Show connecting state
    showToast(`Connecting to ${broker.name}...`, 'info');
    
    try {
      // Check backend health first
      if (!window.brokerAPI) {
        throw new Error('Broker API not loaded. Please refresh the page.');
      }

      const healthy = await window.brokerAPI.checkHealth();
      if (!healthy) {
        throw new Error('Backend server is not running. Please start it with "npm run dev" in the backend folder.');
      }

      // Attempt connection
      const result = await window.brokerAPI.connect(broker.id);
      
      if (result.success) {
        showToast(`Connected to ${broker.name} successfully!`, 'success');
        closeModal();
        
        // Load and show broker data
        await loadBrokerData(broker.id);
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      showToast(error.message, 'error');
    }
  }

  // Search functionality
  function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
      filteredBrokers = [...BROKERS];
    } else {
      filteredBrokers = BROKERS.filter(broker => 
        broker.name.toLowerCase().includes(query)
      );
    }
    
    renderBrokers(filteredBrokers);
  }

  // Event listeners
  connectBrokerBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);
  searchInput.addEventListener('input', handleSearch);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // BROKER DATA & DASHBOARD
  // ─────────────────────────────────────────────────────────────────

  /**
   * Load broker data after successful connection
   */
  async function loadBrokerData(brokerId) {
    try {
      const brokerName = BROKERS.find(b => b.id === brokerId)?.name || brokerId;
      
      // Fetch all data in parallel
      const [profileRes, fundsRes, positionsRes, ordersRes, holdingsRes, tradesRes] = await Promise.allSettled([
        window.brokerAPI.getProfile(brokerId),
        window.brokerAPI.getFunds(brokerId),
        window.brokerAPI.getPositions(brokerId),
        window.brokerAPI.getOrders(brokerId),
        window.brokerAPI.getHoldings(brokerId),
        window.brokerAPI.getTrades(brokerId),
      ]);

      // Store data in global state
      window.brokerData = window.brokerData || {};
      window.brokerData[brokerId] = {
        profile: profileRes.status === 'fulfilled' && profileRes.value.success ? profileRes.value.data : null,
        funds: fundsRes.status === 'fulfilled' && fundsRes.value.success ? fundsRes.value.data : null,
        positions: positionsRes.status === 'fulfilled' && positionsRes.value.success ? positionsRes.value.data : [],
        orders: ordersRes.status === 'fulfilled' && ordersRes.value.success ? ordersRes.value.data : [],
        holdings: holdingsRes.status === 'fulfilled' && holdingsRes.value.success ? holdingsRes.value.data : [],
        trades: tradesRes.status === 'fulfilled' && tradesRes.value.success ? tradesRes.value.data : [],
      };

      // Show broker dashboard
      showBrokerDashboard(brokerId);

      // Log summary
      console.log(`✓ Loaded ${brokerName} data:`, {
        profile: window.brokerData[brokerId].profile ? 'Yes' : 'No',
        funds: window.brokerData[brokerId].funds ? 'Yes' : 'No',
        positions: window.brokerData[brokerId].positions.length,
        orders: window.brokerData[brokerId].orders.length,
        holdings: window.brokerData[brokerId].holdings.length,
        trades: window.brokerData[brokerId].trades.length,
      });

    } catch (error) {
      console.error('Failed to load broker data:', error);
      showToast('Connected but failed to load some data. Check console for details.', 'warning');
    }
  }

  /**
   * Show broker dashboard with account data
   */
  function showBrokerDashboard(brokerId) {
    const data = window.brokerData?.[brokerId];
    if (!data) {
      console.warn('No broker data available');
      return;
    }

    const brokerName = BROKERS.find(b => b.id === brokerId)?.name || brokerId;

    // Update Portfolio page with broker data
    updatePortfolioPage(brokerId, data);

    // Navigate to Portfolio page to show data
    window.location.hash = '#portfolio';
    
    showToast(`${brokerName} data loaded. View in Portfolio tab.`, 'success');
  }

  /**
   * Update Portfolio page with broker data
   */
  function updatePortfolioPage(brokerId, data) {
    const portfolioPage = document.getElementById('portfolioPage');
    if (!portfolioPage) return;

    const brokerName = BROKERS.find(b => b.id === brokerId)?.name || brokerId;

    // Replace "Coming Soon" with actual data
    portfolioPage.innerHTML = `
      <div class="page-hero">
        <h1 class="page-title">Portfolio</h1>
        <p class="page-subtitle">${brokerName} • Connected</p>
      </div>

      <!-- Account Summary -->
      <div class="broker-dashboard">
        <div class="broker-dashboard-header">
          <h2 class="section-heading">Account Overview</h2>
          <button class="btn-ghost" id="refreshBrokerData">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
          <button class="btn-ghost" id="disconnectBroker">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Disconnect
          </button>
        </div>

        ${renderProfileCard(data.profile)}
        ${renderFundsCard(data.funds)}
        ${renderPositionsTable(data.positions)}
        ${renderOrdersTable(data.orders)}
        ${renderHoldingsTable(data.holdings)}
        ${renderTradesTable(data.trades)}
      </div>
    `;

    // Add event listeners
    const refreshBtn = document.getElementById('refreshBrokerData');
    const disconnectBtn = document.getElementById('disconnectBroker');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => loadBrokerData(brokerId));
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', async () => {
        const confirmed = confirm(`Disconnect from ${brokerName}?`);
        if (confirmed) {
          // Disconnect WebSocket first
          if (window.websocketClient) {
            window.websocketClient.disconnect();
          }
          
          const result = await window.brokerAPI.disconnect(brokerId);
          if (result.success) {
            delete window.brokerData[brokerId];
            showToast('Disconnected successfully', 'success');
            // Reset portfolio page
            portfolioPage.innerHTML = `
              <div class="page-hero">
                <h1 class="page-title">Portfolio</h1>
                <p class="page-subtitle">Track holdings, performance, and analytics</p>
              </div>
              <div class="coming-soon-card">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <h2>Portfolio Tracker Coming Soon</h2>
                <p>Holdings, performance metrics, P&L tracking, and analytics will be available here.</p>
              </div>
            `;
          } else {
            showToast(`Disconnect failed: ${result.error}`, 'error');
          }
        }
      });
    }

    // Initialize WebSocket for real-time updates
    if (window.websocketClient) {
      console.log('Initializing WebSocket for real-time updates');
      window.websocketClient.initialize(brokerId);
    }

    // Initialize order placement functionality
    if (window.orderPlacement) {
      window.orderPlacement.initialize(brokerId);
    }

    // Store broker data globally for WebSocket updates
    window.brokerData = data;
  }

  /**
   * Render profile card
   */
  function renderProfileCard(profile) {
    if (!profile) return '<div class="data-section"><p class="empty-message">Profile data not available</p></div>';

    return `
      <div class="data-section">
        <h3 class="data-section-title">Profile</h3>
        <div class="data-grid">
          ${profile.clientId ? `<div class="data-item"><span class="data-label">Client ID</span><span class="data-value">${escapeHtml(profile.clientId)}</span></div>` : ''}
          ${profile.name ? `<div class="data-item"><span class="data-label">Name</span><span class="data-value">${escapeHtml(profile.name)}</span></div>` : ''}
          ${profile.email ? `<div class="data-item"><span class="data-label">Email</span><span class="data-value">${escapeHtml(profile.email)}</span></div>` : ''}
          ${profile.mobile ? `<div class="data-item"><span class="data-label">Mobile</span><span class="data-value">${escapeHtml(profile.mobile)}</span></div>` : ''}
          ${profile.exchanges ? `<div class="data-item"><span class="data-label">Exchanges</span><span class="data-value">${profile.exchanges.join(', ')}</span></div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render funds card
   */
  function renderFundsCard(funds) {
    if (!funds) return '<div class="data-section" data-section="funds"><p class="empty-message">Funds data not available</p></div>';

    return `
      <div class="data-section" data-section="funds">
        <h3 class="data-section-title">Available Funds</h3>
        <div class="data-grid">
          ${funds.availableMargin !== undefined ? `<div class="data-item"><span class="data-label">Available Margin</span><span class="data-value">${inr(funds.availableMargin)}</span></div>` : ''}
          ${funds.usedMargin !== undefined ? `<div class="data-item"><span class="data-label">Used Margin</span><span class="data-value">${inr(funds.usedMargin)}</span></div>` : ''}
          ${funds.collateral !== undefined ? `<div class="data-item"><span class="data-label">Collateral</span><span class="data-value">${inr(funds.collateral)}</span></div>` : ''}
          ${funds.withdrawableBalance !== undefined ? `<div class="data-item"><span class="data-label">Withdrawable</span><span class="data-value">${inr(funds.withdrawableBalance)}</span></div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render positions table
   */
  function renderPositionsTable(positions) {
    if (!positions || positions.length === 0) {
      return '<div class="data-section" data-section="positions"><h3 class="data-section-title">Positions</h3><p class="empty-message">No open positions</p></div>';
    }

    const rows = positions.map(pos => `
      <tr>
        <td>${escapeHtml(pos.symbol)}</td>
        <td>${escapeHtml(pos.product)}</td>
        <td>${pos.quantity > 0 ? 'Buy' : 'Sell'}</td>
        <td>${Math.abs(pos.quantity)}</td>
        <td>${pos.averagePrice?.toFixed(2) || '-'}</td>
        <td>${pos.ltp?.toFixed(2) || '-'}</td>
        <td class="${pos.pnl >= 0 ? 'text-profit' : 'text-loss'}">${pos.pnl?.toFixed(2) || '-'}</td>
      </tr>
    `).join('');

    return `
      <div class="data-section" data-section="positions">
        <h3 class="data-section-title">Positions (${positions.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Product</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Avg Price</th>
                <th>LTP</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Render orders table
   */
  function renderOrdersTable(orders) {
    if (!orders || orders.length === 0) {
      return '<div class="data-section" data-section="orders"><h3 class="data-section-title">Orders</h3><p class="empty-message">No orders</p></div>';
    }

    const rows = orders.map(order => `
      <tr>
        <td>${escapeHtml(order.symbol)}</td>
        <td>${escapeHtml(order.orderType)}</td>
        <td>${escapeHtml(order.side)}</td>
        <td>${order.quantity}</td>
        <td>${order.price?.toFixed(2) || 'Market'}</td>
        <td><span class="order-status order-status-${order.status.toLowerCase()}">${escapeHtml(order.status)}</span></td>
      </tr>
    `).join('');

    return `
      <div class="data-section" data-section="orders">
        <h3 class="data-section-title">Orders (${orders.length})
          <button class="btn-primary btn-place-order" style="margin-left: 12px; font-size: 12px; padding: 4px 8px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Place Order
          </button>
        </h3>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Render holdings table
   */
  function renderHoldingsTable(holdings) {
    if (!holdings || holdings.length === 0) {
      return '<div class="data-section" data-section="holdings"><h3 class="data-section-title">Holdings</h3><p class="empty-message">No holdings</p></div>';
    }

    const rows = holdings.map(holding => `
      <tr>
        <td>${escapeHtml(holding.symbol)}</td>
        <td>${holding.quantity}</td>
        <td>${holding.averagePrice?.toFixed(2) || '-'}</td>
        <td>${holding.ltp?.toFixed(2) || '-'}</td>
        <td class="${holding.pnl >= 0 ? 'text-profit' : 'text-loss'}">${holding.pnl?.toFixed(2) || '-'}</td>
      </tr>
    `).join('');

    return `
      <div class="data-section" data-section="holdings">
        <h3 class="data-section-title">Holdings (${holdings.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Avg Price</th>
                <th>LTP</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Render trades table
   */
  function renderTradesTable(trades) {
    if (!trades || trades.length === 0) {
      return '<div class="data-section" data-section="trades"><h3 class="data-section-title">Trades</h3><p class="empty-message">No trades today</p></div>';
    }

    const rows = trades.map(trade => `
      <tr>
        <td>${trade.time || '-'}</td>
        <td>${escapeHtml(trade.symbol)}</td>
        <td>${escapeHtml(trade.side)}</td>
        <td>${trade.quantity}</td>
        <td>${trade.price?.toFixed(2) || '-'}</td>
      </tr>
    `).join('');

    return `
      <div class="data-section" data-section="trades">
        <h3 class="data-section-title">Trades (${trades.length})</h3>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.broker-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `broker-toast broker-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('broker-toast-show'), 10);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove('broker-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

}());

/**
 * Order Placement Modal and Functions
 */
(function() {
  'use strict';

  let currentBrokerId = null;

  /**
   * Initialize order placement functionality
   */
  function initializeOrderPlacement(brokerId) {
    currentBrokerId = brokerId;
    
    // Add event listener to place order button
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn-place-order')) {
        e.preventDefault();
        showOrderModal();
      }
    });
  }

  /**
   * Show order placement modal
   */
  function showOrderModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.order-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Place Order</h3>
          <button class="modal-close">&times;</button>
        </div>
        <form class="order-form" id="orderForm">
          <div class="form-row">
            <div class="form-group">
              <label for="orderSymbol">Symbol *</label>
              <input type="text" id="orderSymbol" name="symbol" required placeholder="e.g. RELIANCE-EQ">
            </div>
            <div class="form-group">
              <label for="orderSide">Side *</label>
              <select id="orderSide" name="side" required>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="orderQuantity">Quantity *</label>
              <input type="number" id="orderQuantity" name="quantity" required min="1" placeholder="1">
            </div>
            <div class="form-group">
              <label for="orderType">Order Type *</label>
              <select id="orderType" name="orderType" required>
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
                <option value="STOPLOSS_LIMIT">Stop Loss Limit</option>
                <option value="STOPLOSS_MARKET">Stop Loss Market</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="orderPrice">Price</label>
              <input type="number" id="orderPrice" name="price" step="0.05" placeholder="0.00">
            </div>
            <div class="form-group">
              <label for="orderProduct">Product *</label>
              <select id="orderProduct" name="product" required>
                <option value="INTRADAY">Intraday</option>
                <option value="DELIVERY">Delivery</option>
                <option value="CARRYFORWARD">Carry Forward</option>
                <option value="MARGIN">Margin</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="orderExchange">Exchange</label>
              <select id="orderExchange" name="exchange">
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="NFO">NFO</option>
                <option value="BFO">BFO</option>
                <option value="MCX">MCX</option>
              </select>
            </div>
            <div class="form-group">
              <label for="orderDuration">Duration</label>
              <select id="orderDuration" name="duration">
                <option value="DAY">Day</option>
                <option value="IOC">IOC</option>
              </select>
            </div>
          </div>
          <div class="order-summary">
            <p><strong>Order Summary:</strong></p>
            <div id="orderSummaryContent">Select order details to see summary</div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" id="cancelOrder">Cancel</button>
            <button type="submit" class="btn-primary" id="confirmOrder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
              Place Order
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    setupOrderModalEventListeners();

    // Focus on symbol input
    setTimeout(() => {
      document.getElementById('orderSymbol').focus();
    }, 100);
  }

  /**
   * Setup order modal event listeners
   */
  function setupOrderModalEventListeners() {
    const modal = document.querySelector('.order-modal');
    const form = document.getElementById('orderForm');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelOrder');
    const backdrop = modal.querySelector('.modal-backdrop');

    // Close modal handlers
    [closeBtn, cancelBtn, backdrop].forEach(element => {
      element.addEventListener('click', closeOrderModal);
    });

    // Form submission
    form.addEventListener('submit', handleOrderSubmission);

    // Real-time order summary update
    form.addEventListener('input', updateOrderSummary);
    form.addEventListener('change', updateOrderSummary);

    // Price field visibility based on order type
    document.getElementById('orderType').addEventListener('change', (e) => {
      const priceField = document.getElementById('orderPrice');
      const priceGroup = priceField.parentElement;
      
      if (e.target.value === 'MARKET') {
        priceField.removeAttribute('required');
        priceGroup.style.opacity = '0.5';
      } else {
        priceField.setAttribute('required', 'required');
        priceGroup.style.opacity = '1';
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeOrderModal();
      }
    });
  }

  /**
   * Update order summary in real-time
   */
  function updateOrderSummary() {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const summaryContent = document.getElementById('orderSummaryContent');

    if (!data.symbol || !data.side || !data.quantity) {
      summaryContent.innerHTML = 'Select order details to see summary';
      return;
    }

    const quantity = parseInt(data.quantity) || 0;
    const price = parseFloat(data.price) || 0;
    const orderType = data.orderType || 'MARKET';
    const product = data.product || 'INTRADAY';

    let priceText = 'Market Price';
    if (orderType !== 'MARKET' && price > 0) {
      priceText = `₹${price.toFixed(2)}`;
    }

    const estimatedValue = orderType !== 'MARKET' && price > 0 ? quantity * price : 0;

    summaryContent.innerHTML = `
      <div class="summary-item">${data.side} ${quantity} shares of ${data.symbol}</div>
      <div class="summary-item">Price: ${priceText}</div>
      <div class="summary-item">Product: ${product}</div>
      ${estimatedValue > 0 ? `<div class="summary-item">Est. Value: ₹${estimatedValue.toFixed(2)}</div>` : ''}
    `;
  }

  /**
   * Handle order form submission
   */
  async function handleOrderSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    orderData.quantity = parseInt(orderData.quantity);
    if (orderData.price) {
      orderData.price = parseFloat(orderData.price);
    }

    // Validation
    if (!orderData.symbol || !orderData.side || !orderData.quantity) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (orderData.orderType !== 'MARKET' && (!orderData.price || orderData.price <= 0)) {
      showToast('Price is required for non-market orders', 'error');
      return;
    }

    // Confirmation dialog
    const orderSummary = `${orderData.side} ${orderData.quantity} shares of ${orderData.symbol} at ${orderData.orderType === 'MARKET' ? 'Market Price' : '₹' + orderData.price}`;
    const confirmed = confirm(`Confirm Order Placement:\n\n${orderSummary}\n\nThis will place a LIVE order on your broker account.`);
    
    if (!confirmed) return;

    // Disable form during submission
    const submitBtn = document.getElementById('confirmOrder');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="spinner"></div>
      Placing Order...
    `;

    try {
      // Place order via broker API
      const result = await window.brokerAPI.placeOrder(currentBrokerId, orderData);
      
      if (result.success) {
        showToast(`Order placed successfully: ${result.data.orderId}`, 'success');
        closeOrderModal();
        
        // Add new order to local data immediately (will be updated via WebSocket)
        if (window.brokerData && window.brokerData.orders) {
          window.brokerData.orders.unshift(result.data);
          
          // Re-render orders table
          const ordersSection = document.querySelector('[data-section="orders"]');
          if (ordersSection) {
            const ordersHtml = renderOrdersTable(window.brokerData.orders);
            ordersSection.outerHTML = ordersHtml;
            
            // Re-attach event listeners
            attachOrderButtonListeners();
          }
        }
      } else {
        showToast(`Order placement failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      showToast(`Order placement failed: ${error.message}`, 'error');
    } finally {
      // Re-enable form
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  /**
   * Close order modal
   */
  function closeOrderModal() {
    const modal = document.querySelector('.order-modal');
    if (modal) {
      modal.remove();
    }
    
    // Remove escape key listener
    document.removeEventListener('keydown', closeOrderModal);
  }

  /**
   * Attach event listeners to order buttons
   */
  function attachOrderButtonListeners() {
    document.querySelectorAll('.btn-place-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showOrderModal();
      });
    });
  }

  // Export order placement functions
  window.orderPlacement = {
    initialize: initializeOrderPlacement,
    showModal: showOrderModal
  };

})();
/* ============================================================
   INITIALIZATION
   ============================================================ */

// Ensure broker modal buttons work properly
document.addEventListener('DOMContentLoaded', function() {
  // Check if Connect Broker button exists and add event listener
  const connectBrokerBtn = document.querySelector('.jbtn-ghost');
  const brokerModal = document.getElementById('brokerModal');
  
  if (connectBrokerBtn && brokerModal && !connectBrokerBtn.hasAttribute('data-initialized')) {
    connectBrokerBtn.setAttribute('data-initialized', 'true');
    connectBrokerBtn.addEventListener('click', function() {
      console.log('Connect Broker button clicked');
      brokerModal.hidden = false;
      document.body.style.overflow = 'hidden';
      
      // Focus search input if it exists
      const searchInput = document.getElementById('brokerSearchInput');
      if (searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
    });
  }
  
  // Check if Add Trade Note button exists and add event listener  
  const addTradeBtn = document.querySelector('#journalDashboard .jbtn-primary');
  
  if (addTradeBtn && !addTradeBtn.hasAttribute('data-initialized')) {
    addTradeBtn.setAttribute('data-initialized', 'true');
    addTradeBtn.addEventListener('click', function() {
      console.log('Add Trade Note button clicked');
      const journalDashboard = document.getElementById('journalDashboard');
      const journalCalendar = document.getElementById('journalCalendar');
      
      if (journalDashboard && journalCalendar) {
        journalDashboard.hidden = true;
        journalCalendar.hidden = false;
      }
    });
  }
  
  // Check if broker modal close button works
  const modalClose = document.getElementById('brokerModalClose');
  if (modalClose && brokerModal && !modalClose.hasAttribute('data-initialized')) {
    modalClose.setAttribute('data-initialized', 'true');
    modalClose.addEventListener('click', function() {
      brokerModal.hidden = true;
      document.body.style.overflow = '';
    });
  }
  
  // Close on overlay click
  if (brokerModal && !brokerModal.hasAttribute('data-overlay-initialized')) {
    brokerModal.setAttribute('data-overlay-initialized', 'true');
    brokerModal.addEventListener('click', function(e) {
      if (e.target === brokerModal) {
        brokerModal.hidden = true;
        document.body.style.overflow = '';
      }
    });
  }
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && brokerModal && !brokerModal.hidden) {
      brokerModal.hidden = true;
      document.body.style.overflow = '';
    }
  });
});