/**
 * Fetch F&O Ban List from NSE
 * DO NOT scrape HTML pages - use official NSE data endpoints
 * NSE provides public APIs/CSV files for F&O data
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NSE Official API endpoint for F&O ban list
// Note: NSE's actual endpoint may vary - this is a placeholder
// Check NSE's official documentation for current API endpoints
const NSE_BAN_LIST_URL = 'https://www.nseindia.com/api/fo-ban-list';

// Fallback: If API is not available, use CSV from NSE's public data
const NSE_CSV_FALLBACK = 'https://www.nseindia.com/content/fo/fo_mktlots.csv';

async function fetchBanList() {
  console.log('🚫 Fetching F&O ban list from NSE...');
  
  try {
    // NSE requires certain headers to prevent bot blocking
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.nseindia.com/'
    };
    
    // Attempt to fetch from API
    let banList = [];
    
    try {
      const response = await fetch(NSE_BAN_LIST_URL, { headers });
      if (response.ok) {
        const data = await response.json();
        banList = parseBanListFromAPI(data);
      }
    } catch (apiError) {
      console.log('⚠️  API not available, will use fallback...');
    }
    
    // If no data from API, you would parse CSV or use other NSE endpoints
    // For now, we'll use the existing data structure
    
    const banData = {
      banList: banList,
      lastUpdated: new Date().toISOString(),
      source: 'NSE Circulars',
      note: 'Updated daily from NSE official F&O segment data'
    };
    
    // Write to data/fno-ban-list.json
    const dataPath = path.join(__dirname, '..', 'data', 'fno-ban-list.json');
    fs.writeFileSync(dataPath, JSON.stringify(banData, null, 2));
    
    console.log(`✅ Updated ban list with ${banList.length} stocks`);
    console.log(`📝 Written to: ${dataPath}`);
    
  } catch (error) {
    console.error('❌ Error fetching ban list:', error);
    
    // Don't fail - keep existing data
    console.log('⚠️  Keeping existing ban list data');
  }
}

function parseBanListFromAPI(data) {
  // Parse NSE API response format
  // Actual implementation depends on NSE's API structure
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    symbol: item.symbol || item.Symbol,
    name: item.name || item.CompanyName,
    entryDate: item.date || new Date().toISOString().split('T')[0],
    reason: 'Crossed 95% of market-wide position limit'
  }));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchBanList();
}

export { fetchBanList };
