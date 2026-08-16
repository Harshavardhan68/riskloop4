/**
 * RiskLoop - Strategies Questions Flow Chart & My Strategies Module
 * Comprehensive educational & engineering framework for designing, testing, and validating trading strategies.
 */

(function() {
  'use strict';

  function showMyStrategies() {
    const overviewView = document.getElementById('stratOverviewView');
    const myStratView = document.getElementById('myStrategiesView');
    if (overviewView) overviewView.hidden = true;
    if (myStratView) myStratView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showOverview() {
    const overviewView = document.getElementById('stratOverviewView');
    const myStratView = document.getElementById('myStrategiesView');
    if (overviewView) overviewView.hidden = false;
    if (myStratView) myStratView.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleBacktestDetails(id) {
    const drawer = document.getElementById(id);
    if (!drawer) return;
    drawer.hidden = !drawer.hidden;
  }

  function openBacktestSummary() {
    // Open all backtest details or show backtesting overview modal
    const drawers = document.querySelectorAll('.my-strat-bt-drawer');
    const anyHidden = Array.from(drawers).some(d => d.hidden);
    drawers.forEach(d => {
      d.hidden = !anyHidden;
    });
  }

  function initStrategiesPage() {
    const container = document.getElementById('strategiesPage');
    if (!container) return;

    const myStratBtn = document.getElementById('stratMyStrategiesBtn');
    if (myStratBtn) {
      myStratBtn.onclick = showMyStrategies;
    }

    const backBtn = document.getElementById('myStratBackBtn');
    if (backBtn) {
      backBtn.onclick = showOverview;
    }
  }

  window.initStrategiesPage = initStrategiesPage;
  window.showMyStrategies = showMyStrategies;
  window.showOverview = showOverview;
  window.toggleBacktestDetails = toggleBacktestDetails;
  window.openBacktestSummary = openBacktestSummary;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStrategiesPage);
  } else {
    initStrategiesPage();
  }
}());
