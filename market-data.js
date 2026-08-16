/* ============================================================
   MARKET DATA MODULE
   Fetches data from JSON files via CDN (jsdelivr GitHub CDN)
   Architecture: Data layer separated from business logic and UI
   ============================================================ */

// CDN Base URL - Update with your GitHub username and repo name
// Example: https://cdn.jsdelivr.net/gh/username/riskloop@main/data/
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME@main/data/';

/* ============================================================
   DATA FETCHING LAYER
   ============================================================ */

/**
 * Fetch JSON from CDN with error handling and caching
 * @param {string} filename - JSON filename to fetch
 * @returns {Promise<Object>} Parsed JSON data
 */
async function fetchMarketData(filename) {
  try {
    let url = `${CDN_BASE}${filename}`;
    if (CDN_BASE.includes('YOUR_GITHUB_USERNAME') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname) {
      url = `./data/${filename}`;
    }
    
    let response;
    try {
      response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok && url !== `./data/${filename}`) {
        response = await fetch(`./data/${filename}`);
      }
    } catch (e) {
      response = await fetch(`./data/${filename}`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    throw error;
  }
}

/**
 * Fetch market status configuration
 */
async function fetchMarketStatusConfig() {
  return await fetchMarketData('market-status-config.json');
}

/**
 * Fetch NSE holidays list
 */
async function fetchNSEHolidays() {
  return await fetchMarketData('nse-holidays.json');
}

/**
 * Fetch expiry rules configuration
 */
async function fetchExpiryRules() {
  return await fetchMarketData('expiry-rules.json');
}

/**
 * Fetch economic calendar events
 */
async function fetchEconomicCalendar() {
  return await fetchMarketData('economic-calendar.json');
}

/**
 * Fetch F&O ban list
 */
async function fetchBanList() {
  return await fetchMarketData('fno-ban-list.json');
}

/**
 * Fetch lot sizes data
 */
async function fetchLotSizes() {
  return await fetchMarketData('lot-sizes.json');
}

/**
 * Fetch market news
 */
async function fetchMarketNews() {
  return await fetchMarketData('market-news.json');
}

/* ============================================================
   BUSINESS LOGIC LAYER
   Date calculations and market status determination
   ============================================================ */

/**
 * Check if a given date is a trading holiday
 * @param {Date} date - Date to check
 * @param {Array} holidays - Array of holiday objects
 * @returns {boolean} True if it's a holiday
 */
function isHoliday(date, holidays) {
  const dateStr = date.toISOString().split('T')[0];
  return holidays.some(h => h.date === dateStr);
}

/**
 * Check if market is currently open
 * @param {Object} config - Market configuration (trading hours, days)
 * @param {Array} holidays - List of holidays
 * @returns {Object} { isOpen: boolean, reason: string }
 */
function isMarketOpen(config, holidays) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 6=Saturday
  
  // Check if today is a trading day (Monday-Friday)
  if (!config.tradingDays.includes(dayOfWeek)) {
    return { isOpen: false, reason: 'Weekend' };
  }
  
  // Check if today is a holiday
  if (isHoliday(now, holidays)) {
    return { isOpen: false, reason: 'Holiday' };
  }
  
  // Check trading hours
  const [startHour, startMin] = config.tradingHours.start.split(':').map(Number);
  const [endHour, endMin] = config.tradingHours.end.split(':').map(Number);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (currentMinutes < startMinutes) {
    return { isOpen: false, reason: 'Before trading hours' };
  }
  
  if (currentMinutes > endMinutes) {
    return { isOpen: false, reason: 'After trading hours' };
  }
  
  return { isOpen: true, reason: 'Trading in progress' };
}

/**
 * Get next occurrence of a specific weekday
 * @param {string} weekdayName - 'Monday', 'Tuesday', etc.
 * @param {Date} fromDate - Starting date (default: today)
 * @returns {Date} Next occurrence of that weekday
 */
function getNextWeekday(weekdayName, fromDate = new Date()) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = weekdays.indexOf(weekdayName);
  
  if (targetDay === -1) {
    throw new Error(`Invalid weekday: ${weekdayName}`);
  }
  
  const today = new Date(fromDate);
  const currentDay = today.getDay();
  
  // Calculate days until target weekday
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7; // Move to next week
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  
  return nextDate;
}

/**
 * Get last occurrence of a specific weekday in a month
 * @param {string} weekdayName - 'Thursday', etc.
 * @param {Date} date - Date within the target month
 * @returns {Date} Last occurrence of that weekday in the month
 */
function getLastWeekdayOfMonth(weekdayName, date = new Date()) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = weekdays.indexOf(weekdayName);
  
  if (targetDay === -1) {
    throw new Error(`Invalid weekday: ${weekdayName}`);
  }
  
  // Get last day of month
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0); // Day 0 of next month = last day of current month
  
  // Work backwards to find last occurrence of target weekday
  const lastDayOfWeek = lastDay.getDay();
  let daysBack = (lastDayOfWeek - targetDay + 7) % 7;
  
  const result = new Date(lastDay);
  result.setDate(lastDay.getDate() - daysBack);
  
  return result;
}

/**
 * Calculate next expiry date for an instrument
 * @param {string} instrument - Instrument symbol (e.g., 'NIFTY')
 * @param {Object} expiryRules - Expiry rules configuration
 * @param {string} expiryType - 'weekly' or 'monthly'
 * @returns {Date} Next expiry date
 */
function calculateNextExpiry(instrument, expiryRules, expiryType = 'weekly') {
  if (expiryType === 'weekly') {
    const weekday = expiryRules.weeklyExpiry[instrument];
    if (!weekday) {
      throw new Error(`No weekly expiry rule for ${instrument}`);
    }
    return getNextWeekday(weekday);
  } else {
    // Monthly expiry - last Thursday of the month by default
    const weekday = expiryRules.monthlyExpiry.default || 'Thursday';
    return getLastWeekdayOfMonth(weekday);
  }
}

/**
 * Calculate days until a date
 * @param {Date} targetDate - Target date
 * @returns {number} Number of days
 */
function daysUntil(targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diff = targetDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Calculate relative time (e.g., "2 hours ago")
 * @param {string} isoString - ISO date string
 * @returns {string} Relative time string
 */
function getRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ============================================================
   UI RENDERING LAYER
   DOM manipulation and display logic
   ============================================================ */

/**
 * Render market status cards
 * @param {Object} nseStatus - NSE market status
 * @param {Object} bseStatus - BSE market status
 */
function renderMarketStatus(nseStatus, bseStatus) {
  const statusGrid = document.querySelector('.status-grid');
  if (!statusGrid) return;
  
  const nseCard = statusGrid.children[0];
  const bseCard = statusGrid.children[1];
  
  updateStatusCard(nseCard, nseStatus);
  updateStatusCard(bseCard, bseStatus);
}

function updateStatusCard(card, status) {
  const indicator = card.querySelector('.status-indicator');
  const statusDot = card.querySelector('.status-dot');
  const statusText = indicator.querySelector('span:last-child');
  
  if (status.isOpen) {
    indicator.className = 'status-indicator status-open';
    statusText.textContent = 'Market Open';
  } else {
    indicator.className = 'status-indicator status-closed';
    statusText.textContent = 'Market Closed';
  }
}

/**
 * Render news articles
 * @param {Array} articles - Array of news articles
 */
function renderNews(articles) {
  const newsList = document.querySelector('.news-list');
  if (!newsList) return;
  
  newsList.innerHTML = articles.map(article => {
    const categoryClass = {
      'market': 'market-news',
      'rbi': 'rbi-news',
      'sebi': 'sebi-news',
      'earnings': 'earnings-news',
      'ipo': 'ipo-news'
    }[article.category] || 'market-news';
    
    const categoryLabel = {
      'market': 'Market',
      'rbi': 'RBI',
      'sebi': 'SEBI',
      'earnings': 'Earnings',
      'ipo': 'IPO'
    }[article.category] || 'Market';
    
    return `
      <article class="news-card" data-url="${article.url}">
        <div class="news-category ${categoryClass}">${categoryLabel}</div>
        <h3 class="news-title">${article.title}</h3>
        <p class="news-excerpt">${article.excerpt}</p>
        <div class="news-meta">
          <span class="news-source">${article.source}</span>
          <span class="news-time">${getRelativeTime(article.publishedAt)}</span>
        </div>
      </article>
    `;
  }).join('');
  
  // Make news cards clickable
  newsList.querySelectorAll('.news-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

/**
 * Render economic calendar events
 * @param {Array} events - Array of calendar events
 */
function renderEconomicCalendar(events) {
  const calendarList = document.querySelector('.calendar-list');
  if (!calendarList) return;
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  calendarList.innerHTML = sortedEvents.map(event => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('en-IN', { month: 'short' });
    
    const impactClass = {
      'high': 'high-impact',
      'medium': 'medium-impact',
      'low': 'low-impact'
    }[event.impact] || 'low-impact';
    
    const impactLabel = event.impact.charAt(0).toUpperCase() + event.impact.slice(1) + ' Impact';
    
    return `
      <div class="calendar-card">
        <div class="calendar-date">
          <div class="date-day">${day}</div>
          <div class="date-month">${month}</div>
        </div>
        <div class="calendar-content">
          <h3 class="calendar-title">${event.title}</h3>
          <p class="calendar-description">${event.description}</p>
          <div class="calendar-meta">
            <span class="impact-badge ${impactClass}">${impactLabel}</span>
            <span class="calendar-time">${event.time} ${event.timezone}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render F&O updates
 * @param {Object} expiryData - Expiry dates data
 * @param {Object} banList - Ban list data
 * @param {Object} lotSizes - Lot sizes data
 */
function renderFOUpdates(expiryData, banList, lotSizes) {
  // Update expiry cards
  if (expiryData.weekly) {
    const weeklyCard = document.querySelector('.fo-card:nth-child(1)');
    if (weeklyCard) {
      weeklyCard.querySelector('.fo-value').textContent = formatDate(expiryData.weekly.date);
      weeklyCard.querySelector('.fo-label').textContent = `Next expiry in ${expiryData.weekly.daysUntil} days`;
    }
  }
  
  if (expiryData.monthly) {
    const monthlyCard = document.querySelector('.fo-card:nth-child(2)');
    if (monthlyCard) {
      monthlyCard.querySelector('.fo-value').textContent = formatDate(expiryData.monthly.date);
    }
  }
  
  // Update lot size changes card
  if (lotSizes.recentChanges) {
    const changesCard = document.querySelector('.fo-card:nth-child(3)');
    if (changesCard) {
      const count = lotSizes.recentChanges.length;
      changesCard.querySelector('.fo-value').textContent = `${count} instrument${count !== 1 ? 's' : ''} updated`;
    }
  }
  
  // Update ban list card
  if (banList.banList) {
    const banCard = document.querySelector('.fo-card:nth-child(4)');
    if (banCard) {
      const banListEl = banCard.querySelector('.fo-ban-list');
      const count = banList.banList.length;
      
      if (count === 0) {
        banListEl.innerHTML = '<span class="ban-chip" style="background: var(--profit); color: white;">No stocks in ban</span>';
        banCard.querySelector('.fo-label').textContent = 'All instruments tradeable';
      } else {
        banListEl.innerHTML = banList.banList.map(item => 
          `<span class="ban-chip">${item.symbol}</span>`
        ).join('');
        banCard.querySelector('.fo-label').textContent = `${count} stock${count !== 1 ? 's' : ''} in ban period`;
      }
    }
  }
  
  // Update lot size changes table
  if (lotSizes.recentChanges) {
    const tableEl = document.querySelector('.lot-changes-table');
    if (tableEl) {
      tableEl.innerHTML = lotSizes.recentChanges.map(change => `
        <div class="lot-change-row">
          <div class="lot-change-symbol">${change.symbol}</div>
          <div class="lot-change-old">${change.oldSize} → <span class="lot-change-new">${change.newSize}</span></div>
          <div class="lot-change-date">Effective: ${new Date(change.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      `).join('');
    }
  }
}

/**
 * Show loading state
 */
function showLoading(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = '<div class="loading-state">Loading...</div>';
  }
}

/**
 * Show error state
 */
function showError(selector, message) {
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = `<div class="error-state">⚠️ ${message}</div>`;
  }
}

/* ============================================================
   INITIALIZATION
   Load all market data when Market page is active
   ============================================================ */

async function initializeMarketPage() {
  try {
    // Only initialize if we're on the market page
    const marketPage = document.getElementById('marketPage');
    if (!marketPage || marketPage.hidden) return;
    
    // Load all data in parallel
    const [
      marketConfig,
      holidays,
      expiryRules,
      calendar,
      banList,
      lotSizes,
      news
    ] = await Promise.all([
      fetchMarketStatusConfig(),
      fetchNSEHolidays(),
      fetchExpiryRules(),
      fetchEconomicCalendar(),
      fetchBanList(),
      fetchLotSizes(),
      fetchMarketNews()
    ]);
    
    // Calculate market status
    const nseStatus = isMarketOpen(marketConfig.nse, holidays.holidays);
    const bseStatus = isMarketOpen(marketConfig.bse, holidays.holidays);
    
    // Calculate expiry dates
    const weeklyExpiry = calculateNextExpiry('NIFTY', expiryRules, 'weekly');
    const monthlyExpiry = calculateNextExpiry('NIFTY', expiryRules, 'monthly');
    
    const expiryData = {
      weekly: {
        date: weeklyExpiry,
        daysUntil: daysUntil(weeklyExpiry)
      },
      monthly: {
        date: monthlyExpiry,
        daysUntil: daysUntil(monthlyExpiry)
      }
    };
    
    // Render all sections
    renderMarketStatus(nseStatus, bseStatus);
    renderNews(news.articles);
    renderEconomicCalendar(calendar.events);
    renderFOUpdates(expiryData, banList, lotSizes);
    
    console.log('✅ Market page initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing market page:', error);
    
    // Show error states
    showError('.status-grid', 'Unable to load market status');
    showError('.news-list', 'Unable to load news');
    showError('.calendar-list', 'Unable to load calendar');
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeMarketPage };
}
