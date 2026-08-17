/**
 * MT5 Economic Calendar Bridge Integration Test Suite
 * Tests:
 * 1. Valid authenticated POST with x-mt5-bridge-secret
 * 2. Missing secret (HTTP 401)
 * 3. Invalid secret (HTTP 401)
 * 4. Malformed payload (HTTP 400)
 * 5. GET calendar records & chronological sorting
 * 6. Country, currency, impact, and date range query filters
 * 7. Schema normalization verification (13 fields)
 */

import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
let BRIDGE_SECRET = 'riskloop_mt5_bridge_secret_2026';

try {
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  const match = envContent.match(/MT5_CALENDAR_BRIDGE_SECRET=(.*)/);
  if (match && match[1].trim()) {
    BRIDGE_SECRET = match[1].trim();
  }
} catch (e) {}

async function runBridgeTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🧪 MT5 Economic Calendar Bridge Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ── TEST 1: Missing Secret (HTTP 401) ──────────────────────────────────
  console.log('📌 Test 1: Missing Secret (x-mt5-bridge-secret header absent)');
  try {
    const res = await fetch(`${BASE_URL}/api/economic-calendar/mt5`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'US Non-Farm Payrolls',
        country: 'US',
        eventTime: new Date().toISOString()
      })
    });
    const json = await res.json();
    assert(res.status === 401, `Status code is 401 (got ${res.status})`);
    assert(json.success === false, 'Response success is false');
    assert(json.error === 'Unauthorized', 'Error is Unauthorized');
  } catch (err) {
    assert(false, `Test 1 threw error: ${err.message}`);
  }

  // ── TEST 2: Invalid Secret (HTTP 401) ──────────────────────────────────
  console.log('\n📌 Test 2: Invalid Secret in Header');
  try {
    const res = await fetch(`${BASE_URL}/api/economic-calendar/mt5`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mt5-bridge-secret': 'wrong_secret_12345'
      },
      body: JSON.stringify({
        event: 'US Non-Farm Payrolls',
        country: 'US',
        eventTime: new Date().toISOString()
      })
    });
    const json = await res.json();
    assert(res.status === 401, `Status code is 401 (got ${res.status})`);
    assert(json.success === false, 'Response success is false');
    assert(json.message.includes('Invalid'), `Error message indicates invalid secret (${json.message})`);
  } catch (err) {
    assert(false, `Test 2 threw error: ${err.message}`);
  }

  // ── TEST 3: Malformed Payload (HTTP 400) ──────────────────────────────
  console.log('\n📌 Test 3: Malformed Payload Validation');
  try {
    const res = await fetch(`${BASE_URL}/api/economic-calendar/mt5`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mt5-bridge-secret': BRIDGE_SECRET
      },
      body: JSON.stringify({
        // Missing required 'event' and 'eventTime'
        country: 'US',
        impact: 'high'
      })
    });
    const json = await res.json();
    assert(res.status === 400, `Status code is 400 (got ${res.status})`);
    assert(json.success === false, 'Response success is false');
    assert(json.error === 'Validation Error', 'Error identified as Validation Error');
  } catch (err) {
    assert(false, `Test 3 threw error: ${err.message}`);
  }

  // ── TEST 4: Valid Authenticated POST & Normalization ───────────────────
  console.log('\n📌 Test 4: Valid Authenticated POST (Single & Batch records)');
  const sampleRecords = [
    {
      id: 'MT5_IN_WPI_2026',
      country: 'India',
      countryCode: 'IN',
      currency: 'INR',
      event: 'WPI Inflation YoY',
      eventCode: 'IN_WPI_YOY',
      eventTime: '2026-08-18T06:30:00.000Z',
      impact: 'high',
      actual: '3.42%',
      forecast: '3.50%',
      previous: '3.36%',
      revisedPrevious: '3.38%',
      source: 'MetaTrader 5 MQL5'
    },
    {
      id: 'MT5_US_FOMC_2026',
      country: 'United States',
      countryCode: 'US',
      currency: 'USD',
      event: 'FOMC Interest Rate Decision',
      eventCode: 'US_FED_RATE',
      eventTime: '2026-08-19T18:00:00.000Z',
      impact: 'high',
      actual: '—',
      forecast: '5.25%',
      previous: '5.50%',
      revisedPrevious: '—',
      source: 'MetaTrader 5 MQL5'
    },
    {
      id: 'MT5_GB_GDP_2026',
      country: 'United Kingdom',
      countryCode: 'GB',
      currency: 'GBP',
      event: 'GDP (MoM)',
      eventCode: 'GB_GDP_MOM',
      eventTime: '2026-08-17T07:00:00.000Z',
      impact: 'medium',
      actual: '0.2%',
      forecast: '0.1%',
      previous: '0.0%',
      revisedPrevious: '—',
      source: 'MetaTrader 5 MQL5'
    }
  ];

  try {
    const res = await fetch(`${BASE_URL}/api/economic-calendar/mt5`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mt5-bridge-secret': BRIDGE_SECRET
      },
      body: JSON.stringify({ events: sampleRecords })
    });
    const json = await res.json();
    assert(res.status === 200, `Status code is 200 OK (got ${res.status})`);
    assert(json.success === true, 'Response success is true');
    assert(json.count === 3, `Processed count is 3 (got ${json.count})`);

    // Verify normalization fields
    const item = json.data[0];
    const requiredFields = [
      'id', 'country', 'countryCode', 'currency', 'event', 'eventCode',
      'eventTime', 'impact', 'actual', 'forecast', 'previous', 'revisedPrevious', 'source'
    ];
    const hasAllFields = requiredFields.every(f => f in item);
    assert(hasAllFields, `Normalized record has all 13 required schema fields: [${requiredFields.join(', ')}]`);
    assert(item.currency === 'INR', `Currency normalized to INR (got ${item.currency})`);
    assert(item.countryCode === 'IN', `Country code normalized to IN (got ${item.countryCode})`);
  } catch (err) {
    assert(false, `Test 4 threw error: ${err.message}`);
  }

  // ── TEST 5: GET /api/economic-calendar & Chronological Sorting ─────────
  console.log('\n📌 Test 5: GET /api/economic-calendar & Chronological Sorting');
  try {
    const res = await fetch(`${BASE_URL}/api/economic-calendar`);
    const json = await res.json();
    assert(res.status === 200, `Status code is 200 OK (got ${res.status})`);
    assert(json.success === true, 'Response success is true');
    assert(Array.isArray(json.events), 'Response contains events array');
    assert(json.events.length >= 3, `Events array contains ingested items (got ${json.events.length})`);

    // Verify chronological order
    let isSorted = true;
    for (let i = 1; i < json.events.length; i++) {
      const prev = new Date(json.events[i - 1].eventTime).getTime();
      const curr = new Date(json.events[i].eventTime).getTime();
      if (prev > curr) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Events are chronologically sorted by eventTime (ascending)');
  } catch (err) {
    assert(false, `Test 5 threw error: ${err.message}`);
  }

  // ── TEST 6: Query Filtering (Country, Currency, Impact, Date) ──────────
  console.log('\n📌 Test 6: Query Filters (country, currency, impact, from/to)');
  try {
    // 6a: Filter by Country (IN)
    const inRes = await fetch(`${BASE_URL}/api/economic-calendar?country=IN`);
    const inJson = await inRes.json();
    const allIndia = inJson.events.every(e => e.countryCode === 'IN' || e.country.toLowerCase().includes('india'));
    assert(allIndia && inJson.events.length > 0, `Filter country=IN returned only India events (${inJson.events.length} found)`);

    // 6b: Filter by Currency (USD)
    const usdRes = await fetch(`${BASE_URL}/api/economic-calendar?currency=USD`);
    const usdJson = await usdRes.json();
    const allUSD = usdJson.events.every(e => e.currency === 'USD');
    assert(allUSD && usdJson.events.length > 0, `Filter currency=USD returned only USD events (${usdJson.events.length} found)`);

    // 6c: Filter by Impact (high)
    const impactRes = await fetch(`${BASE_URL}/api/economic-calendar?impact=high`);
    const impactJson = await impactRes.json();
    const allHigh = impactJson.events.every(e => e.impact === 'high');
    assert(allHigh && impactJson.events.length > 0, `Filter impact=high returned only high-impact events (${impactJson.events.length} found)`);

    // 6d: Date Range Filter (from/to)
    const from = '2026-08-18T00:00:00.000Z';
    const to = '2026-08-18T23:59:59.000Z';
    const dateRes = await fetch(`${BASE_URL}/api/economic-calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const dateJson = await dateRes.json();
    const inRange = dateJson.events.every(e => {
      const t = new Date(e.eventTime).getTime();
      return t >= new Date(from).getTime() && t <= new Date(to).getTime();
    });
    assert(inRange, `Date range filtering accurately restricted events within window (${dateJson.events.length} found)`);
  } catch (err) {
    assert(false, `Test 6 threw error: ${err.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) process.exit(1);
}

runBridgeTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
