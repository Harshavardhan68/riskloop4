/**
 * Fetch Lot Sizes from NSE Contract Files
 * Uses NSE's official public data endpoints (bhavcopy/contract files)
 * DO NOT scrape HTML pages - use structured data files
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NSE provides contract specifications as CSV files
// Check NSE's official website for current URLs
const NSE_CONTRACT_FILE_URL = 'https://www.nseindia.com/content/fo/fo_mktlots.csv';

async function fetchLotSizes() {
  console.log('📊 Fetching lot sizes from NSE contract files...');
  
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.nseindia.com/'
    };
    
    // Read existing data to detect changes
    const dataPath = path.join(__dirname, '..', 'data', 'lot-sizes.json');
    let existingData = { instruments: [], recentChanges: [] };
    
    if (fs.existsSync(dataPath)) {
      existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    // Fetch contract file (CSV format)
    const response = await fetch(NSE_CONTRACT_FILE_URL, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvData = await response.text();
    const instruments = parseContractCSV(csvData);
    
    // Detect changes by comparing with existing data
    const recentChanges = detectLotSizeChanges(existingData.instruments, instruments);
    
    const lotSizeData = {
      instruments: instruments,
      recentChanges: recentChanges.slice(0, 10), // Keep last 10 changes
      lastUpdated: new Date().toISOString(),
      source: 'NSE Contract Files',
      note: 'Synced from NSE official contract specifications'
    };
    
    // Write to data/lot-sizes.json
    fs.writeFileSync(dataPath, JSON.stringify(lotSizeData, null, 2));
    
    console.log(`✅ Updated lot sizes for ${instruments.length} instruments`);
    console.log(`📝 Detected ${recentChanges.length} recent changes`);
    console.log(`📝 Written to: ${dataPath}`);
    
  } catch (error) {
    console.error('❌ Error fetching lot sizes:', error);
    console.log('⚠️  Keeping existing lot size data');
  }
}

function parseContractCSV(csvText) {
  // Parse NSE contract CSV format
  // Typical format: Symbol,Name,Exchange,InstrumentType,LotSize
  const lines = csvText.split('\n').slice(1); // Skip header
  
  return lines
    .filter(line => line.trim())
    .map(line => {
      const [symbol, name, exchange, type, lotSize] = line.split(',');
      return {
        symbol: symbol?.trim(),
        name: name?.trim(),
        exchange: exchange?.trim() || 'NSE',
        type: type?.trim() || 'Index',
        lotSize: parseInt(lotSize) || 0,
        updated: new Date().toISOString().split('T')[0]
      };
    })
    .filter(item => item.symbol && item.lotSize > 0);
}

function detectLotSizeChanges(oldInstruments, newInstruments) {
  const changes = [];
  const oldMap = new Map(oldInstruments.map(i => [i.symbol, i]));
  
  for (const newInst of newInstruments) {
    const oldInst = oldMap.get(newInst.symbol);
    
    if (oldInst && oldInst.lotSize !== newInst.lotSize) {
      const changePercent = ((newInst.lotSize - oldInst.lotSize) / oldInst.lotSize * 100).toFixed(2);
      
      changes.push({
        symbol: newInst.symbol,
        oldSize: oldInst.lotSize,
        newSize: newInst.lotSize,
        effectiveDate: newInst.updated,
        changePercent: parseFloat(changePercent)
      });
    }
  }
  
  return changes;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchLotSizes();
}

export { fetchLotSizes };
