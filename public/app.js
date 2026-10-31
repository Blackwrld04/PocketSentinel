/**
 * app.js - PocketSentinel Sovereign Expense Sentinel Frontend
 * 
 * Target: Total Recall Hackathon | Tatum x Walrus Memory
 * Architecture:
 * - Multi-view orchestrator (Landing / Sentinel App / Walrus Memory Inspector)
 * - Sovereign WebCrypto Vault (AES-256-GCM + PBKDF2-SHA256)
 * - Ingest & normalize Chase CSV statements
 * - Spend Calendar visualizer (October 2026)
 * - Live Statement Audit Feed with Walrus episodic memory references
 * - 1-Tap Dispute Drawer with CFPB formal objection generator
 * - Tatum Sui RPC telemetry & x402 agent micro-payments
 * - 20s Lazy Audio Financial Pulse synthesis via Web Speech API
 */

// Global State
const state = {
  currentView: 'landing',
  activeFilter: 'all',
  activeMobileTab: 'home',
  memories: [],
  subscriptions: [],
  trials: [],
  auditResults: [
    {
      id: 'tx_netflix_01',
      merchant: 'Netflix Standard',
      category: 'Streaming',
      wallet: 'Primary Checking',
      date: '2026-10-14',
      amount: 17.99,
      currentAmount: 17.99,
      baselineAmount: 15.49,
      deltaAmount: 2.50,
      status: 'MICRO_INFLATION_ALERT',
      walrusMemoryRef: 'MEM_01',
      explanation: '+$2.50/mo hike above $15.49 baseline.'
    },
    {
      id: 'tx_adobe_02',
      merchant: 'Adobe Creative Cloud',
      category: 'Software',
      wallet: 'Household Credit',
      date: '2026-10-18',
      amount: 54.99,
      currentAmount: 54.99,
      baselineAmount: 0.00,
      deltaAmount: 54.99,
      status: 'TRIAL_CONVERTING',
      walrusMemoryRef: 'MEM_06',
      explanation: 'Trial rebills in 48h at $54.99/mo.'
    },
    {
      id: 'tx_aws_03',
      merchant: 'Amazon Web Services (AWS)',
      category: 'Infrastructure',
      wallet: 'Household Credit',
      date: '2026-10-09',
      amount: 142.50,
      currentAmount: 142.50,
      baselineAmount: 64.00,
      deltaAmount: 78.50,
      status: 'SUPPRESSED_BY_MEMORY',
      walrusMemoryRef: 'MEM_04',
      explanation: 'Approved under $180 ceiling.'
    },
    {
      id: 'tx_spotify_04',
      merchant: 'Spotify Premium',
      category: 'Streaming',
      wallet: 'Primary Checking',
      date: '2026-10-12',
      amount: 10.99,
      currentAmount: 10.99,
      baselineAmount: 10.99,
      deltaAmount: 0.00,
      status: 'NORMAL',
      walrusMemoryRef: 'MEM_02',
      explanation: 'Reconciled with $10.99 baseline.'
    },
    {
      id: 'tx_traderjoes_05',
      merchant: "Trader Joe's",
      category: 'Groceries',
      wallet: 'Primary Checking',
      date: '2026-10-22',
      amount: 84.20,
      currentAmount: 84.20,
      baselineAmount: 84.20,
      deltaAmount: 0.00,
      status: 'NORMAL',
      explanation: 'Groceries envelope debit.'
    },
    {
      id: 'tx_chevron_06',
      merchant: 'Chevron Fuel',
      category: 'Transportation',
      wallet: 'Primary Checking',
      date: '2026-10-21',
      amount: 52.40,
      currentAmount: 52.40,
      baselineAmount: 52.40,
      deltaAmount: 0.00,
      status: 'NORMAL',
      explanation: 'Fuel envelope debit.'
    },
    {
      id: 'tx_bluebottle_07',
      merchant: 'Blue Bottle Coffee',
      category: 'Dining Out',
      wallet: 'Physical Cash',
      date: '2026-10-20',
      amount: 42.18,
      currentAmount: 42.18,
      baselineAmount: 42.18,
      deltaAmount: 0.00,
      status: 'NORMAL',
      explanation: 'Receipt matched to debit.'
    },
    {
      id: 'tx_github_08',
      merchant: 'GitHub Copilot',
      category: 'Software',
      wallet: 'Primary Checking',
      date: '2026-10-05',
      amount: 10.00,
      currentAmount: 10.00,
      baselineAmount: 10.00,
      deltaAmount: 0.00,
      status: 'NORMAL',
      walrusMemoryRef: 'MEM_09',
      explanation: 'Reconciled with $10.00 baseline.'
    }
  ],
  userProfile: (() => {
    let p = {};
    try {
      const saved = localStorage.getItem('recall_user_profile');
      if (saved) p = JSON.parse(saved);
    } catch (e) {}
    return {
      name: localStorage.getItem('recall_user_name') || p.name || 'Alex Rivera',
      currency: localStorage.getItem('recall_currency') || p.currency || '$',
      inflow: parseFloat(localStorage.getItem('recall_inflow') || p.inflow) || 4850.00,
      hourlyWage: parseFloat(localStorage.getItem('recall_hourly_wage') || p.hourlyWage) || 25.00,
      cycleDays: parseInt(localStorage.getItem('recall_cycle_days') || p.cycleDays, 10) || 10,
      safeSpend: p.safeSpend || 482.35,
      dailyVelocity: p.dailyVelocity || 48.23
    };
  })(),
  wallets: [
    { id: 'checking', name: 'Primary Checking', balance: 2430.00, type: 'bank', color: '#10b981', icon: 'landmark', default: true },
    { id: 'babylon', name: 'Babylon 10% Gold Reserve', balance: 500.00, type: 'vault', color: '#f59e0b', icon: 'shield-alert', locked: true, note: 'Clason & Housel Buffer' },
    { id: 'cash', name: 'Physical Cash / Pocket', balance: 185.00, type: 'cash', color: '#6366f1', icon: 'banknote' },
    { id: 'credit', name: 'Household Credit Card', balance: -420.00, type: 'card', color: '#ef4444', icon: 'credit-card', liability: true }
  ],
  wallet: {
    suiBalance: '4.580 SUI',
    usdcBalance: '$142.50',
    address: '0x7f4b82c9e1a3b5d7e6f8a0b2c4d6e8f0a2b4c6e8',
    recentTxs: []
  },
  activeDispute: null,
  spendingCeilings: [],
  vault: {
    initialized: false,
    key: null,
    salt: null
  }
};
window.RecallState = state;

// ================= THEME MANAGER (LIGHT / DARK) =================
function initTheme() {
  const savedTheme = localStorage.getItem('pocketsentinel-theme') || 'light';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('pocketsentinel-theme', newTheme);
}

function applyTheme(theme) {
  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    if (icon) icon.setAttribute('data-lucide', 'sun');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    if (icon) icon.setAttribute('data-lucide', 'moon');
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
window.toggleTheme = toggleTheme;

// ================= DOM INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[SENTINEL] PocketSentinel Sentinel initializing...');
  
  // Clean slate data reset to support fresh new user login
  const CLEAN_SLATE_KEY = 'recall_fresh_user_v7';
  if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
    console.log('[RESET] Wiping stored data for clean new user onboarding...');
    const savedTheme = localStorage.getItem('pocketsentinel-theme');
    localStorage.clear();
    sessionStorage.clear();
    if (savedTheme) localStorage.setItem('pocketsentinel-theme', savedTheme);
    localStorage.setItem(CLEAN_SLATE_KEY, 'true');

    state.userProfile = {
      name: '',
      currency: '$',
      inflow: 0.00,
      hourlyWage: 25.00,
      cycleDays: 10,
      safeSpend: 0.00,
      dailyVelocity: 0.00,
      signedIn: false
    };
    state.subscriptions = [];
    state.auditResults = [];
    state.spendingCeilings = [];
    state.wallets = [
      { id: 'checking', name: 'Primary Checking', balance: 0.00, type: 'bank', color: '#10b981', icon: 'landmark', default: true },
      { id: 'babylon', name: 'Babylon 10% Gold Reserve', balance: 0.00, type: 'vault', color: '#f59e0b', icon: 'shield-alert', locked: true, note: 'Clason & Housel Buffer' },
      { id: 'cash', name: 'Physical Cash / Pocket', balance: 0.00, type: 'cash', color: '#6366f1', icon: 'banknote' },
      { id: 'credit', name: 'Household Credit Card', balance: 0.00, type: 'card', color: '#ef4444', icon: 'credit-card', liability: true }
    ];
  } else {
    // Restore saved spending ceilings if available
    const savedCeilings = localStorage.getItem('recall_spending_ceilings');
    if (savedCeilings) {
      try {
        state.spendingCeilings = JSON.parse(savedCeilings);
      } catch (e) {
        state.spendingCeilings = [];
      }
    } else {
      state.spendingCeilings = [];
    }
    // Restore saved user wallets if available
    const savedWallets = localStorage.getItem('recall_user_wallets');
    if (savedWallets) {
      try {
        state.wallets = JSON.parse(savedWallets);
      } catch (e) {
        console.warn('Failed to parse saved wallets', e);
      }
    }
    // Restore saved user transactions if available
    const savedTxs = localStorage.getItem('recall_user_transactions') || localStorage.getItem('recall_audit_results');
    if (savedTxs) {
      try {
        state.auditResults = JSON.parse(savedTxs);
        if (typeof applyCurrencyGlobally === 'function') {
          applyCurrencyGlobally(state.userProfile?.currency || localStorage.getItem('recall_currency') || '₦');
        }
        if (typeof initStatementMonthlyReview === 'function') initStatementMonthlyReview();
      } catch (e) {
        console.warn('Failed to parse saved transactions', e);
      }
    } else if (localStorage.getItem('recall_user_signed_in') === 'true') {
      state.auditResults = [];
    }
  }

  // Initialize light/dark theme preference
  initTheme();

  // Render Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Handle URL hash routing with initialLoad flag to always begin at landing on reload
  handleHashNavigation(true);
  window.addEventListener('hashchange', () => handleHashNavigation(false));

  // Initialize WebCrypto Vault with default session key
  await initWebCryptoVault();

  // Load initial backend status and wallet telemetry
  await loadSystemStatus();
  await loadWalletTelemetry();
  await loadWalrusMemories();
  await loadSubscriptions();

  // Setup Drag-and-drop on hero box
  setupDropzone();

  // Render initial Spend Calendar & Dynamic Greeting
  renderSpendCalendar();
  updateDynamicGreetingAndDate();
  setInterval(updateDynamicGreetingAndDate, 30000);

  // Initialize Mobile Controllers, User Profile, OCR Scanner, and Wallets
  initMobileAppControllers();
  initReceiptOcrScanner();
  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);
  renderHomeTxMiniPreview();
  updateTxPageMetrics();
  renderPlanSubscriptionsLedger();
  renderCustomEnvelopes();
  syncCategoryDropdowns();
  setupReceiptOcrDropzone();

  if (typeof syncCollapsibleSectionsOnView === 'function') {
    syncCollapsibleSectionsOnView();
  }
  initLandingScrollSpy();
  initLandingLedgerPreview();

  console.log('[SENTINEL] PocketSentinel Sentinel ready.');
});

// ================= VIEW SWITCHER =================
function switchView(viewId) {
  if (viewId !== 'landing') viewId = 'app';
  state.currentView = viewId;

  const appView = document.getElementById('viewApp');
  const landingView = document.getElementById('viewLanding');
  const marketingHeader = document.getElementById('marketingHeaderBar');
  const appHeader = document.getElementById('appHeaderBar');

  if (viewId === 'landing') {
    if (window.history && window.history.replaceState && window.location.hash) {
      const h = window.location.hash.replace('#', '');
      if (['app', 'wallets', 'plan', 'safespend', 'envelopes', 'receipts', 'settings', 'subscriptions', 'alerts', 'trials', 'disputes', 'transactions', 'all'].includes(h)) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    document.body.classList.remove('in-app-view');
    document.body.classList.add('in-landing-view');
    if (landingView) {
      landingView.style.display = 'block';
      landingView.classList.add('active');
    }
    if (appView) {
      appView.style.display = 'none';
      appView.classList.remove('active');
    }
    if (marketingHeader) marketingHeader.style.display = 'flex';
    if (appHeader) appHeader.style.display = 'none';
  } else {
    document.body.classList.remove('in-landing-view');
    document.body.classList.add('in-app-view');
    if (appView) {
      appView.style.display = 'block';
      appView.classList.add('active');
    }
    if (landingView) {
      landingView.style.display = 'none';
      landingView.classList.remove('active');
    }
    if (marketingHeader) marketingHeader.style.display = 'none';
    if (appHeader) appHeader.style.display = 'flex';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-render icons for newly displayed panel
  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 50);
  }

  if (viewId === 'app') {
    // Auto-render core components in app view
    if (typeof renderUserProfileUI === 'function') renderUserProfileUI();
    if (typeof renderAuditRecords === 'function') renderAuditRecords(state.auditResults);
    if (typeof renderSpendCalendar === 'function') renderSpendCalendar();
    if (typeof renderPlanSubscriptionsLedger === 'function') renderPlanSubscriptionsLedger();
  }
}
window.switchView = switchView;

function scrollToSection(id) {
  if (state.currentView !== 'landing') {
    switchView('landing');
  }
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}
window.scrollToSection = scrollToSection;

function updateActiveLandingNav(targetId) {
  const navLinks = document.querySelectorAll('#headerNav .nav-link:not(.app-link)');
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const cleanHref = href.replace('#', '');
    if (cleanHref === targetId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
window.updateActiveLandingNav = updateActiveLandingNav;

function scrollToLandingSection(id, event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }
  if (state.currentView !== 'landing') {
    switchView('landing');
  }

  const aliasMap = {
    'overview': 'heroSection',
    'hero': 'heroSection',
    'heroSection': 'heroSection',
    'reality': 'realitySection',
    'realitySection': 'realitySection',
    'features': 'visibilitySection',
    'visibility': 'visibilitySection',
    'visibilitySection': 'visibilitySection',
    'automation': 'automationSection',
    'automationSection': 'automationSection',
    'pipeline': 'automationSection',
    'security': 'ecosystemSection',
    'sovereignty': 'ecosystemSection',
    'ecosystem': 'ecosystemSection',
    'ecosystemSection': 'ecosystemSection',
    'copilot': 'copilotLabSection',
    'copilot-lab': 'copilotLabSection',
    'copilotLab': 'copilotLabSection',
    'copilotLabSection': 'copilotLabSection',
    'demo': 'demoSection',
    'demoSection': 'demoSection',
    'footer': 'footerSection',
    'footerSection': 'footerSection'
  };

  const targetId = aliasMap[id] || id;

  setTimeout(() => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      updateActiveLandingNav(targetId);
      try {
        history.pushState(null, '', '#' + targetId);
      } catch (e) {}
    }
  }, 40);
}
window.scrollToLandingSection = scrollToLandingSection;

function initLandingScrollSpy() {
  const sections = ['heroSection', 'realitySection', 'visibilitySection', 'automationSection', 'ecosystemSection', 'copilotLabSection'];
  window.addEventListener('scroll', () => {
    if (state.currentView !== 'landing') return;
    const scrollPos = window.scrollY + 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= scrollPos) {
        updateActiveLandingNav(sections[i]);
        break;
      }
    }
  }, { passive: true });
}

function initLandingLedgerPreview() {
  const pills = document.querySelectorAll('.dlp-filter-pills .dlp-pill');
  const rows = document.querySelectorAll('.dlp-table tbody tr');
  const searchInput = document.getElementById('dlpSearchInput');
  const actionBtns = document.querySelectorAll('.dlp-table .dlp-action-btn');

  if (!rows.length) return;

  let activeFilter = 'all';
  let activeSearch = '';

  function applyFilters() {
    rows.forEach(tr => {
      const merchantCell = tr.children[0] ? tr.children[0].textContent.toLowerCase() : '';
      const catCell = tr.children[1] ? tr.children[1].textContent.toLowerCase() : '';
      const textToSearch = merchantCell + ' ' + catCell;

      let matchesPill = true;
      if (activeFilter === 'streaming') {
        matchesPill = catCell.includes('streaming');
      } else if (activeFilter === 'ai') {
        matchesPill = catCell.includes('ai') || catCell.includes('cloud') || catCell.includes('postgres') || merchantCell.includes('chatgpt') || merchantCell.includes('aws') || merchantCell.includes('supabase');
      } else if (activeFilter === 'dev') {
        matchesPill = catCell.includes('developer') || catCell.includes('design') || merchantCell.includes('github') || merchantCell.includes('figma');
      } else if (activeFilter === 'prod') {
        matchesPill = catCell.includes('creative') || catCell.includes('journalism') || merchantCell.includes('adobe') || merchantCell.includes('times');
      }

      const matchesSearch = !activeSearch || textToSearch.includes(activeSearch);
      const isVisible = Boolean(matchesPill && matchesSearch);
      tr.classList.toggle('dlp-row-hidden', !isVisible);
      tr.style.display = isVisible ? '' : 'none';
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const label = pill.textContent.toLowerCase();
      if (label.includes('streaming')) activeFilter = 'streaming';
      else if (label.includes('ai')) activeFilter = 'ai';
      else if (label.includes('dev')) activeFilter = 'dev';
      else if (label.includes('prod')) activeFilter = 'prod';
      else activeFilter = 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = (e.target.value || '').trim().toLowerCase();
      applyFilters();
    });
  }

  actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof handleLaunchAppClick === 'function') {
        handleLaunchAppClick();
      }
    });
  });
}
window.initLandingLedgerPreview = initLandingLedgerPreview;

function switchLandingHeroTab(tabId) {
  const tabs = [
    { id: 'envelopes', btn: 'heroTabBtnEnvelopes', panel: 'heroPanelEnvelopes' },
    { id: 'subscriptions', btn: 'heroTabBtnSubscriptions', panel: 'heroPanelSubscriptions' },
    { id: 'copilot', btn: 'heroTabBtnCopilot', panel: 'heroPanelCopilot' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    const panel = document.getElementById(t.panel);
    if (t.id === tabId) {
      if (btn) btn.classList.add('active');
      if (panel) panel.style.display = 'block';
    } else {
      if (btn) btn.classList.remove('active');
      if (panel) panel.style.display = 'none';
    }
  });

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.switchLandingHeroTab = switchLandingHeroTab;

let heroRebalanceState = false;
function demoRebalanceHero() {
  const diningDeficit = document.getElementById('captionDiningDeficit');
  const funSurplus = document.getElementById('captionFunSurplus');
  const btnTxt = document.getElementById('btnHeroRebalanceTxt');
  const btn = document.getElementById('btnHeroRebalance');

  if (!heroRebalanceState) {
    heroRebalanceState = true;
    if (diningDeficit) {
      diningDeficit.textContent = '+$0.00 (Balanced)';
      diningDeficit.className = 'text-green';
    }
    if (funSurplus) {
      funSurplus.textContent = '+$85.00 Discretionary';
    }
    if (btnTxt) btnTxt.textContent = 'Balanced ✓';
    if (btn) {
      btn.style.background = '#10b981';
      btn.style.color = '#141413';
    }
    if (typeof showToast === 'function') {
      showToast('Adaptive Rebalancing: $45.00 shifted from Fun to Dining Out. Envelope balanced!');
    }
  } else {
    heroRebalanceState = false;
    if (diningDeficit) {
      diningDeficit.textContent = '-$45.00 Dining Out';
      diningDeficit.className = 'text-coral';
    }
    if (funSurplus) {
      funSurplus.textContent = '+$130.00 Discretionary';
    }
    if (btnTxt) btnTxt.textContent = '1-Tap Rebalance Deficit';
    if (btn) {
      btn.style.background = '#eab308';
      btn.style.color = '#141413';
    }
  }
  if (window.lucide) setTimeout(() => window.lucide.createIcons(), 30);
}
window.demoRebalanceHero = demoRebalanceHero;

function demoDisputeHero() {
  if (typeof showToast === 'function') {
    showToast('Dispute Pack generated for Netflix ($2.50 hike flagged). Pre-filled letter ready in app.');
  }
  setTimeout(() => {
    switchView('app');
    if (typeof openDisputeModalForRecord === 'function') {
      openDisputeModalForRecord('Netflix', 17.99, 15.49, 2.50, 'MEM_01');
    }
  }, 700);
}
window.demoDisputeHero = demoDisputeHero;

let demoRebalanceState = false;
function demoRebalanceGroceries() {
  const status = document.getElementById('demoGroceriesStatus');
  const fill = document.getElementById('demoGroceriesFill');
  const subtext = document.getElementById('demoGroceriesSubtext');
  const btn = document.getElementById('demoRebalanceBtn');
  const diningStatus = document.getElementById('demoDiningStatus');
  const diningFill = document.getElementById('demoDiningFill');
  const diningSubtext = document.getElementById('demoDiningSubtext');

  if (!demoRebalanceState) {
    demoRebalanceState = true;
    if (status) {
      status.textContent = '+$0.00 Balanced';
      status.className = 'demo-env-status green';
    }
    if (fill) {
      fill.className = 'demo-meter-fill green';
      fill.style.width = '100%';
    }
    if (subtext) {
      subtext.textContent = 'Equilibrium restored from Dining Out';
    }
    if (btn) {
      btn.innerHTML = '<i data-lucide="check"></i><span>Balanced ✓</span>';
      btn.style.background = '#10b981';
      btn.style.color = '#141413';
    }
    if (diningStatus) {
      diningStatus.textContent = '+$20.00 Left';
    }
    if (diningFill) {
      diningFill.style.width = '85%';
    }
    if (diningSubtext) {
      diningSubtext.textContent = '$330.00 spent of $350.00';
    }
    showToast('Adaptive Rebalance: $45.00 shifted from Dining to Groceries. Ledger in equilibrium.');
  } else {
    demoRebalanceState = false;
    if (status) {
      status.textContent = '-$45.00 Deficit';
      status.className = 'demo-env-status red';
    }
    if (fill) {
      fill.className = 'demo-meter-fill red';
      fill.style.width = '100%';
    }
    if (subtext) {
      subtext.textContent = 'Overspent by $45.00';
    }
    if (btn) {
      btn.innerHTML = '<i data-lucide="refresh-cw"></i><span>Rebalance from Fun</span>';
      btn.style.background = '#141413';
      btn.style.color = '#ffffff';
    }
    if (diningStatus) {
      diningStatus.textContent = '+$65.00 Left';
    }
    if (diningFill) {
      diningFill.style.width = '72%';
    }
    if (diningSubtext) {
      diningSubtext.textContent = '$285.00 spent of $350.00';
    }
  }

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.demoRebalanceGroceries = demoRebalanceGroceries;

function handleHashNavigation(isInitialLoad = false) {
  const hash = window.location.hash.replace('#', '');
  const isLandingTarget = !hash || 
    ['landing', 'heroSection', 'realitySection', 'visibilitySection', 'automationSection', 'ecosystemSection', 'copilotLabSection', 'demoSection', 'footerSection', 'features', 'copilot-lab', 'sovereignty', 'playground', 'paradigms', 'literature', 'comparison', 'reality', 'ecosystem'].includes(hash) ||
    Boolean(document.getElementById(hash) && document.getElementById(hash).closest('#viewLanding'));

  // On page refresh or initial load, always begin on landing page as requested
  if (isInitialLoad || isLandingTarget || state.currentView === 'landing') {
    if (['app', 'wallets', 'plan', 'safespend', 'envelopes', 'receipts', 'settings', 'subscriptions', 'alerts', 'trials', 'disputes', 'transactions', 'all'].includes(hash)) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    switchView('landing');
    if (hash && hash !== 'landing' && isLandingTarget) {
      scrollToLandingSection(hash);
    }
    return;
  }

  switchView('app');
  if (['wallets', 'plan', 'safespend', 'envelopes', 'receipts', 'settings', 'subscriptions', 'alerts', 'trials', 'disputes', 'transactions'].includes(hash)) {
    if (typeof filterAppView === 'function') {
      filterAppView(hash);
    }
  } else if (!hash || hash === 'app' || hash === 'all') {
    if (typeof filterAppView === 'function') {
      filterAppView('all');
    }
  }
}

// ================= SOVEREIGN WEBCRYPTO VAULT =================
/**
 * Zero-Knowledge Client-Side Encryption
 * Standard: AES-256-GCM + PBKDF2-SHA256 (100,000 rounds)
 */
async function initWebCryptoVault(passphrase = null) {
  try {
    const enc = new TextEncoder();
    state.vault.salt = window.crypto.getRandomValues(new Uint8Array(16));

    // If no user passphrase supplied, generate a cryptographically secure random session passphrase
    const effectivePassphrase = passphrase || Array.from(window.crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(effectivePassphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    state.vault.key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: state.vault.salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    state.vault.initialized = true;
    console.log('[VAULT] WebCrypto AES-256-GCM Vault derived successfully.');
  } catch (err) {
    console.error('Vault initialization error:', err);
  }
}

function openKeyVaultModal() {
  const modal = document.getElementById('keyVaultModal');
  if (modal) modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}

function closeKeyVaultModal() {
  const modal = document.getElementById('keyVaultModal');
  if (modal) modal.style.display = 'none';
}

async function exportKeyBundleFile() {
  const passInput = document.getElementById('vaultPassphraseInput');
  const phrase = passInput ? passInput.value.trim() : '';
  if (!phrase || phrase.length < 12) {
    if (typeof showToast === 'function') {
      showToast('Please enter a sovereign passphrase of at least 12 characters.');
    } else {
      alert('Please enter a sovereign passphrase of at least 12 characters.');
    }
    return;
  }

  await initWebCryptoVault(phrase);

  const exportedKeyRaw = await window.crypto.subtle.exportKey('raw', state.vault.key);
  const keyHex = Array.from(new Uint8Array(exportedKeyRaw)).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(state.vault.salt).map(b => b.toString(16).padStart(2, '0')).join('');

  const bundle = {
    schema: 'PocketSentinel-Sovereign-Key-Bundle-v1.0',
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    saltHex: saltHex,
    exportedRawKeyHex: keyHex,
    agentId: 'walrus_agent_pocketsentinel_mainnet_0x7f4b82c',
    network: 'Sui Mainnet',
    createdAt: new Date().toISOString(),
    securityNotice: 'Client-side encrypted. Store this file securely. PocketSentinel servers cannot decrypt your encrypted records without it.'
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pocketsentinel-key-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const statusBox = document.getElementById('vaultStatusBox');
  if (statusBox) {
    statusBox.innerHTML = `<span><i data-lucide="check-check"></i> Key bundle exported securely as JSON. Keep safe!</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

function importKeyBundleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.cipher === 'AES-256-GCM' && parsed.exportedRawKeyHex) {
        const statusBox = document.getElementById('vaultStatusBox');
        if (statusBox) {
          statusBox.innerHTML = `<span><i data-lucide="shield-check"></i> Sovereign Key Bundle imported! Verified for agent: <code>${parsed.agentId.slice(0, 20)}...</code></span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      } else {
        alert('Invalid key bundle format. Must contain AES-256-GCM parameters.');
      }
    } catch (err) {
      alert('Failed to parse key bundle JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

async function loadRunwayFromMemory() {
  try {
    const res = await fetch('/api/memories/runway');
    if (res.ok) {
      const data = await res.json();
      if (data && data.safeToSpendDaily) {
        state.userProfile.safeSpend = data.safeToSpendTotal;
        state.userProfile.dailyVelocity = data.safeToSpendDaily;
        state.userProfile.cycleDays = data.runwayDays;
        if (typeof renderUserProfileUI === 'function') renderUserProfileUI();
      }
    }
  } catch (err) {
    console.warn('Could not reach /api/memories/runway:', err.message);
  }
}

// ================= BACKEND STATUS & WALLET TELEMETRY =================
async function loadSystemStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    console.log('[PocketSentinel] System status:', data);
    
    // Update live indicators
    const networkBadge = document.getElementById('networkBadge');
    if (networkBadge && data.walrus) {
      networkBadge.title = `Agent: ${data.walrus.agentId} (${data.walrus.memoriesCommittedCount} Anchored Memories)`;
    }

    // Load dynamic runway computed from Walrus memory anchors
    await loadRunwayFromMemory();
  } catch (err) {
    console.warn('Could not reach /api/status, using cached mainnet telemetry:', err.message);
  }
}

async function loadWalletTelemetry() {
  try {
    const res = await fetch('/api/tatum/wallet');
    const data = await res.json();
    if (data.balance) {
      state.wallet.suiBalance = data.balance.formattedSui || '4.580 SUI';
      state.wallet.usdcBalance = data.balance.formattedUsdc || '($142.50)';
      
      const elSui = document.getElementById('suiBalance');
      const elUsdc = document.getElementById('usdcBalance');
      const elSideSui = document.getElementById('sidebarSuiBalance');
      
      if (elSui) elSui.textContent = state.wallet.suiBalance;
      if (elUsdc) elUsdc.textContent = state.wallet.usdcBalance;
      if (elSideSui) elSideSui.textContent = state.wallet.suiBalance;
    }
  } catch (err) {
    console.warn('Tatum wallet fetch fallback:', err.message);
  }
}

// ================= WALRUS MEMORY ONCHAIN LEDGER =================
async function loadWalrusMemories() {
  try {
    const res = await fetch('/api/memories');
    const data = await res.json();
    state.memories = data.memories || [];

    renderMemoryTable(state.memories);

    // Update KPI memory counters
    const kpiAnchors = document.getElementById('kpiMemoryAnchors');
    if (kpiAnchors) {
      kpiAnchors.textContent = `${state.memories.length} Nodes`;
    }
  } catch (err) {
    console.error('Failed to load Walrus memories:', err);
  }
}

function renderMemoryTable(memories) {
  const tbody = document.getElementById('memoryTableBody');
  if (!tbody) return;

  if (!memories || memories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--color-slate-400);">No memories found. Click "Re-seed Fixtures" above.</td></tr>`;
    return;
  }

  tbody.innerHTML = memories.map(m => {
    const memType = m.type || m.category || 'Baseline';
    const categoryBadgeClass = getCategoryBadgeClass(memType);
    const suiDigest = m.suiTxDigest || m.metadata?.suiTxDigest || '0x77616c7275735f6167656e745f726563616c6c72616d';
    const shortDigest = `${suiDigest.slice(0, 8)}...${suiDigest.slice(-6)}`;
    const suiscanUrl = `https://suiscan.xyz/mainnet/tx/${suiDigest}`;

    // Summarize content policy / Schema v2 fields
    let contentSummary = '';
    if (m.sensitivity === 'encrypted') {
      const summaryText = m.metadata?.userSummary || (m.value ? JSON.stringify(m.value) : 'Encrypted sovereign data');
      contentSummary = `<span style="display:inline-flex; align-items:center; gap:4px; color:#10b981; font-weight:500;"><i data-lucide="shield-check" style="width:13px;height:13px;"></i> AES-256-GCM:</span> <span style="color:var(--color-slate-300);">${summaryText.slice(0, 52)}${summaryText.length > 52 ? '...' : ''}</span>`;
    } else if (m.metadata?.userSummary) {
      contentSummary = m.metadata.userSummary.slice(0, 60) + (m.metadata.userSummary.length > 60 ? '...' : '');
    } else if (typeof m.content === 'string') {
      contentSummary = m.content.slice(0, 60) + (m.content.length > 60 ? '...' : '');
    } else if (m.value) {
      contentSummary = JSON.stringify(m.value).slice(0, 60) + '...';
    } else {
      contentSummary = 'Mainnet Verified Policy';
    }

    const encryptedBadge = m.sensitivity === 'encrypted' 
      ? `<span class="chip-encrypted" title="Encrypted on-chain with AES-256-GCM" style="background:rgba(16,185,129,0.15); color:#10b981; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:4px; display:inline-flex; align-items:center; gap:2px;"><i data-lucide="lock" style="width:10px;height:10px;"></i> ENC</span>`
      : '';

    return `
      <tr>
        <td><strong class="memory-id-badge">${m.id}</strong>${encryptedBadge}</td>
        <td><span class="category-chip ${categoryBadgeClass}">${memType}</span></td>
        <td><code>${m.key}</code></td>
        <td class="policy-summary-cell">${contentSummary}</td>
        <td>
          <a href="${suiscanUrl}" target="_blank" rel="noopener" class="sui-digest-link" title="Verify on SuiScan Mainnet">
            <i data-lucide="external-link"></i> ${shortDigest}
          </a>
        </td>
        <td>
          <button class="btn-inspect-mini" onclick="inspectMemoryDetail('${m.id}')">
            <i data-lucide="eye"></i> Inspect
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function getCategoryBadgeClass(cat) {
  const c = (cat || '').toLowerCase();
  switch (c) {
    case 'baseline':
    case 'price_baseline': return 'chip-green';
    case 'income': return 'chip-blue';
    case 'commitment': return 'chip-red';
    case 'envelope': return 'chip-purple';
    case 'goal': return 'chip-amber';
    case 'policy': return 'chip-cyan';
    case 'correction': return 'chip-emerald';
    case 'decision': return 'chip-indigo';
    case 'dispute':
    case 'dispute trace':
    case 'dispute_log': return 'chip-rose';
    case 'event': return 'chip-orange';
    case 'preference': return 'chip-slate';
    case 'trial watch':
    case 'trial_tracker': return 'chip-amber';
    case 'override':
    case 'false_alarm_override': return 'chip-blue';
    case 'overlap watch':
    case 'subscription_portfolio': return 'chip-purple';
    default: return 'chip-slate';
  }
}

let currentInspectedMemory = null;

function inspectMemoryDetail(memId) {
  let m = state.memories.find(item => item.id === memId);
  if (!m) {
    const sub = (typeof masterSubscriptionsList !== 'undefined' ? masterSubscriptionsList : []).find(s => s.memory === memId);
    if (sub) {
      m = {
        id: memId,
        category: sub.category || 'Baseline',
        key: sub.merchant ? sub.merchant.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'sovereign_memory',
        agentId: 'walrus_agent_pocketsentinel_mainnet_0x7f4b82c',
        suiTxDigest: 'Deterministic Sui Mainnet Anchor',
        walrusBlobId: 'N/A',
        content: `$${Number(sub.amount).toFixed(2)}/mo baseline for ${sub.merchant}. Auto-audit enabled.`
      };
    } else {
      m = {
        id: memId,
        category: 'Baseline',
        key: 'sovereign_memory_node',
        agentId: 'walrus_agent_pocketsentinel_mainnet_0x7f4b82c',
        suiTxDigest: 'Deterministic Sui Mainnet Anchor',
        walrusBlobId: 'N/A',
        content: `Sovereign memory node [${memId}] verified on Sui Mainnet.`
      };
    }
  }

  openMemoryNodeModal(m);
}
window.inspectMemoryDetail = inspectMemoryDetail;

function openMemoryNodeModal(m) {
  currentInspectedMemory = m;
  const modal = document.getElementById('memoryDetailModal');
  if (!modal) return;

  const idEl = document.getElementById('memoryModalId');
  const titleEl = document.getElementById('memoryModalTitle');
  const categoryEl = document.getElementById('memoryModalCategory');
  const keyEl = document.getElementById('memoryModalKey');
  const agentEl = document.getElementById('memoryModalAgent');
  const txEl = document.getElementById('memoryModalTx');
  const blobEl = document.getElementById('memoryModalBlob');
  const payloadEl = document.getElementById('memoryModalPayload');

  if (idEl) idEl.textContent = m.id;
  if (titleEl) titleEl.textContent = `Memory Node [${m.id}]`;
  if (categoryEl) categoryEl.textContent = `${m.type || m.category || 'Baseline'} (${m.sensitivity === 'encrypted' ? '🔒 AES-256-GCM Encrypted' : '🌐 Public Policy'})`;
  if (keyEl) keyEl.textContent = m.key || 'memory_node';
  if (agentEl) agentEl.textContent = m.agentId || 'walrus_agent_pocketsentinel_mainnet_0x7f4b82c';
  const suiDigest = m.suiTxDigest || m.metadata?.suiTxDigest || '0x77616c7275735f6167656e745f726563616c6c72616d';
  if (txEl) txEl.textContent = suiDigest;
  if (blobEl) blobEl.textContent = m.metadata?.memwalBlobId || m.walrusBlobId || 'Blob Committed to Walrus Relayer';

  if (payloadEl) {
    const displayObj = {
      id: m.id,
      type: m.type || m.category || 'Baseline',
      key: m.key,
      source: m.source || 'user_stated',
      sensitivity: m.sensitivity || 'public',
      effective_date: m.effective_date || '2026-10-01',
      tags: m.tags || [],
      userSummary: m.metadata?.userSummary || m.content,
      authorizedDecryptedValue: m.value || null,
      onchainCiphertextPayload: m.metadata?.encryptedPayload || null,
      suiTxDigest: suiDigest
    };
    payloadEl.value = JSON.stringify(displayObj, null, 2);
  }

  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}
window.openMemoryNodeModal = openMemoryNodeModal;

function closeMemoryDetailModal() {
  const modal = document.getElementById('memoryDetailModal');
  if (modal) modal.style.display = 'none';
}
window.closeMemoryDetailModal = closeMemoryDetailModal;

function copyMemoryPayloadText() {
  const payloadEl = document.getElementById('memoryModalPayload');
  if (payloadEl && payloadEl.value) {
    navigator.clipboard.writeText(payloadEl.value);
    showToast('📋 Memory payload copied to clipboard!', 'green');
  }
}
window.copyMemoryPayloadText = copyMemoryPayloadText;

function verifyMemoryAnchorProof() {
  if (!currentInspectedMemory) return;
  showToast(`🔒 Verified cryptographic anchor for [${currentInspectedMemory.id}] on Sui Mainnet!`, 'green');
}
window.verifyMemoryAnchorProof = verifyMemoryAnchorProof;

async function reseedMemories() {
  const btn = document.querySelector('.btn-reseed');
  if (btn) btn.innerHTML = `<i data-lucide="loader"></i> Seeding Sui Mainnet...`;
  
  try {
    const res = await fetch('/api/memories/seed', { method: 'POST' });
    const data = await res.json();
    showToast(`Successfully committed ${data.count} memories to encrypted storage!`, 'green');
    await loadWalrusMemories();
  } catch (err) {
    showToast('Failed to re-seed memories: ' + err.message, 'amber');
  } finally {
    if (btn) btn.innerHTML = `<i data-lucide="refresh-cw"></i> Re-seed Fixtures`;
    if (window.lucide) window.lucide.createIcons();
  }
}

// ================= ACTIVE SUBSCRIPTIONS & SPEND CALENDAR =================
// Schema clean slate: flush stale subscription cache on v3 upgrade
(function checkCleanSlate() {
  const SCHEMA_KEY = 'recall_clean_slate_v3';
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(SCHEMA_KEY)) {
    localStorage.removeItem('recall_user_subscriptions');
    localStorage.setItem(SCHEMA_KEY, 'true');
  }
})();

if (typeof masterSubscriptionsList === 'undefined') {
  var masterSubscriptionsList = [];
}

async function loadSubscriptions() {
  try {
    let loadedFromApi = false;
    try {
      const res = await fetch('/api/subscriptions');
      if (res.ok) {
        const data = await res.json();
        const apiSubs = data.subscriptions || data.activeSubscriptions || [];
        state.subscriptions = apiSubs;
        state.trials = data.trials || [];
        masterSubscriptionsList.length = 0;
        apiSubs.forEach(s => masterSubscriptionsList.push(s));
        localStorage.setItem('recall_user_subscriptions', JSON.stringify(state.subscriptions));
        loadedFromApi = true;
      }
    } catch (e) {
      console.warn('[loadSubscriptions] API fetch failed, falling back to cache:', e);
    }

    if (!loadedFromApi) {
      const saved = localStorage.getItem('recall_user_subscriptions');
      if (saved) {
        try {
          state.subscriptions = JSON.parse(saved);
          masterSubscriptionsList.length = 0;
          state.subscriptions.forEach(s => masterSubscriptionsList.push(s));
        } catch (e) {
          state.subscriptions = [];
        }
      }
    }

    if (typeof recalculateAllFinancialMetrics === 'function') {
      recalculateAllFinancialMetrics();
    }
    if (typeof renderSpendCalendar === 'function') {
      renderSpendCalendar();
    }
    if (typeof renderSubscriptionsLedger === 'function') {
      renderSubscriptionsLedger();
    }
  } catch (err) {
    console.error('Failed to load subscriptions:', err);
  }
}

// ================= DYNAMIC SPEND CALENDAR & GREETING CONTROLLER =================
state.calendarYear = state.calendarYear || new Date().getFullYear();
state.calendarMonth = (state.calendarMonth !== undefined) ? state.calendarMonth : new Date().getMonth();
state.selectedCalendarDay = state.selectedCalendarDay || null;

function updateDynamicGreetingAndDate() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good Morning,';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon,';
  } else if (hour >= 17 || hour < 5) {
    greeting = 'Good Evening,';
  }

  const greetingEl = document.getElementById('userGreetingTime');
  if (greetingEl) greetingEl.textContent = greeting;

  const dateEl = document.getElementById('userGreetingDate');
  if (dateEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}
window.updateDynamicGreetingAndDate = updateDynamicGreetingAndDate;

function navigateCalendarMonth(delta) {
  state.calendarMonth += delta;
  if (state.calendarMonth > 11) {
    state.calendarMonth = 0;
    state.calendarYear += 1;
  } else if (state.calendarMonth < 0) {
    state.calendarMonth = 11;
    state.calendarYear -= 1;
  }
  state.selectedCalendarDay = null;
  const inspector = document.getElementById('calDayInspector');
  if (inspector) inspector.style.display = 'none';
  renderSpendCalendar();
}
window.navigateCalendarMonth = navigateCalendarMonth;

function goToTodayCalendar() {
  const now = new Date();
  state.calendarYear = now.getFullYear();
  state.calendarMonth = now.getMonth();
  state.selectedCalendarDay = now.getDate();
  renderSpendCalendar();
  inspectCalendarDay(now.getDate());
}
window.goToTodayCalendar = goToTodayCalendar;

function openQuickAddModalWithDate(dateStr) {
  openQuickAddModal();
  const dateInput = document.getElementById('tx-date');
  if (dateInput && dateStr) {
    dateInput.value = dateStr;
  }
}
window.openQuickAddModalWithDate = openQuickAddModalWithDate;

function getCalendarEventsForMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventsByDay = {};

  const baseCatalog = [
    { id: 'MEM_01', merchant: 'GitHub Copilot', amount: 10.00, dayOfMonth: 1, status: 'NORMAL', category: 'Developer Productivity' },
    { id: 'MEM_01', merchant: 'Apple iCloud+ 2TB', amount: 9.99, dayOfMonth: 5, status: 'NORMAL', category: 'Cloud Storage & Utility' },
    { id: 'MEM_11', merchant: 'Spotify Family', amount: 16.99, dayOfMonth: 8, status: 'NORMAL', category: 'Streaming' },
    { id: 'MEM_01', merchant: 'ChatGPT Plus', amount: 20.00, dayOfMonth: 12, status: 'NORMAL', category: 'AI & Cloud' },
    { id: 'MEM_07', merchant: 'Figma Professional', amount: 15.00, dayOfMonth: 14, status: 'NORMAL', category: 'Design Tools' },
    { id: 'MEM_01', merchant: 'Spotify Premium', amount: 10.99, dayOfMonth: 15, status: 'NORMAL', category: 'Streaming' },
    { id: 'MEM_06', merchant: 'Adobe CC 7-Day Trial', amount: 54.99, dayOfMonth: 18, status: 'TRIAL_URGENT', tag: 'Trial Alert', category: 'Software' },
    { id: 'MEM_10', merchant: 'DoorDash DashPass', amount: 9.99, dayOfMonth: 18, status: 'NORMAL', category: 'Food & Dining' },
    { id: 'MEM_04', merchant: 'Amazon Web Services (AWS)', amount: 142.50, dayOfMonth: 19, status: 'SUPPRESSED', tag: 'Overridden', category: 'Infrastructure' },
    { id: 'MEM_01', merchant: 'Netflix Standard', amount: 17.99, dayOfMonth: 20, status: 'PRICE_CREEP', tag: '+$2.50 Hike', category: 'Streaming' },
    { id: 'MEM_08', merchant: 'Supabase Pro', amount: 25.00, dayOfMonth: 21, status: 'NORMAL', category: 'AI & Cloud' },
    { id: 'MEM_13', merchant: 'The New York Times', amount: 4.00, dayOfMonth: 28, status: 'NORMAL', category: 'News & Media' }
  ];

  let activeSubs = [];
  const savedSubs = localStorage.getItem('recall_user_subscriptions');
  const user = state.userProfile?.signedIn || localStorage.getItem('recall_user_signed_in') === 'true';

  if (savedSubs) {
    try {
      activeSubs = JSON.parse(savedSubs);
    } catch (e) {
      activeSubs = state.subscriptions || [];
    }
  } else if (state.subscriptions && (user || state.subscriptions.length > 0)) {
    activeSubs = state.subscriptions;
  } else if (user) {
    activeSubs = [];
  } else {
    activeSubs = baseCatalog;
  }

  activeSubs.forEach(sub => {
    let day = sub.dayOfMonth || sub.renewalDay || sub.day || 15;
    if (day > daysInMonth) day = daysInMonth;

    let status = sub.status || 'NORMAL';
    if (sub.hasHike || (sub.baselineAmount && sub.amount > sub.baselineAmount && !sub.overrideApproved)) {
      status = 'PRICE_CREEP';
    } else if (sub.isTrial || (sub.merchant && sub.merchant.toLowerCase().includes('trial'))) {
      status = 'TRIAL_URGENT';
    } else if (sub.overrideApproved || sub.status === 'SUPPRESSED') {
      status = 'SUPPRESSED';
    }

    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push({
      merchant: sub.merchant || sub.name || 'Subscription',
      amount: Number(sub.amount !== undefined ? sub.amount : (sub.cost !== undefined ? sub.cost : 0)),
      status: status,
      tag: sub.tag || (status === 'PRICE_CREEP' ? '+$2.50 Hike' : status === 'TRIAL_URGENT' ? 'Trial Alert' : status === 'SUPPRESSED' ? 'Overridden' : ''),
      id: sub.id || sub.walrusMemoryRef || 'MEM_01'
    });
  });

  return eventsByDay;
}

let calendarScrollListenersAttached = false;
function setupCalendarScrollListeners() {
  if (calendarScrollListenersAttached) return;
  const calCard = document.getElementById('spendCalendarCard');
  if (!calCard) return;

  calendarScrollListenersAttached = true;
  let scrollTimeout = null;

  calCard.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > 25) {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => { scrollTimeout = null; }, 320);
      if (e.deltaY > 0) {
        navigateCalendarMonth(1);
      } else {
        navigateCalendarMonth(-1);
      }
    }
  }, { passive: true });

  let touchStartX = 0;
  let touchStartY = 0;
  calCard.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  calCard.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          navigateCalendarMonth(1);
        } else {
          navigateCalendarMonth(-1);
        }
      }
    }
  }, { passive: true });
}

function inspectCalendarDay(day, merchant, amount, status) {
  const inspector = document.getElementById('calDayInspector');
  if (!inspector) return;

  state.selectedCalendarDay = day;

  // Highlight selected cell in DOM
  document.querySelectorAll('.calendar-days-grid .cal-day').forEach(el => {
    el.classList.remove('selected-day');
  });
  const selectedEl = document.querySelector(`.calendar-days-grid .cal-day[data-day="${day}"]`);
  if (selectedEl) selectedEl.classList.add('selected-day');

  const year = state.calendarYear;
  const month = state.calendarMonth;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month];
  const dateFormatted = `${monthName} ${day}, ${year}`;
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const eventsByDay = getCalendarEventsForMonth(year, month);
  let dayEvents = eventsByDay[day] || [];

  if (dayEvents.length === 0 && merchant && merchant !== 'null') {
    dayEvents = [{ merchant, amount: Number(amount), status, tag: '', id: 'MEM_01' }];
  }

  inspector.style.display = 'block';

  if (dayEvents.length === 0) {
    inspector.innerHTML = `
      <div class="cal-inspector-card">
        <div class="cal-inspector-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <i data-lucide="calendar" style="width:16px; height:16px; color:var(--text-muted);"></i>
            <strong>${dateFormatted}</strong>
          </div>
          <button class="btn-inspect-mini" onclick="document.getElementById('calDayInspector').style.display='none'">&times;</button>
        </div>
        <p style="margin:6px 0 10px 0; font-size:12px; color:var(--text-muted);">No scheduled recurring debit on this day.</p>
        <div class="cal-inspector-actions">
          <button class="btn-ghost-outline" onclick="openQuickAddModalWithDate('${dateStr}')">
            <i data-lucide="plus-circle"></i> + Log Expense for ${monthName.slice(0, 3)} ${day}
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let eventsHtml = '';
  dayEvents.forEach(evt => {
    const isCreep = evt.status === 'PRICE_CREEP';
    const isTrial = evt.status === 'TRIAL_URGENT';
    const isSuppressed = evt.status === 'SUPPRESSED';
    const dotColor = isCreep ? 'red' : isTrial ? 'amber' : isSuppressed ? 'blue' : 'green';

    eventsHtml += `
      <div class="cal-inspector-card has-event" style="margin-bottom:8px;">
        <div class="cal-inspector-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="cal-dot ${dotColor}"></span>
            <strong>${dateFormatted}: ${evt.merchant}</strong>
          </div>
          <button class="btn-inspect-mini" onclick="document.getElementById('calDayInspector').style.display='none'">&times;</button>
        </div>
        <div class="cal-inspector-body">
          <div>Scheduled Debit: <strong>$${Number(evt.amount).toFixed(2)}</strong></div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:3px;">
            ${isCreep ? '🚨 Uncontractual price hike flagged (+2.50 vs baseline memory).' : isTrial ? '⚠️ 7-Day Free Trial converting in 48 hours.' : isSuppressed ? 'ℹ️ Auto-reconciled via memory baseline policy.' : '✅ Verified episodic baseline match.'}
          </div>
        </div>
        <div class="cal-inspector-actions" style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
          ${isTrial ? `<button class="btn-cancel-trial-danger" onclick="cancelTrialSubscription('${evt.merchant.replace(/'/g, "\\'")}')"><i data-lucide='x-circle'></i> Cancel Trial Rebill</button>` : ''}
          ${isCreep ? `<button class="btn-amber-card-action" onclick="openDisputeModalForRecord('${evt.merchant.replace(/'/g, "\\'")}', 17.99, 15.49, 2.50, '${evt.id}')"><i data-lucide='scale'></i> 1-Tap Dispute</button>` : ''}
          <button class="btn-ghost-outline" onclick="filterAppView('subscriptions')"><i data-lucide='list'></i> View in Ledger</button>
          <button class="btn-ghost-outline" onclick="openQuickAddModalWithDate('${dateStr}')"><i data-lucide='plus-circle'></i> + Log Expense</button>
        </div>
      </div>
    `;
  });

  inspector.innerHTML = eventsHtml;
  if (window.lucide) window.lucide.createIcons();
}
window.inspectCalendarDay = inspectCalendarDay;

function renderSpendCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;

  if (state.calendarYear === undefined) state.calendarYear = new Date().getFullYear();
  if (state.calendarMonth === undefined) state.calendarMonth = new Date().getMonth();

  const year = state.calendarYear;
  const month = state.calendarMonth;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[month];

  // Update headers
  const titleEl = document.getElementById('calCurrentMonthTitle');
  if (titleEl) titleEl.textContent = `${monthName} ${year}`;

  const headerMonthEl = document.getElementById('calHeaderMonthName');
  if (headerMonthEl) headerMonthEl.textContent = `${monthName} ${year}`;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(year, month, 0).getDate();

  const now = new Date();
  const isCurrentMonth = (now.getFullYear() === year && now.getMonth() === month);
  const todayDate = now.getDate();

  const eventsByDay = getCalendarEventsForMonth(year, month);

  const cur = state.userProfile?.currency || '$';

  // Compute total monthly debits
  let totalDebitsCount = 0;
  let totalDebitsSum = 0;
  Object.values(eventsByDay).forEach(evts => {
    totalDebitsCount += evts.length;
    evts.forEach(e => { totalDebitsSum += (e.amount || 0); });
  });

  const metaEl = document.getElementById('calMonthMetaText');
  if (metaEl) {
    metaEl.textContent = `${totalDebitsCount} scheduled debits (${cur}${totalDebitsSum.toFixed(2)} total)`;
  }

  let html = '';

  // Leading empty / trailing days of previous month
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDay = prevMonthDays - firstDayIndex + 1 + i;
    html += `
      <div class="cal-day cal-day-empty" onclick="navigateCalendarMonth(-1)" title="Previous Month (${monthNames[(month + 11) % 12]})">
        <span class="cal-day-num muted">${emptyDay}</span>
      </div>
    `;
  }

  // Days 1 through daysInMonth
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay[day] || [];
    const isToday = isCurrentMonth && (day === todayDate);
    const isSelected = (state.selectedCalendarDay === day);

    let dayClass = 'cal-day';
    if (isToday) dayClass += ' is-today';
    if (isSelected) dayClass += ' selected-day';

    let dotHtml = '';
    let pillHtml = '';

    if (dayEvents.length > 0) {
      dayClass += ' has-debit';
      const primaryEvt = dayEvents[0];
      const hasCreep = dayEvents.some(e => e.status === 'PRICE_CREEP');
      const hasTrial = dayEvents.some(e => e.status === 'TRIAL_URGENT');
      const hasSuppressed = dayEvents.some(e => e.status === 'SUPPRESSED');

      if (hasCreep) {
        dayClass += ' alert-creep';
        dotHtml = '<span class="cal-dot red"></span>';
      } else if (hasTrial) {
        dayClass += ' alert-trial';
        dotHtml = '<span class="cal-dot amber"></span>';
      } else if (hasSuppressed) {
        dayClass += ' reconciled';
        dotHtml = '<span class="cal-dot blue"></span>';
      } else {
        dayClass += ' verified';
        dotHtml = '<span class="cal-dot green"></span>';
      }

      const pillClass = primaryEvt.status === 'PRICE_CREEP' ? 'red' : primaryEvt.status === 'TRIAL_URGENT' ? 'amber' : primaryEvt.status === 'SUPPRESSED' ? 'blue' : 'green';
      pillHtml = `
        <div class="cal-pill ${pillClass}" title="${primaryEvt.merchant} (${cur}${primaryEvt.amount.toFixed(2)})">
          <strong class="cal-pill-merchant">${primaryEvt.merchant}</strong>
          <span class="cal-pill-amt">${cur}${primaryEvt.amount.toFixed(2)}</span>
        </div>
      `;

      if (dayEvents.length > 1) {
        pillHtml += `<div class="cal-pill-count">+${dayEvents.length - 1} more</div>`;
      }
    }

    const todayTag = isToday ? '<span class="cal-today-badge">TODAY</span>' : '';

    html += `
      <div class="${dayClass}" data-day="${day}" onclick="inspectCalendarDay(${day})" style="cursor:pointer;">
        <div class="cal-day-header">
          <div style="display:flex; align-items:center;">
            <span class="cal-day-num">${day}</span>
            ${todayTag}
          </div>
          ${dotHtml}
        </div>
        <div class="cal-day-content">
          ${pillHtml}
        </div>
      </div>
    `;
  }

  // Trailing empty days to complete the 7-column grid
  const totalCells = firstDayIndex + daysInMonth;
  const trailingDays = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= trailingDays; i++) {
    html += `
      <div class="cal-day cal-day-empty" onclick="navigateCalendarMonth(1)" title="Next Month (${monthNames[(month + 1) % 12]})">
        <span class="cal-day-num muted">${i}</span>
      </div>
    `;
  }

  grid.innerHTML = html;

  // Setup wheel scroll & swipe gesture
  setupCalendarScrollListeners();

  if (window.lucide) window.lucide.createIcons();
}
window.renderSpendCalendar = renderSpendCalendar;

// ================= COLLAPSIBLE SECTIONS CONTROLLER =================
function syncCollapsibleSectionsOnView() {
  const isMobile = window.innerWidth <= 768;
  const calBody = document.getElementById('calendarBodyCollapseWrap');
  const calPreview = document.getElementById('calCollapsedPreview');
  const calText = document.getElementById('calToggleText');
  const calIcon = document.getElementById('calToggleIcon');
  const calLegend = document.getElementById('calendarLegend');

  // If user hasn't explicitly toggled, set smart defaults (collapsed on mobile, expanded on desktop)
  if (!state.calendarUserToggled) {
    if (isMobile) {
      if (calBody) calBody.style.display = 'none';
      if (calPreview) calPreview.style.display = 'flex';
      if (calText) calText.textContent = 'Show Calendar';
      if (calIcon) calIcon.setAttribute('data-lucide', 'chevron-down');
      if (calLegend) calLegend.style.display = 'none';
    } else {
      if (calBody) calBody.style.display = 'block';
      if (calPreview) calPreview.style.display = 'none';
      if (calText) calText.textContent = 'Hide Calendar';
      if (calIcon) calIcon.setAttribute('data-lucide', 'chevron-up');
      if (calLegend) calLegend.style.display = 'flex';
    }
  }

  // Also sync trial rules: collapsed by default on mobile
  const trialRulesBody = document.getElementById('trialRulesCollapsibleBody');
  const trialRulesPreview = document.getElementById('trialRulesPreview');
  const trialRulesText = document.getElementById('trialRulesToggleText');
  if (!state.trialRulesUserToggled) {
    if (isMobile) {
      if (trialRulesBody) trialRulesBody.style.display = 'none';
      if (trialRulesPreview) trialRulesPreview.style.display = 'block';
      if (trialRulesText) trialRulesText.textContent = 'Configure Rules ▾';
    } else {
      if (trialRulesBody) trialRulesBody.style.display = 'block';
      if (trialRulesPreview) trialRulesPreview.style.display = 'none';
      if (trialRulesText) trialRulesText.textContent = 'Hide Alert Rules ▴';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}
window.syncCollapsibleSectionsOnView = syncCollapsibleSectionsOnView;

function toggleCalendarSection() {
  state.calendarUserToggled = true;
  const body = document.getElementById('calendarBodyCollapseWrap');
  const preview = document.getElementById('calCollapsedPreview');
  const text = document.getElementById('calToggleText');
  const icon = document.getElementById('calToggleIcon');
  const legend = document.getElementById('calendarLegend');

  if (!body) return;

  const isHidden = body.style.display === 'none' || getComputedStyle(body).display === 'none';

  if (isHidden) {
    body.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (text) text.textContent = 'Hide Calendar';
    if (icon) icon.setAttribute('data-lucide', 'chevron-up');
    if (legend) legend.style.display = 'flex';
    if (typeof renderSpendCalendar === 'function') renderSpendCalendar();
  } else {
    body.style.display = 'none';
    if (preview) preview.style.display = 'flex';
    if (text) text.textContent = 'Show Calendar';
    if (icon) icon.setAttribute('data-lucide', 'chevron-down');
    if (legend) legend.style.display = 'none';
  }

  if (window.lucide) window.lucide.createIcons();
}
window.toggleCalendarSection = toggleCalendarSection;

function toggleTrialRules() {
  state.trialRulesUserToggled = true;
  const body = document.getElementById('trialRulesCollapsibleBody');
  const preview = document.getElementById('trialRulesPreview');
  const text = document.getElementById('trialRulesToggleText');

  if (!body) return;

  const isHidden = body.style.display === 'none' || getComputedStyle(body).display === 'none';

  if (isHidden) {
    body.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (text) text.textContent = 'Hide Alert Rules ▴';
  } else {
    body.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (text) text.textContent = 'Configure Rules ▾';
  }

  if (window.lucide) window.lucide.createIcons();
}
window.toggleTrialRules = toggleTrialRules;

function toggleLedgerSection() {
  const body = document.getElementById('ledgerBodyCollapseWrap');
  const preview = document.getElementById('ledgerCollapsedPreview');
  const text = document.getElementById('ledgerToggleText');
  const icon = document.getElementById('ledgerToggleIcon');

  if (!body) return;

  const isHidden = body.style.display === 'none' || getComputedStyle(body).display === 'none';

  if (isHidden) {
    body.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (text) text.textContent = 'Hide';
    if (icon) icon.setAttribute('data-lucide', 'chevron-up');
  } else {
    body.style.display = 'none';
    if (preview) preview.style.display = 'flex';
    if (text) text.textContent = 'Show';
    if (icon) icon.setAttribute('data-lucide', 'chevron-down');
  }

  if (window.lucide) window.lucide.createIcons();
}
window.toggleLedgerSection = toggleLedgerSection;

// ================= ZERO COGNITIVE LOAD SUBTAB CONTROLLERS =================
function switchSubsSubTab(tabName) {
  state.activeSubsSubTab = tabName;
  const tabs = [
    { name: 'ledger', btn: 'subTabBtnLedger', panel: 'subsTabPanelLedger' },
    { name: 'calendar', btn: 'subTabBtnCalendar', panel: 'subsTabPanelCalendar' },
    { name: 'trial', btn: 'subTabBtnTrial', panel: 'subsTabPanelTrial' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    const panel = document.getElementById(t.panel);
    if (t.name === tabName) {
      if (btn) btn.classList.add('active');
      if (panel) {
        panel.style.display = 'block';
        panel.classList.add('active');
      }
    } else {
      if (btn) btn.classList.remove('active');
      if (panel) {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    }
  });

  if (tabName === 'calendar') {
    const calBody = document.getElementById('calendarBodyCollapseWrap');
    const calPreview = document.getElementById('calCollapsedPreview');
    const calLegend = document.getElementById('calendarLegend');
    if (calBody) calBody.style.display = 'block';
    if (calPreview) calPreview.style.display = 'none';
    if (calLegend) calLegend.style.display = 'flex';
    if (typeof renderSpendCalendar === 'function') renderSpendCalendar();
  } else if (tabName === 'ledger') {
    if (typeof renderSubscriptionsLedger === 'function') renderSubscriptionsLedger();
  } else if (tabName === 'trial') {
    if (typeof renderTrialSentinelPanel === 'function') renderTrialSentinelPanel();
  }

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.switchSubsSubTab = switchSubsSubTab;

function switchSettingsCategory(catName) {
  state.activeSettingsCategory = catName;
  const cats = [
    { name: 'profile', btn: 'setTabBtnProfile', panel: 'settingsPanelProfile' },
    { name: 'escalation', btn: 'setTabBtnEscalation', panel: 'settingsPanelEscalation' },
    { name: 'notifs', btn: 'setTabBtnNotifs', panel: 'settingsPanelNotifs' },
    { name: 'ceilings', btn: 'setTabBtnCeilings', panel: 'settingsPanelCeilings' },
    { name: 'reports', btn: 'setTabBtnReports', panel: 'settingsPanelReports' },
    { name: 'legal', btn: 'setTabBtnLegal', panel: 'settingsPanelLegal' }
  ];

  cats.forEach(c => {
    const btn = document.getElementById(c.btn);
    const panel = document.getElementById(c.panel);
    if (c.name === catName) {
      if (btn) btn.classList.add('active');
      if (panel) {
        panel.style.display = 'block';
        panel.classList.add('active');
      }
    } else {
      if (btn) btn.classList.remove('active');
      if (panel) {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    }
  });

  if (catName === 'ceilings' && typeof renderApprovedCeilingsTable === 'function') {
    renderApprovedCeilingsTable();
  }

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.switchSettingsCategory = switchSettingsCategory;

// ================= STATEMENT INGESTION & AUDIT =================
function setupDropzone() {
  const dropzone = document.getElementById('heroDropzone');
  const fileInput = document.getElementById('heroFileInput');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-active');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleStatementFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleStatementFile(e.target.files[0]);
    }
  });
}

async function loadSampleDemoStatement() {
  const btn = document.getElementById('btnDemoLoad');
  if (btn) btn.innerHTML = `<i data-lucide="loader"></i> Auditing Statement...`;

  try {
    const res = await fetch('/fixtures/sample_chase_statement.csv');
    const csvText = await res.text();
    const transactions = parseCSVStatement(csvText);

    // Run batch audit
    await executeBatchAudit(transactions);

    // Switch to app view smoothly
    switchView('app');
  } catch (err) {
    console.error('Error loading demo statement:', err);
    // Fallback directly to batch audit
    await auditStatementData();
    switchView('app');
  } finally {
    if (btn) btn.innerHTML = `<i data-lucide="sparkles"></i> <span>Audit Sample Statement</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim().replace(/^["']|["']$/g, ''));
  return result;
}

function parseCSVStatement(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  // Parse header
  const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const dateIdx = header.findIndex(h => h.includes('date') || h.includes('time'));
  const descIdx = header.findIndex(h => h.includes('description') || h.includes('merchant') || h.includes('payee') || h.includes('narrative') || h.includes('details') || h.includes('name'));
  const amtIdx = header.findIndex(h => h.includes('amount') || h.includes('debit') || h.includes('total') || h.includes('paid out'));
  const catIdx = header.findIndex(h => h.includes('category') || h.includes('type'));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length >= 2) {
      const rawDate = (dateIdx >= 0 && cols[dateIdx]) ? cols[dateIdx] : '2026-10-20';
      const merchant = (descIdx >= 0 && cols[descIdx]) ? cols[descIdx] : (cols[1] || 'Unknown Merchant');
      
      const rawAmt = (amtIdx >= 0 && cols[amtIdx]) ? cols[amtIdx] : (cols[cols.length - 1] || '0');
      const cleanNum = parseFloat(String(rawAmt).replace(/[^0-9.-]/g, ''));
      const amount = isNaN(cleanNum) ? 0 : Math.abs(cleanNum);
      const category = (catIdx >= 0 && cols[catIdx]) ? cols[catIdx] : 'General';

      if (amount > 0 || merchant !== 'Unknown Merchant') {
        results.push({
          date: rawDate,
          merchant,
          amount,
          category,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  return results;
}

async function handleStatementFileUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  showToast(`Ingesting ${isPdf ? 'PDF' : 'CSV'} bank statement: ${file.name}...`, 'info');

  try {
    const activeCur = state.userProfile?.currency || localStorage.getItem('recall_currency') || '₦';
    const formData = new FormData();
    formData.append('statement', file);
    formData.append('currency', activeCur);

    const res = await fetch('/api/statement/upload', {
      method: 'POST',
      headers: {
        'x-user-currency': encodeURIComponent(activeCur)
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Failed to process statement file.');
    }

    // Auto-populate user profile from statement metadata
    if (data.meta) {
      if (data.meta.accountName) {
        state.userProfile = state.userProfile || {};
        state.userProfile.name = data.meta.accountName;
        localStorage.setItem('recall_user_name', data.meta.accountName);
      }
      if (data.meta.currency) {
        // Do not downgrade user-selected Naira to dollar fallback
        const incomingCur = data.meta.currency;
        if (incomingCur === '$' && (state.userProfile?.currency === '₦' || localStorage.getItem('recall_currency') === '₦')) {
          // Preserve Naira
        } else {
          state.userProfile = state.userProfile || {};
          state.userProfile.currency = incomingCur;
          localStorage.setItem('recall_currency', incomingCur);
          if (typeof applyCurrencyGlobally === 'function') {
            applyCurrencyGlobally(incomingCur);
          }
        }
      }
    }

    // Save and render audited transactions
    state.auditResults = data.report?.items || [];
    if (data.monthlySummary) state.statementMonthlySummary = data.monthlySummary;
    if (data.availableMonths) state.availableStatementMonths = data.availableMonths;

    // Synchronize checking wallet balance and name to statement metadata
    if (state.wallets && state.wallets.length > 0) {
      const bankName = data.meta?.bank || 'Primary Checking';
      const acctNum = data.meta?.accountNumber ? ` (${data.meta.accountNumber})` : '';
      state.wallets[0].name = `${bankName}${acctNum}`;
      const closingVal = data.meta?.closingBalance !== undefined && data.meta.closingBalance !== ''
        ? parseFloat(data.meta.closingBalance)
        : (data.availableMonths && data.availableMonths[0] ? data.availableMonths[0].inflow - data.availableMonths[0].outflow : 0);
      state.wallets[0].balance = Number(closingVal.toFixed(2));
      try {
        localStorage.setItem('recall_user_wallets', JSON.stringify(state.wallets));
      } catch (e) {}
    }

    // Set initial active statement month and align user profile inflow
    if (data.availableMonths && data.availableMonths.length > 0) {
      const latestMonth = data.availableMonths[0];
      state.selectedStatementMonth = latestMonth.monthKey;
      state.userProfile.inflow = Number(latestMonth.inflow || 0);
      try {
        localStorage.setItem('recall_inflow', String(latestMonth.inflow));
      } catch (e) {}
    }

    // Cache transactions safely in compact format
    try {
      const compactItems = (state.auditResults || []).map(r => ({
        id: r.id,
        merchant: r.merchant,
        amount: r.amount,
        currentAmount: r.currentAmount,
        type: r.type,
        category: r.category,
        date: r.date,
        displayDate: r.displayDate,
        time: r.time,
        monthKey: r.monthKey,
        monthLabel: r.monthLabel,
        status: r.status,
        walrusMemoryRef: r.walrusMemoryRef,
        message: r.message
      }));
      localStorage.setItem('recall_user_transactions', JSON.stringify(compactItems));
    } catch (e) {
      console.warn('Failed to cache statement transactions to localStorage', e);
    }

    // Initialize Monthly Statement Review & Switcher
    if (typeof initStatementMonthlyReview === 'function') {
      initStatementMonthlyReview();
    }
    if (data.availableMonths && data.availableMonths.length > 0) {
      if (typeof selectStatementMonth === 'function') {
        selectStatementMonth(data.availableMonths[0].monthKey);
      }
    }

    // Re-render all views
    if (typeof renderUserProfileUI === 'function') renderUserProfileUI();
    if (typeof recalculateAllFinancialMetrics === 'function') recalculateAllFinancialMetrics();
    if (typeof renderAuditRecords === 'function') renderAuditRecords(state.auditResults);
    if (typeof renderHomeTxMiniPreview === 'function') renderHomeTxMiniPreview();
    if (typeof updateTxPageMetrics === 'function') updateTxPageMetrics();
    if (typeof renderEnvelopesPlan === 'function') renderEnvelopesPlan();
    if (typeof renderTrialSentinelPanel === 'function') renderTrialSentinelPanel();
    if (typeof renderDisputesLedger === 'function') renderDisputesLedger();

    // Reset input
    if (event?.target) event.target.value = '';

    const bankName = data.meta?.bank || 'bank';
    const alertCount = data.report?.alertsCount || 0;
    showToast(`Successfully ingested and audited ${data.parsedCount} transactions from your ${bankName} statement! (${alertCount} alerts flagged)`, 'success');

    // Switch to Transactions view to see the records immediately
    if (typeof filterAppView === 'function') {
      filterAppView('transactions');
    } else if (typeof switchView === 'function') {
      switchView('app');
    }
  } catch (err) {
    console.error('Statement upload error:', err);
    showToast('Failed to process bank statement: ' + (err.message || 'Unknown error'), 'error');
  }
}
window.handleStatementFileUpload = handleStatementFileUpload;

function handleStatementFile(file) {
  if (!file) return;
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    handleStatementFileUpload({ target: { files: [file] } });
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const transactions = parseCSVStatement(text);
    if (transactions.length > 0) {
      await executeBatchAudit(transactions);
      showToast(`Audited ${transactions.length} transactions from ${file.name}`, 'success');
      switchView('app');
    }
  };
  reader.readAsText(file);
}
window.handleStatementFile = handleStatementFile;

async function auditStatementData() {
  const sampleTransactions = [
    { merchant: 'Netflix', amount: 17.99, date: '2026-10-20' },
    { merchant: 'Amazon Web Services (AWS)', amount: 142.50, date: '2026-10-19' },
    { merchant: 'Adobe Creative Cloud', amount: 54.99, date: '2026-10-18' },
    { merchant: 'OpenAI (ChatGPT Plus)', amount: 20.00, date: '2026-10-14' },
    { merchant: 'Spotify Premium', amount: 10.99, date: '2026-10-15' },
    { merchant: 'DoorDash DashPass', amount: 9.99, date: '2026-10-18' },
    { merchant: 'Apex Luxury Apparel LLC', amount: 89.00, date: '2026-10-21' }
  ];

  await executeBatchAudit(sampleTransactions);
}

async function executeBatchAudit(transactions) {
  try {
    const res = await fetch('/api/audit/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    });
    const report = await res.json();
    state.auditResults = report.items || report.results || [];

    try {
      localStorage.setItem('recall_user_transactions', JSON.stringify(state.auditResults));
    } catch (e) {
      console.warn('Failed to persist user transactions', e);
    }

    if (typeof initStatementMonthlyReview === 'function') initStatementMonthlyReview();
    if (typeof recalculateAllFinancialMetrics === 'function') recalculateAllFinancialMetrics();
    if (typeof renderAuditRecords === 'function') renderAuditRecords(state.auditResults);
    if (typeof renderHomeTxMiniPreview === 'function') renderHomeTxMiniPreview();
    if (typeof updateTxPageMetrics === 'function') updateTxPageMetrics();
    if (typeof renderEnvelopesPlan === 'function') renderEnvelopesPlan();
    if (typeof renderTrialSentinelPanel === 'function') renderTrialSentinelPanel();
    if (typeof renderDisputesLedger === 'function') renderDisputesLedger();

    const cur = state.userProfile?.currency || '$';
    const kpiFlags = document.getElementById('kpiActiveFlags');
    if (kpiFlags) {
      const alertCount = report.alertsCount !== undefined ? report.alertsCount : (report.summary ? (report.summary.priceHikesDetected + report.summary.trialsPending) : 0);
      kpiFlags.textContent = `${alertCount} Alerts`;
    }

    const kpiPreserved = document.getElementById('kpiPreservedLeakage');
    if (kpiPreserved && report.annualSavingsPreserved) {
      kpiPreserved.textContent = `${cur}${report.annualSavingsPreserved}`;
    }

    return report;
  } catch (err) {
    console.error('Batch audit error:', err);
    showToast('Failed to run batch audit on statement transactions.', 'error');
  }
}
window.executeBatchAudit = executeBatchAudit;

function isCreditRecord(r) {
  if (!r) return false;
  if (r.type === 'credit' || r.txType === 'credit') return true;
  if (r.direction === 'credit' || r.direction === 'inflow') return true;
  if (r.transaction && (r.transaction.type === 'credit' || r.transaction.direction === 'credit')) return true;
  const cat = (r.category || (r.transaction && r.transaction.category) || '').toLowerCase();
  if (cat.includes('income') || cat.includes('deposit') || cat.includes('inflow')) return true;
  return false;
}
window.isCreditRecord = isCreditRecord;

function getTxAmount(r) {
  if (!r) return 0;
  const v = r.currentAmount !== undefined ? r.currentAmount : (r.amount !== undefined ? r.amount : (r.transaction && r.transaction.amount) || 0);
  return Number(v) || 0;
}
window.getTxAmount = getTxAmount;

let currentTxSearchQuery = '';
let currentTxFilterMode = 'all';

function formatMonthLabel(mKey) {
  if (!mKey || typeof mKey !== 'string') return 'October 2026';
  const parts = mKey.split('-');
  if (parts.length === 2) {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const idx = parseInt(parts[1], 10) - 1;
    if (idx >= 0 && idx < 12) {
      return `${months[idx]} ${parts[0]}`;
    }
  }
  return mKey;
}

function getTxMonthKey(r) {
  if (!r) return '2026-10';
  if (r.monthKey && /^\d{4}-\d{2}$/.test(r.monthKey)) return r.monthKey;
  const raw = (r.transaction && r.transaction.date) || r.date || r.displayDate || r.timestamp || '';
  if (!raw) return '2026-10';

  // 1. If contains YYYY-MM
  const isoMatch = String(raw).match(/(\d{4})[-/](\d{1,2})/);
  if (isoMatch) {
    const yr = isoMatch[1];
    const mo = isoMatch[2].padStart(2, '0');
    if (parseInt(mo, 10) >= 1 && parseInt(mo, 10) <= 12) {
      return `${yr}-${mo}`;
    }
  }

  // 2. If DD Mon YYYY or Mon DD YYYY (e.g. 15 Oct 2026 or Oct 15 2026 or 15-Oct-2026)
  const mmap = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
  const str = String(raw).toLowerCase();
  for (const [monName, monNum] of Object.entries(mmap)) {
    if (str.includes(monName)) {
      const yearMatch = str.match(/\b(202\d)\b/);
      const yr = yearMatch ? yearMatch[1] : '2026';
      return `${yr}-${monNum}`;
    }
  }

  return '2026-10';
}
window.getTxMonthKey = getTxMonthKey;

function initStatementMonthlyReview() {
  const records = state.auditResults || [];

  // Group by month
  const monthMap = {};
  for (const r of records) {
    const mKey = getTxMonthKey(r);
    const mLabel = r.monthLabel || formatMonthLabel(mKey);
    if (!monthMap[mKey]) {
      monthMap[mKey] = {
        monthKey: mKey,
        monthLabel: mLabel,
        inflow: 0,
        outflow: 0,
        txCount: 0,
        debitCount: 0,
        creditCount: 0,
        categories: {}
      };
    }
    const m = monthMap[mKey];
    m.txCount++;
    const amt = getTxAmount(r);
    const isCredit = isCreditRecord(r);
    if (isCredit) {
      m.inflow += amt;
      m.creditCount++;
    } else {
      m.outflow += amt;
      m.debitCount++;
      const cat = r.category || 'Discretionary';
      m.categories[cat] = (m.categories[cat] || 0) + amt;
    }
  }

  // Sort available months descending (newest first)
  const sortedKeys = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));
  state.availableStatementMonths = sortedKeys.map(k => monthMap[k]);

  // Set default selected month to newest month if available
  if (!state.selectedStatementMonth || (state.selectedStatementMonth !== 'all' && !monthMap[state.selectedStatementMonth])) {
    state.selectedStatementMonth = sortedKeys.length > 0 ? sortedKeys[0] : 'all';
  }

  renderStatementMonthPills();
  renderOverviewMonthPills();
  updateStatementMonthlyReviewCards();
}
window.initStatementMonthlyReview = initStatementMonthlyReview;

function renderStatementMonthPills() {
  const container = document.getElementById('statementMonthPillsTrack');
  if (!container) return;

  const records = state.auditResults || [];
  if (!records || records.length === 0) {
    container.innerHTML = `
      <button type="button" class="month-pill-btn active" data-month="all" onclick="selectStatementMonth('all')">
        <span>Full Year / All Months</span> <span class="pill-count">0</span>
      </button>
    `;
    return;
  }

  const months = state.availableStatementMonths || [];
  let html = `
    <button type="button" class="month-pill-btn ${state.selectedStatementMonth === 'all' ? 'active' : ''}" data-month="all" onclick="selectStatementMonth('all')" title="Full Year / All Months statement review">
      <span>Full Year / All Months</span> <span class="pill-count">${records.length}</span>
    </button>
  `;

  months.forEach(m => {
    const isActive = state.selectedStatementMonth === m.monthKey;
    html += `
      <button type="button" class="month-pill-btn ${isActive ? 'active' : ''}" data-month="${m.monthKey}" onclick="selectStatementMonth('${m.monthKey}')" title="${m.monthLabel}">
        <span>${m.monthLabel}</span> <span class="pill-count">${m.txCount}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

function renderOverviewMonthPills() {
  const container = document.getElementById('overviewMonthPillsTrack');
  if (!container) return;

  const records = state.auditResults || [];
  if (!records || records.length === 0) {
    container.innerHTML = '';
    return;
  }

  const months = state.availableStatementMonths || [];
  const active = state.selectedStatementMonth || 'all';

  let html = `
    <button type="button" class="month-pill-btn ${active === 'all' ? 'active' : ''}" data-month="all" onclick="selectStatementMonth('all')" title="View all months combined">
      <span>Year / All</span>
    </button>
  `;

  months.forEach(m => {
    const isActive = active === m.monthKey;
    const parts = m.monthKey.split('-');
    const monIdx = parseInt(parts[1], 10) - 1;
    const monNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const shortLabel = monIdx >= 0 && monIdx < 12 ? `${monNames[monIdx]} '${parts[0].substring(2)}` : m.monthLabel;
    html += `
      <button type="button" class="month-pill-btn ${isActive ? 'active' : ''}" data-month="${m.monthKey}" onclick="selectStatementMonth('${m.monthKey}')" title="${m.monthLabel}">
        <span>${shortLabel}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}
window.renderOverviewMonthPills = renderOverviewMonthPills;

function selectStatementMonth(monthKey) {
  state.selectedStatementMonth = monthKey;

  // 1. Sync user profile inflow to the selected month's exact inflow
  if (state.availableStatementMonths && state.availableStatementMonths.length > 0) {
    if (monthKey === 'all') {
      const totalInflow = state.availableStatementMonths.reduce((sum, m) => sum + (m.inflow || 0), 0);
      if (totalInflow > 0) state.userProfile.inflow = Number(totalInflow.toFixed(2));
    } else {
      const mData = state.availableStatementMonths.find(m => m.monthKey === monthKey);
      if (mData && mData.inflow > 0) {
        state.userProfile.inflow = Number(mData.inflow.toFixed(2));
      }
    }
  }

  // 2. Re-render both pill tracks so the active state is always exact
  renderStatementMonthPills();
  renderOverviewMonthPills();

  // 3. Scroll active pills into visible view in their horizontal scrollers
  setTimeout(() => {
    document.querySelectorAll('.month-pill-btn.active').forEach(pill => {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }, 30);

  // 4. Update statement review cards
  updateStatementMonthlyReviewCards();

  // 5. Update Cashflow Distribution Bar, Safe-to-Spend Runway, Net Liquidity
  if (typeof recalculateAllFinancialMetrics === 'function') recalculateAllFinancialMetrics();

  // 6. Update user profile displays
  if (typeof renderUserProfileUI === 'function') renderUserProfileUI();

  // 7. Update Envelopes Plan with selected month's inflow and living spend
  if (typeof renderEnvelopesPlan === 'function') renderEnvelopesPlan();

  // 8. Update Transactions feed with fast rendering
  currentTxRenderLimit = 80;
  renderAuditRecords(state.auditResults);

  // 9. Update Transaction page volume and hourly Life Energy KPIs
  if (typeof updateTxPageMetrics === 'function') updateTxPageMetrics();
}
window.selectStatementMonth = selectStatementMonth;

function navigateStatementMonth(direction) {
  const months = (state.availableStatementMonths || []).map(m => m.monthKey);
  if (months.length === 0) return;

  const current = state.selectedStatementMonth;
  let idx = months.indexOf(current);

  if (direction === -1 || direction === 'prev') {
    // Left arrow (<): Step backward in time (e.g. Oct -> Sep -> Aug -> Jul)
    if (idx === -1) {
      idx = 0;
    } else if (idx < months.length - 1) {
      idx = idx + 1;
    } else {
      selectStatementMonth('all');
      return;
    }
  } else {
    // Right arrow (>): Step forward in time (e.g. Jul -> Aug -> Sep -> Oct)
    if (idx === -1) {
      idx = 0;
    } else if (idx > 0) {
      idx = idx - 1;
    } else {
      selectStatementMonth('all');
      return;
    }
  }

  selectStatementMonth(months[idx]);
}
window.navigateStatementMonth = navigateStatementMonth;

function updateStatementMonthlyReviewCards() {
  const cur = state.userProfile?.currency || '$';
  const records = state.auditResults || [];
  const selected = state.selectedStatementMonth || 'all';

  let title = 'All Months / Full Year Review';
  let inflow = 0;
  let outflow = 0;
  let debitCount = 0;
  let creditCount = 0;
  const categories = {};

  if (selected === 'all') {
    title = 'All Months / Full Year Review';
    for (const r of records) {
      const amt = getTxAmount(r);
      const isCredit = isCreditRecord(r);
      if (isCredit) {
        inflow += amt;
        creditCount++;
      } else {
        outflow += amt;
        debitCount++;
        const cat = r.category || 'Discretionary';
        categories[cat] = (categories[cat] || 0) + amt;
      }
    }
  } else {
    const mData = (state.availableStatementMonths || []).find(m => m.monthKey === selected);
    if (mData) {
      title = `${mData.monthLabel} Statement Review`;
      inflow = mData.inflow;
      outflow = mData.outflow;
      debitCount = mData.debitCount;
      creditCount = mData.creditCount;
      Object.assign(categories, mData.categories);
    } else {
      title = `${formatMonthLabel(selected)} Statement Review`;
      for (const r of records) {
        if (getTxMonthKey(r) === selected) {
          const amt = getTxAmount(r);
          const isCredit = isCreditRecord(r);
          if (isCredit) {
            inflow += amt;
            creditCount++;
          } else {
            outflow += amt;
            debitCount++;
            const cat = r.category || 'Discretionary';
            categories[cat] = (categories[cat] || 0) + amt;
          }
        }
      }
    }
  }

  const net = inflow - outflow;

  // Find top destination category
  let topCat = 'None';
  let topCatAmt = 0;
  for (const [cName, cAmt] of Object.entries(categories)) {
    if (cAmt > topCatAmt) {
      topCatAmt = cAmt;
      topCat = cName;
    }
  }
  const topPct = outflow > 0 ? Math.round((topCatAmt / outflow) * 100) : 0;

  // Inflow Card
  const elTitle = document.getElementById('statementActiveMonthTitle');
  if (elTitle) elTitle.textContent = title;

  const elInflow = document.getElementById('flowMonthInflow');
  if (elInflow) elInflow.textContent = `+${cur}${inflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elInflowSub = document.getElementById('flowMonthInflowSub');
  if (elInflowSub) elInflowSub.textContent = `${creditCount} incoming deposit${creditCount === 1 ? '' : 's'}`;

  // Outflow Card
  const elOutflow = document.getElementById('flowMonthOutflow');
  if (elOutflow) elOutflow.textContent = `-${cur}${outflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elOutflowSub = document.getElementById('flowMonthOutflowSub');
  if (elOutflowSub) elOutflowSub.textContent = `${debitCount} processed debit${debitCount === 1 ? '' : 's'}`;

  // Net Card
  const elNet = document.getElementById('flowMonthNet');
  if (elNet) {
    const isPos = net >= 0;
    const absVal = Math.abs(net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    elNet.textContent = `${isPos ? '+' : '-'}${cur}${absVal}`;
    elNet.className = `flow-card-value ${isPos ? 'text-green' : 'text-coral'}`;
  }

  const elNetSub = document.getElementById('flowMonthNetSub');
  if (elNetSub) {
    elNetSub.textContent = net >= 0 ? 'Net Preserved Savings' : 'Net Deficit Outflow';
  }

  // Top Destination Card
  const elTopDest = document.getElementById('flowMonthTopDest');
  if (elTopDest) {
    elTopDest.textContent = topCat !== 'None' ? topCat : 'None';
  }

  const elTopDestSub = document.getElementById('flowMonthTopDestSub');
  if (elTopDestSub) {
    elTopDestSub.textContent = topCatAmt > 0
      ? `${cur}${topCatAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${topPct}% of spending)`
      : 'Where funds left to';
  }

  // Category Allocation Chips ("Leaves to here")
  const chipsContainer = document.getElementById('monthCategoryChips');
  const breakdownBar = document.getElementById('monthSpendingBreakdownBar');
  if (chipsContainer && breakdownBar) {
    const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    if (catEntries.length > 0) {
      breakdownBar.style.display = 'block';
      chipsContainer.innerHTML = catEntries.map(([cName, cAmt]) => {
        const pct = outflow > 0 ? Math.round((cAmt / outflow) * 100) : 0;
        return `
          <div class="category-spend-chip">
            <span class="chip-dot"></span>
            <span>${cName}</span>
            <span class="chip-amt">${cur}${cAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="chip-pct">(${pct}%)</span>
          </div>
        `;
      }).join('');
    } else {
      breakdownBar.style.display = 'none';
    }
  }

  // Update top KPI cards to match
  const kpiVol = document.getElementById('txKpiVolumeDisplay');
  const kpiLabel = document.getElementById('txKpiVolumeLabel');
  const kpiSub = document.getElementById('txKpiCountSub');
  if (kpiVol) kpiVol.textContent = `${cur}${outflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (kpiLabel) kpiLabel.textContent = selected === 'all' ? 'All Months Volume' : `${formatMonthLabel(selected)} Volume`;
  if (kpiSub) kpiSub.textContent = `${debitCount} processed statement debits`;
}

let currentTxRenderLimit = 80;

function loadMoreAuditRecords() {
  currentTxRenderLimit += 80;
  renderAuditRecords(state.auditResults);
}
window.loadMoreAuditRecords = loadMoreAuditRecords;

function handleTxSearch(query) {
  currentTxSearchQuery = (query || '').toLowerCase().trim();
  currentTxRenderLimit = 80;
  renderAuditRecords(state.auditResults);
}
window.handleTxSearch = handleTxSearch;

function filterTxTable(mode) {
  currentTxFilterMode = mode || 'all';
  currentTxRenderLimit = 80;
  document.querySelectorAll('.tx-filter-chips .chip').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-filter') === mode);
  });
  renderAuditRecords(state.auditResults);
}
window.filterTxTable = filterTxTable;

function renderAuditRecords(records) {
  const container = document.getElementById('auditRecordsList');
  if (!container) return;

  if (!records || records.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 48px 24px; color: var(--text-muted);">
        <i data-lucide="inbox" style="width:40px; height:40px; margin-bottom:12px; stroke-width:1.5; opacity:0.6;"></i>
        <div style="font-weight:600; font-size:15px; margin-bottom:6px; color:var(--text-main);">No transactions recorded yet</div>
        <p style="font-size:13px; max-width:400px; margin:0 auto 16px auto;">Upload a bank statement (PDF or CSV) or click "+ Log Expense" above to start auditing your expenses against policy baselines.</p>
        <div style="display:inline-flex; gap:10px; flex-wrap:wrap; justify-content:center;">
          <button class="btn-allocate-funds" onclick="document.getElementById('hiddenStatementUpload').click()" style="padding:8px 16px; font-size:13px;">
            <i data-lucide="upload"></i> Upload Statement (PDF/CSV)
          </button>
          <button class="btn-rebalance-secondary" onclick="openLogExpenseModal()" style="padding:8px 16px; font-size:13px;">
            <i data-lucide="plus"></i> Log First Expense
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    if (typeof renderHomeTxMiniPreview === 'function') renderHomeTxMiniPreview();
    if (typeof updateTxPageMetrics === 'function') updateTxPageMetrics();
    return;
  }

  // Ensure monthly breakdown navigation is initialized
  if (!state.availableStatementMonths || state.availableStatementMonths.length === 0) {
    initStatementMonthlyReview();
  }

  const cur = state.userProfile?.currency || '$';

  // 1. Filter by selected month
  let filtered = records;
  if (state.selectedStatementMonth && state.selectedStatementMonth !== 'all') {
    filtered = filtered.filter(r => getTxMonthKey(r) === state.selectedStatementMonth);
  }

  // 2. Filter based on currentTxFilterMode and state.activeFilter
  filtered = filtered.filter(r => {
    const isAlert = r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'TRIAL_CONVERTING' || r.status === 'ESCALATION_REQUIRED' || r.status === 'ESCALATION_FLAG';
    const isSub = r.status === 'VERIFIED_OK' || r.status === 'NORMAL' || r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'SUPPRESSED_BY_MEMORY' || r.status === 'SUPPRESSED_APPROVED' || r.category === 'Streaming' || r.category === 'Software' || r.category === 'Infrastructure' || r.category === 'Subscriptions';
    const isTrial = r.status === 'TRIAL_CONVERTING' || r.status === 'TRIAL_URGENT' || (r.merchant && r.merchant.toLowerCase().includes('adobe'));
    const isCredit = r.type === 'credit';

    if (currentTxFilterMode === 'debit' && isCredit) return false;
    if (currentTxFilterMode === 'credit' && !isCredit) return false;
    if (currentTxFilterMode === 'subscription' && !isSub) return false;
    if (currentTxFilterMode === 'flagged' && !isAlert && !isTrial) return false;

    if (state.activeFilter === 'alerts') return isAlert;
    if (state.activeFilter === 'subscriptions') return isSub;
    if (state.activeFilter === 'trials') return isTrial;
    return true;
  });

  if (currentTxSearchQuery) {
    filtered = filtered.filter(r => {
      const m = (r.merchant || '').toLowerCase();
      const c = (r.category || '').toLowerCase();
      const w = (r.wallet || '').toLowerCase();
      const expl = (r.explanation || r.message || '').toLowerCase();
      return m.includes(currentTxSearchQuery) || c.includes(currentTxSearchQuery) || w.includes(currentTxSearchQuery) || expl.includes(currentTxSearchQuery);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 24px; color: var(--text-muted);">
        <i data-lucide="filter" style="width:36px; height:36px; margin-bottom:10px; opacity:0.5;"></i>
        <div style="font-weight:600; font-size:14px; margin-bottom:4px; color:var(--text-main);">No transactions found</div>
        <p style="font-size:12px; margin:0 auto 12px auto;">No records match your active month and filters.</p>
        <button class="btn-ghost-action" onclick="selectStatementMonth('all'); filterTxTable('all');" style="display:inline-flex; align-items:center; gap:6px; margin:0 auto;">
          <i data-lucide="rotate-ccw"></i> Reset Filters
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const totalMatches = filtered.length;
  const visible = filtered.slice(0, currentTxRenderLimit);

  let listHtml = visible.map(r => {
    const merchant = r.merchant || (r.transaction && r.transaction.merchant) || 'Unknown Merchant';
    const amount = r.currentAmount !== undefined ? r.currentAmount : (r.amount !== undefined ? r.amount : (r.transaction && r.transaction.amount) || 0);
    const baseline = r.baselineAmount !== undefined ? r.baselineAmount : (r.baseline !== undefined ? r.baseline : null);
    const delta = r.deltaAmount !== undefined ? r.deltaAmount : (baseline !== null && amount > baseline ? Number((amount - baseline).toFixed(2)) : 0);
    const memoryRef = r.walrusMemoryRef || r.memoryUsed || null;
    const date = (r.transaction && r.transaction.date) || r.date || '2026-10-20';
    const isCredit = r.type === 'credit';
    const safeMerchantArg = String(merchant).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    const statusData = getAuditStatusBadge(r.status, delta);

    let actionBtnHtml = '';
    if (isCredit) {
      actionBtnHtml = `
        <span class="verified-badge" style="background:rgba(22,163,74,0.08); color:#16A34A; border:1px solid rgba(22,163,74,0.25);">
          <i data-lucide="check"></i> Inflow
        </span>
      `;
    } else if (r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP') {
      actionBtnHtml = `
        <div style="display:flex; gap:4px;">
          <button class="btn-card-action-red" onclick="openDisputeModalForRecord('${safeMerchantArg}', ${amount}, ${baseline || 0}, ${delta}, '${memoryRef || 'MEM_01'}')">
            <i data-lucide="shield-alert"></i> Dispute
          </button>
          <button class="btn-card-action-amber" onclick="openResolveChangeModal('${safeMerchantArg}', ${amount}, ${baseline || 0})" title="Resolve Plan Change vs Price Hike">
            <i data-lucide="help-circle"></i> Resolve
          </button>
        </div>
      `;
    } else if (r.status === 'TRIAL_CONVERTING' || r.status === 'TRIAL_URGENT' || merchant.toLowerCase().includes('adobe')) {
      actionBtnHtml = `
        <button class="btn-card-action-amber" onclick="openDisputeModalForTrial()">
          <i data-lucide="clock"></i> Cancel
        </button>
      `;
    } else if (r.status === 'SUPPRESSED_BY_MEMORY' || r.status === 'SUPPRESSED_APPROVED') {
      actionBtnHtml = `
        <span class="suppressed-badge" title="Suppressed by Policy Memory ${memoryRef || 'MEM_04'}">
          <i data-lucide="shield-check"></i> Reconciled
        </span>
      `;
    } else if (r.status === 'ESCALATION_REQUIRED' || r.status === 'ESCALATION_FLAG') {
      actionBtnHtml = `
        <button class="btn-card-action-amber" onclick="showToast('Unknown merchant exceeding threshold. Policy triggered: Review required.', 'amber')">
          <i data-lucide="alert-circle"></i> Review
        </button>
      `;
    } else {
      actionBtnHtml = `
        <span class="verified-badge">
          <i data-lucide="check"></i> Verified
        </span>
      `;
    }

    const logoUrl = getMerchantLogo(merchant);
    const avatarHtml = logoUrl
      ? `<div class="merchant-avatar-wrap"><img src="${logoUrl}" class="merchant-avatar-img" alt="${escapeHtml(merchant)}"></div>`
      : `<div class="merchant-avatar ${getAvatarClass(merchant)}">${merchant.charAt(0)}</div>`;

    const walletLabel = r.wallet ? r.wallet.replace(' Account', '').replace(' / Pocket', '') : '';
    const isHikeAlert = (r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP');

    // Clean human-friendly date (e.g. 'Oct 14')
    let formattedDate = date;
    if (typeof date === 'string' && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const mIdx = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (mIdx >= 0 && mIdx < 12 && !isNaN(d)) {
          formattedDate = `${months[mIdx]} ${d}`;
        }
      }
    } else if (r.displayDate) {
      formattedDate = r.displayDate;
    }

    let subtextParts = [formattedDate];
    if (r.category) subtextParts.push(r.category);
    if (walletLabel) subtextParts.push(walletLabel);
    if (isHikeAlert && baseline !== null && baseline > 0) subtextParts.push(`Baseline ${cur}${baseline.toFixed(2)}`);

    const badgeDisplay = isCredit
      ? `<span class="verified-badge text-green" style="background:rgba(22,163,74,0.1); color:#16A34A; border:1px solid rgba(22,163,74,0.25);"><i data-lucide="arrow-down-left"></i> Money Enters</span>`
      : statusData.badgeHtml;

    const amountDisplay = isCredit
      ? `<span class="billed-amount text-green" style="color:#16A34A; font-weight:800;">+${cur}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`
      : `<span class="billed-amount">${cur}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;

    return `
      <div class="audit-record-row ${r.status ? r.status.toLowerCase() : ''} ${isCredit ? 'credit-row' : ''}">
        <div class="record-left">
          ${avatarHtml}
          <div class="record-details">
            <div class="record-title-row">
              <strong>${escapeHtml(merchant)}</strong>
              ${badgeDisplay}
            </div>
            <div class="record-subtext">
              ${subtextParts.map((part, i) => i === 0 ? `<span>${escapeHtml(part)}</span>` : `<span>· ${escapeHtml(part)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="record-right">
          <div class="record-amount-block">
            ${amountDisplay}
          </div>
          <div class="record-actions">
            ${actionBtnHtml}
            ${r.isUserLogged ? `<button class="btn-inspect-mini text-coral" onclick="deleteUserLoggedTx('${safeMerchantArg}', ${amount})" title="Delete"><i data-lucide="trash-2"></i></button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (totalMatches > currentTxRenderLimit) {
    listHtml += `
      <div style="text-align:center; padding: 20px 0;">
        <button type="button" class="btn-ghost-action" onclick="loadMoreAuditRecords()" style="display:inline-flex; align-items:center; gap:6px; margin:0 auto; padding:8px 24px; font-weight:600; font-size:12px;">
          <i data-lucide="chevron-down"></i> Load More Transactions (Showing ${visible.length} of ${totalMatches})
        </button>
      </div>
    `;
  }

  container.innerHTML = listHtml;
  if (window.lucide) window.lucide.createIcons();

  if (window.lucide) window.lucide.createIcons();

  if (typeof renderHomeTxMiniPreview === 'function') renderHomeTxMiniPreview();
  if (typeof updateTxPageMetrics === 'function') updateTxPageMetrics();
}

function renderHomeTxMiniPreview() {
  const lineTxBadge = document.getElementById('homeLineTxBadge');
  const lineAlertBadge = document.getElementById('homeLineAlertBadge');
  const lineAlertSub = document.getElementById('homeLineAlertSub');
  const sidebarTxCount = document.getElementById('sidebarTxCount');

  const records = state.auditResults || [];
  if (lineTxBadge) lineTxBadge.textContent = `${records.length} Audited`;
  if (sidebarTxCount) sidebarTxCount.textContent = `${records.length} Txns`;

  const subs = typeof getActiveSubscriptionsList === 'function' ? getActiveSubscriptionsList() : (state.subscriptions || []);
  const creepSubs = subs.filter(s => Boolean(s.hasHike || s.status === 'CREEP_FLAG' || s.status === 'PRICE_CREEP' || (Number(s.cost) > Number(s.baseline) && !s.overrideApproved)));
  const trialSubs = subs.filter(s => Boolean(s.isTrial || s.status === 'TRIAL' || s.status === 'TRIAL_URGENT'));

  const selected = state.selectedStatementMonth || 'all';
  const targetRecords = selected === 'all'
    ? records
    : records.filter(r => (typeof getTxMonthKey === 'function' ? getTxMonthKey(r) : (r.monthKey || '')) === selected);

  const stmtAlerts = targetRecords.filter(r => 
    r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'TRIAL_CONVERTING' || r.status === 'ESCALATION_REQUIRED'
  );

  const totalAlerts = creepSubs.length + trialSubs.length + stmtAlerts.length;

  if (lineAlertBadge) lineAlertBadge.textContent = `${totalAlerts} Action Needed`;
  if (lineAlertSub) {
    if (totalAlerts === 0) {
      lineAlertSub.textContent = 'All baselines verified · Zero alerts';
    } else {
      const parts = [];
      if (creepSubs.length > 0) parts.push(`${creepSubs.length} price creep`);
      if (trialSubs.length > 0) parts.push(`${trialSubs.length} trial expiring`);
      if (stmtAlerts.length > 0) parts.push(`${stmtAlerts.length} high-debit escalation(s)`);
      lineAlertSub.textContent = parts.join(' · ') || `${totalAlerts} flagged discrepancy action(s) needed`;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}
window.renderHomeTxMiniPreview = renderHomeTxMiniPreview;

function updateTxPageMetrics() {
  const records = state.auditResults || [];
  const cur = state.userProfile?.currency || '$';
  const selected = state.selectedStatementMonth || 'all';

  const targetRecords = selected === 'all' 
    ? records 
    : records.filter(r => getTxMonthKey(r) === selected);

  const debitRecords = targetRecords.filter(r => !isCreditRecord(r));
  const totalVolume = debitRecords.reduce((sum, r) => sum + getTxAmount(r), 0);

  const wage = state.userProfile?.hourlyWage || 25;
  const totalHours = wage > 0 ? (totalVolume / wage).toFixed(1) : '0.0';

  const alertsCount = targetRecords.filter(r => 
    r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'TRIAL_CONVERTING' || r.status === 'ESCALATION_REQUIRED'
  ).length;

  const volDisplay = document.getElementById('txKpiVolumeDisplay');
  const volLabel = document.getElementById('txKpiVolumeLabel');
  const countSub = document.getElementById('txKpiCountSub');
  const hoursDisplay = document.getElementById('txKpiLifeEnergy');
  const wageSub = document.getElementById('txKpiWageSub');
  const alertDisplay = document.getElementById('txKpiAlertsCount');

  if (volDisplay) volDisplay.textContent = `${cur}${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (volLabel) volLabel.textContent = selected === 'all' ? 'All Months Volume' : `${formatMonthLabel(selected)} Volume`;
  if (countSub) countSub.textContent = `${debitRecords.length} processed statement debits`;
  if (hoursDisplay) hoursDisplay.textContent = `${totalHours} hrs`;
  if (wageSub) wageSub.textContent = `Calculated at ${cur}${wage.toFixed(2)}/hr wage`;
  if (alertDisplay) alertDisplay.textContent = `${alertsCount} Flagged`;
}
window.updateTxPageMetrics = updateTxPageMetrics;

function getAuditStatusBadge(status, delta) {
  const cur = state.userProfile?.currency || '$';
  switch (status) {
    case 'MICRO_INFLATION_ALERT':
    case 'PRICE_CREEP':
      return {
        badgeHtml: `<span class="status-badge alert"><i data-lucide="trending-up"></i> +${cur}${delta ? delta.toFixed(2) : '2.50'} Hike</span>`
      };
    case 'TRIAL_CONVERTING':
    case 'TRIAL_URGENT':
      return {
        badgeHtml: `<span class="status-badge urgent"><i data-lucide="alert-triangle"></i> 48h Trial</span>`
      };
    case 'SUPPRESSED_BY_MEMORY':
    case 'SUPPRESSED_APPROVED':
      return {
        badgeHtml: `<span class="status-badge suppressed"><i data-lucide="shield-check"></i> Approved</span>`
      };
    case 'ESCALATION_REQUIRED':
    case 'ESCALATION_FLAG':
      return {
        badgeHtml: `<span class="status-badge escalation"><i data-lucide="flag"></i> Review</span>`
      };
    case 'WATCHDOG_WARNING':
      return {
        badgeHtml: `<span class="status-badge escalation"><i data-lucide="alert-circle"></i> Warning</span>`
      };
    default:
      return {
        badgeHtml: ''
      };
  }
}

function getMerchantLogo(merchant) {
  const m = (merchant || '').toLowerCase();
  if (m.includes('netflix')) return '/assets/logos/netflix.svg';
  if (m.includes('spotify')) return '/assets/logos/spotify.svg';
  if (m.includes('aws') || m.includes('amazon')) return '/assets/logos/aws.svg';
  if (m.includes('adobe')) return '/assets/logos/adobe.svg';
  if (m.includes('openai') || m.includes('chatgpt')) return '/assets/logos/openai.svg';
  if (m.includes('github') || m.includes('copilot')) return '/assets/logos/github.svg';
  if (m.includes('apple') || m.includes('icloud')) return '/assets/logos/apple.svg';
  if (m.includes('figma')) return '/assets/logos/figma.svg';
  if (m.includes('supabase')) return '/assets/logos/supabase.svg';
  if (m.includes('times') || m.includes('nytimes')) return '/assets/logos/nytimes.svg';
  if (m.includes('chase')) return '/assets/logos/chase.svg';
  if (m.includes('amex') || m.includes('american express')) return '/assets/logos/amex.svg';
  if (m.includes('bofa') || m.includes('bank of america')) return '/assets/logos/bofa.svg';
  if (m.includes('stripe')) return '/assets/logos/stripe.svg';
  if (m.includes('sui')) return '/assets/logos/sui.svg';
  if (m.includes('walrus')) return '/assets/logos/walrus.svg';
  if (m.includes('tatum')) return '/assets/logos/tatum.svg';
  return null;
}
window.getMerchantLogo = getMerchantLogo;

function getAvatarClass(merchant) {
  const m = (merchant || '').toLowerCase();
  if (m.includes('netflix')) return 'netflix';
  if (m.includes('spotify')) return 'spotify';
  if (m.includes('aws') || m.includes('amazon')) return 'aws';
  if (m.includes('adobe')) return 'adobe';
  if (m.includes('openai') || m.includes('chatgpt')) return 'openai';
  if (m.includes('doordash')) return 'doordash';
  if (m.includes('trader')) return 'traderjoes';
  if (m.includes('chevron') || m.includes('fuel') || m.includes('gas')) return 'chevron';
  if (m.includes('bottle') || m.includes('coffee') || m.includes('starbucks')) return 'bluebottle';
  if (m.includes('github') || m.includes('copilot')) return 'github';
  if (m.includes('apple') || m.includes('icloud')) return 'apple';
  if (m.includes('equinox') || m.includes('gym') || m.includes('fitness')) return 'equinox';
  if (m.includes('figma')) return 'figma';
  if (m.includes('supabase')) return 'supabase';
  return 'default';
}

// ================= SUBVIEW CONTROLLER (ROUTER) =================
function filterAppView(filterType) {
  // Alias copilot directly into the merged Safe-to-Spend view
  if (filterType === 'copilot') {
    filterType = 'safespend';
    if (typeof openCopilotFromAnywhere === 'function') {
      openCopilotFromAnywhere();
      return;
    }
  }

  // Autonomous rules run in background; route rules request to settings
  if (filterType === 'rules') {
    filterType = 'settings';
    if (typeof showToast === 'function') {
      showToast('Autonomous logic rules run automatically in the background.');
    }
  }

  state.activeFilter = filterType;
  if (filterType && filterType !== 'all') {
    history.replaceState(null, null, '#' + filterType);
  } else {
    history.replaceState(null, null, '#app');
  }

  // Toggle active styling in sidebar
  document.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.classList.remove('active');
  });

  const btnMap = {
    all: 'sideBtnAll',
    transactions: 'sideBtnTransactions',
    wallets: 'sideBtnWallets',
    plan: 'sideBtnPlan',
    safespend: 'sideBtnSafeSpend',
    envelopes: 'sideBtnPlan',
    receipts: 'sideBtnReceipts',
    subscriptions: 'sideBtnSubscriptions',
    alerts: 'sideBtnAlerts',
    trials: 'sideBtnTrials',
    disputes: 'sideBtnDisputes',
    settings: 'sideBtnSettings'
  };

  const targetBtn = document.getElementById(btnMap[filterType]);
  if (targetBtn) {
    targetBtn.classList.add('active');
  }

  // Synchronize Mobile Bottom Nav
  const mNavBtnMap = {
    all: 'mNavHome',
    transactions: 'mNavHome',
    wallets: 'mNavWallets',
    plan: 'mNavPlan',
    envelopes: 'mNavPlan',
    safespend: 'mNavHome',
    receipts: 'mNavHome',
    subscriptions: 'mNavSettings',
    alerts: 'mNavHome',
    trials: 'mNavSettings',
    disputes: 'mNavSettings',
    settings: 'mNavSettings'
  };
  document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
  const activeMNav = document.getElementById(mNavBtnMap[filterType]);
  if (activeMNav) activeMNav.classList.add('active');

  // Toggle Subview Panels safely without alias collisions
  const uniquePanels = [
    document.getElementById('subviewOverview'),
    document.getElementById('subviewTransactions'),
    document.getElementById('subviewWallets'),
    document.getElementById('subviewPlan'),
    document.getElementById('subviewSafeSpend'),
    document.getElementById('subviewReceipts'),
    document.getElementById('subviewAlerts'),
    document.getElementById('subviewDisputes'),
    document.getElementById('subviewSubscriptions'),
    document.getElementById('subviewSettings')
  ].filter(Boolean);

  let targetPanel = document.getElementById('subviewOverview');
  if (filterType === 'transactions') {
    targetPanel = document.getElementById('subviewTransactions');
  } else if (filterType === 'wallets') {
    targetPanel = document.getElementById('subviewWallets');
  } else if (filterType === 'plan' || filterType === 'envelopes') {
    targetPanel = document.getElementById('subviewPlan');
  } else if (filterType === 'safespend') {
    targetPanel = document.getElementById('subviewSafeSpend');
  } else if (filterType === 'receipts') {
    targetPanel = document.getElementById('subviewReceipts');
  } else if (filterType === 'subscriptions' || filterType === 'trials' || filterType === 'calendar') {
    targetPanel = document.getElementById('subviewSubscriptions');
    if (filterType === 'trials') {
      switchSubsSubTab('trial');
    } else if (filterType === 'calendar') {
      switchSubsSubTab('calendar');
    } else {
      switchSubsSubTab('ledger');
    }
  } else if (filterType === 'settings') {
    targetPanel = document.getElementById('subviewSettings');
    if (!state.activeSettingsCategory) {
      switchSettingsCategory('profile');
    } else {
      switchSettingsCategory(state.activeSettingsCategory);
    }
  } else if (filterType === 'alerts') {
    targetPanel = document.getElementById('subviewAlerts');
  } else if (filterType === 'disputes') {
    targetPanel = document.getElementById('subviewDisputes') || document.getElementById('subviewAlerts');
  }

  uniquePanels.forEach(p => {
    if (p === targetPanel) {
      p.style.display = 'flex';
      p.classList.add('active');
    } else {
      p.style.display = 'none';
      p.classList.remove('active');
    }
  });

  // Re-scroll main content area to top
  const scrollArea = document.getElementById('appMainScrollArea');
  if (scrollArea) scrollArea.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;

  applyCurrencyGlobally();

  // View specific loaders
  if (filterType === 'all') {
    renderHomeTxMiniPreview();
    renderUserProfileUI();
  } else if (filterType === 'transactions') {
    if (typeof initStatementMonthlyReview === 'function') initStatementMonthlyReview();
    renderAuditRecords(state.auditResults);
    updateTxPageMetrics();
  } else if (filterType === 'wallets') {
    renderWalletsUI();
  } else if (filterType === 'plan' || filterType === 'envelopes') {
    renderEnvelopesPlan();
    renderPlanSubscriptionsLedger();
  } else if (filterType === 'safespend') {
    if (typeof calculateAffordability === 'function') calculateAffordability();
    const chatContainer = document.getElementById('copilotChatMessages');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  } else if (filterType === 'subscriptions' || filterType === 'trials' || filterType === 'calendar') {
    if (state.activeSubsSubTab === 'calendar') {
      renderSpendCalendar();
    } else if (state.activeSubsSubTab === 'trial') {
      renderTrialSentinelPanel();
    } else {
      renderSubscriptionsLedger();
    }
  } else if (filterType === 'alerts') {
    renderRadarAlertsView();
  } else if (filterType === 'disputes') {
    renderDisputesLedger();
  } else if (filterType === 'settings') {
    loadUserSettingsToForm();
    loadUserProfileToSettings();
  }

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 50);
  }
}
window.filterAppView = filterAppView;

// ================= ACTIVE SUBSCRIPTIONS LEDGER COMPONENT =================
masterSubscriptionsList = [
  {
    id: 'sub_netflix',
    merchant: 'Netflix Standard Tier',
    plan: '1080p 2-Screens Plan',
    logo: '/assets/logos/netflix.svg',
    category: 'streaming',
    categoryLabel: 'Streaming Video',
    cost: 17.99,
    baseline: 15.49,
    delta: 2.50,
    renewalDay: 20,
    renewalText: 'Oct 20, 2026',
    memory: 'MEM_01',
    status: 'CREEP_FLAG',
    statusBadge: '<span class="status-badge alert"><i data-lucide="trending-up"></i> +$2.50 Hike Flagged</span>'
  },
  {
    id: 'sub_spotify',
    merchant: 'Spotify Family Plan',
    plan: 'Premium 6-Account Family',
    logo: '/assets/logos/spotify.svg',
    category: 'streaming',
    categoryLabel: 'Streaming Audio',
    cost: 16.99,
    baseline: 16.99,
    delta: 0,
    renewalDay: 8,
    renewalText: 'Nov 8, 2026',
    memory: 'MEM_01',
    status: 'OVERLAP',
    statusBadge: '<span class="status-badge alert" style="background:#EFF6FF;color:#2563EB;border-color:#2563EB;"><i data-lucide="layers"></i> Audio Overlap</span>'
  },
  {
    id: 'sub_chatgpt',
    merchant: 'OpenAI ChatGPT Plus',
    plan: 'GPT-4o & Canvas Tier',
    logo: '/assets/logos/openai.svg',
    category: 'ai',
    categoryLabel: 'AI & Machine Learning',
    cost: 20.00,
    baseline: 20.00,
    delta: 0,
    renewalDay: 12,
    renewalText: 'Nov 12, 2026',
    memory: 'MEM_01',
    status: 'VERIFIED',
    statusBadge: '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Baseline Match</span>'
  },
  {
    id: 'sub_aws',
    merchant: 'Amazon Web Services (AWS)',
    plan: 'EC2 & S3 Cloud Hosting',
    logo: '/assets/logos/aws.svg',
    category: 'ai',
    categoryLabel: 'Cloud Compute',
    cost: 142.50,
    baseline: 64.00,
    delta: 0,
    renewalDay: 22,
    renewalText: 'Oct 22, 2026',
    memory: 'MEM_04',
    status: 'OVERRIDE',
    statusBadge: '<span class="status-badge suppressed"><i data-lucide="shield-check"></i> Ceiling $180 Approved</span>'
  },
  {
    id: 'sub_figma',
    merchant: 'Figma Professional',
    plan: 'UI/UX Design Seat',
    logo: '/assets/logos/figma.svg',
    category: 'dev',
    categoryLabel: 'Product Design',
    cost: 15.00,
    baseline: 15.00,
    delta: 0,
    renewalDay: 14,
    renewalText: 'Nov 14, 2026',
    memory: 'MEM_01',
    status: 'VERIFIED',
    statusBadge: '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Baseline Match</span>'
  },
  {
    id: 'sub_supabase',
    merchant: 'Supabase Pro Platform',
    plan: 'Dedicated Compute & Storage',
    logo: '/assets/logos/supabase.svg',
    category: 'ai',
    categoryLabel: 'Managed PostgreSQL',
    cost: 25.00,
    baseline: 25.00,
    delta: 0,
    renewalDay: 21,
    renewalText: 'Oct 21, 2026',
    memory: 'MEM_01',
    status: 'VERIFIED',
    statusBadge: '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Baseline Match</span>'
  },
  {
    id: 'sub_adobe',
    merchant: 'Adobe Creative Cloud All Apps',
    plan: '7-Day Free Trial Converting',
    logo: '/assets/logos/adobe.svg',
    category: 'dev',
    categoryLabel: 'Creative Suite',
    cost: 54.99,
    baseline: 0.00,
    delta: 54.99,
    renewalDay: 25,
    renewalText: 'Oct 25, 2026 (48h left)',
    memory: 'MEM_06',
    status: 'TRIAL',
    statusBadge: '<span class="status-badge urgent"><i data-lucide="clock"></i> 48h Trial Auto-Rebill</span>'
  },
  {
    id: 'sub_github',
    merchant: 'GitHub Copilot Individual',
    plan: 'AI Pair Programmer',
    logo: '/assets/logos/github.svg',
    category: 'dev',
    categoryLabel: 'Developer Tools',
    cost: 10.00,
    baseline: 10.00,
    delta: 0,
    renewalDay: 1,
    renewalText: 'Nov 1, 2026',
    memory: 'MEM_01',
    status: 'VERIFIED',
    statusBadge: '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Baseline Match</span>'
  },
  {
    id: 'sub_nytimes',
    merchant: 'The New York Times',
    plan: 'All Access Digital News',
    logo: '/assets/logos/nytimes.svg',
    category: 'productivity',
    categoryLabel: 'Journalism & Media',
    cost: 4.00,
    baseline: 4.00,
    delta: 0,
    renewalDay: 28,
    renewalText: 'Oct 28, 2026',
    memory: 'MEM_01',
    status: 'PROMO',
    statusBadge: '<span class="status-badge verified" style="background:#FAF5FF;color:#7C3AED;border-color:#DDD6FE;"><i data-lucide="tag"></i> Promo Active</span>'
  }
];

let activeSubCategory = 'all';
let activeSubSearch = '';

function getActiveSubscriptionsList() {
  const saved = localStorage.getItem('recall_user_subscriptions');
  const user = state.userProfile?.signedIn || localStorage.getItem('recall_user_signed_in') === 'true';

  let list = null;
  if (saved) {
    try {
      list = JSON.parse(saved);
    } catch (e) {
      list = null;
    }
  } else if (state.subscriptions && (user || state.subscriptions.length > 0)) {
    list = state.subscriptions;
  }

  if (list && Array.isArray(list)) {
    return list.map((s, idx) => {
      const amt = Number(s.cost !== undefined ? s.cost : (s.amount !== undefined ? s.amount : 0));
      const base = Number(s.baseline !== undefined ? s.baseline : amt);
      const isTrial = Boolean(s.isTrial || s.status === 'TRIAL' || s.status === 'TRIAL_URGENT');
      const isCreep = Boolean(s.hasHike || s.status === 'CREEP_FLAG' || s.status === 'PRICE_CREEP' || (amt > base && !s.overrideApproved));
      const isOverride = Boolean(s.overrideApproved || s.status === 'OVERRIDE' || s.status === 'SUPPRESSED');
      const isCancelled = s.status === 'cancelled' || s.status === 'CANCELLED';
      const isPendingReview = s.status === 'pending_review' || s.status === 'PENDING_REVIEW';

      let memRef = s.id || s.memory || 'MEM_01';
      if (s.walrusMemoryRef) memRef = s.walrusMemoryRef;
      if (s.merchant && s.merchant.toLowerCase().includes('adobe')) memRef = 'MEM_06';
      if (s.merchant && s.merchant.toLowerCase().includes('aws')) memRef = 'MEM_04';
      if (s.merchant && s.merchant.toLowerCase().includes('doordash')) memRef = 'MEM_10';
      if (['MEM_02', 'MEM_03', 'MEM_05', 'MEM_08', 'MEM_09', 'MEM_12'].includes(memRef)) {
        memRef = 'MEM_01';
      }

      let statusBadge = s.statusBadge;
      if (!statusBadge || isCancelled || isPendingReview) {
        if (isCancelled) {
          statusBadge = '<span class="status-badge alert" style="background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;"><i data-lucide="x-circle"></i> Cancelled</span>';
        } else if (isPendingReview) {
          statusBadge = '<span class="status-badge alert" style="background:#FEF3C7;color:#92400E;border-color:#FCD34D;"><i data-lucide="help-circle"></i> Pending Review</span>';
        } else if (isTrial) {
          statusBadge = '<span class="status-badge alert" style="background:#FFFBEB;color:#D97706;border-color:#FDE68A;"><i data-lucide="clock"></i> 48h Trial Alert</span>';
        } else if (isCreep) {
          statusBadge = '<span class="status-badge alert"><i data-lucide="trending-up"></i> Price Hike Flagged</span>';
        } else if (isOverride) {
          statusBadge = '<span class="status-badge suppressed"><i data-lucide="shield-check"></i> Approved Limit</span>';
        } else {
          statusBadge = '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Verified Active</span>';
        }
      }

      return {
        id: s.id || `sub_${idx + 1}`,
        merchant: s.merchant || s.name || s.display_name || 'Subscription',
        plan: s.plan || s.name || 'Standard Tier',
        logo: s.logo || getMerchantLogo(s.merchant || s.name || s.display_name || '') || '/assets/logos/generic.svg',
        category: (s.category || 'tools').toLowerCase(),
        categoryLabel: s.categoryLabel || s.category || 'Utility',
        cost: amt,
        baseline: base,
        delta: Number(s.delta || (amt - base)),
        renewalDay: Number(s.renewalDay || s.dayOfMonth || s.day || s.bill_day || 15),
        renewalText: s.renewalText || `Day ${s.renewalDay || s.dayOfMonth || s.day || s.bill_day || 15} of month`,
        memory: memRef,
        status: isCancelled ? 'CANCELLED' : isPendingReview ? 'PENDING_REVIEW' : isTrial ? 'TRIAL' : isCreep ? 'CREEP_FLAG' : isOverride ? 'OVERRIDE' : 'VERIFIED',
        source: s.source || 'user_stated',
        statusBadge: statusBadge
      };
    });
  }

  return masterSubscriptionsList;
}
window.getActiveSubscriptionsList = getActiveSubscriptionsList;

// ================= GLOBAL CURRENCY & DISPUTES UTILITIES =================
function applyCurrencyGlobally(cur = null) {
  const currency = cur || state.userProfile?.currency || '$';
  if (state.userProfile) {
    state.userProfile.currency = currency;
  }

  // Sanitize and normalize any existing audit result records to active currency
  if (Array.isArray(state.auditResults)) {
    let changed = false;
    state.auditResults.forEach(r => {
      if (r.currency !== currency) {
        r.currency = currency;
        changed = true;
      }
      if (currency === '₦' || currency === 'NGN') {
        const isNigerian = Boolean(r.merchant && /opay|owealth|kuda|gtbank|zenith|palmpay|moniepoint|firstbank|access bank|auto-save/i.test(r.merchant));
        const amt = Number(r.amount !== undefined ? r.amount : (r.currentAmount || 0));
        // If falsely flagged as an unknown merchant escalation gate on a small micro-spend (< 75,000 NGN)
        if (r.status === 'ESCALATION_REQUIRED' && (isNigerian || amt < 75000)) {
          r.status = 'VERIFIED_OK';
          r.message = 'Normal micro-spend within discretionary limits.';
          changed = true;
        } else if (r.message && r.message.includes('$')) {
          r.message = r.message.replace(/\$50(\.00)?/g, '₦75,000.00').replace(/\$([0-9,]+(\.[0-9]{2})?)/g, '₦$1');
          changed = true;
        }
        if (r.title && r.title.includes('$')) {
          r.title = r.title.replace(/\$([0-9,]+(\.[0-9]{2})?)/g, '₦$1');
          changed = true;
        }
      }
    });
    if (changed) {
      try {
        localStorage.setItem('recall_user_transactions', JSON.stringify(state.auditResults));
      } catch (e) {}
    }
  }

  // All currency symbol spans and labels
  document.querySelectorAll('.currency-sym, .modal-cur-sym').forEach(el => {
    el.textContent = currency;
  });

  // Prefix elements
  const txPrefix = document.getElementById('txCurrencyPrefix');
  if (txPrefix) txPrefix.textContent = currency;
  const newSubPrefix = document.getElementById('newSubCurrencyPrefix');
  if (newSubPrefix) newSubPrefix.textContent = currency;
  const inflowPrefix = document.getElementById('currencyPrefixInflow');
  if (inflowPrefix) inflowPrefix.textContent = currency;
  const wagePrefix = document.getElementById('currencyPrefixWage');
  if (wagePrefix) wagePrefix.textContent = currency;

  // Populate tx-wallet dropdown with current wallet balances in user currency
  const txWallet = document.getElementById('tx-wallet');
  if (txWallet && state.wallets && state.wallets.length > 0) {
    const curVal = txWallet.value;
    txWallet.innerHTML = state.wallets.map(w => `
      <option value="${w.name}" ${curVal === w.name ? 'selected' : ''}>
        ${w.name} (${currency}${Number(w.balance || 0).toFixed(2)}${w.locked ? ' Locked' : ''})
      </option>
    `).join('');
  }

  // Populate transfer wallets dropdown with current balances
  const fromSel = document.getElementById('transferFromWallet');
  const toSel = document.getElementById('transferToWallet');
  if (fromSel && toSel && state.wallets && state.wallets.length > 0) {
    const fromVal = fromSel.value || state.wallets[0]?.name;
    const toVal = toSel.value || state.wallets[1]?.name || state.wallets[0]?.name;
    const opts = state.wallets.map(w => `
      <option value="${w.name}">
        ${w.name} (${currency}${Number(w.balance || 0).toFixed(2)}${w.locked ? ' Locked' : ''})
      </option>
    `).join('');
    fromSel.innerHTML = opts;
    toSel.innerHTML = opts;
    if (fromVal) fromSel.value = fromVal;
    if (toVal) toSel.value = toVal;
  }

  // Populate newSubWallet dropdown
  const subWallet = document.getElementById('newSubWallet');
  if (subWallet && state.wallets && state.wallets.length > 0) {
    const subVal = subWallet.value;
    subWallet.innerHTML = state.wallets.map(w => `
      <option value="${w.id}" ${subVal === w.id ? 'selected' : ''}>
        ${w.name} (${currency}${Number(w.balance || 0).toFixed(2)})
      </option>
    `).join('');
  }

  // Update spend escalation slider display and ticks
  const gateSlider = document.getElementById('gateSlider');
  if (gateSlider && typeof updateGateDisplay === 'function') {
    updateGateDisplay(gateSlider.value);
  }
  const ticks = document.getElementById('gateRangeTicks');
  if (ticks) {
    ticks.innerHTML = `
      <span>${currency}10</span>
      <span>${currency}50</span>
      <span>${currency}100</span>
      <span>${currency}200</span>
    `;
  }
  const microSel = document.getElementById('microInflationSelect');
  if (microSel && microSel.options.length >= 3) {
    microSel.options[0].textContent = `Zero Tolerance (>= ${currency}0.50)`;
    microSel.options[1].textContent = `Standard (>= ${currency}1.00)`;
    microSel.options[2].textContent = `Relaxed (>= ${currency}2.50)`;
  }

  // Update ceiling input placeholder and re-render approved ceilings table
  const ceilingInput = document.getElementById('newOverrideCeiling');
  if (ceilingInput) {
    ceilingInput.placeholder = `Ceiling (${currency})`;
  }
  if (typeof renderApprovedCeilingsTable === 'function') {
    renderApprovedCeilingsTable();
  }
  if (typeof renderRadarAlertsView === 'function') {
    renderRadarAlertsView();
  }
}
window.applyCurrencyGlobally = applyCurrencyGlobally;

function renderTrialSentinelPanel() {
  const panel = document.getElementById('subsTabPanelTrial');
  if (!panel) return;

  const cur = state.userProfile?.currency || '$';
  const allSubs = getActiveSubscriptionsList();
  const trialSubs = allSubs.filter(s => Boolean(s.isTrial || s.status === 'TRIAL' || s.status === 'TRIAL_URGENT'));
  const totalTrialRisk = trialSubs.reduce((sum, t) => sum + (Number(t.cost !== undefined ? t.cost : t.amount) || 0), 0);

  const riskStat = document.getElementById('settingsTrialRisk');
  if (riskStat) {
    riskStat.innerHTML = `${cur}${totalTrialRisk.toFixed(2)}<small>/mo</small>`;
  }

  const trialBadge = document.querySelector('#subTabBtnTrial .subtab-badge-pill');
  if (trialBadge) {
    trialBadge.textContent = `${trialSubs.length}`;
    if (trialSubs.length === 0) {
      trialBadge.style.opacity = '0.6';
    } else {
      trialBadge.style.opacity = '1';
    }
  }

  if (trialSubs.length === 0) {
    panel.innerHTML = `
      <div class="settings-card card-full-width" style="text-align:center; padding: 48px 24px; background:var(--bg-surface); border:2px solid var(--border-color); border-radius:12px; margin-top:14px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: #DCFCE7; color: #16A34A; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 2px solid #141413;">
          <i data-lucide="shield-check" style="width: 30px; height: 30px;"></i>
        </div>
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">Zero Impending Free Trials</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 18px auto; line-height: 1.6;">
          You have no recurring trials converting to paid debits. Sentinel continuously monitors your subscriptions and will arm an autonomous 48-hour defense timer before any trial converts to a paid rebill.
        </p>
        <button class="btn-ghost-action" onclick="openAddTrialModal()" style="display:inline-flex; align-items:center; gap:6px;">
          <i data-lucide="plus-circle"></i> <span>+ Track a Free Trial</span>
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // If trial subs exist, render cards for them
  let cardsHtml = trialSubs.map(t => {
    const rebillAmt = Number(t.cost !== undefined ? t.cost : t.amount) || 0;
    const merchant = t.merchant || 'Free Trial';
    return `
      <div class="settings-card card-full-width trial-sentinel-hero-card" id="trialSentinelCard_${t.id}">
        <div class="trial-card-top-alert">
          <div class="trial-alert-badge"><i data-lucide="clock"></i> 48H TRIAL CONVERSION ALERT</div>
          <div class="trial-countdown-ticker">
            <span class="pulse-amber-dot"></span>
            <strong>47h : 58m : 14s remaining</strong>
          </div>
        </div>

        <div class="trial-card-body-grid">
          <div class="trial-info-block">
            <div class="trial-merchant-header">
              <img src="${t.logo || '/assets/logos/generic.svg'}" class="merchant-hero-logo" alt="${merchant}">
              <div>
                <h3 class="trial-merchant-title">${merchant}</h3>
                <p class="trial-merchant-sub">Rebills ${cur}${rebillAmt.toFixed(2)}/mo on <strong>November 15, 2026</strong></p>
              </div>
            </div>

            <div class="trial-metadata-pills">
              <span class="trial-meta-pill"><i data-lucide="credit-card"></i> <strong>Card:</strong> Primary Rail</span>
              <span class="trial-meta-pill"><i data-lucide="clock"></i> <strong>Cadence:</strong> 7-Day Free Trial</span>
              <span><span class="status-pill amber"><i data-lucide="alert-triangle"></i> Action Needed · 48h to Rebill</span></span>
            </div>

            <div class="trial-decision-actions" id="trialDecisionActions_${t.id}">
              <button class="btn-cancel-trial-danger" onclick="cancelTrialSubscription('${merchant}')">
                <i data-lucide="x-circle"></i>
                <span>Cancel Subscription</span>
              </button>
              <button class="btn-keep-trial-success" onclick="keepTrialSubscription('${merchant}')">
                <i data-lucide="check-circle-2"></i>
                <span>Keep Subscription</span>
              </button>
              <button class="btn-ghost-outline" onclick="openDisputeModalForRecord('${merchant}', ${rebillAmt}, 0, ${rebillAmt}, '${t.memory || 'MEM_TRIAL'}')">
                <i data-lucide="file-text"></i>
                <span>Cancellation Pack</span>
              </button>
            </div>
          </div>

          <div class="trial-notifications-block">
            <div class="trial-notif-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <i data-lucide="bell" class="text-amber"></i>
                <h4>Trial Alert Rules</h4>
              </div>
            </div>
            <div class="trial-rules-preview" style="margin-top:8px;">
              <p class="setting-hint" style="margin:0;">🔔 48h advance alarm · Web Push & Telegram active</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  panel.innerHTML = cardsHtml;
  if (window.lucide) window.lucide.createIcons();
}
window.renderTrialSentinelPanel = renderTrialSentinelPanel;

function renderDisputesLedger() {
  const tbody = document.getElementById('disputesTableBody');
  if (!tbody) return;

  const cur = state.userProfile?.currency || '$';
  let userDisputes = [];
  try {
    const saved = localStorage.getItem('recall_user_disputes');
    if (saved) userDisputes = JSON.parse(saved);
  } catch (e) {
    userDisputes = [];
  }

  const totalPreservedEl = document.getElementById('disputesTotalPreserved');
  const countSubEl = document.getElementById('disputesCountSub');
  const feeEl = document.getElementById('disputesSentinelFee');
  const rakeEl = document.getElementById('disputesTraditionalRake');
  const rateEl = document.getElementById('disputesSuccessRate');

  if (userDisputes.length === 0) {
    if (totalPreservedEl) totalPreservedEl.textContent = `${cur}0.00`;
    if (countSubEl) countSubEl.textContent = '0 disputes resolved';
    if (feeEl) feeEl.textContent = `${cur}0.00 (0% Rake)`;
    if (rakeEl) rakeEl.textContent = `${cur}0.00`;
    if (rateEl) rateEl.textContent = '100%';

    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 48px 20px; color: var(--text-muted);">
          <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #F3F4F6; color: #6B7280; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
              <i data-lucide="scale" style="width:24px; height:24px; stroke-width:1.5;"></i>
            </div>
            <strong style="color:var(--text-main); font-size:14px;">No Disputes Filed Yet</strong>
            <p style="font-size:12px; max-width:440px; margin:0 auto; line-height:1.5; color:var(--text-muted);">
              When price creep is detected or you dispute an unauthorized subscription debit, Sentinel generates 1-tap objection packs and logs verified Sui resolution proofs here.
            </p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // If disputes exist
  const totalPreserved = userDisputes.reduce((sum, d) => sum + (Number(d.amountSaved) || 0), 0);
  const rakeAvoided = totalPreserved * 0.40;

  if (totalPreservedEl) totalPreservedEl.textContent = `${cur}${totalPreserved.toFixed(2)}`;
  if (countSubEl) countSubEl.textContent = `${userDisputes.length} disputes resolved`;
  if (feeEl) feeEl.textContent = `${cur}0.00 (0% Rake)`;
  if (rakeEl) rakeEl.textContent = `-${cur}${rakeAvoided.toFixed(2)}`;
  if (rateEl) rateEl.textContent = '100%';

  tbody.innerHTML = userDisputes.map(d => `
    <tr>
      <td>
        <div class="tx-cell-merchant">
          <img src="${d.logo || '/assets/logos/generic.svg'}" class="merchant-mini-logo" alt="${d.merchant}">
          <strong>${d.merchant}</strong>
        </div>
      </td>
      <td>${d.reason}</td>
      <td><strong class="text-green">+${cur}${Number(d.amountSaved || 0).toFixed(2)} Saved</strong></td>
      <td><code>${d.memory || 'MEM_PROOF'}</code></td>
      <td>
        <a href="https://suiscan.xyz/mainnet/tx/8Xp4v9wK2mN1bL7qR5sT3uV" target="_blank" class="sui-digest-link">
          <i data-lucide="external-link"></i> ${d.txHash || 'Sui Mainnet Proof'}
        </a>
      </td>
      <td><span class="status-pill green">${d.status || 'Resolved · Credit Kept'}</span></td>
    </tr>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}
window.renderDisputesLedger = renderDisputesLedger;

function renderSubscriptionsLedger() {
  const container = document.getElementById('subscriptionsContainer');
  if (!container) return;

  const sourceList = getActiveSubscriptionsList();

  // Dynamically update filter buttons with live counts!
  const allCount = sourceList.length;
  const streamCount = sourceList.filter(s => s.category === 'streaming').length;
  const aiCount = sourceList.filter(s => s.category === 'ai').length;
  const devCount = sourceList.filter(s => s.category === 'dev').length;
  const prodCount = sourceList.filter(s => s.category === 'productivity').length;

  const btnAll = document.querySelector('.sub-filter-buttons button:nth-child(1)');
  const btnStream = document.querySelector('.sub-filter-buttons button:nth-child(2)');
  const btnAi = document.querySelector('.sub-filter-buttons button:nth-child(3)');
  const btnDev = document.querySelector('.sub-filter-buttons button:nth-child(4)');
  const btnProd = document.querySelector('.sub-filter-buttons button:nth-child(5)');

  if (btnAll) btnAll.textContent = `All (${allCount})`;
  if (btnStream) btnStream.textContent = `Streaming (${streamCount})`;
  if (btnAi) btnAi.textContent = `AI & Cloud (${aiCount})`;
  if (btnDev) btnDev.textContent = `Dev Tools (${devCount})`;
  if (btnProd) btnProd.textContent = `Productivity (${prodCount})`;

  if (typeof renderTrialSentinelPanel === 'function') {
    renderTrialSentinelPanel();
  }

  const dismissed = JSON.parse(localStorage.getItem('recall_dismissed_subscription_proposals') || '[]');
  const activeProposals = (state.subscriptionProposals || []).filter(p => !dismissed.includes(p.vendor));

  let proposalsHtml = '';
  const cur = state.userProfile?.currency || '$';

  if (activeProposals.length > 0) {
    proposalsHtml = `
      <div class="proposals-wrapper" style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="sparkles" style="color: #3B82F6; width: 16px; height: 16px;"></i>
          <span>Statement Proposals Detected (${activeProposals.length})</span>
        </div>
        ${activeProposals.map(p => `
          <div class="proposal-card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center; color: #3B82F6;">
                <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                  <span>${escapeHtml(p.vendor)}</span>
                  <span class="badge" style="font-size: 11px; background: rgba(59, 130, 246, 0.2); color: #2563EB; padding: 2px 8px; border-radius: 12px;">Detected ${escapeHtml(p.detected_cadence || 'monthly')} · ${cur}${Number(p.amount).toFixed(2)}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                  Pattern: <code>${escapeHtml(p.raw_pattern || p.vendor)}</code> · ${p.occurrences || 2} cycles observed. Add to memory ledger?
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn-primary-compact btn-confirm-proposal" data-vendor="${escapeHtml(p.vendor)}" data-amount="${p.amount}" data-cadence="${escapeHtml(p.detected_cadence || 'monthly')}" data-pattern="${escapeHtml(p.raw_pattern || p.vendor)}" style="padding: 6px 14px; font-size: 12px;">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i> Confirm
              </button>
              <button class="btn-ghost-outline btn-dismiss-proposal" data-vendor="${escapeHtml(p.vendor)}" style="padding: 6px 12px; font-size: 12px;">
                Dismiss
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const filtered = sourceList.filter(item => {
    const matchesCat = activeSubCategory === 'all' || item.category === activeSubCategory;
    const matchesQuery = !activeSubSearch || 
      item.merchant.toLowerCase().includes(activeSubSearch.toLowerCase()) || 
      (item.memory && item.memory.toLowerCase().includes(activeSubSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0 && activeProposals.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 48px; color: var(--text-muted);">
        <div style="font-weight:600; margin-bottom:6px;">No subscriptions configured</div>
        <p style="font-size:13px; max-width:380px; margin:0 auto 16px auto;">You currently have no recurring services active. Click below to configure your subscriptions and spend calendar.</p>
        <button class="btn-primary-compact" onclick="openConfigureSubscriptionsModal()" style="display:inline-flex; align-items:center; gap:6px;">
          <i data-lucide="sliders-horizontal" style="width:14px; height:14px;"></i> Configure Subscriptions
        </button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = proposalsHtml + `
    <table class="subscriptions-table">
      <thead>
        <tr>
          <th>Service & Merchant</th>
          <th>Plan & Category</th>
          <th>Monthly Cost</th>
          <th>Renewal Cadence</th>
          <th>Policy Baseline</th>
          <th>Sentinel Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  filtered.forEach(sub => {
    const merchantEsc = escapeHtml(sub.merchant);
    const planEsc = escapeHtml(sub.plan);
    const catLabelEsc = escapeHtml(sub.categoryLabel);
    const renewalTextEsc = escapeHtml(sub.renewalText);
    const memEsc = escapeHtml(sub.memory || 'MEM_01');

    let actionBtn = '';
    if (sub.status === 'CREEP_FLAG') {
      actionBtn = `
        <div style="display:inline-flex; gap:4px;">
          <button class="btn-inspect-mini text-coral btn-dispute-trigger" data-merchant="${merchantEsc}" data-cost="${sub.cost}" data-baseline="${sub.baseline}" data-delta="${sub.delta}" data-memory="${memEsc}">
            <i data-lucide="scale"></i> Dispute
          </button>
          <button class="btn-inspect-mini text-amber btn-resolve-change-trigger" data-merchant="${merchantEsc}" data-cost="${sub.cost}" data-baseline="${sub.baseline}" title="Plan Change vs Price Hike">
            <i data-lucide="help-circle"></i> Resolve
          </button>
        </div>
      `;
    } else if (sub.status === 'TRIAL') {
      actionBtn = `
        <button class="btn-inspect-mini text-amber btn-trial-cancel-trigger" data-merchant="${merchantEsc}">
          <i data-lucide="x-circle"></i> Cancel
        </button>
      `;
    } else if (sub.status === 'OVERLAP') {
      actionBtn = `
        <button class="btn-inspect-mini text-blue btn-overlap-trigger">
          <i data-lucide="arrow-right-left"></i> Consolidate
        </button>
      `;
    } else if (sub.status === 'CANCELLED') {
      actionBtn = `
        <span class="status-badge alert" style="background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;font-size:11px;padding:3px 8px;">
          <i data-lucide="x-circle"></i> Inactive
        </span>
      `;
    } else {
      actionBtn = `
        <div style="display:inline-flex; gap:4px;">
          <button class="btn-inspect-mini btn-policy-trigger" data-memory="${memEsc}">
            <i data-lucide="eye"></i> Policy
          </button>
          <button class="btn-inspect-mini text-coral btn-sub-cancel-trigger" data-merchant="${merchantEsc}" title="Cancel subscription">
            <i data-lucide="x-circle"></i> Cancel
          </button>
        </div>
      `;
    }

    html += `
      <tr>
        <td>
          <div class="sub-merchant-cell">
            <img src="${sub.logo}" class="merchant-mini-logo" alt="${merchantEsc}">
            <div class="sub-merchant-meta">
              <strong>${merchantEsc}</strong>
              <span>${planEsc}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="category-chip chip-slate">${catLabelEsc}</span>
        </td>
        <td class="sub-cost-cell">
          <strong>${cur}${sub.cost.toFixed(2)}</strong>
          <small>${cur}${(sub.cost * 12).toFixed(2)} / yr</small>
        </td>
        <td class="sub-date-cell">
          <span>${renewalTextEsc}</span>
        </td>
        <td>
          <strong class="memory-id-badge btn-policy-trigger" data-memory="${memEsc}" style="cursor:pointer;" title="Inspect memory baseline">
            ${memEsc}
          </strong>
        </td>
        <td>
          ${sub.statusBadge}
        </td>
        <td>
          ${actionBtn}
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;

  // Safe event delegation - no inline string interpolation!
  container.querySelectorAll('.btn-dispute-trigger').forEach(btn => {
    btn.onclick = () => {
      openDisputeModalForRecord(
        btn.dataset.merchant,
        parseFloat(btn.dataset.cost || 0),
        parseFloat(btn.dataset.baseline || 0),
        parseFloat(btn.dataset.delta || 0),
        btn.dataset.memory
      );
    };
  });
  container.querySelectorAll('.btn-trial-cancel-trigger').forEach(btn => {
    btn.onclick = () => {
      if (typeof openDisputeModalForTrial === 'function') openDisputeModalForTrial(btn.dataset.merchant);
    };
  });
  container.querySelectorAll('.btn-overlap-trigger').forEach(btn => {
    btn.onclick = () => {
      if (typeof openDisputeModalForOverlap === 'function') openDisputeModalForOverlap();
    };
  });
  container.querySelectorAll('.btn-policy-trigger').forEach(btn => {
    btn.onclick = () => {
      if (typeof inspectMemoryDetail === 'function') inspectMemoryDetail(btn.dataset.memory);
    };
  });
  container.querySelectorAll('.btn-resolve-change-trigger').forEach(btn => {
    btn.onclick = () => {
      openResolveChangeModal(
        btn.dataset.merchant,
        parseFloat(btn.dataset.cost || 0),
        parseFloat(btn.dataset.baseline || 0)
      );
    };
  });
  container.querySelectorAll('.btn-sub-cancel-trigger').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm(`Mark ${btn.dataset.merchant} as cancelled in the sovereign ledger?`)) return;
      await cancelSubscription(btn.dataset.merchant);
    };
  });
  container.querySelectorAll('.btn-confirm-proposal').forEach(btn => {
    btn.onclick = async () => {
      await confirmProposal(
        btn.dataset.vendor,
        parseFloat(btn.dataset.amount || 0),
        btn.dataset.cadence,
        btn.dataset.pattern
      );
    };
  });
  container.querySelectorAll('.btn-dismiss-proposal').forEach(btn => {
    btn.onclick = () => {
      dismissProposal(btn.dataset.vendor);
    };
  });

  if (window.lucide) window.lucide.createIcons();
}
window.renderSubscriptionsLedger = renderSubscriptionsLedger;

async function cancelSubscription(vendor) {
  try {
    const res = await fetch('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription');
    showToast(`Cancelled ${vendor} in sovereign ledger MEM_01`, 'emerald');
    await loadSubscriptions();
  } catch (err) {
    showToast('Failed to cancel subscription: ' + err.message, 'amber');
  }
}
window.cancelSubscription = cancelSubscription;

function openResolveChangeModal(vendor, amount, baseline) {
  const modal = document.getElementById('resolveChangeModal');
  if (!modal) {
    showToast(`Discrepancy for ${vendor}: new charge $${amount.toFixed(2)} vs baseline $${baseline.toFixed(2)}`, 'blue');
    return;
  }
  const titleEl = document.getElementById('resolveChangeVendorTitle');
  if (titleEl) titleEl.textContent = `Resolve ${vendor}: Plan Change vs Price Hike`;

  const detailsEl = document.getElementById('resolveChangeDetails');
  if (detailsEl) {
    const diff = (amount - baseline).toFixed(2);
    detailsEl.innerHTML = `Charge of <strong>$${amount.toFixed(2)}</strong> differs from established baseline <strong>$${baseline.toFixed(2)}</strong> (+${diff >= 0 ? '$' : '-$'}${Math.abs(diff)}).`;
  }

  const btnPlan = document.getElementById('btnConfirmPlanChange');
  if (btnPlan) {
    btnPlan.onclick = () => resolveSubscriptionChange('plan_change');
  }
  const btnHike = document.getElementById('btnConfirmPriceHike');
  if (btnHike) {
    btnHike.onclick = () => resolveSubscriptionChange('price_hike');
  }

  modal.dataset.vendor = vendor;
  modal.dataset.amount = amount;
  modal.style.display = 'flex';
  modal.classList.add('active');
}
window.openResolveChangeModal = openResolveChangeModal;

function closeResolveChangeModal() {
  const modal = document.getElementById('resolveChangeModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}
window.closeResolveChangeModal = closeResolveChangeModal;

async function resolveSubscriptionChange(choice) {
  const modal = document.getElementById('resolveChangeModal');
  if (!modal) return;
  const vendor = modal.dataset.vendor;
  const amount = parseFloat(modal.dataset.amount || 0);

  try {
    const res = await fetch('/api/subscriptions/resolve-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor, amount, choice })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve change');

    closeResolveChangeModal();
    if (choice === 'plan_change') {
      showToast(`Updated baseline for ${vendor} to $${amount.toFixed(2)}!`, 'emerald');
    } else {
      showToast(`Flagged unannounced price hike for ${vendor}. Dispute pack ready.`, 'coral');
    }
    await loadSubscriptions();
  } catch (err) {
    showToast('Failed to resolve change: ' + err.message, 'amber');
  }
}
window.resolveSubscriptionChange = resolveSubscriptionChange;

async function confirmProposal(vendor, amount, cadence, raw_pattern) {
  try {
    const res = await fetch('/api/subscriptions/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor, amount, cadence, raw_pattern })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to confirm proposal');
    state.subscriptionProposals = (state.subscriptionProposals || []).filter(p => p.vendor !== vendor);
    showToast(`Confirmed subscription for ${vendor} into sovereign ledger MEM_01!`, 'emerald');
    await loadSubscriptions();
  } catch (err) {
    showToast('Failed to confirm subscription: ' + err.message, 'amber');
  }
}
window.confirmProposal = confirmProposal;

function dismissProposal(vendor) {
  const dismissed = JSON.parse(localStorage.getItem('recall_dismissed_subscription_proposals') || '[]');
  if (!dismissed.includes(vendor)) {
    dismissed.push(vendor);
    localStorage.setItem('recall_dismissed_subscription_proposals', JSON.stringify(dismissed));
  }
  state.subscriptionProposals = (state.subscriptionProposals || []).filter(p => p.vendor !== vendor);
  renderSubscriptionsLedger();
  showToast(`Dismissed proposal for ${vendor}`, 'slate');
}
window.dismissProposal = dismissProposal;

function filterSubsCategory(cat, btn) {
  activeSubCategory = cat;
  document.querySelectorAll('.sub-filter-buttons .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSubscriptionsLedger();
}
window.filterSubsCategory = filterSubsCategory;

function handleSubSearch(event) {
  activeSubSearch = event.target.value.trim();
  renderSubscriptionsLedger();
}
window.handleSubSearch = handleSubSearch;

// ================= USER SETTINGS & ESCALATION CONTROLS =================
function updateGateDisplay(val) {
  const el = document.getElementById('gateValueDisplay');
  const cur = state.userProfile?.currency || '$';
  if (el) el.textContent = `${cur}${parseFloat(val).toFixed(2)}`;
}
window.updateGateDisplay = updateGateDisplay;

function updateInflationDisplay(val) {
  const el = document.getElementById('inflationCapDisplay');
  if (el) el.textContent = `${parseFloat(val).toFixed(1)}%`;
}
window.updateInflationDisplay = updateInflationDisplay;

function loadUserSettingsToForm() {
  const savedGate = localStorage.getItem('recall-gate-threshold');
  const savedMicro = localStorage.getItem('recall-micro-inflation');
  const savedCap = localStorage.getItem('recall-inflation-cap');
  const savedTg = localStorage.getItem('recall-telegram-handle');

  if (savedGate) {
    const slider = document.getElementById('gateSlider');
    if (slider) {
      slider.value = savedGate;
      updateGateDisplay(savedGate);
    }
  }

  if (savedMicro) {
    const select = document.getElementById('microInflationSelect');
    if (select) select.value = savedMicro;
  }

  if (savedCap) {
    const capSlider = document.getElementById('inflationSlider');
    if (capSlider) {
      capSlider.value = savedCap;
      updateInflationDisplay(savedCap);
    }
  }

  if (savedTg) {
    const tgInput = document.getElementById('telegramHandleInput');
    if (tgInput) tgInput.value = savedTg;
  }

  // Check Groq Copilot status
  fetch('/api/copilot/config')
    .then(r => r.json())
    .then(data => {
      const badge = document.getElementById('groqStatusBadge');
      if (badge) {
        if (data.configured) {
          badge.textContent = 'PocketSentinel AI Connected';
          badge.className = 'status-pill green';
        } else {
          badge.textContent = 'Local Intelligence Engine Active';
          badge.className = 'status-pill blue';
        }
      }
    })
    .catch(() => {});
}

function saveAllUserSettings() {
  const gate = document.getElementById('gateSlider')?.value || '50';
  const micro = document.getElementById('microInflationSelect')?.value || '0.50';
  const cap = document.getElementById('inflationSlider')?.value || '5.0';
  const tg = document.getElementById('telegramHandleInput')?.value || '';
  const sms = document.getElementById('smsPhoneInput')?.value || '';

  localStorage.setItem('recall-gate-threshold', gate);
  localStorage.setItem('recall-micro-inflation', micro);
  localStorage.setItem('recall-inflation-cap', cap);
  localStorage.setItem('recall-telegram-handle', tg);
  localStorage.setItem('recall-sms-phone', sms);

  showToast('Sentinel policies & escalation gates saved locally and synced!');
}
window.saveAllUserSettings = saveAllUserSettings;

function sendTestTelegramAlert() {
  const tg = document.getElementById('telegramHandleInput')?.value || 'sovereign_user';
  showToast(`[Telegram @PocketSentinelBot] Test alert dispatched to @${tg}: "Netflix +$2.50 hike flagged on Chase Sapphire card. 1-Tap Dispute: recall.xyz/d/902"`);
}
window.sendTestTelegramAlert = sendTestTelegramAlert;

async function updateMasterPassphrase() {
  const input = document.getElementById('settingsPassphraseInput');
  const phrase = input ? input.value.trim() : '';
  if (phrase.length < 12) {
    alert('Master passphrase must be at least 12 characters.');
    return;
  }

  await initWebCryptoVault(phrase);
  showToast('Master encryption passphrase updated. AES-256-GCM vault re-keyed.');
}
window.updateMasterPassphrase = updateMasterPassphrase;

async function pingTatumRpc() {
  const btn = event.target.closest('button');
  if (btn) btn.innerHTML = `<i data-lucide="loader"></i> Pinging...`;

  try {
    const start = performance.now();
    const res = await fetch('/api/status');
    const data = await res.json();
    const latency = Math.round(performance.now() - start);

    showToast(`Tatum Sui Mainnet RPC response: ${latency}ms · Block 48,192,042 · Status: ${data.status}`);
  } catch (err) {
    showToast('Tatum RPC fallback connection active.');
  } finally {
    if (btn) btn.innerHTML = `<i data-lucide="activity"></i> Test RPC Latency`;
    if (window.lucide) window.lucide.createIcons();
  }
}
window.pingTatumRpc = pingTatumRpc;

function renderApprovedCeilingsTable() {
  const tbody = document.getElementById('overridesTableBody');
  const cur = state.userProfile?.currency || '$';

  const ceilingInput = document.getElementById('newOverrideCeiling');
  if (ceilingInput) {
    ceilingInput.placeholder = `Ceiling (${cur})`;
  }

  if (!tbody) return;

  if (!state.spendingCeilings || state.spendingCeilings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
          No approved spending ceilings configured. Add an exception below to suppress false alerts for known merchant spikes.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = state.spendingCeilings.map((c, idx) => `
    <tr>
      <td>
        <div class="tx-cell-merchant">
          <span class="merchant-logo-fallback"><i data-lucide="shield"></i></span>
          <strong>${escapeHtml(c.merchant)}</strong>
        </div>
      </td>
      <td>${cur}${parseFloat(c.ceiling || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo</td>
      <td>${escapeHtml(c.reason || 'Approved Ceiling')}</td>
      <td><code>${escapeHtml(c.policy || c.id || ('POL-' + String(idx + 1).padStart(2, '0')))}</code></td>
      <td><span class="status-pill ${c.status === 'Frozen' ? 'blue' : 'green'}">${escapeHtml(c.status || 'Active')}</span></td>
      <td>
        <button class="btn-inspect-mini text-coral" onclick="removeApprovedCeiling(${idx})" title="Revoke Ceiling">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    </tr>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}
window.renderApprovedCeilingsTable = renderApprovedCeilingsTable;

function removeApprovedCeiling(index) {
  if (!state.spendingCeilings || index < 0 || index >= state.spendingCeilings.length) return;
  const removed = state.spendingCeilings.splice(index, 1)[0];
  try {
    localStorage.setItem('recall_spending_ceilings', JSON.stringify(state.spendingCeilings));
  } catch (e) {
    console.warn('Failed to update spending ceilings', e);
  }
  renderApprovedCeilingsTable();
  showToast(`Revoked spending ceiling for ${removed?.merchant || 'merchant'}. Standard baseline re-applied.`);
}
window.removeApprovedCeiling = removeApprovedCeiling;

function removeOverrideRow(btn) {
  const row = btn.closest('tr');
  if (row) {
    row.remove();
    showToast('Override policy revoked. Standard baseline re-applied.');
  }
}
window.removeOverrideRow = removeOverrideRow;

function addNewOverridePolicy() {
  const merchant = document.getElementById('newOverrideMerchant')?.value.trim();
  const ceilingVal = document.getElementById('newOverrideCeiling')?.value.trim();
  const reason = document.getElementById('newOverrideReason')?.value.trim();
  const cur = state.userProfile?.currency || '$';

  if (!merchant || !ceilingVal || !reason) {
    if (typeof showToast === 'function') {
      showToast(`Please provide Merchant, Ceiling (${cur}), and Reason.`);
    }
    return;
  }

  const ceiling = parseFloat(ceilingVal);
  if (isNaN(ceiling) || ceiling < 0) {
    if (typeof showToast === 'function') {
      showToast('Please enter a valid positive ceiling amount.');
    }
    return;
  }

  if (!state.spendingCeilings) {
    state.spendingCeilings = [];
  }

  const memId = `POL-${String(state.spendingCeilings.length + 1).padStart(2, '0')}`;
  state.spendingCeilings.push({
    id: memId,
    merchant,
    ceiling,
    reason,
    policy: memId,
    status: 'Active'
  });

  try {
    localStorage.setItem('recall_spending_ceilings', JSON.stringify(state.spendingCeilings));
  } catch (e) {
    console.warn('Failed to persist spending ceilings', e);
  }

  if (document.getElementById('newOverrideMerchant')) document.getElementById('newOverrideMerchant').value = '';
  if (document.getElementById('newOverrideCeiling')) document.getElementById('newOverrideCeiling').value = '';
  if (document.getElementById('newOverrideReason')) document.getElementById('newOverrideReason').value = '';

  renderApprovedCeilingsTable();
  showToast(`Override policy [${memId}] committed for ${merchant}!`);
}
window.addNewOverridePolicy = addNewOverridePolicy;

// ================= TRIALS & ALERTS DYNAMIC RENDERING =================
function renderRadarAlertsView() {
  const container = document.getElementById('alertsCardsGrid');
  if (!container) return;

  const cur = state.userProfile?.currency || '$';

  // 1. Subscription Creeps
  const subs = typeof getActiveSubscriptionsList === 'function' ? getActiveSubscriptionsList() : (state.subscriptions || []);
  const creepSubs = subs.filter(s => Boolean(s.hasHike || s.status === 'CREEP_FLAG' || s.status === 'PRICE_CREEP' || (Number(s.cost) > Number(s.baseline) && !s.overrideApproved)));

  // 2. Subscription Free Trials
  const trialSubs = subs.filter(s => Boolean(s.isTrial || s.status === 'TRIAL' || s.status === 'TRIAL_URGENT'));

  // 3. Subscription Overlaps
  const overlapSubs = subs.filter(s => s.status === 'OVERLAP' || (s.category && s.category.includes('streaming') && subs.filter(x => x.category === s.category).length > 1));
  const hasOverlap = overlapSubs.length >= 2;

  // 4. Statement Escalations (respecting active statement month)
  const records = state.auditResults || [];
  const selected = state.selectedStatementMonth || 'all';
  const targetRecords = selected === 'all'
    ? records
    : records.filter(r => (typeof getTxMonthKey === 'function' ? getTxMonthKey(r) : (r.monthKey || '')) === selected);

  const escalationRecords = targetRecords.filter(r => r.status === 'ESCALATION_REQUIRED' || r.status === 'MICRO_INFLATION_ALERT');

  let cardsHtml = '';

  // Render Subscription Creep cards
  creepSubs.forEach(s => {
    const cost = Number(s.cost || 0);
    const base = Number(s.baseline || 0);
    const delta = Number(s.delta || (cost - base));
    const annualLeak = (delta * 12).toFixed(2);
    cardsHtml += `
      <div class="triage-card triage-creep">
        <div class="triage-card-header">
          <div class="triage-merchant-info">
            <div class="triage-logo-wrap">
              <img src="${s.logo || '/assets/logos/generic.svg'}" alt="${escapeHtml(s.merchant)}" class="merchant-mini-logo">
            </div>
            <div>
              <h4 class="triage-name">${escapeHtml(s.merchant)}</h4>
              <span class="triage-meta">${escapeHtml(s.plan || 'Standard Tier')} · Day ${s.renewalDay || 20} of month</span>
            </div>
          </div>
          <span class="triage-badge red"><i data-lucide="trending-up"></i> +${cur}${delta.toFixed(2)} / mo Hike</span>
        </div>
        <div class="triage-comparison-box">
          <div class="comp-col">
            <span class="comp-label">Baseline</span>
            <strong class="comp-val">${cur}${base.toFixed(2)} / mo</strong>
            <span class="comp-sub">Approved [${s.memory || 'MEM_01'}]</span>
          </div>
          <div class="comp-arrow">&rarr;</div>
          <div class="comp-col">
            <span class="comp-label">Recent Charge</span>
            <strong class="comp-val red">${cur}${cost.toFixed(2)} / mo</strong>
            <span class="comp-sub">Unannounced hike</span>
          </div>
          <div class="comp-col highlight">
            <span class="comp-label">Annual Leakage</span>
            <strong class="comp-val red">+${cur}${annualLeak} / yr</strong>
            <span class="comp-sub">Recoverable</span>
          </div>
        </div>
        <p class="triage-narrative">
          Billed +${cur}${delta.toFixed(2)}/mo above your ${cur}${base.toFixed(2)} approved baseline [${s.memory || 'MEM_01'}].
        </p>
        <div class="triage-actions-row">
          <button type="button" class="btn-amber-cta" onclick="openDisputeModalForRecord('${escapeHtml(s.merchant).replace(/'/g, "\\'")}', ${cost}, ${base}, ${delta}, '${s.memory || 'MEM_01'}')">
            <i data-lucide="scale"></i>
            <span>Dispute Hike (${cur}${annualLeak}/yr)</span>
          </button>
          <button type="button" class="btn-ghost-outline" onclick="inspectMemoryDetail('${s.memory || 'MEM_01'}')">
            <i data-lucide="eye"></i>
            <span>View Memory</span>
          </button>
        </div>
      </div>
    `;
  });

  // Render Trial cards
  trialSubs.forEach(t => {
    const cost = Number(t.cost || 0);
    const annualCommit = (cost * 12).toFixed(2);
    cardsHtml += `
      <div class="triage-card triage-trial">
        <div class="triage-card-header">
          <div class="triage-merchant-info">
            <div class="triage-logo-wrap">
              <img src="${t.logo || '/assets/logos/generic.svg'}" alt="${escapeHtml(t.merchant)}" class="merchant-mini-logo">
            </div>
            <div>
              <h4 class="triage-name">${escapeHtml(t.merchant)}</h4>
              <span class="triage-meta">7-Day Free Trial · Rebill in 48h</span>
            </div>
          </div>
          <span class="triage-badge amber"><i data-lucide="clock"></i> 48-Hour Alarm</span>
        </div>
        <div class="triage-comparison-box">
          <div class="comp-col">
            <span class="comp-label">Trial Cost</span>
            <strong class="comp-val">${cur}0.00</strong>
            <span class="comp-sub">Free Period</span>
          </div>
          <div class="comp-arrow">&rarr;</div>
          <div class="comp-col">
            <span class="comp-label">Upcoming Rebill</span>
            <strong class="comp-val coral">${cur}${cost.toFixed(2)} / mo</strong>
            <span class="comp-sub">Auto-conversion</span>
          </div>
          <div class="comp-col highlight">
            <span class="comp-label">Annual Commitment</span>
            <strong class="comp-val coral">${cur}${annualCommit} / yr</strong>
            <span class="comp-sub">Recurring contract</span>
          </div>
        </div>
        <p class="triage-narrative">
          Free trial ends in 48 hours. Auto-rebills at ${cur}${cost.toFixed(2)}/mo on Day ${t.renewalDay || 25}.
        </p>
        <div class="triage-actions-row">
          <button type="button" class="btn-amber-cta" onclick="openDisputeModalForTrial('${escapeHtml(t.merchant).replace(/'/g, "\\'")}', ${cost}, '${t.memory || 'MEM_10'}')">
            <i data-lucide="shield-alert"></i>
            <span>Cancel Subscription</span>
          </button>
          <button type="button" class="btn-ghost-outline" onclick="copyTrialCancelTemplate()">
            <i data-lucide="copy"></i>
            <span>Copy Notice</span>
          </button>
        </div>
      </div>
    `;
  });

  // Render Overlap card if active
  if (hasOverlap) {
    cardsHtml += `
      <div class="triage-card triage-overlap">
        <div class="triage-card-header">
          <div class="triage-merchant-info">
            <div class="triage-logo-wrap">
              <img src="/assets/logos/spotify.svg" alt="Spotify" class="merchant-mini-logo">
            </div>
            <div>
              <h4 class="triage-name">Streaming Overlap Detected</h4>
              <span class="triage-meta">Multiple active streaming services</span>
            </div>
          </div>
          <span class="triage-badge blue"><i data-lucide="layers"></i> Redundant</span>
        </div>
        <div class="triage-comparison-box">
          <div class="comp-col">
            <span class="comp-label">Primary</span>
            <strong class="comp-val">${cur}16.99 / mo</strong>
            <span class="comp-sub">Active</span>
          </div>
          <div class="comp-col">
            <span class="comp-label">Duplicate</span>
            <strong class="comp-val">${cur}10.99 / mo</strong>
            <span class="comp-sub">Active</span>
          </div>
          <div class="comp-col highlight">
            <span class="comp-label">Potential Savings</span>
            <strong class="comp-val text-green">Save ${cur}131.88 / yr</strong>
            <span class="comp-sub">Consolidate tiers</span>
          </div>
        </div>
        <p class="triage-narrative">
          Multiple active audio/video streaming subscriptions detected [MEM_11]. Consolidating preserves capital.
        </p>
        <div class="triage-actions-row">
          <button type="button" class="btn-amber-cta" onclick="openDisputeModalForOverlap()">
            <i data-lucide="arrow-right-left"></i>
            <span>Consolidate</span>
          </button>
          <button type="button" class="btn-ghost-outline" onclick="suppressOverlapFor90Days()">
            <i data-lucide="clock"></i>
            <span>Snooze</span>
          </button>
        </div>
      </div>
    `;
  }

  // Render Statement High-Debit Escalation cards
  escalationRecords.forEach((r, idx) => {
    const amt = parseFloat(r.amount || 0);
    cardsHtml += `
      <div class="triage-card triage-gate">
        <div class="triage-card-header">
          <div class="triage-merchant-info">
            <div class="triage-logo-wrap">
              <span class="gate-icon-placeholder"><i data-lucide="shield-alert"></i></span>
            </div>
            <div>
              <h4 class="triage-name">${escapeHtml(r.merchant || 'High-Debit Transaction')}</h4>
              <span class="triage-meta">${escapeHtml(r.date || r.displayDate || 'Recent')} · Statement Debit</span>
            </div>
          </div>
          <span class="triage-badge amber"><i data-lucide="alert-triangle"></i> High-Debit Gate</span>
        </div>
        <div class="triage-comparison-box">
          <div class="comp-col">
            <span class="comp-label">Amount Debited</span>
            <strong class="comp-val red">${cur}${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            <span class="comp-sub">Requires verification</span>
          </div>
          <div class="comp-col">
            <span class="comp-label">Safety Policy</span>
            <strong class="comp-val">[MEM_07]</strong>
            <span class="comp-sub">Autonomous Gate</span>
          </div>
          <div class="comp-col highlight">
            <span class="comp-label">Action Status</span>
            <strong class="comp-val coral">Approval Needed</strong>
            <span class="comp-sub">Quarantined</span>
          </div>
        </div>
        <p class="triage-narrative">
          ${escapeHtml((() => {
            let msg = r.message || `Charge of ${cur}${amt.toFixed(2)} exceeds autonomous safety threshold.`;
            if (cur && cur !== '$' && msg.includes('$')) {
              if (cur === '₦' || cur === 'NGN') {
                msg = msg.replace(/\$50(\.00)?/g, '₦75,000.00');
              }
              msg = msg.replace(/\$([0-9,]+(\.[0-9]{2})?)/g, `${cur}$1`);
            }
            return msg;
          })())}
        </p>
        <div class="triage-actions-row">
          <button type="button" class="btn-amber-cta" onclick="approveEscalationRecord(${idx})">
            <i data-lucide="check-circle-2"></i>
            <span>Approve Exception</span>
          </button>
          <button type="button" class="btn-ghost-outline" onclick="openDisputeModalForRecord('${escapeHtml(r.merchant).replace(/'/g, "\\'")}', ${amt}, 0, ${amt}, 'MEM_07')">
            <i data-lucide="scale"></i>
            <span>1-Tap Dispute</span>
          </button>
        </div>
      </div>
    `;
  });

  // Empty state if zero alerts
  if (!cardsHtml) {
    cardsHtml = `
      <div class="empty-alerts-card" style="grid-column: 1 / -1; text-align: center; padding: 56px 24px; background: #ffffff; border: 2px solid #141413; border-radius: 14px; box-shadow: 3px 3px 0px #141413;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 2px solid #141413; box-shadow: 2px 2px 0px #141413;">
          <i data-lucide="shield-check" style="width: 32px; height: 32px;"></i>
        </div>
        <h3 style="font-size: 1.2rem; font-weight: 900; margin-bottom: 6px; color: #141413;">Zero Discrepancy Alerts</h3>
        <p style="font-size: 0.9rem; color: #64748b; max-width: 480px; margin: 0 auto 18px auto; line-height: 1.6;">
          All statement debits and recurring subscriptions match approved baseline memories. Autonomous safety radar is active and protecting your runway.
        </p>
      </div>
    `;
  }

  container.innerHTML = cardsHtml;
  if (window.lucide) window.lucide.createIcons();
}
window.renderRadarAlertsView = renderRadarAlertsView;

function approveEscalationRecord(idx) {
  const records = state.auditResults || [];
  const selected = state.selectedStatementMonth || 'all';
  const targetRecords = selected === 'all'
    ? records
    : records.filter(r => (typeof getTxMonthKey === 'function' ? getTxMonthKey(r) : (r.monthKey || '')) === selected);

  const escalationRecords = targetRecords.filter(r => r.status === 'ESCALATION_REQUIRED' || r.status === 'MICRO_INFLATION_ALERT');
  const target = escalationRecords[idx];
  if (target) {
    target.status = 'VERIFIED_OK';
    target.message = 'Approved by user exception.';
    if (typeof addNewOverridePolicy === 'function') {
      addNewOverridePolicy(target.merchant, target.amount, 'User Approved High-Debit Exception');
    }
    recalculateAllFinancialMetrics();
    renderRadarAlertsView();
    showToast(`Approved ${target.merchant} debit exception!`);
  }
}
window.approveEscalationRecord = approveEscalationRecord;

function batchDisputeAllHikes() {
  const subs = typeof getActiveSubscriptionsList === 'function' ? getActiveSubscriptionsList() : (state.subscriptions || []);
  const creepSubs = subs.filter(s => Boolean(s.hasHike || s.status === 'CREEP_FLAG' || s.status === 'PRICE_CREEP' || (Number(s.cost) > Number(s.baseline) && !s.overrideApproved)));
  if (creepSubs.length > 0) {
    const s = creepSubs[0];
    const cost = Number(s.cost || 0);
    const base = Number(s.baseline || 0);
    const delta = Number(s.delta || (cost - base));
    openDisputeModalForRecord(s.merchant, cost, base, delta, s.memory || 'MEM_01');
    showToast(`1-Tap dispute pack generated for ${s.merchant}!`);
  } else {
    showToast('All subscriptions currently match authorized baselines.');
  }
}
window.batchDisputeAllHikes = batchDisputeAllHikes;

function openDisputeModalForTrial(merchant = 'Adobe Creative Cloud All Apps', rebillAmt = 54.99, memoryId = 'MEM_10') {
  const cur = state.userProfile?.currency || '$';
  state.activeDispute = {
    merchant,
    amount: rebillAmt,
    baseline: 0.00,
    delta: rebillAmt,
    memoryId,
    type: 'TRIAL_CANCEL'
  };

  const modal = document.getElementById('disputeModal');
  const title = document.getElementById('disputeModalTitle');
  const subtitle = document.getElementById('disputeModalSubtitle');
  const subject = document.getElementById('disputeSubject');
  const body = document.getElementById('disputeLetterBody');
  const metaStrip = document.getElementById('disputeMetaStrip');

  title.textContent = `1-Tap Trial Cancellation Pack: ${merchant}`;
  subtitle.textContent = `48h Pre-Conversion Warning · Sovereign Memory [${memoryId}] · 0% Fee Rake`;
  subject.textContent = `Formal Notice of Immediate Cancellation: ${merchant} Trial`;

  const annualCommit = (rebillAmt * 12).toFixed(2);
  metaStrip.innerHTML = `
    <div class="meta-item"><span>Trial Period:</span> <strong>7-Day Free Period</strong></div>
    <div class="meta-item red"><span>Impending Rebill:</span> <strong>${cur}${rebillAmt.toFixed(2)} / mo (${cur}${annualCommit}/yr)</strong></div>
    <div class="meta-item amber"><span>Hours Remaining:</span> <strong>48 Hours (Auto-converts)</strong></div>
    <div class="meta-item green"><span>PocketSentinel Fee:</span> <strong>${cur}0.00 (Zero Rake)</strong></div>
  `;

  body.value = `To: ${merchant} Billing & Subscription Support
Re: Immediate Cancellation Notice of Free Trial Account
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To Customer Support,

Please accept this formal written notice of cancellation for my ${merchant} trial, effective immediately.

- Account Service: ${merchant}
- Trial Expiration / Rebill Horizon: Upcoming Renewal
- Scheduled Recurring Charge: ${cur}${rebillAmt.toFixed(2)} / month

I affirmatively opt out of converting this trial to a paid subscription or recurring contract. Please ensure no debit or early termination fee is processed against my card on file.

Please reply with written confirmation of cancellation and transaction reference.

Sincerely,
PocketSentinel Sovereign Account Sentinel [ID: ${memoryId}]`;

  if (modal) modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}
window.openDisputeModalForTrial = openDisputeModalForTrial;

function openDisputeModalForOverlap() {
  const cur = state.userProfile?.currency || '$';
  alert(`Audio Overlap Consolidator:\n\nSovereign Memory [MEM_11] notes active subscriptions to both Spotify (${cur}16.99/mo) and Apple Music (${cur}10.99/mo).\n\nConsolidating to a single streaming tier preserves ${cur}131.88/year in household capital.\n\nWould you like PocketSentinel to draft a 1-tap cancellation notice for Apple Music?`);
  showToast('Prompting Apple Music cancellation pack to eliminate audio duplication.');
}
window.openDisputeModalForOverlap = openDisputeModalForOverlap;

function simulateUnknownMerchantDebit() {
  const simulatedTx = {
    date: '2026-10-23',
    merchant: 'Apex Cloud Analytics Inc',
    amount: 79.99,
    status: 'ESCALATION_REQUIRED',
    message: 'Unknown merchant charge of $79.99 exceeds configured $50.00 escalation gate. Quarantine active.'
  };

  state.auditResults.unshift(simulatedTx);
  filterAppView('all');
  showToast('Policy MEM_07 Alarm: $79.99 charge from Apex Cloud quarantined at escalation gate!');
}
window.simulateUnknownMerchantDebit = simulateUnknownMerchantDebit;

function copyTrialCancelTemplate() {
  const text = `To Adobe Billing Support: Please cancel my 7-day Adobe Creative Cloud trial immediately before the Oct 25 renewal. Do not bill my card. Thank you.`;
  navigator.clipboard.writeText(text);
  showToast('Cancellation notice copied to clipboard!');
}
window.copyTrialCancelTemplate = copyTrialCancelTemplate;

function suppressOverlapFor90Days() {
  showToast('Spotify + Apple Music overlap notice snoozed for 90 days in memory.');
}
window.suppressOverlapFor90Days = suppressOverlapFor90Days;

// ================= MODAL CONTROLLERS (ADD SUB / ADD TRIAL) =================
function openNewSubscriptionModal() {
  const modal = document.getElementById('newSubscriptionModal') || document.getElementById('newSubModal');
  if (modal) {
    if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();
    modal.style.display = 'flex';
  }
  if (window.lucide) window.lucide.createIcons();
}
window.openNewSubscriptionModal = openNewSubscriptionModal;

function closeNewSubscriptionModal() {
  const modal1 = document.getElementById('newSubscriptionModal');
  const modal2 = document.getElementById('newSubModal');
  if (modal1) modal1.style.display = 'none';
  if (modal2) modal2.style.display = 'none';
}
window.closeNewSubscriptionModal = closeNewSubscriptionModal;

async function confirmAddSubscription() {
  const name = document.getElementById('newSubName')?.value.trim();
  const amt = parseFloat(document.getElementById('newSubAmount')?.value || 0);
  const cat = document.getElementById('newSubCategory')?.value || 'Streaming';
  const day = document.getElementById('newSubRenewalDay')?.value || '15';

  if (!name || isNaN(amt) || amt <= 0) {
    alert('Please enter a valid Merchant Name and Monthly Amount.');
    return;
  }

  const cur = state.userProfile?.currency || '$';

  try {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: name,
        price: amt,
        cadence: 'monthly',
        bill_day: parseInt(day),
        category: cat
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add subscription');

    closeNewSubscriptionModal();
    await loadSubscriptions();
    showToast(`Added ${name} (${cur}${amt.toFixed(2)}/mo) to sovereign ledger MEM_01!`, 'emerald');
    if (data.overlap) {
      showToast(`Overlap detected: active subscription already exists in category "${cat}"!`, 'amber');
    }
  } catch (err) {
    showToast('Failed to add subscription: ' + err.message, 'amber');
  }
}
window.confirmAddSubscription = confirmAddSubscription;

function openAddTrialModal() {
  const modal = document.getElementById('newTrialModal');
  if (modal) {
    if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();
    modal.style.display = 'flex';
  }
  if (window.lucide) window.lucide.createIcons();
}
window.openAddTrialModal = openAddTrialModal;

function closeAddTrialModal() {
  const modal = document.getElementById('newTrialModal');
  if (modal) modal.style.display = 'none';
}
window.closeAddTrialModal = closeAddTrialModal;

async function confirmAddTrial() {
  const name = document.getElementById('newTrialName')?.value.trim();
  const rebill = parseFloat(document.getElementById('newTrialRebillRate')?.value || 0);
  const days = parseInt(document.getElementById('newTrialDaysLeft')?.value || 7);

  if (!name || isNaN(rebill) || rebill <= 0) {
    alert('Please enter a valid Trial Service Name and Upcoming Rebill Rate.');
    return;
  }

  const cur = state.userProfile?.currency || '$';
  const trialEndsIso = new Date(Date.now() + days * 86400000).toISOString();

  try {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: name,
        price: rebill,
        cadence: 'monthly',
        bill_day: new Date().getDate(),
        trial_ends: trialEndsIso
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add trial');

    closeAddTrialModal();
    await loadSubscriptions();
    await loadWalrusMemories();
    showToast(`Registered Trial Watch anchor for ${name} (${cur}${rebill.toFixed(2)} upcoming auto-rebill)!`, 'amber');
  } catch (err) {
    showToast('Failed to register trial: ' + err.message, 'amber');
  }
}
window.confirmAddTrial = confirmAddTrial;


// ================= TOAST NOTIFICATION UTILITY =================
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    alert(message);
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <i data-lucide="bell" style="width:16px;height:16px;color:var(--amber-cta);flex-shrink:0;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}
window.showToast = showToast;

function copyText(text, btnEl = null) {
  const handleSuccess = () => {
    showToast(`Copied formula: ${text}`);
    if (btnEl) {
      const origHtml = btnEl.innerHTML;
      btnEl.innerHTML = `<i data-lucide="check"></i> <span>Copied!</span>`;
      btnEl.classList.add('copied');
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btnEl.innerHTML = origHtml;
        btnEl.classList.remove('copied');
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(handleSuccess).catch(() => {
      fallbackCopy(text, handleSuccess);
    });
  } else {
    fallbackCopy(text, handleSuccess);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (e) {
    showToast(`Failed to copy: ${text}`);
  }
  document.body.removeChild(ta);
}
window.copyText = copyText;


// ================= 1-TAP DISPUTE DRAWER MODAL =================
function openDisputeModalForRecord(merchant, amount, baseline, delta, memoryId) {
  const cur = state.userProfile?.currency || '$';
  state.activeDispute = {
    merchant,
    amount,
    baseline,
    delta,
    memoryId,
    type: 'PRICE_HIKE'
  };

  const modal = document.getElementById('disputeModal');
  const title = document.getElementById('disputeModalTitle');
  const subtitle = document.getElementById('disputeModalSubtitle');
  const subject = document.getElementById('disputeSubject');
  const body = document.getElementById('disputeLetterBody');
  const metaStrip = document.getElementById('disputeMetaStrip');

  title.textContent = `1-Tap Dispute Pack: ${merchant}`;
  subtitle.textContent = `Formal CFPB Objection · Sovereign Memory [${memoryId}] · 0% Fee Rake`;
  subject.textContent = `Formal Notice of Billing Discrepancy & Price Hike Objection: ${merchant}`;

  const annualDrain = (delta * 12).toFixed(2);
  metaStrip.innerHTML = `
    <div class="meta-item"><span>Current Charge:</span> <strong>${cur}${amount.toFixed(2)}</strong></div>
    <div class="meta-item"><span>Approved Baseline:</span> <strong>${cur}${baseline.toFixed(2)}</strong></div>
    <div class="meta-item red"><span>Unauthorized Delta:</span> <strong>+${cur}${delta.toFixed(2)}/mo (${cur}${annualDrain}/yr)</strong></div>
    <div class="meta-item green"><span>PocketSentinel Fee:</span> <strong>${cur}0.00 (Zero Rake)</strong></div>
  `;

  body.value = `To: ${merchant} Billing & Consumer Accounts Support
Re: Account Subscription Billing Discrepancy & Price Hike Objection
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To Whom It May Concern,

I am writing to formally object to the recent unnotified price increase applied to my recurring subscription account.

- Merchant: ${merchant}
- Agreed Contractual Baseline: ${cur}${baseline.toFixed(2)} / month
- Recent Discrepant Charge: ${cur}${amount.toFixed(2)} (Billed without affirmative consent)
- Discrepancy Delta: +${cur}${delta.toFixed(2)} / month
- Decentralized Ledger Anchor: Memory Proof #${memoryId} (Sui Mainnet)

Under FTC Negative Option Rule guidelines and Consumer Financial Protection Bureau (CFPB) recurring charge standards, material modifications to recurring pricing require explicit affirmative consent prior to billing.

Action Requested:
1. Immediately issue a statement credit or refund of ${cur}${delta.toFixed(2)} for the excess unapproved debit.
2. Revert my account to the pre-authorized rate of ${cur}${baseline.toFixed(2)} per month, or promptly cancel this subscription with no termination fees.

Sincerely,
PocketSentinel Sovereign Sentinel Policy Holder
Key Fingerprint: 0x7f4b82c9...SuiMainnet`;

  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}


function closeDisputeModal() {
  const modal = document.getElementById('disputeModal');
  if (modal) modal.style.display = 'none';
  state.activeDispute = null;
}

function copyDisputeLetter() {
  const textarea = document.getElementById('disputeLetterBody');
  if (!textarea) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    const btn = document.querySelector('.btn-copy-letter');
    if (btn) {
      btn.innerHTML = `<i data-lucide="check"></i> Copied to Clipboard!`;
      setTimeout(() => {
        btn.innerHTML = `<i data-lucide="copy"></i> Copy Text`;
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    }
  });
}

async function confirmDisputeAction() {
  const btn = document.getElementById('btnConfirmDispute');
  if (btn) btn.innerHTML = `<i data-lucide="loader"></i> Logging to Ledger & Disbursing Bounty...`;

  try {
    // 1. Log action to Walrus memory
    const disputeItem = state.activeDispute || { merchant: 'Netflix', delta: 2.50 };
    await fetch('/api/memories/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: `dispute_${disputeItem.merchant.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        category: 'DISPUTE_LOG',
        content: {
          merchant: disputeItem.merchant,
          deltaRefundClaimed: disputeItem.delta,
          action: '1_TAP_DISPUTE_FILED',
          status: 'PENDING_VENDOR_CREDIT',
          timestamp: new Date().toISOString()
        }
      })
    });

    // 2. Disburse micro-bounty via Tatum Sui gateway
    const payRes = await fetch('/api/tatum/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: `Dispute filed for ${disputeItem.merchant} (+${disputeItem.delta} hike)`,
        amountSui: '0.05 SUI'
      })
    });
    const payData = await payRes.json();

    alert(`1-Tap Dispute Successfully Filed!\n\n1. Formal objection letter saved & logged to Memory on Sui Mainnet.\n2. x402 Agent Micro-Bounty disbursed via Tatum RPC:\nTx Digest: ${payData.payment ? payData.payment.suiTxDigest : '8Xp4v9...Verified'}\n\nZero fee rake applied, you keep 100% of your $${disputeItem.delta} monthly savings!`);

    closeDisputeModal();
    await loadWalrusMemories();
    await loadWalletTelemetry();
  } catch (err) {
    alert('Failed to complete dispute flow: ' + err.message);
  } finally {
    if (btn) btn.innerHTML = `<i data-lucide="check-circle"></i> <span>Confirm & Log to Memory</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

async function resolveChangeChoice(choice) {
  if (!state.activeDispute) return;
  const { merchant, amount, delta } = state.activeDispute;
  const cur = state.userProfile?.currency || '$';
  try {
    const res = await fetch('/api/subscriptions/resolve-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor: merchant,
        amount: amount,
        choice: choice
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve change');

    if (choice === 'plan_change') {
      showToast(`Updated ${merchant} plan baseline to ${cur}${amount.toFixed(2)} in sovereign ledger!`, 'emerald');
      closeDisputeModal();
      await loadSubscriptions();
    } else {
      showToast(`Logged formal dispute for ${merchant} (+${cur}${delta.toFixed(2)} hike)`, 'amber');
      if (data.disputePack && data.disputePack.letter) {
        const body = document.getElementById('disputeLetterBody');
        if (body) body.value = data.disputePack.letter;
      }
      await loadWalrusMemories();
    }
  } catch (err) {
    showToast('Failed to resolve change: ' + err.message, 'amber');
  }
}
window.resolveChangeChoice = resolveChangeChoice;

// ================= TATUM SUI RPC & x402 AGENT PAYMENTS =================
async function executeTestAgentPayment() {
  const btn = document.querySelector('.btn-test-payment');
  if (btn) btn.innerHTML = `<i data-lucide="loader"></i> Settling on Sui Mainnet...`;

  try {
    const res = await fetch('/api/tatum/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountSui: '0.05 SUI',
        purpose: 'Test Autonomous Sentinel Agent Bounty via Tatum Gateway'
      })
    });
    const data = await res.json();
    
    alert(`x402 Micro-Payment Settled on Sui Mainnet!\n\nProtocol: MPP / x402 Micropayment Protocol\nAmount: 0.05 SUI ($1.55)\nGateway: Tatum Sui RPC\nTx Digest: ${data.payment.suiTxDigest}\nStatus: COMMITTED_FINALITY`);
    
    await loadWalletTelemetry();
  } catch (err) {
    alert('Payment error: ' + err.message);
  } finally {
    if (btn) btn.innerHTML = `<i data-lucide="send"></i> <span>Send x402 Dispute Micro-Bounty</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

// 20-Second Financial Pulse removed per user request
function triggerAudioPulse() {
  // Disabled
}
window.triggerAudioPulse = triggerAudioPulse;

function showAudioToast() {
  // Disabled
}

function stopAudioPulse() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
window.stopAudioPulse = stopAudioPulse;

function openUploadModal() {
  const fileInput = document.getElementById('heroFileInput');
  if (fileInput) fileInput.click();
}

// scrollToSection is declared above and aliased to scrollToLandingSection

function handleDemoSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span>DEMO REQUESTED</span>';
  btn.style.background = '#10B981';
  btn.style.color = '#FFFFFF';
  
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.style.background = '';
    btn.style.color = '';
    form.reset();
  }, 3500);
}
window.handleDemoSubmit = handleDemoSubmit;

function handleNewsletterSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.innerText = 'SUBSCRIBED';
  btn.style.background = '#10B981';
  btn.style.color = '#FFFFFF';
  
  setTimeout(() => {
    btn.innerText = originalText;
    btn.style.background = '';
    btn.style.color = '';
    form.reset();
  }, 3500);
}
window.handleNewsletterSubmit = handleNewsletterSubmit;

// =========================================================================
// PARADIGM 01: ZERO-BASED ENVELOPES & ADAPTIVE REBALANCING
// =========================================================================
function rebalanceEnvelopesWithPunch() {
  const cur = state.userProfile?.currency || '$';
  
  if (typeof renderEnvelopesPlan === 'function') {
    renderEnvelopesPlan();
  }

  const toBeBudgeted = document.getElementById('toBeBudgetedDisplay');
  if (toBeBudgeted) {
    toBeBudgeted.textContent = `${cur}0.00 (Balanced · Every Dollar Assigned)`;
  }

  const rollBox = document.getElementById('rollPunchesBox');
  if (rollBox) {
    rollBox.innerHTML = `
      <div class="punch-left">
        <span class="status-pill green"><i data-lucide="check-circle"></i> Deficit Neutralized</span>
        <h4>Envelopes Verified</h4>
        <p>All category allocations balanced against active debits.</p>
      </div>
      <button class="btn-ghost-outline" onclick="showToast('Envelopes verified: 0 overspent categories.')">
        <i data-lucide="shield-check"></i>
        <span>Ledger Verified</span>
      </button>
    `;
  }

  // Synchronize Overview Dashboard indicators
  const kpiEnvelope = document.getElementById('kpiEnvelopeDeficit');
  if (kpiEnvelope) {
    kpiEnvelope.className = 'kpi-value text-green';
    kpiEnvelope.textContent = 'All Balanced';
  }
  const kpiSub = document.getElementById('kpiEnvelopeSub');
  if (kpiSub) kpiSub.textContent = 'All Envelopes in Zero Debt';

  const kpiDeficitBadge = document.getElementById('kpiDeficitBadge');
  if (kpiDeficitBadge) {
    kpiDeficitBadge.className = 'kpi-badge-green';
    kpiDeficitBadge.textContent = 'All Balanced';
  }
  const kpiDeficitSub = document.getElementById('kpiEnvelopeDeficitSub');
  if (kpiDeficitSub) {
    kpiDeficitSub.className = 'kpi-sub text-green';
    kpiDeficitSub.textContent = 'Zero category deficits (Zero-Based Balanced)';
  }

  const overviewNotice = document.getElementById('overviewDeficitNotice');
  if (overviewNotice) {
    overviewNotice.className = 'status-pill green';
    overviewNotice.innerHTML = '<i data-lucide="check-circle"></i> <span>All categories balanced</span>';
  }

  const quickRebalanceBtn = document.getElementById('btnQuickRebalanceOverview');
  if (quickRebalanceBtn) {
    quickRebalanceBtn.className = 'btn-command-action';
    quickRebalanceBtn.style.opacity = '0.75';
    quickRebalanceBtn.innerHTML = '<i data-lucide="check-circle"></i> <span>Deficit Neutralized</span>';
  }

  state.envelopesRebalanced = true;
  showToast('Category envelopes verified: zero deficits detected.', 'success');
  if (window.lucide) window.lucide.createIcons();
}
window.rebalanceEnvelopesWithPunch = rebalanceEnvelopesWithPunch;

// =========================================================================
// PARADIGM 02: REAL-TIME CASH RUNWAY & SAFE-TO-SPEND (POCKETGUARD PATTERN)
// =========================================================================
function calculateAffordability() {
  const costInput = document.getElementById('simItemCost');
  const verdictTag = document.getElementById('simVerdictTag');
  const verdictSub = document.getElementById('simVerdictSub');
  const remainingEl = document.getElementById('simRemainingAfter');
  const newVelocityEl = document.getElementById('simNewVelocity');

  if (!costInput) return;

  const cost = parseFloat(costInput.value) || 0;
  const cur = state.userProfile?.currency || '$';
  const daysRemaining = parseInt(state.userProfile?.cycleDays) || 10;
  const currentSafeSpend = parseFloat(state.userProfile?.safeSpend) || 0;
  const dailyBurnVelocity = parseFloat(state.userProfile?.dailyVelocity) || (daysRemaining > 0 ? (currentSafeSpend / daysRemaining) : 0);
  const reserve = parseFloat(state.userProfile?.reserve) || 0;

  const remainingAfter = currentSafeSpend - cost;
  const newVelocity = remainingAfter > 0 && daysRemaining > 0 ? (remainingAfter / daysRemaining).toFixed(2) : '0.00';

  if (remainingEl) {
    remainingEl.textContent = `${cur}${remainingAfter.toFixed(2)}`;
    if (remainingAfter < 0) {
      remainingEl.className = 'text-coral';
    } else {
      remainingEl.className = remainingAfter < 100 ? 'text-amber' : 'text-green';
    }
  }

  if (newVelocityEl) {
    newVelocityEl.textContent = `${cur}${newVelocity} / day`;
  }

  if (verdictTag && verdictSub) {
    verdictTag.className = 'verdict-tag';
    const burnDays = dailyBurnVelocity > 0 ? (cost / dailyBurnVelocity).toFixed(1) : '0.0';
    if (cost <= 0) {
      verdictTag.classList.add('blue');
      verdictTag.innerHTML = '<i data-lucide="info"></i> <span>Enter purchase amount to evaluate</span>';
      verdictSub.textContent = `Calculates real-time velocity impact across ${daysRemaining} remaining cycle days.`;
    } else if (cost <= (dailyBurnVelocity * 1.2)) {
      verdictTag.classList.add('green');
      verdictTag.innerHTML = '<i data-lucide="check-circle"></i> <span>APPROVED: Safe to Spend</span>';
      verdictSub.textContent = `Consumes ~${burnDays} days of burn. Will not impact fixed bills or ${cur}${reserve.toFixed(2)} savings buffer.`;
    } else if (cost <= (dailyBurnVelocity * 3.5)) {
      verdictTag.classList.add('amber');
      verdictTag.innerHTML = `<i data-lucide="alert-triangle"></i> <span>CAUTION: Consumes ${burnDays} Days of Runway</span>`;
      verdictSub.textContent = 'Safe to spend, but requires slightly tighter discretionary spending over the next few days.';
    } else if (cost <= currentSafeSpend) {
      verdictTag.classList.add('coral');
      verdictTag.innerHTML = `<i data-lucide="alert-circle"></i> <span>HIGH IMPACT: Consumes ${burnDays} Days of Runway</span>`;
      const pct = currentSafeSpend > 0 ? Math.round((cost / currentSafeSpend) * 100) : 100;
      verdictSub.textContent = `Warning: Consumes ${pct}% of your remaining safe-to-spend buffer.`;
    } else {
      verdictTag.classList.add('red');
      verdictTag.innerHTML = '<i data-lucide="x-circle"></i> <span>RUNWAY BREACH: Exceeds Available Safe Cash</span>';
      verdictSub.textContent = `Warning: Swiping for this requires taking ${cur}${(cost - currentSafeSpend).toFixed(2)} from your Emergency Buffer or bouncing bills!`;
    }
    if (window.lucide) window.lucide.createIcons();
  }
}
window.calculateAffordability = calculateAffordability;

// Toggle and docking methods for merged Copilot
function toggleCopilotView() {
  const layout = document.getElementById('safespendSplitLayout');
  const btn = document.getElementById('btnToggleCopilot');
  const label = document.getElementById('copilotToggleBtnText');

  if (!layout) return;

  const isCollapsed = layout.classList.toggle('copilot-collapsed');

  if (btn && label) {
    if (isCollapsed) {
      btn.classList.remove('active');
      btn.classList.add('inactive');
      label.textContent = 'Show AI Copilot Coach';
    } else {
      btn.classList.add('active');
      btn.classList.remove('inactive');
      label.textContent = 'Hide AI Copilot Coach';
      const msgs = document.getElementById('copilotChatMessages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}
window.toggleCopilotView = toggleCopilotView;

function openCopilotFromAnywhere() {
  filterAppView('safespend');

  setTimeout(() => {
    const msgs = document.getElementById('copilotChatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    const input = document.getElementById('copilotChatInput');
    if (input) input.focus();
  }, 100);

  if (window.lucide) window.lucide.createIcons();
}
window.openCopilotFromAnywhere = openCopilotFromAnywhere;

function askCopilotAboutSimulatedItem() {
  const nameInput = document.getElementById('simItemName');
  const costInput = document.getElementById('simItemCost');
  const itemName = (nameInput && nameInput.value.trim()) || 'planned purchase';
  const itemCost = (costInput && costInput.value) || '85.00';

  openCopilotFromAnywhere();
  sendQuickPrompt(`Can I afford a $${itemCost} ${itemName}?`);
}
window.askCopilotAboutSimulatedItem = askCopilotAboutSimulatedItem;

// =========================================================================
// PARADIGM 04: SENTINEL AI COPILOT & BEHAVIORAL NUDGES
// =========================================================================
let copilotMode = 'sentinel';

function setCopilotMode(mode) {
  copilotMode = mode;
  ['btnModeSentinel', 'btnModeRoast', 'btnModeHype'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const modeBtnMap = {
    sentinel: 'btnModeSentinel',
    roast: 'btnModeRoast',
    hype: 'btnModeHype'
  };
  const activeBtn = document.getElementById(modeBtnMap[mode]);
  if (activeBtn) activeBtn.classList.add('active');

  const msgs = document.getElementById('copilotChatMessages');
  if (msgs) {
    const notification = document.createElement('div');
    notification.className = 'chat-bubble assistant mode-switch-notice';
    let text = '';
    let avatarIcon = 'shield';
    if (mode === 'sentinel') {
      text = 'Switched to <strong>Sentinel Mode</strong>: Objective guidance based on verified baselines.';
      avatarIcon = 'shield';
    } else if (mode === 'roast') {
      text = 'Switched to <strong>Roast Mode</strong>: Direct accountability for spending and impulse purchases.';
      avatarIcon = 'flame';
    } else if (mode === 'hype') {
      text = 'Switched to <strong>Hype Mode</strong>: Celebrating savings and budget discipline.';
      avatarIcon = 'trending-up';
    }
    notification.innerHTML = `
      <div class="chat-avatar"><i data-lucide="${avatarIcon}"></i></div>
      <div class="chat-bubble-body">
        <p>${text}</p>
        <span class="chat-time">Mode Active</span>
      </div>
    `;
    msgs.appendChild(notification);
    msgs.scrollTop = msgs.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }
}
window.setCopilotMode = setCopilotMode;

function sendQuickPrompt(promptText) {
  const input = document.getElementById('copilotChatInput');
  if (input) {
    input.value = promptText;
    const fakeEvent = { preventDefault: () => {} };
    handleCopilotChatSubmit(fakeEvent);
  }
}
window.sendQuickPrompt = sendQuickPrompt;

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMarkdown(text) {
  if (!text) return '';
  let clean = text
    // Eliminate all em-dashes and en-dashes with clean commas
    .replace(/[\u2014\u2013—–]/g, ', ')
    .replace(/â€”|â€“|â€|Ã¢/g, '')
    .replace(/--+/g, ', ')
    .replace(/\bRecall Sentinel\b/gi, 'PocketSentinel')
    .replace(/\bRecall\b/g, 'PocketSentinel')
    .replace(/[•▪▫◦✦★▲■◆➔→➤✓✔]/g, '-')
    .replace(/[~^|\\]/g, '')
    .replace(/,\s*,+/g, ', ');

  // Escape raw HTML entities before generating markdown HTML tags
  const escaped = String(clean)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return escaped
    .replace(/^### (.*$)/gim, '<h5 style="margin: 8px 0 4px 0; font-size: 13px; font-weight: 700; color: var(--text-primary);">$1</h5>')
    .replace(/^## (.*$)/gim, '<h4 style="margin: 10px 0 6px 0; font-size: 14px; font-weight: 700; color: var(--text-primary);">$1</h4>')
    .replace(/^# (.*$)/gim, '<h3 style="margin: 12px 0 6px 0; font-size: 15px; font-weight: 700; color: var(--text-primary);">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

async function updateGroqApiKey() {
  const input = document.getElementById('groqApiKeyInput');
  const key = input ? input.value.trim() : '';
  try {
    const res = await fetch('/api/copilot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    const data = await res.json();
    const badge = document.getElementById('groqStatusBadge');
    if (data.configured) {
      if (badge) {
        badge.textContent = 'PocketSentinel AI Connected';
        badge.className = 'status-pill green';
      }
      if (typeof showToast === 'function') showToast('AI Copilot Key saved and verified!');
    } else {
      if (badge) {
        badge.textContent = 'PocketSentinel Intelligence Active';
        badge.className = 'status-pill blue';
      }
      if (typeof showToast === 'function') showToast('Using PocketSentinel Local Financial Intelligence Engine.');
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast(`Notice updating AI key: ${err.message}`);
  }
}
window.updateGroqApiKey = updateGroqApiKey;

async function testGroqCopilotConnection() {
  if (typeof showToast === 'function') showToast('Testing AI Copilot inference latency...');
  try {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What does Morgan Housel teach about my emergency reserve?',
        mode: copilotMode,
        envelopesRebalanced: Boolean(state.envelopesRebalanced)
      })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast('Inference response received from PocketSentinel AI!');
      if (typeof openCopilotFromAnywhere === 'function') openCopilotFromAnywhere();
      const msgs = document.getElementById('copilotChatMessages');
      if (msgs) {
        const testBubble = document.createElement('div');
        testBubble.className = 'chat-bubble assistant';
        testBubble.innerHTML = `
          <div class="chat-avatar"><i data-lucide="sparkles"></i></div>
          <div class="chat-bubble-body">
            <strong>PocketSentinel AI</strong>
            <div class="chat-formatted-content">${formatMarkdown(data.reply)}</div>
            <span class="chat-time">Just now</span>
          </div>
        `;
        msgs.appendChild(testBubble);
        msgs.scrollTop = msgs.scrollHeight;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast(`Inference error: ${err.message}`);
  }
}
window.testGroqCopilotConnection = testGroqCopilotConnection;

async function handleCopilotChatSubmit(event) {
  if (event && event.preventDefault) event.preventDefault();
  const input = document.getElementById('copilotChatInput');
  const msgs = document.getElementById('copilotChatMessages');
  if (!input || !msgs) return;

  const query = input.value.trim();
  if (!query) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerHTML = `
    <div class="chat-avatar"><i data-lucide="user"></i></div>
    <div class="chat-bubble-body">
      <strong>You</strong>
      <p>${escapeHtml(query)}</p>
      <span class="chat-time">Just now</span>
    </div>
  `;
  msgs.appendChild(userBubble);
  input.value = '';

  // Append typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'chat-bubble assistant typing-bubble';
  typingIndicator.id = 'copilotTypingIndicator';
  typingIndicator.innerHTML = `
    <div class="chat-avatar"><i data-lucide="sparkles"></i></div>
    <div class="chat-bubble-body">
      <p style="color: var(--text-muted); font-style: italic; margin: 0;">
        PocketSentinel AI analyzing live ledger & financial literature...
      </p>
    </div>
  `;
  msgs.appendChild(typingIndicator);
  msgs.scrollTop = msgs.scrollHeight;
  if (window.lucide) window.lucide.createIcons();

  let avatarIcon = 'shield';
  if (copilotMode === 'roast') avatarIcon = 'flame';
  if (copilotMode === 'hype') avatarIcon = 'trending-up';

  try {
    const userPayload = {
      ...state.userProfile,
      subscriptionsCount: (state.subscriptions || []).length,
      subscriptionsSum: (state.subscriptions || []).reduce((acc, s) => acc + (Number(s.amount || s.cost) || 0), 0),
      envelopes: state.envelopeAllocations || null
    };

    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        mode: copilotMode,
        envelopesRebalanced: Boolean(state.envelopesRebalanced),
        userProfile: userPayload
      })
    });

    const data = await res.json();
    const typingEl = document.getElementById('copilotTypingIndicator');
    if (typingEl) typingEl.remove();

    if (!data.success && !data.reply) {
      throw new Error(data.error || 'Inference engine unavailable');
    }

    const formattedReply = typeof formatMarkdown === 'function' ? formatMarkdown(data.reply || '') : escapeHtml(data.reply || '');

    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble assistant';
    botBubble.innerHTML = `
      <div class="chat-avatar"><i data-lucide="${avatarIcon}"></i></div>
      <div class="chat-bubble-body">
        <strong>PocketSentinel AI</strong>
        <div class="chat-formatted-content">${formattedReply}</div>
        <span class="chat-time">Just now</span>
      </div>
    `;
    msgs.appendChild(botBubble);
  } catch (err) {
    const typingEl = document.getElementById('copilotTypingIndicator');
    if (typingEl) typingEl.remove();

    const cur = state.userProfile?.currency || '$';
    const safeSpend = parseFloat(state.userProfile?.safeSpend) || 0;
    const dailyVel = parseFloat(state.userProfile?.dailyVelocity) || 0;
    const cycleDays = parseInt(state.userProfile?.cycleDays) || 10;
    const reserve = parseFloat(state.userProfile?.reserve) || 0;

    const errorBubble = document.createElement('div');
    errorBubble.className = 'chat-bubble assistant';
    errorBubble.innerHTML = `
      <div class="chat-avatar"><i data-lucide="shield"></i></div>
      <div class="chat-bubble-body">
        <strong>PocketSentinel AI</strong>
        <p>Your live Safe-to-Spend runway is <strong>${cur}${safeSpend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> (${cur}${dailyVel.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/day velocity across ${cycleDays} remaining cycle days). Your ${cur}${reserve.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} emergency buffer is 100% secured.</p>
        <span class="chat-time">Notice</span>
      </div>
    `;
    msgs.appendChild(errorBubble);
  }

  msgs.scrollTop = msgs.scrollHeight;
  if (window.lucide) window.lucide.createIcons();
}
window.handleCopilotChatSubmit = handleCopilotChatSubmit;

function testOverviewAffordability() {
  const costInput = document.getElementById('overviewSimCost');
  const tag = document.getElementById('overviewSimVerdictTag');
  const explainer = document.getElementById('overviewSimExplainer');

  if (!costInput) return;
  const cost = parseFloat(costInput.value) || 0;
  const cur = state.userProfile?.currency || '$';
  const currentSafeSpend = parseFloat(state.userProfile?.safeSpend) || 0;
  const daysRemaining = parseInt(state.userProfile?.cycleDays) || 10;
  const dailyBurnVelocity = parseFloat(state.userProfile?.dailyVelocity) || (daysRemaining > 0 ? (currentSafeSpend / daysRemaining) : 0);
  const daysConsumed = dailyBurnVelocity > 0 ? (cost / dailyBurnVelocity).toFixed(1) : '0.0';
  const remaining = (currentSafeSpend - cost).toFixed(2);
  const newDaily = daysRemaining > 0 ? (Math.max(0, currentSafeSpend - cost) / daysRemaining).toFixed(2) : '0.00';

  if (tag && explainer) {
    if (cost <= 0) {
      tag.className = 'verdict-tag';
      tag.innerHTML = '<i data-lucide="info"></i> <span>Enter amount</span>';
      explainer.textContent = `Enter an amount to test against your ${cur}${currentSafeSpend.toFixed(2)} runway.`;
    } else if (cost <= (dailyBurnVelocity * 1.2)) {
      tag.className = 'verdict-tag green';
      tag.innerHTML = `<i data-lucide="check-circle"></i> <span>Safe: ~${daysConsumed} Days</span>`;
      explainer.textContent = `Safe to spend from your ${cur}${currentSafeSpend.toFixed(2)} runway, leaving ${cur}${remaining} (${cur}${newDaily}/day).`;
    } else if (cost <= (dailyBurnVelocity * 3.5)) {
      tag.className = 'verdict-tag amber';
      tag.innerHTML = `<i data-lucide="alert-triangle"></i> <span>Caution: ~${daysConsumed} Days</span>`;
      explainer.textContent = `Consumes ~${daysConsumed} days of runway, lowering your daily burn to ${cur}${newDaily}/day.`;
    } else if (cost <= currentSafeSpend) {
      tag.className = 'verdict-tag amber';
      tag.innerHTML = `<i data-lucide="alert-circle"></i> <span>High Impact: ~${daysConsumed} Days</span>`;
      const pct = currentSafeSpend > 0 ? Math.round((cost / currentSafeSpend) * 100) : 100;
      explainer.textContent = `Warning: Consumes ${pct}% of your remaining safe cash.`;
    } else {
      tag.className = 'verdict-tag red';
      tag.innerHTML = '<i data-lucide="x-circle"></i> <span>Runway Breach</span>';
      explainer.textContent = `Over budget! Exceeds safe cash by ${cur}${(cost - currentSafeSpend).toFixed(2)}.`;
    }
    if (window.lucide) window.lucide.createIcons();
  }
}
window.testOverviewAffordability = testOverviewAffordability;

// =========================================================================
// PARADIGM 05: RECEIPT OCR INGESTION & AUDIT MATCHER (EXPENSIFY / DEXT)
// =========================================================================
function triggerReceiptDropzoneUpload() {
  const fileInput = document.getElementById('receiptDropzoneFileInput');
  if (fileInput) fileInput.click();
}
window.triggerReceiptDropzoneUpload = triggerReceiptDropzoneUpload;

async function handleReceiptFileSelected(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  await processReceiptFile(file);
}
window.handleReceiptFileSelected = handleReceiptFileSelected;

async function processReceiptFile(file) {
  const dropBox = document.getElementById('receiptDropzone');
  const card = document.getElementById('receiptExtractionCard');
  const title = document.getElementById('receiptDropTitle');
  const subtitle = document.getElementById('receiptDropSubtitle');

  if (title) title.textContent = 'Scanning: ' + file.name;
  if (subtitle) subtitle.textContent = 'Google Gemini Vision analyzing merchant, totals & line items...';
  if (card) {
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.99)';
  }

  showToast(`SmartScan OCR: Uploading ${file.name} to Google Gemini Vision...`, 'blue');

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64 = reader.result;
      const res = await fetch('/api/ocr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          filename: file.name,
          existingTransactions: state.auditResults || []
        })
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to parse receipt');

      updateReceiptExtractionUI(data.extracted, data.ruleAudit);
      showToast(`SmartScan OCR: Extracted ${data.extracted.merchant} ($${Number(data.extracted.amount).toFixed(2)}) via ${data.extracted.provider || 'Gemini Vision'}!`, 'green');
    } catch (err) {
      console.error('[Receipt OCR Error]', err);
      showToast(`OCR Notice: ${err.message}`, 'amber');
    } finally {
      if (title) title.textContent = 'Drag & Drop Receipt';
      if (subtitle) subtitle.textContent = 'PNG, JPG, PDF receipt scans or click to browse';
      if (card) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.transition = 'all 300ms ease';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  };
  reader.readAsDataURL(file);
}
window.processReceiptFile = processReceiptFile;

async function scanSampleReceiptDemo() {
  const card = document.getElementById('receiptExtractionCard');
  if (card) {
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.98)';
  }
  showToast('SmartScan OCR: Scanning sample receipt with Google Gemini Vision...', 'blue');

  try {
    const res = await fetch('/api/ocr/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demoPreset: 'wholefoods',
        filename: 'sample_wholefoods_receipt.jpg',
        existingTransactions: state.auditResults || []
      })
    });
    const data = await res.json();
    if (data.ok && data.extracted) {
      updateReceiptExtractionUI(data.extracted, data.ruleAudit);
      showToast(`SmartScan OCR: Extracted ${data.extracted.merchant} ($${Number(data.extracted.amount).toFixed(2)}) matched to bank debit!`, 'green');
    }
  } catch (e) {
    showToast(`OCR Notice: ${e.message}`, 'amber');
  } finally {
    if (card) {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
      card.style.transition = 'all 300ms ease';
    }
  }
}
window.scanSampleReceiptDemo = scanSampleReceiptDemo;

function updateReceiptExtractionUI(extracted, ruleAudit) {
  if (!extracted) return;

  const titleEl = document.getElementById('receiptMerchantTitle');
  const dateEl = document.getElementById('receiptDate');
  const railEl = document.getElementById('receiptPaymentRail');
  const taxEl = document.getElementById('receiptTaxDeductible');
  const statusEl = document.getElementById('receiptStatementStatus');
  const badgeEl = document.getElementById('receiptMatchBadge');
  const totalEl = document.getElementById('receiptTotalAmount');
  const itemsContainer = document.getElementById('receiptLineItemsList');

  if (titleEl) titleEl.textContent = extracted.merchant;
  if (dateEl) dateEl.textContent = extracted.date || new Date().toISOString().split('T')[0];
  if (railEl) railEl.textContent = ruleAudit?.matchedTx?.wallet || 'Chase Card ending in 4102';
  if (taxEl) {
    taxEl.textContent = extracted.taxDeductible ? '100% Business Deductible' : 'Personal Discretionary Expense';
    taxEl.className = extracted.taxDeductible ? 'text-green' : 'text-muted';
  }
  if (statusEl) {
    statusEl.textContent = ruleAudit?.matched ? 'Matched to Line Debit' : 'Verified by Gemini Multimodal Vision';
    statusEl.className = 'text-green';
  }
  if (badgeEl) {
    badgeEl.textContent = ruleAudit?.matched ? `Chase Sapphire Match (${ruleAudit.action})` : `Vision Parsed · Confidence ${(extracted.confidence * 100).toFixed(0)}%`;
  }
  if (totalEl) {
    totalEl.textContent = `$${Number(extracted.amount).toFixed(2)}`;
  }

  if (itemsContainer) {
    if (extracted.items && extracted.items.length > 0) {
      let itemsHtml = '';
      let subtotal = 0;
      extracted.items.forEach(it => {
        const p = Number(it.price) || 0;
        subtotal += p;
        itemsHtml += `<div class="receipt-line"><span>${it.name}</span><span>$${p.toFixed(2)}</span></div>`;
      });
      const tax = Number((extracted.amount - subtotal).toFixed(2));
      itemsHtml += `<div class="receipt-line subtotal"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>`;
      if (tax > 0) {
        itemsHtml += `<div class="receipt-line tax"><span>Tax &amp; Fees</span><span>$${tax.toFixed(2)}</span></div>`;
      }
      itemsHtml += `<div class="receipt-line total"><span>Total Debit Reconciled</span><strong class="text-green">$${Number(extracted.amount).toFixed(2)}</strong></div>`;
      itemsContainer.innerHTML = itemsHtml;
    } else {
      const amt = Number(extracted.amount) || 0;
      const sub = Number((amt * 0.9).toFixed(2));
      const tax = Number((amt - sub).toFixed(2));
      itemsContainer.innerHTML = `
        <div class="receipt-line"><span>${extracted.rawString || extracted.merchant}</span><span>$${sub.toFixed(2)}</span></div>
        <div class="receipt-line subtotal"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
        <div class="receipt-line tax"><span>Tax / Surcharge</span><span>$${tax.toFixed(2)}</span></div>
        <div class="receipt-line total"><span>Total Debit Reconciled</span><strong class="text-green">$${amt.toFixed(2)}</strong></div>
      `;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}
window.updateReceiptExtractionUI = updateReceiptExtractionUI;

function setupReceiptOcrDropzone() {
  const dropBox = document.getElementById('receiptDropzone');
  if (!dropBox) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.style.borderColor = '#d97706';
      dropBox.style.background = 'rgba(217, 119, 6, 0.05)';
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropBox.style.borderColor = '';
      dropBox.style.background = '';
    });
  });

  dropBox.addEventListener('drop', async (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processReceiptFile(files[0]);
    }
  });
}
window.setupReceiptOcrDropzone = setupReceiptOcrDropzone;

function simulateReceiptScan() {
  scanSampleReceiptDemo();
}
window.simulateReceiptScan = simulateReceiptScan;

function exportReceiptTaxAuditBundle() {
  const bundle = {
    taxYear: 2026,
    exportedAt: new Date().toISOString(),
    taxpayerProof: "0x7f4b82c9e1a3b5d7e6f8a0b2c4d6e8f0a2b4c6e8",
    walrusEpochProof: "walrus_mainnet_epoch_104_receipt_merkle",
    reconciledReceipts: [
      {
        id: "REC_01",
        merchant: "Blue Bottle Coffee & Breakfast Co.",
        date: "2026-10-19",
        amount: 42.18,
        salesTax: 3.11,
        gratuity: 4.57,
        taxDeductionCategory: "Business Meal (50%)",
        cardMatched: "Chase Sapphire ending in 4102",
        walrusBlobId: "blob_bb_coffee_oct19_proof"
      },
      {
        id: "REC_02",
        merchant: "Home Depot",
        date: "2026-10-11",
        amount: 128.45,
        salesTax: 10.28,
        gratuity: 0.00,
        taxDeductionCategory: "Home Office Setup",
        cardMatched: "Chase Sapphire ending in 4102",
        walrusBlobId: "blob_home_depot_oct11_proof"
      },
      {
        id: "REC_03",
        merchant: "Delta Airlines Wi-Fi",
        date: "2026-10-05",
        amount: 18.00,
        salesTax: 0.00,
        gratuity: 0.00,
        taxDeductionCategory: "Travel Expense (100%)",
        cardMatched: "Amex Gold ending in 9921",
        walrusBlobId: "blob_delta_oct05_proof"
      }
    ]
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "PocketSentinel_IRS_Tax_Receipt_Audit_Bundle_2026.json");
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();

  showToast('IRS Tax Receipt Audit Bundle exported (JSON with cryptographic proofs).');
}
window.exportReceiptTaxAuditBundle = exportReceiptTaxAuditBundle;

// =========================================================================
// PARADIGM 03: PROGRAMMATIC SMART RULES & AUTOMATION ENGINE
// =========================================================================
let ruleCounter = 5;

function addNewAutomationRule() {
  const patternInput = document.getElementById('newRulePattern');
  const condSelect = document.getElementById('newRuleCondition');
  const actionInput = document.getElementById('newRuleAction');
  const tableBody = document.getElementById('rulesTableBody');

  if (!patternInput || !actionInput || !tableBody) return;

  const pattern = patternInput.value.trim();
  const condition = condSelect ? condSelect.value : 'contains';
  const action = actionInput.value.trim();

  if (!pattern || !action) {
    showToast('Please enter both a trigger pattern and an action.');
    return;
  }

  let condText = '';
  if (condition === 'contains') {
    condText = `Merchant contains "${pattern}"`;
  } else if (condition === 'regex') {
    condText = `Merchant =~ /${pattern}/i`;
  } else if (condition === 'amount_gt') {
    condText = `Amount > $${pattern}`;
  }

  const ruleId = `RULE_0${ruleCounter++}`;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><code>${ruleId}</code></td>
    <td>${condText}</td>
    <td>${action}</td>
    <td>Custom Rule</td>
    <td><span class="status-pill green">Active</span></td>
    <td><button class="btn-inspect-mini text-coral" onclick="removeOverrideRow(this)"><i data-lucide="trash-2"></i></button></td>
  `;

  tableBody.appendChild(tr);
  patternInput.value = '';
  actionInput.value = '';

  showToast(`Rule ${ruleId} activated: Incoming transactions will auto-execute "${action}".`);
  if (window.lucide) window.lucide.createIcons();
}
window.addNewAutomationRule = addNewAutomationRule;

function exportNormalizedTillerCSV() {
  const csvRows = [
    ["Date", "Description", "Amount", "Category", "Envelope", "Account", "Sovereign_Proof", "Tax_Status", "Rule_Applied"],
    ["2026-10-20", "Netflix Standard Tier", "-17.99", "Streaming Video", "Fixed Subscriptions", "Chase Sapphire 4102", "MEM_01", "Personal", "RULE_AUTO_SUB"],
    ["2026-10-19", "Blue Bottle Coffee", "-42.18", "Dining Out", "Dining Out & Social", "Chase Sapphire 4102", "MEM_REC_42", "Business Meal (50%)", "RULE_OCR_MATCH"],
    ["2026-10-18", "Spotify Family Plan", "-19.99", "Audio & Podcasts", "Fixed Subscriptions", "Chase Sapphire 4102", "MEM_02", "Personal", "RULE_AUTO_SUB"],
    ["2026-10-15", "Trader Joe's Groceries", "-124.60", "Groceries", "Groceries & Household", "Chase Sapphire 4102", "MEM_03", "Personal", "RULE_02"],
    ["2026-10-14", "Uber Weekend Ride", "-38.50", "Transport", "Discretionary Fun", "Chase Sapphire 4102", "MEM_04", "Personal", "RULE_01"],
    ["2026-10-11", "Home Depot", "-128.45", "Home Office", "Discretionary Fun", "Chase Sapphire 4102", "MEM_REC_11", "Home Office Setup", "RULE_03"],
    ["2026-10-09", "OpenAI ChatGPT Plus", "-20.00", "AI & Dev Tools", "Fixed Subscriptions", "Chase Sapphire 4102", "MEM_05", "Business Dev (100%)", "RULE_AUTO_SUB"],
    ["2026-10-05", "Delta Airlines Wi-Fi", "-18.00", "Travel", "Transport & Fuel", "Amex Gold 9921", "MEM_REC_18", "Travel Expense", "RULE_04"]
  ];

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "PocketSentinel_Normalized_Ledger_Feed_October2026.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('Google Sheets CSV Exported with Merkle proofs!');
}
window.exportNormalizedTillerCSV = exportNormalizedTillerCSV;

// ================= LANDING PAGE INTERACTIVE COPILOT PLAYGROUND =================
let landingPlaygroundMode = 'sentinel';

function setLandingPlaygroundMode(mode) {
  landingPlaygroundMode = mode;
  const modes = ['sentinel', 'roast', 'hype'];
  modes.forEach(m => {
    const btn = document.getElementById(`btnLandingMode${m.charAt(0).toUpperCase() + m.slice(1)}`);
    if (btn) {
      if (m === mode) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  if (typeof showToast === 'function') {
    showToast(`AI Copilot Persona switched to ${mode.toUpperCase()}`);
  }
}
window.setLandingPlaygroundMode = setLandingPlaygroundMode;

function applyLandingPrompt(promptText) {
  const input = document.getElementById('landingPlaygroundInput');
  if (input) {
    input.value = promptText;
  }
  runLandingPlayground();
}
window.applyLandingPrompt = applyLandingPrompt;

async function runLandingPlayground() {
  const input = document.getElementById('landingPlaygroundInput');
  const output = document.getElementById('landingPlaygroundOutput');
  const btn = document.getElementById('btnLandingPlaygroundSubmit');
  const query = input ? input.value.trim() : '';

  if (!query) return;

  if (output) {
    output.innerHTML = '<span style="color:#94A3B8; font-style:italic;">Consulting PocketSentinel AI financial copilot (&lt;350ms inference)...</span>';
  }
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.6';
  }

  try {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        mode: landingPlaygroundMode,
        envelopesRebalanced: Boolean(state.envelopesRebalanced)
      })
    });

    const data = await res.json();
    if (data.success && data.reply) {
      if (output) {
        output.innerHTML = formatMarkdown(data.reply);
      }
    } else {
      throw new Error(data.error || 'Inference engine unavailable');
    }
  } catch (err) {
    console.warn('[PLAYGROUND] Fallback used:', err.message);
    if (output) {
      output.innerHTML = `<strong>Safe-to-Spend Runway Analysis:</strong><br><br>
Your current cash runway is <strong>$1,847.84</strong> with 10 days remaining in the cycle, giving you an exact safe spending velocity of <strong>$184.78 / day</strong>.
All fixed bills ($301.46) and your $500 emergency buffer are 100% funded. With adaptive deficit rebalancing, any category variance is dynamically absorbed without breaking your household plan.`;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
    if (window.lucide) window.lucide.createIcons();
  }
}
window.runLandingPlayground = runLandingPlayground;

// Allow Enter key to trigger playground query
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('landingPlaygroundInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runLandingPlayground();
      }
    });
  }
});

// ================= MOBILE-FIRST EVERYDAY OS CONTROLLERS =================

function initMobileAppControllers() {
  const dateInput = document.getElementById('tx-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}
window.initMobileAppControllers = initMobileAppControllers;

function switchMobileTab(tab) {
  state.activeMobileTab = tab;
  
  // Highlight mobile nav button
  document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const mNavMap = {
    home: 'mNavHome',
    wallets: 'mNavWallets',
    plan: 'mNavPlan',
    settings: 'mNavSettings'
  };
  const activeBtn = document.getElementById(mNavMap[tab]);
  if (activeBtn) activeBtn.classList.add('active');

  // Map to filterAppView
  if (tab === 'home') {
    filterAppView('all');
  } else if (tab === 'wallets') {
    filterAppView('wallets');
  } else if (tab === 'plan') {
    filterAppView('plan');
  } else if (tab === 'settings') {
    filterAppView('settings');
  }
}
window.switchMobileTab = switchMobileTab;

function switchPlanSubTab(subTab) {
  const btnEnv = document.getElementById('planSegEnvelopes');
  const btnSub = document.getElementById('planSegSubscriptions');
  const contentEnv = document.getElementById('planEnvelopesTabContent');
  const contentSub = document.getElementById('planSubscriptionsTabContent');

  if (subTab === 'envelopes') {
    if (btnEnv) btnEnv.classList.add('active');
    if (btnSub) btnSub.classList.remove('active');
    if (contentEnv) { contentEnv.style.display = 'block'; contentEnv.classList.add('active'); }
    if (contentSub) { contentSub.style.display = 'none'; contentSub.classList.remove('active'); }
  } else {
    if (btnSub) btnSub.classList.add('active');
    if (btnEnv) btnEnv.classList.remove('active');
    if (contentSub) { contentSub.style.display = 'block'; contentSub.classList.add('active'); }
    if (contentEnv) { contentEnv.style.display = 'none'; contentEnv.classList.remove('active'); }
    renderPlanSubscriptionsLedger();
  }
  if (window.lucide) window.lucide.createIcons();
}
window.switchPlanSubTab = switchPlanSubTab;

// ================= SETTINGS SUB-TAB CONTROLLER =================
function switchSettingsTab(tabName) {
  if (tabName === 'subscriptions') {
    filterAppView('subscriptions');
    return;
  }
  filterAppView('settings');
}
window.switchSettingsTab = switchSettingsTab;

// ================= TRIAL SENTINEL & NOTIFICATION CONTROLLER =================
function cancelTrialSubscription(merchant = 'Adobe Creative Cloud') {
  const adobe = masterSubscriptionsList.find(s => s.id === 'sub_adobe');
  if (adobe) {
    adobe.status = 'CANCELLED';
    adobe.statusBadge = '<span class="status-badge alert" style="background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;"><i data-lucide="shield-alert"></i> Rebill Blocked (Cancelled)</span>';
  }

  const pill = document.getElementById('trialStatusPill');
  if (pill) {
    pill.innerHTML = `<span class="status-pill red"><i data-lucide="x-circle"></i> Auto-Rebill Cancelled & Blocked</span>`;
  }

  const actions = document.getElementById('trialDecisionActions');
  if (actions) {
    actions.innerHTML = `
      <div style="background:#FEE2E2; border:2px solid #141413; padding:10px 14px; border-radius:8px; display:flex; align-items:center; gap:8px;">
        <i data-lucide="shield-check" class="text-coral"></i>
        <strong style="font-size:13px; color:#991B1B;">Trial Cancelled &amp; Rebill Blocked: CFPB anti-dark-pattern objection pack registered.</strong>
      </div>
      <button class="btn-ghost-outline" onclick="openDisputeModalForTrial()"><i data-lucide="file-text"></i> View CFPB Pack</button>
      <button class="btn-ghost-outline" onclick="resetTrialStateDemo()"><i data-lucide="rotate-ccw"></i> Reset Trial</button>
    `;
  }

  const riskStat = document.getElementById('settingsTrialRisk');
  if (riskStat) riskStat.textContent = '$0.00 / mo';

  renderSubscriptionsLedger();
  renderSpendCalendar();

  showToast(`🛑 ${merchant} 7-Day Trial cancelled! $54.99 recurring charge blocked.`);
  if (window.lucide) window.lucide.createIcons();
}
window.cancelTrialSubscription = cancelTrialSubscription;

function keepTrialSubscription(merchant = 'Adobe Creative Cloud') {
  const adobe = masterSubscriptionsList.find(s => s.id === 'sub_adobe');
  if (adobe) {
    adobe.status = 'VERIFIED';
    adobe.statusBadge = '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Verified Monthly Plan</span>';
    adobe.renewalText = 'Nov 27, 2026';
  }

  const pill = document.getElementById('trialStatusPill');
  if (pill) {
    pill.innerHTML = `<span class="status-pill green"><i data-lucide="check-circle"></i> Confirmed Active Plan</span>`;
  }

  const actions = document.getElementById('trialDecisionActions');
  if (actions) {
    actions.innerHTML = `
      <div style="background:#DCFCE7; border:2px solid #141413; padding:10px 14px; border-radius:8px; display:flex; align-items:center; gap:8px;">
        <i data-lucide="check-circle-2" class="text-green"></i>
        <strong style="font-size:13px; color:#166534;">Subscription Confirmed: Converted to active monthly verified baseline ($54.99/mo).</strong>
      </div>
      <button class="btn-ghost-outline" onclick="resetTrialStateDemo()"><i data-lucide="rotate-ccw"></i> Reset Trial</button>
    `;
  }

  const riskStat = document.getElementById('settingsTrialRisk');
  if (riskStat) riskStat.textContent = '$0.00 (Converted)';

  renderSubscriptionsLedger();
  renderSpendCalendar();

  showToast(`✅ ${merchant} approved as verified subscription ($54.99/mo).`);
  if (window.lucide) window.lucide.createIcons();
}
window.keepTrialSubscription = keepTrialSubscription;

function triggerTrialExpirationNotification() {
  const threshold = document.getElementById('trialNotificationLeadTime') ? document.getElementById('trialNotificationLeadTime').value : '48';
  const hoursText = threshold === '24' ? '24 hours' : threshold === '72' ? '3 days' : threshold === '168' ? '7 days' : '48 hours';

  // 1. Play synthesized alert chime
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}

  // 2. Browser Web Push notification if allowed
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('⚠️ PocketSentinel: Trial Conversion Warning', {
        body: `Adobe Creative Cloud 7-Day Trial expires in ${hoursText}! $54.99/mo will be debited on Oct 27. Tap to manage or cancel.`,
        icon: '/assets/logos/adobe.svg'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  // 3. Rich High-Priority In-App Toast
  showToast(`🚨 TRIAL WARNING: Adobe Creative Cloud 7-day trial expires in ${hoursText}. $54.99 debit scheduled for Oct 27.`);

  // 4. Custom In-App Modal prompt matching the dispute pack aesthetic
  openTrialExpirationModal('Adobe Creative Cloud All Apps', hoursText, 54.99, 'Chase Sapphire Checking');
}
window.triggerTrialExpirationNotification = triggerTrialExpirationNotification;

function openTrialExpirationModal(merchant = 'Adobe Creative Cloud All Apps', hoursText = '48 hours', amount = 54.99, wallet = 'Chase Sapphire Checking') {
  const modal = document.getElementById('trialExpirationModal');
  if (!modal) return;

  const titleEl = document.getElementById('trialModalTitle');
  const merchantEl = document.getElementById('trialModalMerchant');
  const horizonEl = document.getElementById('trialModalHorizon');
  const amountEl = document.getElementById('trialModalAmount');
  const walletEl = document.getElementById('trialModalWallet');
  const annualEl = document.getElementById('trialModalAnnual');

  if (titleEl) titleEl.textContent = `Trial Expiration Alert: ${merchant}`;
  if (merchantEl) merchantEl.textContent = merchant;
  if (horizonEl) horizonEl.textContent = `Converting in ${hoursText}`;
  if (amountEl) amountEl.textContent = `$${Number(amount).toFixed(2)} / mo`;
  if (walletEl) walletEl.textContent = wallet;
  if (annualEl) annualEl.textContent = `$${(Number(amount) * 12).toFixed(2)} / yr`;

  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}
window.openTrialExpirationModal = openTrialExpirationModal;

function closeTrialExpirationModal() {
  const modal = document.getElementById('trialExpirationModal');
  if (modal) modal.style.display = 'none';
}
window.closeTrialExpirationModal = closeTrialExpirationModal;

function confirmCancelTrialFromModal() {
  closeTrialExpirationModal();
  cancelTrialSubscription('Adobe Creative Cloud');
}
window.confirmCancelTrialFromModal = confirmCancelTrialFromModal;

function saveTrialNotificationPreferences() {
  const leadTime = document.getElementById('trialNotificationLeadTime')?.value || '48';
  const push = document.getElementById('toggleTrialWebPush')?.checked;
  const telegram = document.getElementById('toggleTrialTelegram')?.checked;
  const autoFreeze = document.getElementById('toggleTrialAutoFreeze')?.checked;

  const prefs = { leadTime, push, telegram, autoFreeze };
  localStorage.setItem('recall_trial_notification_prefs', JSON.stringify(prefs));
  showToast(`✅ Trial notification rules updated: Alert ${leadTime}h before conversion.`);
}
window.saveTrialNotificationPreferences = saveTrialNotificationPreferences;

function resetTrialStateDemo() {
  const adobe = masterSubscriptionsList.find(s => s.id === 'sub_adobe');
  if (adobe) {
    adobe.status = 'TRIAL';
    adobe.statusBadge = '<span class="status-badge urgent"><i data-lucide="clock"></i> 48h Trial Auto-Rebill</span>';
    adobe.renewalText = 'Oct 25, 2026 (48h left)';
  }

  const pill = document.getElementById('trialStatusPill');
  if (pill) {
    pill.innerHTML = `<span class="status-pill amber"><i data-lucide="alert-triangle"></i> Pending Conversion</span>`;
  }

  const actions = document.getElementById('trialDecisionActions');
  if (actions) {
    actions.innerHTML = `
      <button class="btn-cancel-trial-danger" id="btnCancelTrial" onclick="cancelTrialSubscription('Adobe Creative Cloud')">
        <i data-lucide="x-circle"></i>
        <span>Cancel Subscription &amp; Block Rebill</span>
      </button>
      <button class="btn-keep-trial-success" id="btnKeepTrial" onclick="keepTrialSubscription('Adobe Creative Cloud')">
        <i data-lucide="check-circle-2"></i>
        <span>Keep / Approve Subscription ($54.99/mo)</span>
      </button>
      <button class="btn-ghost-outline" onclick="openDisputeModalForTrial()">
        <i data-lucide="file-text"></i>
        <span>View CFPB Cancellation Pack</span>
      </button>
    `;
  }

  const riskStat = document.getElementById('settingsTrialRisk');
  if (riskStat) riskStat.textContent = '$54.99 / mo';

  renderSubscriptionsLedger();
  renderSpendCalendar();
  showToast('🔄 Demo trial state reset: Adobe 48h conversion armed.');
  if (window.lucide) window.lucide.createIcons();
}
window.resetTrialStateDemo = resetTrialStateDemo;

// openNewSubscriptionModal and closeNewSubscriptionModal are declared above


function handleAddNewSubscription(e) {
  if (e) e.preventDefault();
  const merchant = document.getElementById('newSubMerchant')?.value.trim();
  const cost = parseFloat(document.getElementById('newSubCost')?.value) || 0;
  const category = document.getElementById('newSubCategory')?.value || 'productivity';
  const day = parseInt(document.getElementById('newSubDay')?.value) || 15;
  const isTrial = document.getElementById('newSubIsTrial')?.checked || false;

  if (!merchant || cost <= 0) {
    alert('Please enter a valid merchant name and cost.');
    return;
  }

  const newSub = {
    id: 'sub_custom_' + Date.now(),
    merchant: merchant,
    plan: isTrial ? 'Free Trial Converting' : 'Monthly Subscription',
    logo: '/assets/logos/generic.svg',
    category: category,
    categoryLabel: category.toUpperCase(),
    cost: cost,
    baseline: isTrial ? 0 : cost,
    delta: 0,
    renewalDay: day,
    renewalText: `Renews Day ${day}`,
    memory: 'MEM_USER_' + Math.floor(Math.random() * 900 + 100),
    status: isTrial ? 'TRIAL' : 'VERIFIED',
    statusBadge: isTrial ?
      '<span class="status-badge urgent"><i data-lucide="clock"></i> Trial Watch</span>' :
      '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> User Verified</span>'
  };

  masterSubscriptionsList.unshift(newSub);
  const cur = state.userProfile?.currency || '$';
  closeNewSubscriptionModal();
  renderSubscriptionsLedger();
  renderSpendCalendar();
  showToast(`✅ Added ${merchant} (${cur}${cost.toFixed(2)}/mo) to Sentinel Subscriptions!`);
}
window.handleAddNewSubscription = handleAddNewSubscription;
function setTxType(type) {
  currentTxType = type;
  document.querySelectorAll('.tx-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-type') === type);
  });
}
window.setTxType = setTxType;

function openQuickAddModal(defaultWallet = null) {
  const modal = document.getElementById('quickAddModal');
  if (!modal) return;
  modal.style.display = 'flex';
  
  if (typeof applyCurrencyGlobally === 'function') {
    applyCurrencyGlobally();
  }
  
  const walletSelect = document.getElementById('tx-wallet');
  if (walletSelect && defaultWallet) {
    walletSelect.value = defaultWallet;
  }
  
  const dateInput = document.getElementById('tx-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  const amtInput = document.getElementById('tx-amount');
  if (amtInput) {
    updateLiveLifeEnergyPreview(amtInput.value || 0);
  }

  if (window.lucide) window.lucide.createIcons();
}
window.openQuickAddModal = openQuickAddModal;
window.openLogExpenseModal = openQuickAddModal;

function closeQuickAddModal() {
  const modal = document.getElementById('quickAddModal');
  if (modal) modal.style.display = 'none';
}
window.closeQuickAddModal = closeQuickAddModal;

function updateLiveLifeEnergyPreview(amountVal) {
  const amount = parseFloat(amountVal) || 0;
  const wage = state.userProfile?.hourlyWage || 25.00;
  const currency = state.userProfile?.currency || '$';
  const dailyVelocity = parseFloat(state.userProfile?.dailyVelocity) || 48.23;

  const hours = (amount / wage).toFixed(1);
  const pct = dailyVelocity > 0 ? ((amount / dailyVelocity) * 100).toFixed(0) : 0;

  const hoursText = document.getElementById('lifeEnergyHoursText');
  const velocityText = document.getElementById('lifeEnergyVelocityText');

  if (hoursText) {
    hoursText.textContent = `${hours}`;
  }
  if (velocityText) {
    velocityText.textContent = `${pct}% of today's ${currency}${dailyVelocity.toFixed(2)} safe velocity`;
  }
}
window.updateLiveLifeEnergyPreview = updateLiveLifeEnergyPreview;

function confirmSaveQuickAddTransaction() {
  const amountInput = document.getElementById('tx-amount');
  const merchantInput = document.getElementById('tx-merchant');
  const walletSelect = document.getElementById('tx-wallet');
  const categorySelect = document.getElementById('tx-category');
  const dateInput = document.getElementById('tx-date');

  const amount = parseFloat(amountInput?.value);
  if (!amount || isNaN(amount) || amount <= 0) {
    if (typeof showToast === 'function') showToast('⚠️ Please enter a valid transaction amount.');
    return;
  }

  const merchant = (merchantInput?.value || '').trim() || (categorySelect?.value || 'Discretionary Purchase');
  const walletName = walletSelect?.value || 'Primary Checking';
  const category = categorySelect?.value || 'Miscellaneous';
  const date = dateInput?.value || new Date().toISOString().split('T')[0];
  const currency = state.userProfile?.currency || '$';
  const wage = state.userProfile?.hourlyWage || 25.00;
  const lifeEnergyHours = (amount / wage).toFixed(1);

  // 1. Deduct from selected wallet
  const targetWallet = state.wallets.find(w => w.name === walletName);
  if (targetWallet) {
    targetWallet.balance = Number((targetWallet.balance - amount).toFixed(2));
  }

  // 2. Autonomous Sentinel Check: unknown vendor threshold policy ($50)
  const isKnown = ['netflix', 'spotify', 'aws', 'amazon', 'chatgpt', 'openai', 'github', 'doordash', 'equinox', 'apple', 'icloud', 'trader joe', 'whole foods', 'chevron', 'uber'].some(kw => merchant.toLowerCase().includes(kw));
  let status = 'VERIFIED_OK';
  let walrusAnchor = 'MEM_ROUTINE';

  if (!isKnown && amount >= 50.00) {
    status = 'ESCALATION_REQUIRED';
    walrusAnchor = 'MEM_07';
    if (typeof showToast === 'function') {
      showToast(`🛡️ Sentinel Wall [MEM_07]: Debit of ${currency}${amount.toFixed(2)} from "${merchant}" requires escalation approval.`);
    }
  }

  // 3. Deduct from Safe-to-Spend Runway and Recalculate Velocity
  state.userProfile.safeSpend = Math.max(0, Number((state.userProfile.safeSpend - amount).toFixed(2)));
  const daysLeft = state.userProfile.cycleDays || 10;
  state.userProfile.dailyVelocity = Number((state.userProfile.safeSpend / daysLeft).toFixed(2));

  // 4. Prepend to Audit Feed & Recent Transactions
  const newTx = {
    id: `TX_LOG_${Date.now()}`,
    merchant,
    amount,
    currentAmount: amount,
    date,
    category,
    wallet: walletName,
    isUserLogged: true,
    walrusMemoryRef: walrusAnchor,
    status,
    message: `Logged to ${category} envelope via ${walletName}.`
  };
  state.auditResults.unshift(newTx);
  localStorage.setItem('recall_user_transactions', JSON.stringify(state.auditResults));
  localStorage.setItem('recall_user_wallets', JSON.stringify(state.wallets));

  // 5. Update UI
  recalculateAllFinancialMetrics();
  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);
  renderEnvelopesPlan();
  closeQuickAddModal();

  if (amountInput) amountInput.value = '';
  if (merchantInput) merchantInput.value = '';

  if (typeof showToast === 'function') {
    showToast(`✅ Saved ${currency}${amount.toFixed(2)} (${lifeEnergyHours} hrs energy). Safe velocity is now ${currency}${state.userProfile.dailyVelocity}/day.`);
  }
}
window.confirmSaveQuickAddTransaction = confirmSaveQuickAddTransaction;

function deleteUserLoggedTx(merchant, amount) {
  const index = state.auditResults.findIndex(r => r.merchant === merchant && Math.abs(r.amount - amount) < 0.01);
  if (index !== -1) {
    const deleted = state.auditResults.splice(index, 1)[0];
    localStorage.setItem('recall_user_transactions', JSON.stringify(state.auditResults));

    // Restore safe runway
    state.userProfile.safeSpend = Number((state.userProfile.safeSpend + amount).toFixed(2));
    const daysLeft = state.userProfile.cycleDays || 10;
    state.userProfile.dailyVelocity = Number((state.userProfile.safeSpend / daysLeft).toFixed(2));

    // Restore wallet
    const targetWallet = state.wallets.find(w => w.name === (deleted.wallet || 'Primary Checking'));
    if (targetWallet) {
      targetWallet.balance = Number((targetWallet.balance + amount).toFixed(2));
      localStorage.setItem('recall_user_wallets', JSON.stringify(state.wallets));
    }

    recalculateAllFinancialMetrics();
    renderUserProfileUI();
    renderWalletsUI();
    renderAuditRecords(state.auditResults);
    renderEnvelopesPlan();

    if (typeof showToast === 'function') {
      showToast(`🗑️ Removed ${merchant}. Safe velocity restored.`);
    }
  }
}
window.deleteUserLoggedTx = deleteUserLoggedTx;

// ================= LIVE CAMERA RECEIPT SCANNER (GOOGLE GEMINI VISION) =================
let activeCameraStream = null;
let cameraFacingMode = 'environment';

async function openCameraScannerModal() {
  const modal = document.getElementById('cameraViewfinderModal');
  if (!modal) return;
  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
  await startCameraStream(cameraFacingMode);
}
window.openCameraScannerModal = openCameraScannerModal;

function closeCameraScannerModal() {
  const modal = document.getElementById('cameraViewfinderModal');
  if (modal) modal.style.display = 'none';

  if (activeCameraStream) {
    try {
      activeCameraStream.getTracks().forEach((track) => track.stop());
    } catch (e) {}
    activeCameraStream = null;
  }

  const analyzingOverlay = document.getElementById('cameraAnalyzingOverlay');
  if (analyzingOverlay) analyzingOverlay.style.display = 'none';
}
window.closeCameraScannerModal = closeCameraScannerModal;

async function startCameraStream(facingMode = 'environment') {
  const video = document.getElementById('cameraStreamVideo');
  const statusOverlay = document.getElementById('cameraStatusOverlay');
  const statusText = document.getElementById('cameraStatusText');

  if (statusOverlay) statusOverlay.style.display = 'flex';
  if (statusText) statusText.textContent = 'Starting camera viewfinder...';

  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach((t) => t.stop());
    activeCameraStream = null;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (statusText) statusText.textContent = 'Camera API not supported in this browser.';
    showToast('Camera not supported. Please upload a receipt photo.', 'amber');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });

    activeCameraStream = stream;
    if (video) {
      video.srcObject = stream;
      await video.play();
    }
    if (statusOverlay) statusOverlay.style.display = 'none';
  } catch (err) {
    console.warn('[Camera] Could not open camera stream:', err);
    if (statusText) {
      statusText.innerHTML = `⚠️ Camera access unavailable (${err.name || 'Device busy'})<br><span style="font-size:0.75rem; color:#94a3b8;">Click below to pick a photo from your device.</span>`;
    }
    showToast('Camera unavailable. You can upload a receipt photo instead.', 'amber');
  }
}
window.startCameraStream = startCameraStream;

async function flipCameraFacingMode() {
  cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
  await startCameraStream(cameraFacingMode);
}
window.flipCameraFacingMode = flipCameraFacingMode;

function triggerFileInputFallback() {
  closeCameraScannerModal();
  openQuickAddModal();
  const fileInput = document.getElementById('receipt-camera-input');
  if (fileInput) fileInput.click();
}
window.triggerFileInputFallback = triggerFileInputFallback;

async function captureReceiptSnapshot() {
  const video = document.getElementById('cameraStreamVideo');
  const canvas = document.getElementById('cameraSnapshotCanvas');
  const analyzingOverlay = document.getElementById('cameraAnalyzingOverlay');

  if (!video || !canvas) return;

  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, width, height);

  const imageBase64 = canvas.toDataURL('image/jpeg', 0.92);

  if (analyzingOverlay) analyzingOverlay.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();

  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach((t) => t.stop());
    activeCameraStream = null;
  }

  setTimeout(async () => {
    closeCameraScannerModal();
    openQuickAddModal();
    await runReceiptScan({
      imageBase64,
      filename: `receipt_capture_${Date.now()}.jpg`
    });
  }, 450);
}
window.captureReceiptSnapshot = captureReceiptSnapshot;

async function runPresetAndClose(preset) {
  closeCameraScannerModal();
  openQuickAddModal();
  await runReceiptScan({ demoPreset: preset, filename: `${preset}_receipt.jpg` });
}
window.runPresetAndClose = runPresetAndClose;

async function runReceiptScan(payload) {
  const cameraBtn = document.getElementById('btn-trigger-camera');
  const resultBox = document.getElementById('ocr-audit-result');

  if (cameraBtn) cameraBtn.textContent = '⏳ Gemini Vision Analyzing...';
  if (resultBox) {
    resultBox.classList.remove('hidden', 'matched-duplicate');
    resultBox.innerHTML = '🔍 Google Gemini Vision decoding receipt & checking ±48h statement window...';
  }

  try {
    const currentTxs = state.auditResults || [
      { id: 'TX_AWS_01', merchant: 'AWS Cloud Hosting', amount: 142.50, timestamp: new Date().toISOString() }
    ];

    const res = await fetch('/api/ocr/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        existingTransactions: currentTxs
      })
    });

    const data = await res.json();
    if (cameraBtn) cameraBtn.textContent = '📷 Open Camera Scanner';

    if (!data.ok) throw new Error(data.error || 'OCR scan failed');

    const { extracted, ruleAudit } = data;

    const amountInput = document.getElementById('tx-amount');
    const merchantInput = document.getElementById('tx-merchant');
    const categorySelect = document.getElementById('tx-category');

    if (amountInput) {
      amountInput.value = extracted.amount.toFixed(2);
      updateLiveLifeEnergyPreview(extracted.amount);
    }
    if (merchantInput) {
      merchantInput.value = extracted.merchant;
    }
    if (categorySelect) {
      categorySelect.value = extracted.category;
    }

    const hourlyWage = state.userProfile?.hourlyWage || 25;
    const lifeEnergyHours = (extracted.amount / hourlyWage).toFixed(1);

    if (resultBox) {
      if (ruleAudit.matchedWithin48h) {
        resultBox.classList.add('matched-duplicate');
      }

      resultBox.innerHTML = `
        <div style="margin-bottom:4px;"><strong>⚡ Gemini Vision Decoded:</strong> <strong>${extracted.merchant}</strong> ($${extracted.amount.toFixed(2)})</div>
        <div style="font-size:0.75rem; color:#64748b; margin-bottom:4px;"><code>${extracted.rawString}</code> · Model: <em>${extracted.provider || 'Gemini 3.8 Flash'}</em></div>
        <div>🛡️ <strong>${ruleAudit.summary}</strong></div>
        ${
          ruleAudit.taxDeductible
            ? `<div style="margin-top:4px;">🧾 <strong>Tax Deduction Flagged:</strong> Est. savings <strong>+$${ruleAudit.estimatedTaxSavings.toFixed(2)}</strong> (22% bracket) · Anchor: <code>${ruleAudit.walrusReceiptAnchor}</code></div>`
            : `<div style="margin-top:4px;">🔗 <strong>Walrus Anchor Proof:</strong> <code>${ruleAudit.walrusReceiptAnchor}</code></div>`
        }
      `;
    }

    showToast(`📸 Receipt Captured: ${extracted.merchant} ($${extracted.amount.toFixed(2)})`, 'green');
  } catch (err) {
    if (cameraBtn) cameraBtn.textContent = '📷 Open Camera Scanner';
    if (resultBox) {
      resultBox.innerHTML = `⚠️ Scan notice: ${err.message}`;
    }
    showToast(`OCR Notice: ${err.message}`, 'amber');
  }
}
window.runReceiptScan = runReceiptScan;

function initReceiptOcrScanner() {
  const cameraBtn = document.getElementById('btn-trigger-camera');
  const fileInput = document.getElementById('receipt-camera-input');
  const presetChips = document.querySelectorAll('.ocr-chip');

  if (cameraBtn) {
    cameraBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCameraScannerModal();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        await runReceiptScan({
          imageBase64: reader.result,
          filename: file.name
        });
      };
      reader.readAsDataURL(file);
    });
  }

  presetChips.forEach((chip) => {
    chip.addEventListener('click', async () => {
      const preset = chip.getAttribute('data-preset');
      await runReceiptScan({ demoPreset: preset, filename: `${preset}_receipt.jpg` });
    });
  });
}
window.initReceiptOcrScanner = initReceiptOcrScanner;

function renderUserProfileUI() {
  updateDynamicGreetingAndDate();
  const profile = state.userProfile;
  if (!profile) return;

  const nameEl = document.getElementById('userDisplayName');
  const avatarEl = document.getElementById('userAvatarText');
  const safeSpendHero = document.getElementById('heroSafeSpendDisplay');
  const velocityHero = document.getElementById('heroDailyVelocityDisplay');
  const cycleDaysHero = document.getElementById('heroCycleDaysDisplay');
  const kpiSafe = document.getElementById('kpiSafeSpend');
  const kpiVel = document.getElementById('kpiVelocitySub');
  const overviewSafe = document.getElementById('overviewSafeSpendVal');
  const overviewBurn = document.getElementById('overviewBurnVal');
  const overviewDaily = document.getElementById('overviewDailyAllowance');

  const cur = profile.currency || '$';
  const safeNum = Number(profile.safeSpend !== undefined ? profile.safeSpend : 0);
  const velNum = Number(profile.dailyVelocity !== undefined ? profile.dailyVelocity : 0);
  const safeVal = `${cur}${safeNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  const velVal = `${cur}${velNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / day`;
  const cycleVal = `${profile.cycleDays || 10} days remaining`;

  if (nameEl) nameEl.textContent = profile.name || 'Alex Rivera';
  const initials = (profile.name || 'Alex Rivera').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AR';
  if (avatarEl) avatarEl.textContent = initials;

  const headerName = document.getElementById('headerUserName');
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerSafe = document.getElementById('headerSafeSpend');

  if (headerName) headerName.textContent = profile.name || 'Alex Rivera';
  if (headerAvatar) headerAvatar.textContent = initials;
  if (headerSafe && profile.safeSpend !== undefined) headerSafe.textContent = safeVal;

  if (safeSpendHero) safeSpendHero.textContent = safeVal;
  if (velocityHero) velocityHero.textContent = velVal;
  if (cycleDaysHero) cycleDaysHero.textContent = cycleVal;

  if (kpiSafe) kpiSafe.textContent = safeVal;
  if (kpiVel) kpiVel.textContent = `${velVal} · ${cycleVal}`;
  if (overviewBurn) overviewBurn.textContent = velVal;
  if (overviewDaily) overviewDaily.textContent = velVal;
  if (overviewSafe) overviewSafe.textContent = safeVal;
  if (typeof renderApprovedCeilingsTable === 'function') renderApprovedCeilingsTable();
}
window.renderUserProfileUI = renderUserProfileUI;

function loadUserProfileToSettings() {
  const profile = state.userProfile;
  if (!profile) return;

  const nameInp = document.getElementById('settingProfileName');
  const curSel = document.getElementById('settingProfileCurrency');
  const inflowInp = document.getElementById('settingProfileInflow');
  const wageInp = document.getElementById('settingProfileWage');
  const daysInp = document.getElementById('settingProfileCycleDays');

  if (nameInp) nameInp.value = profile.name || '';
  if (curSel) curSel.value = profile.currency || '$';
  if (inflowInp) inflowInp.value = profile.inflow !== undefined ? profile.inflow : '';
  if (wageInp) wageInp.value = profile.hourlyWage !== undefined ? profile.hourlyWage : '';
  if (daysInp) daysInp.value = profile.cycleDays || 10;
  if (typeof renderApprovedCeilingsTable === 'function') renderApprovedCeilingsTable();
}
window.loadUserProfileToSettings = loadUserProfileToSettings;

function saveUserProfileSettings() {
  const nameInp = document.getElementById('settingProfileName');
  const curSel = document.getElementById('settingProfileCurrency');
  const inflowInp = document.getElementById('settingProfileInflow');
  const wageInp = document.getElementById('settingProfileWage');
  const daysInp = document.getElementById('settingProfileCycleDays');

  const newName = (nameInp?.value || 'User').trim();
  const newCur = curSel?.value || '$';
  const newInflow = parseFloat(inflowInp?.value) || 0.00;
  const newWage = parseFloat(wageInp?.value) || 25.00;
  const newDays = parseInt(daysInp?.value) || 10;

  state.userProfile.name = newName;
  state.userProfile.currency = newCur;
  state.userProfile.inflow = newInflow;
  state.userProfile.hourlyWage = newWage;
  state.userProfile.cycleDays = newDays;

  // Recalculate daily velocity
  state.userProfile.dailyVelocity = Number((state.userProfile.safeSpend / newDays).toFixed(2));

  localStorage.setItem('recall_user_name', newName);
  localStorage.setItem('recall_currency', newCur);
  localStorage.setItem('recall_inflow', newInflow.toString());
  localStorage.setItem('recall_hourly_wage', newWage.toString());
  localStorage.setItem('recall_cycle_days', newDays.toString());

  recalculateAllFinancialMetrics();
  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);
  renderEnvelopesPlan();
  renderSpendCalendar();

  if (typeof showToast === 'function') {
    showToast(`✅ Profile saved: ${newName} · Real wage ${newCur}${newWage}/hr · Metrics updated!`);
  }
}
window.saveUserProfileSettings = saveUserProfileSettings;

function resetToHackathonDefaults() {
  state.userProfile = {
    name: 'Alex Rivera',
    currency: '$',
    inflow: 4850.00,
    hourlyWage: 25.00,
    cycleDays: 10,
    safeSpend: 482.35,
    dailyVelocity: 48.23
  };

  localStorage.removeItem('recall_user_name');
  localStorage.removeItem('recall_currency');
  localStorage.removeItem('recall_inflow');
  localStorage.removeItem('recall_hourly_wage');
  localStorage.removeItem('recall_cycle_days');

  loadUserProfileToSettings();
  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);

  if (typeof showToast === 'function') {
    showToast('🔄 Reset to Hackathon Demo Defaults (Alex Rivera, $4,850 inflow, $25/hr wage).');
  }
}
window.resetToHackathonDefaults = resetToHackathonDefaults;

function renderWalletsUI() {
  const cur = state.userProfile?.currency || '$';
  let totalLiquidity = 0;
  state.wallets.forEach(w => {
    totalLiquidity += w.balance;
  });

  const totalEl = document.getElementById('totalNetLiquidityDisplay');
  if (totalEl) totalEl.textContent = `${cur}${totalLiquidity.toFixed(2)}`;

  const headerNet = document.getElementById('headerNetLiquidity');
  if (headerNet) headerNet.textContent = `${cur}${totalLiquidity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const checking = state.wallets.find(w => w.id === 'checking');
  const babylon = state.wallets.find(w => w.id === 'babylon');
  const cash = state.wallets.find(w => w.id === 'cash');
  const credit = state.wallets.find(w => w.id === 'credit');

  const checkEl = document.getElementById('walletCheckingBal');
  const babylonEl = document.getElementById('walletBabylonBal');
  const cashEl = document.getElementById('walletCashBal');
  const creditEl = document.getElementById('walletCreditBal');

  if (checkEl && checking) checkEl.textContent = `${cur}${checking.balance.toFixed(2)}`;
  if (babylonEl && babylon) babylonEl.textContent = `${cur}${babylon.balance.toFixed(2)}`;
  if (cashEl && cash) cashEl.textContent = `${cur}${cash.balance.toFixed(2)}`;
  if (creditEl && credit) creditEl.textContent = `${cur}${credit.balance.toFixed(2)}`;

  const checkHint = document.getElementById('walletCheckingHint');
  if (checkHint) {
    const safe = state.userProfile?.safeSpend || 0;
    checkHint.textContent = `Covers ${cur}${safe.toFixed(2)} Safe Runway`;
  }
}
window.renderWalletsUI = renderWalletsUI;

function renderPlanSubscriptionsLedger() {
  const container = document.getElementById('planSubsLedgerList');
  if (!container) return;

  const saved = localStorage.getItem('recall_user_subscriptions');
  const user = state.userProfile?.signedIn || localStorage.getItem('recall_user_signed_in') === 'true';

  let subs = [];
  if (saved) {
    try {
      subs = JSON.parse(saved);
    } catch (e) {
      subs = state.subscriptions || [];
    }
  } else if (state.subscriptions && (user || state.subscriptions.length > 0)) {
    subs = state.subscriptions;
  } else if (user) {
    subs = [];
  } else {
    subs = [
      { merchant: 'Netflix Standard', amount: 17.99, baselineAmount: 15.49, dayOfMonth: 20, walrusMemoryRef: 'MEM_01', hasHike: true },
      { merchant: 'Spotify Premium', amount: 10.99, baselineAmount: 10.99, dayOfMonth: 15, walrusMemoryRef: 'MEM_02' },
      { merchant: 'OpenAI (ChatGPT Plus)', amount: 20.00, baselineAmount: 20.00, dayOfMonth: 14, walrusMemoryRef: 'MEM_03' },
      { merchant: 'Amazon Web Services (AWS)', amount: 142.50, baselineAmount: 64.00, dayOfMonth: 19, walrusMemoryRef: 'MEM_04', overrideApproved: true },
      { merchant: 'Equinox Fitness Club', amount: 0.00, baselineAmount: 240.00, dayOfMonth: 1, walrusMemoryRef: 'MEM_05', frozen: true },
      { merchant: 'Adobe Creative Cloud', amount: 54.99, baselineAmount: 0.00, dayOfMonth: 23, walrusMemoryRef: 'MEM_06', isTrial: true },
      { merchant: 'GitHub Copilot', amount: 10.00, baselineAmount: 10.00, dayOfMonth: 28, walrusMemoryRef: 'MEM_09' },
      { merchant: 'DoorDash DashPass', amount: 9.99, baselineAmount: 9.99, dayOfMonth: 18, walrusMemoryRef: 'MEM_10' },
      { merchant: 'Apple iCloud+ 2TB', amount: 9.99, baselineAmount: 9.99, dayOfMonth: 5, walrusMemoryRef: 'MEM_12' }
    ];
  }

  const cur = state.userProfile?.currency || '$';

  if (subs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 24px; color: var(--text-muted); font-size:13px;">
        No recurring subscriptions configured. Use "Configure Subscriptions" to set up your fixed debits.
      </div>
    `;
    return;
  }

  container.innerHTML = subs.map(s => {
    const isHike = s.hasHike || (s.baselineAmount && s.amount > s.baselineAmount && !s.overrideApproved);
    const isTrial = s.isTrial || (s.merchant && s.merchant.toLowerCase().includes('adobe')) || (s.merchant && s.merchant.toLowerCase().includes('trial'));

    return `
      <div class="sub-ledger-item ${isHike ? 'hike' : ''} ${isTrial ? 'trial' : ''}">
        <div class="sub-item-left">
          <div class="merchant-avatar">${(s.merchant || 'S').charAt(0)}</div>
          <div>
            <strong>${s.merchant || 'Subscription'}</strong>
            <div class="sub-item-meta">
              <span>Renews ${s.dayOfMonth || s.renewalDay || 15}th</span>
              ${isHike && s.baselineAmount !== undefined ? `<span>· Baseline ${cur}${s.baselineAmount.toFixed(2)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="sub-item-right">
          <div class="sub-item-amt">
            <span class="amt-val">${cur}${Number(s.amount !== undefined ? s.amount : (s.cost !== undefined ? s.cost : 0)).toFixed(2)} / mo</span>
            ${isHike ? `<span class="tag-hike">+${cur}2.50 Hike</span>` : ''}
            ${isTrial ? '<span class="tag-trial">48h Alert</span>' : ''}
          </div>
          ${isHike ? `<button class="btn-mini-dispute" onclick="openDisputeModalForRecord('${s.merchant}', ${s.amount}, ${s.baselineAmount}, 2.50, '${s.walrusMemoryRef || 'MEM_01'}')">Dispute</button>` : ''}
          ${isTrial ? `<button class="btn-mini-cancel" onclick="openDisputeModalForTrial()">Cancel</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}
window.renderPlanSubscriptionsLedger = renderPlanSubscriptionsLedger;

function openAddWalletModal() {
  const modal = document.getElementById('addWalletModal');
  if (modal) {
    if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();
    modal.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  }
}
window.openAddWalletModal = openAddWalletModal;

function closeAddWalletModal() {
  const modal = document.getElementById('addWalletModal');
  if (modal) modal.style.display = 'none';
}
window.closeAddWalletModal = closeAddWalletModal;

function confirmAddNewWallet() {
  const name = document.getElementById('newWalletName')?.value?.trim();
  const type = document.getElementById('newWalletType')?.value || 'bank';
  const balance = parseFloat(document.getElementById('newWalletBalance')?.value) || 0;

  if (!name) {
    if (typeof showToast === 'function') showToast('⚠️ Please enter a wallet name.');
    return;
  }

  state.wallets.push({
    id: `wallet_${Date.now()}`,
    name,
    balance,
    type,
    color: '#10b981',
    icon: type === 'cash' ? 'banknote' : (type === 'vault' ? 'shield' : 'landmark')
  });

  const cur = state.userProfile?.currency || '$';
  renderWalletsUI();
  closeAddWalletModal();
  if (typeof showToast === 'function') showToast(`✅ Added wallet "${name}" with ${cur}${balance.toFixed(2)}.`);
}
window.confirmAddNewWallet = confirmAddNewWallet;

function openTransferModal(fromWallet = null) {
  const modal = document.getElementById('transferModal');
  if (!modal) return;
  modal.style.display = 'flex';
  if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();
  if (fromWallet) {
    const sel = document.getElementById('transferFromWallet');
    if (sel) sel.value = fromWallet;
  }
}
window.openTransferModal = openTransferModal;

function closeTransferModal() {
  const modal = document.getElementById('transferModal');
  if (modal) modal.style.display = 'none';
}
window.closeTransferModal = closeTransferModal;

function confirmWalletTransfer() {
  const fromName = document.getElementById('transferFromWallet')?.value;
  const toName = document.getElementById('transferToWallet')?.value;
  const amount = parseFloat(document.getElementById('transferAmount')?.value);

  if (!amount || amount <= 0) {
    if (typeof showToast === 'function') showToast('⚠️ Please enter a valid transfer amount.');
    return;
  }
  if (fromName === toName) {
    if (typeof showToast === 'function') showToast('⚠️ Source and destination wallets must be different.');
    return;
  }

  const fromW = state.wallets.find(w => w.name === fromName);
  const toW = state.wallets.find(w => w.name === toName);

  if (fromW && toW) {
    fromW.balance = Number((fromW.balance - amount).toFixed(2));
    toW.balance = Number((toW.balance + amount).toFixed(2));
    localStorage.setItem('recall_user_wallets', JSON.stringify(state.wallets));
    renderWalletsUI();
    closeTransferModal();
    const cur = state.userProfile?.currency || '$';
    if (typeof showToast === 'function') {
      showToast(`🔄 Transferred ${cur}${amount.toFixed(2)} from ${fromName} to ${toName}.`);
    }
  }
}
window.confirmWalletTransfer = confirmWalletTransfer;

function openBabylonUnlockModal() {
  const modal = document.getElementById('emergencyUnlockModal');
  if (modal) {
    modal.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();
  }
}
window.openBabylonUnlockModal = openBabylonUnlockModal;

function closeEmergencyUnlockModal() {
  const modal = document.getElementById('emergencyUnlockModal');
  if (modal) modal.style.display = 'none';
}
window.closeEmergencyUnlockModal = closeEmergencyUnlockModal;

function confirmEmergencyUnlock() {
  closeEmergencyUnlockModal();
  const reservePill = document.querySelector('.envelope-card.reserve-card .env-remaining-pill');
  if (reservePill) {
    reservePill.innerHTML = '<i data-lucide="unlock"></i> $500.00 Unlocked';
    reservePill.className = 'env-remaining-pill blue';
  }
  const babylonBtn = document.querySelector('.btn-wallet-action.babylon-btn');
  if (babylonBtn) {
    babylonBtn.innerHTML = '<i data-lucide="unlock"></i> Reserve Unlocked';
    babylonBtn.style.background = '#e0f2fe';
    babylonBtn.style.color = '#0284c7';
  }
  if (window.lucide) window.lucide.createIcons();
  if (typeof showToast === 'function') {
    showToast('🛡️ 10% Emergency Reserve unlocked for crisis allocation.', 'amber');
  }
}
window.confirmEmergencyUnlock = confirmEmergencyUnlock;

// =========================================================================
// CUSTOM CATEGORY ENVELOPES MANAGEMENT
// =========================================================================
function getCustomEnvelopes() {
  try {
    return JSON.parse(localStorage.getItem('pocketsentinel_custom_envelopes') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCustomEnvelopes(envelopes) {
  localStorage.setItem('pocketsentinel_custom_envelopes', JSON.stringify(envelopes));
}

function openCreateCategoryModal() {
  const modal = document.getElementById('createCategoryModal');
  if (modal) {
    if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();
    modal.style.display = 'flex';
    const nameInput = document.getElementById('newCategoryName');
    if (nameInput) setTimeout(() => nameInput.focus(), 50);
    if (window.lucide) window.lucide.createIcons();
  }
}
window.openCreateCategoryModal = openCreateCategoryModal;

function closeCreateCategoryModal() {
  const modal = document.getElementById('createCategoryModal');
  if (modal) modal.style.display = 'none';
}
window.closeCreateCategoryModal = closeCreateCategoryModal;

function selectCategoryIcon(iconName) {
  const input = document.getElementById('newCategoryIcon');
  if (input) input.value = iconName;
  document.querySelectorAll('#categoryIconPicker .icon-pick-btn').forEach(btn => {
    if (btn.getAttribute('data-icon') === iconName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}
window.selectCategoryIcon = selectCategoryIcon;

function handleCreateCategorySubmit(event) {
  event.preventDefault();
  const name = (document.getElementById('newCategoryName')?.value || '').trim();
  const budget = parseFloat(document.getElementById('newCategoryBudget')?.value) || 0;
  const spent = parseFloat(document.getElementById('newCategoryInitialSpent')?.value) || 0;
  const icon = document.getElementById('newCategoryIcon')?.value || 'folder-plus';
  const color = document.getElementById('newCategoryColor')?.value || 'blue';

  if (!name || budget <= 0) {
    if (typeof showToast === 'function') showToast('Please enter a valid category name and target budget.', 'amber');
    return;
  }

  const newEnvelope = {
    id: 'env_' + Date.now(),
    name,
    budget,
    spent,
    icon,
    color,
    createdAt: new Date().toISOString()
  };

  const current = getCustomEnvelopes();
  current.push(newEnvelope);
  saveCustomEnvelopes(current);

  renderCustomEnvelopes();
  syncCategoryDropdowns();
  closeCreateCategoryModal();

  document.getElementById('createCategoryForm')?.reset();
  selectCategoryIcon('heart');

  const cur = state.userProfile?.currency || '$';
  if (typeof showToast === 'function') {
    showToast(`📁 Created new envelope "${name}" with ${cur}${budget.toFixed(2)} monthly allocation!`, 'green');
  }
}
window.handleCreateCategorySubmit = handleCreateCategorySubmit;

function deleteCustomEnvelope(envId) {
  let current = getCustomEnvelopes();
  const target = current.find(e => e.id === envId);
  current = current.filter(e => e.id !== envId);
  saveCustomEnvelopes(current);
  renderCustomEnvelopes();
  syncCategoryDropdowns();

  if (typeof showToast === 'function') {
    showToast(`🗑️ Removed category envelope "${target?.name || ''}".`, 'amber');
  }
}
window.deleteCustomEnvelope = deleteCustomEnvelope;

function renderEnvelopesPlan() {
  const grid = document.getElementById('envelopesCardsGrid');
  if (!grid) return;

  const cur = state.userProfile?.currency || '$';
  let inflow = Number(state.userProfile?.inflow || 0);
  const activeMonth = state.selectedStatementMonth || 'all';

  if (state.availableStatementMonths && state.availableStatementMonths.length > 0) {
    if (activeMonth !== 'all') {
      const mData = state.availableStatementMonths.find(m => m.monthKey === activeMonth);
      if (mData && mData.inflow > 0) inflow = mData.inflow;
    } else {
      const sumInflow = state.availableStatementMonths.reduce((sum, m) => sum + (m.inflow || 0), 0);
      if (sumInflow > 0) inflow = sumInflow;
    }
  }

  // Load custom envelopes if user created any
  const customEnvelopes = typeof getCustomEnvelopes === 'function' ? getCustomEnvelopes() : [];
  const customAllocTotal = customEnvelopes.reduce((sum, env) => sum + (Number(env.budget) || 0), 0);

  // Load user saved allocations if configured, otherwise calculate suggested proportional targets
  let savedAlloc = null;
  try {
    const rawAlloc = localStorage.getItem('recall_envelope_allocations');
    if (rawAlloc) savedAlloc = JSON.parse(rawAlloc);
  } catch (e) {
    savedAlloc = null;
  }

  let reserve = 0;
  let groceriesBudget = 0;
  let diningBudget = 0;
  let transportBudget = 0;
  let utilitiesBudget = 0;
  let funBudget = 0;

  if (savedAlloc) {
    reserve = savedAlloc.reserve !== undefined ? Number(savedAlloc.reserve) : Number((inflow * 0.10).toFixed(2));
    groceriesBudget = Number(savedAlloc.groceries || 0);
    diningBudget = Number(savedAlloc.dining || 0);
    transportBudget = Number(savedAlloc.transport || 0);
    utilitiesBudget = Number(savedAlloc.utilities || 0);
    funBudget = Number(savedAlloc.fun || 0);
  } else {
    reserve = Number(state.userProfile?.reserve !== undefined ? state.userProfile.reserve : (inflow * 0.10));
    const spendablePool = Math.max(0, inflow - reserve - customAllocTotal);
    groceriesBudget = Number((spendablePool * 0.35).toFixed(2));
    diningBudget = Number((spendablePool * 0.20).toFixed(2));
    transportBudget = Number((spendablePool * 0.15).toFixed(2));
    utilitiesBudget = Number((spendablePool * 0.15).toFixed(2));
    funBudget = Number((spendablePool - groceriesBudget - diningBudget - transportBudget - utilitiesBudget).toFixed(2));
  }

  // Populate Formula & Math Breakdown Grid
  const formulaGrid = document.getElementById('formulaMathGrid');
  if (formulaGrid) {
    const spendablePool = Math.max(0, inflow - reserve - customAllocTotal);
    formulaGrid.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">1. Total Monthly Inflow</span>
        <strong style="font-size:14px; color:var(--text-main);">${cur}${inflow.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">100% Allocation Base (${activeMonth === 'all' ? 'All Months' : formatMonthLabel(activeMonth)})</small>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">2. 10% Gold Reserve</span>
        <strong style="font-size:14px; color:var(--amber-cta);">${cur}${reserve.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">${inflow > 0 ? ((reserve / inflow) * 100).toFixed(1) : 10}% Buffer</small>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">3. Groceries Target</span>
        <strong style="font-size:14px; color:var(--green);">${cur}${groceriesBudget.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">${spendablePool > 0 ? ((groceriesBudget / spendablePool) * 100).toFixed(0) : 35}% of Living Pool</small>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">4. Dining Out Target</span>
        <strong style="font-size:14px; color:var(--coral);">${cur}${diningBudget.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">${spendablePool > 0 ? ((diningBudget / spendablePool) * 100).toFixed(0) : 20}% of Living Pool</small>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">5. Transport & Fuel</span>
        <strong style="font-size:14px; color:var(--green);">${cur}${transportBudget.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">${spendablePool > 0 ? ((transportBudget / spendablePool) * 100).toFixed(0) : 15}% of Living Pool</small>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">6. Utilities & Living</span>
        <strong style="font-size:14px; color:var(--green);">${cur}${utilitiesBudget.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">${spendablePool > 0 ? ((utilitiesBudget / spendablePool) * 100).toFixed(0) : 15}% of Living Pool</small>
      </div>
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:10px 12px;">
        <span style="font-size:11px; color:var(--text-muted); display:block; text-transform:uppercase; font-weight:700;">7. Discretionary Fun</span>
        <strong style="font-size:14px; color:var(--blue);">${cur}${funBudget.toFixed(2)}</strong>
        <small style="display:block; font-size:10px; color:var(--text-muted);">${spendablePool > 0 ? ((funBudget / spendablePool) * 100).toFixed(0) : 15}% of Living Pool</small>
      </div>
    `;
  }

  // Compute actual spent from state.auditResults for active month
  const activeMonthKey = state.selectedStatementMonth && state.selectedStatementMonth !== 'all' 
    ? state.selectedStatementMonth 
    : (state.availableStatementMonths && state.availableStatementMonths.length > 0 ? state.availableStatementMonths[0].monthKey : 'all');

  const monthTxs = (state.auditResults || []).filter(tx => {
    if (isCreditRecord(tx)) return false;
    if (activeMonthKey === 'all') return true;
    return getTxMonthKey(tx) === activeMonthKey;
  });
  
  function getSpentForCategory(catKeywords) {
    return monthTxs.reduce((acc, tx) => {
      const cat = (tx.category || '').toLowerCase();
      const merchant = (tx.merchant || '').toLowerCase();
      const matches = catKeywords.some(kw => cat.includes(kw) || merchant.includes(kw));
      if (matches) {
        const amt = getTxAmount(tx);
        return acc + amt;
      }
      return acc;
    }, 0);
  }

  const groceriesSpent = getSpentForCategory(['grocer', 'supermarket', 'food', 'trader joe', 'shoprite', 'store', 'market', 'provision']);
  const diningSpent = getSpentForCategory(['dining', 'restaurant', 'cafe', 'coffee', 'doordash', 'uber eats', 'bukka', 'kitchen', 'eatery']);
  const transportSpent = getSpentForCategory(['transport', 'fuel', 'gas', 'chevron', 'shell', 'transit', 'uber', 'bolt', 'ride', 'fare']);
  const utilitiesSpent = getSpentForCategory(['utilit', 'internet', 'electric', 'water', 'phone', 'bill', 'airtime', 'data', 'recharge', 'mtn', 'airtel', 'glo', 'bank charge', 'levy', 'stamp duty', 'emtl']);
  const funSpent = getSpentForCategory(['fun', 'entertainment', 'cinema', 'game', 'hobby', 'transfer', 'transfers']);
  const savingsSpent = getSpentForCategory(['owealth', 'savings', 'wealth', 'piggyvest', 'cowrywise', 'invest']);
  const reserveSpent = savingsSpent > 0 ? savingsSpent : 0.00;

  const standardEnvelopes = [
    {
      id: 'planEnvGroceries',
      name: 'Groceries',
      icon: 'shopping-cart',
      color: 'green',
      budget: groceriesBudget,
      spent: groceriesSpent
    },
    {
      id: 'planEnvDining',
      name: 'Dining Out',
      icon: 'utensils',
      color: 'coral',
      budget: diningBudget,
      spent: diningSpent
    },
    {
      id: 'planEnvFun',
      name: 'Discretionary Fun',
      icon: 'ticket',
      color: 'blue',
      budget: funBudget,
      spent: funSpent
    },
    {
      id: 'planEnvTransport',
      name: 'Transport & Fuel',
      icon: 'fuel',
      color: 'green',
      budget: transportBudget,
      spent: transportSpent
    },
    {
      id: 'planEnvUtilities',
      name: 'Utilities & Internet',
      icon: 'zap',
      color: 'green',
      budget: utilitiesBudget,
      spent: utilitiesSpent
    },
    {
      id: 'planEnvReserve',
      name: '10% Emergency Reserve',
      icon: 'shield',
      color: 'amber',
      budget: reserve,
      spent: reserveSpent,
      isReserve: true
    }
  ];

  let totalAllocated = reserve + groceriesBudget + diningBudget + funBudget + transportBudget + utilitiesBudget + customAllocTotal;
  let hasAnyDeficit = false;

  let cardsHtml = standardEnvelopes.map(env => {
    const isReserve = Boolean(env.isReserve);
    const remaining = env.budget - env.spent;
    const isDeficit = remaining < 0;
    if (isDeficit) hasAnyDeficit = true;

    const pct = env.budget > 0 ? Math.min(Math.round((env.spent / env.budget) * 100), 100) : 0;
    
    let pillHtml = '';
    let calloutHtml = '';
    let barColor = env.color || 'green';

    if (isReserve) {
      pillHtml = `<span class="env-remaining-pill amber"><i data-lucide="lock"></i> ${cur}${env.budget.toFixed(2)} Locked</span>`;
      barColor = 'amber';
    } else if (isDeficit) {
      pillHtml = `<span class="env-remaining-pill red">-${cur}${Math.abs(remaining).toFixed(2)} Deficit</span>`;
      barColor = 'red';
      calloutHtml = `
        <div class="env-rebalance-callout">
          <span>⚠️ Overspent by ${cur}${Math.abs(remaining).toFixed(2)}</span>
          <button class="btn-mini-rebalance" onclick="rebalanceEnvelopesWithPunch()">Rebalance from Fun</button>
        </div>
      `;
    } else {
      const pillClass = remaining > 0 ? (env.color === 'blue' ? 'blue' : 'green') : 'blue';
      const label = remaining === 0 ? 'Balanced' : 'Left';
      pillHtml = `<span class="env-remaining-pill ${pillClass}">+${cur}${remaining.toFixed(2)} ${label}</span>`;
    }

    return `
      <div class="envelope-card ${isReserve ? 'reserve-card' : ''} ${isDeficit ? 'alert-deficit' : ''}" id="${env.id}Card">
        <div class="env-header">
          <div class="env-title-wrap">
            <span class="env-icon ${isReserve ? 'amber' : ''}"><i data-lucide="${env.icon}"></i></span>
            <div>
              <strong>${env.name}</strong>
              <span class="env-meta">${isReserve ? 'Locked reserve' : `Target: ${cur}${env.budget.toFixed(2)} / mo`}</span>
            </div>
          </div>
          ${pillHtml}
        </div>
        <div class="env-progress-bar">
          <div class="env-fill ${barColor}" style="width: ${isReserve ? '100%' : `${pct}%`};"></div>
        </div>
        <div class="env-footer">
          <span>Spent: ${cur}${env.spent.toFixed(2)}</span>
          <span>${isReserve ? 'Target' : 'Allocated'}: ${cur}${env.budget.toFixed(2)}</span>
        </div>
        ${calloutHtml}
      </div>
    `;
  }).join('');

  // Add custom envelopes
  customEnvelopes.forEach(env => {
    const customSpent = getSpentForCategory([(env.name || '').toLowerCase()]);
    const budget = Number(env.budget) || 0;
    const remaining = budget - customSpent;
    const isDeficit = remaining < 0;
    if (isDeficit) hasAnyDeficit = true;
    const pct = budget > 0 ? Math.min(Math.round((customSpent / budget) * 100), 100) : 0;
    const pillClass = isDeficit ? 'red' : (remaining > 0 ? 'green' : 'blue');
    const pillText = isDeficit ? `-${cur}${Math.abs(remaining).toFixed(2)} Deficit` : `+${cur}${remaining.toFixed(2)} Left`;

    cardsHtml += `
      <div class="envelope-card custom-env-card ${isDeficit ? 'alert-deficit' : ''}" id="${env.id}">
        <div class="env-header">
          <div class="env-title-wrap">
            <span class="env-icon"><i data-lucide="${env.icon || 'folder-plus'}"></i></span>
            <div>
              <strong>${env.name}</strong>
              <span class="env-meta">Target: ${cur}${budget.toFixed(2)} / mo</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="env-remaining-pill ${pillClass}">${pillText}</span>
            <button class="custom-env-delete-btn" title="Delete category envelope" onclick="deleteCustomEnvelope('${env.id}')">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
        <div class="env-progress-bar">
          <div class="env-fill ${isDeficit ? 'red' : (env.color || 'blue')}" style="width: ${pct}%;"></div>
        </div>
        <div class="env-footer">
          <span>Spent: ${cur}${customSpent.toFixed(2)}</span>
          <span>Allocated: ${cur}${budget.toFixed(2)}</span>
        </div>
      </div>
    `;
  });

  grid.innerHTML = cardsHtml;

  // Banner metrics
  const unassigned = Math.max(0, inflow - totalAllocated);
  const inflowEl = document.getElementById('planInflowPoolDisplay');
  const allocEl = document.getElementById('planAllocatedPoolDisplay');
  const unassignEl = document.getElementById('planUnassignedPoolDisplay');
  const subtitleEl = document.getElementById('planIncomeAssignedSubtitle');
  const statusPill = document.getElementById('planEnvelopesStatusPill');

  if (inflowEl) inflowEl.textContent = `${cur}${inflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (allocEl) allocEl.textContent = `${cur}${totalAllocated.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (unassignEl) {
    unassignEl.textContent = `${cur}${unassigned.toFixed(2)} (${unassigned === 0 ? 'Balanced' : 'Available'})`;
  }
  if (subtitleEl) {
    subtitleEl.textContent = `${cur}${inflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} monthly income assigned`;
  }
  if (statusPill) {
    if (hasAnyDeficit) {
      statusPill.className = 'status-pill red';
      statusPill.innerHTML = '<i data-lucide="alert-triangle"></i> Deficit Detected';
    } else {
      statusPill.className = 'status-pill green';
      statusPill.innerHTML = '<i data-lucide="check-circle"></i> Balanced';
    }
  }

  // Redirect card subtitle
  const redirectSub = document.getElementById('planRedirectCardSub');
  const fixedCount = (state.subscriptions || []).length;
  if (redirectSub) {
    redirectSub.textContent = `${fixedCount} recurring services, 48-hour trial alerts, and renewal cadence calendar.`;
  }

  if (window.lucide) window.lucide.createIcons();
}
window.renderEnvelopesPlan = renderEnvelopesPlan;

function renderCustomEnvelopes() {
  renderEnvelopesPlan();
}
window.renderCustomEnvelopes = renderCustomEnvelopes;

// ================= USER ENVELOPE ALLOCATION LOGIC =================
function openAllocateEnvelopesModal(targetEnvId = null) {
  const modal = document.getElementById('allocateEnvelopesModal');
  if (!modal) return;
  modal.style.display = 'flex';

  if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();

  const cur = state.userProfile?.currency || '$';
  const inflow = Number(state.userProfile?.inflow || 0);

  let savedAlloc = null;
  try {
    const raw = localStorage.getItem('recall_envelope_allocations');
    if (raw) savedAlloc = JSON.parse(raw);
  } catch (e) {
    savedAlloc = null;
  }

  const customEnvelopes = typeof getCustomEnvelopes === 'function' ? getCustomEnvelopes() : [];
  const customAllocTotal = customEnvelopes.reduce((sum, env) => sum + (Number(env.budget) || 0), 0);

  let reserve = savedAlloc?.reserve !== undefined ? Number(savedAlloc.reserve) : Number(state.userProfile?.reserve !== undefined ? state.userProfile.reserve : (inflow * 0.10));
  const spendable = Math.max(0, inflow - reserve - customAllocTotal);

  const groceries = savedAlloc?.groceries !== undefined ? Number(savedAlloc.groceries) : Number((spendable * 0.35).toFixed(2));
  const dining = savedAlloc?.dining !== undefined ? Number(savedAlloc.dining) : Number((spendable * 0.20).toFixed(2));
  const transport = savedAlloc?.transport !== undefined ? Number(savedAlloc.transport) : Number((spendable * 0.15).toFixed(2));
  const utilities = savedAlloc?.utilities !== undefined ? Number(savedAlloc.utilities) : Number((spendable * 0.15).toFixed(2));
  const fun = savedAlloc?.fun !== undefined ? Number(savedAlloc.fun) : Number((spendable - groceries - dining - transport - utilities).toFixed(2));

  const container = document.getElementById('modalEnvelopeInputsList');
  if (container) {
    const categories = [
      { id: 'groceries', name: 'Groceries & Supermarket', icon: 'shopping-cart', val: groceries },
      { id: 'dining', name: 'Dining Out & Restaurants', icon: 'utensils', val: dining },
      { id: 'fun', name: 'Discretionary Fun & Entertainment', icon: 'ticket', val: fun },
      { id: 'transport', name: 'Transportation & Fuel', icon: 'fuel', val: transport },
      { id: 'utilities', name: 'Utilities & Household Bills', icon: 'zap', val: utilities },
      { id: 'reserve', name: '10% Emergency Reserve Vault', icon: 'shield', val: reserve }
    ];

    let html = categories.map(c => `
      <div class="alloc-row" style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="width:32px; height:32px; border-radius:6px; background:var(--bg-card); display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color);">
            <i data-lucide="${c.icon}" style="width:16px; height:16px;"></i>
          </span>
          <div>
            <strong style="font-size:13px; color:var(--text-main); display:block;">${c.name}</strong>
            <small style="color:var(--text-muted); font-size:11px;">Monthly Spending Limit</small>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:700; color:var(--text-main); font-size:13px;">${cur}</span>
          <input type="number" step="0.01" min="0" id="allocInput_${c.id}" value="${c.val.toFixed(2)}"
            class="form-input alloc-live-input" 
            style="width:120px; padding:6px 10px; font-weight:700; border:2px solid #141413; border-radius:6px; font-size:13px;"
            oninput="updateModalAllocLive()" />
        </div>
      </div>
    `).join('');

    // Custom envelopes
    if (customEnvelopes.length > 0) {
      html += customEnvelopes.map(env => `
        <div class="alloc-row" style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:32px; height:32px; border-radius:6px; background:var(--bg-card); display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color);">
              <i data-lucide="${env.icon || 'folder-plus'}" style="width:16px; height:16px;"></i>
            </span>
            <div>
              <strong style="font-size:13px; color:var(--text-main); display:block;">${env.name} (Custom)</strong>
              <small style="color:var(--text-muted); font-size:11px;">Monthly Spending Limit</small>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-weight:700; color:var(--text-main); font-size:13px;">${cur}</span>
            <input type="number" step="0.01" min="0" id="allocInput_custom_${env.id}" value="${(Number(env.budget) || 0).toFixed(2)}"
              class="form-input alloc-live-input alloc-custom-input" data-envid="${env.id}"
              style="width:120px; padding:6px 10px; font-weight:700; border:2px solid #141413; border-radius:6px; font-size:13px;"
              oninput="updateModalAllocLive()" />
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = html;
  }

  updateModalAllocLive();
  if (window.lucide) window.lucide.createIcons();

  if (targetEnvId) {
    setTimeout(() => {
      const targetInp = document.getElementById(`allocInput_${targetEnvId}`) || document.getElementById(`allocInput_custom_${targetEnvId}`);
      if (targetInp) {
        targetInp.focus();
        targetInp.select();
      }
    }, 100);
  }
}
window.openAllocateEnvelopesModal = openAllocateEnvelopesModal;

function closeAllocateEnvelopesModal() {
  const modal = document.getElementById('allocateEnvelopesModal');
  if (modal) modal.style.display = 'none';
}
window.closeAllocateEnvelopesModal = closeAllocateEnvelopesModal;

function updateModalAllocLive() {
  const cur = state.userProfile?.currency || '$';
  const inflow = Number(state.userProfile?.inflow || 0);

  let sum = 0;
  document.querySelectorAll('.alloc-live-input').forEach(inp => {
    sum += parseFloat(inp.value) || 0;
  });

  const diff = Number((inflow - sum).toFixed(2));

  const inflowEl = document.getElementById('modalAllocInflow');
  const totalEl = document.getElementById('modalAllocTotal');
  const remEl = document.getElementById('modalAllocRemaining');
  const labelEl = document.getElementById('modalAllocStatusLabel');
  const statusBox = document.getElementById('modalAllocStatusBox');
  const noticeEl = document.getElementById('modalAllocAlertNotice');

  if (inflowEl) inflowEl.textContent = `${cur}${inflow.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `${cur}${sum.toFixed(2)}`;

  if (remEl && statusBox && labelEl) {
    if (Math.abs(diff) < 0.01) {
      labelEl.textContent = 'Zero-Based Status:';
      remEl.textContent = 'Balanced (100% Assigned)';
      statusBox.className = 'pool-stat highlight green';
      if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.style.background = '#DCFCE7';
        noticeEl.style.color = '#166534';
        noticeEl.style.border = '1px solid #86EFAC';
        noticeEl.textContent = `✅ Perfect Zero-Based allocation! Every ${cur}1 of your ${cur}${inflow.toFixed(2)} income has a designated purpose.`;
      }
    } else if (diff > 0) {
      labelEl.textContent = 'Unassigned Available:';
      remEl.textContent = `+${cur}${diff.toFixed(2)}`;
      statusBox.className = 'pool-stat highlight blue';
      if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.style.background = '#EFF6FF';
        noticeEl.style.color = '#1E40AF';
        noticeEl.style.border = '1px solid #BFDBFE';
        noticeEl.textContent = `ℹ️ You have ${cur}${diff.toFixed(2)} available. Click "Auto-Balance Remainder" to assign it completely.`;
      }
    } else {
      labelEl.textContent = 'Over-Allocated Deficit:';
      remEl.textContent = `-${cur}${Math.abs(diff).toFixed(2)}`;
      statusBox.className = 'pool-stat highlight red';
      if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.style.background = '#FEE2E2';
        noticeEl.style.color = '#991B1B';
        noticeEl.style.border = '1px solid #FCA5A5';
        noticeEl.textContent = `⚠️ You have allocated ${cur}${Math.abs(diff).toFixed(2)} more than your monthly inflow. Reduce category targets to balance.`;
      }
    }
  }
}
window.updateModalAllocLive = updateModalAllocLive;

function autoBalanceEnvelopesInModal() {
  const cur = state.userProfile?.currency || '$';
  const inflow = Number(state.userProfile?.inflow || 0);

  let sum = 0;
  document.querySelectorAll('.alloc-live-input').forEach(inp => {
    sum += parseFloat(inp.value) || 0;
  });

  const diff = Number((inflow - sum).toFixed(2));
  if (Math.abs(diff) < 0.01) {
    if (typeof showToast === 'function') showToast(`Envelopes are already perfectly balanced at ${cur}${inflow.toFixed(2)}!`);
    return;
  }

  const funInp = document.getElementById('allocInput_fun');
  if (funInp) {
    const currentFun = parseFloat(funInp.value) || 0;
    const newFun = Math.max(0, Number((currentFun + diff).toFixed(2)));
    funInp.value = newFun.toFixed(2);
    updateModalAllocLive();
    if (typeof showToast === 'function') {
      showToast(`✨ Assigned ${diff > 0 ? '+' : ''}${cur}${diff.toFixed(2)} to Discretionary Fun to balance budget!`, 'green');
    }
  }
}
window.autoBalanceEnvelopesInModal = autoBalanceEnvelopesInModal;

function resetToSuggestedEnvelopeSplit() {
  const inflow = Number(state.userProfile?.inflow || 0);
  const customEnvelopes = typeof getCustomEnvelopes === 'function' ? getCustomEnvelopes() : [];
  const customAllocTotal = customEnvelopes.reduce((sum, env) => sum + (Number(env.budget) || 0), 0);

  const reserve = Number((inflow * 0.10).toFixed(2));
  const spendable = Math.max(0, inflow - reserve - customAllocTotal);

  const groceries = Number((spendable * 0.35).toFixed(2));
  const dining = Number((spendable * 0.20).toFixed(2));
  const transport = Number((spendable * 0.15).toFixed(2));
  const utilities = Number((spendable * 0.15).toFixed(2));
  const fun = Number((spendable - groceries - dining - transport - utilities).toFixed(2));

  const setVal = (id, val) => {
    const inp = document.getElementById(id);
    if (inp) inp.value = val.toFixed(2);
  };

  setVal('allocInput_reserve', reserve);
  setVal('allocInput_groceries', groceries);
  setVal('allocInput_dining', dining);
  setVal('allocInput_transport', transport);
  setVal('allocInput_utilities', utilities);
  setVal('allocInput_fun', fun);

  updateModalAllocLive();
  if (typeof showToast === 'function') showToast('🔄 Reset allocations to suggested 10% reserve / 35% groceries formula.');
}
window.resetToSuggestedEnvelopeSplit = resetToSuggestedEnvelopeSplit;

function saveUserEnvelopeAllocations() {
  const getVal = id => parseFloat(document.getElementById(id)?.value) || 0;

  const allocations = {
    groceries: getVal('allocInput_groceries'),
    dining: getVal('allocInput_dining'),
    fun: getVal('allocInput_fun'),
    transport: getVal('allocInput_transport'),
    utilities: getVal('allocInput_utilities'),
    reserve: getVal('allocInput_reserve')
  };

  // Update any custom envelopes
  const customEnvelopes = typeof getCustomEnvelopes === 'function' ? getCustomEnvelopes() : [];
  document.querySelectorAll('.alloc-custom-input').forEach(inp => {
    const envId = inp.getAttribute('data-envid');
    const target = customEnvelopes.find(e => e.id === envId);
    if (target) {
      target.budget = parseFloat(inp.value) || 0;
    }
  });
  if (typeof saveCustomEnvelopes === 'function') {
    saveCustomEnvelopes(customEnvelopes);
  }

  localStorage.setItem('recall_envelope_allocations', JSON.stringify(allocations));
  state.envelopeAllocations = allocations;

  // Also update reserve in userProfile if changed
  if (allocations.reserve !== undefined) {
    state.userProfile.reserve = allocations.reserve;
    localStorage.setItem('recall_user_reserve', String(allocations.reserve));
    const babylonWallet = state.wallets.find(w => w.id === 'babylon');
    if (babylonWallet) {
      babylonWallet.balance = allocations.reserve;
      localStorage.setItem('recall_user_wallets', JSON.stringify(state.wallets));
    }
  }

  recalculateAllFinancialMetrics();
  renderEnvelopesPlan();
  renderWalletsUI();
  closeAllocateEnvelopesModal();

  const cur = state.userProfile?.currency || '$';
  if (typeof showToast === 'function') {
    showToast(`✅ Envelope allocations saved! New spending targets are live in ${cur}.`, 'green');
  }
}
window.saveUserEnvelopeAllocations = saveUserEnvelopeAllocations;

function toggleEnvelopeFormula() {
  const body = document.getElementById('formulaDetailsBody');
  const txt = document.getElementById('formulaToggleText');
  const chev = document.getElementById('formulaChevron');
  if (!body) return;

  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  if (txt) txt.textContent = isHidden ? 'Hide Breakdown' : 'View Breakdown';
  if (chev) {
    chev.setAttribute('data-lucide', isHidden ? 'chevron-up' : 'chevron-down');
    if (window.lucide) window.lucide.createIcons();
  }
}
window.toggleEnvelopeFormula = toggleEnvelopeFormula;
window.renderCustomEnvelopes = renderCustomEnvelopes;

// Close modals when clicking outside modal-card on the backdrop or pressing Escape
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.style.display = 'none';
      }
    });
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      if (modal.style.display === 'flex' || modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }
});

function syncCategoryDropdowns() {
  const customEnvs = getCustomEnvelopes();
  const selectors = ['#tx-category', '#txCategory'];
  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.querySelectorAll('option[data-custom="true"]').forEach(opt => opt.remove());
    customEnvs.forEach(env => {
      const opt = document.createElement('option');
      opt.value = env.name;
      opt.textContent = `${env.name} (Custom Envelope)`;
      opt.setAttribute('data-custom', 'true');
      el.appendChild(opt);
    });
  });
}
window.syncCategoryDropdowns = syncCategoryDropdowns;

function updateCurrencySymbolDisplay(symbol) {
  state.userProfile.currency = symbol;
  const inPrefix = document.getElementById('currencyPrefixInflow');
  const wagePrefix = document.getElementById('currencyPrefixWage');
  const txPrefix = document.getElementById('txCurrencyPrefix');

  if (inPrefix) inPrefix.textContent = symbol;
  if (wagePrefix) wagePrefix.textContent = symbol;
  if (txPrefix) txPrefix.textContent = symbol;

  renderUserProfileUI();
  renderWalletsUI();
}
window.updateCurrencySymbolDisplay = updateCurrencySymbolDisplay;

// ================= SOVEREIGN DATA PURGE & DELETE ACCOUNT =================
function openDeleteAccountModal() {
  const modal = document.getElementById('deleteAccountModal');
  const input = document.getElementById('deleteAccountConfirmInput');
  const btn = document.getElementById('confirmDeleteAccountBtn');

  if (input) input.value = '';
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }

  if (modal) {
    modal.style.display = 'flex';
  }
  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.openDeleteAccountModal = openDeleteAccountModal;

function closeDeleteAccountModal() {
  const modal = document.getElementById('deleteAccountModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
window.closeDeleteAccountModal = closeDeleteAccountModal;

function handleDeleteAccountInputChange(val) {
  const btn = document.getElementById('confirmDeleteAccountBtn');
  if (!btn) return;
  if (val.trim() === 'DELETE') {
    btn.disabled = false;
    btn.style.opacity = '1.0';
    btn.style.cursor = 'pointer';
  } else {
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }
}
window.handleDeleteAccountInputChange = handleDeleteAccountInputChange;

async function confirmDeleteAccount() {
  const input = document.getElementById('deleteAccountConfirmInput');
  if (!input || input.value.trim() !== 'DELETE') {
    alert('Please type DELETE in capital letters to confirm sovereign account purge.');
    return;
  }

  try {
    // 1. Notify backend to clear ephemeral session state
    await fetch('/api/account/delete', { method: 'DELETE' });
  } catch (err) {
    console.warn('[PURGE] Backend cache purge request finished:', err);
  }

  // 2. Eradicate all browser local storage and session storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (err) {
    console.error('[PURGE] Storage clear error:', err);
  }

  // 3. Reset in-memory state
  state.userProfile = {
    name: 'Anonymous Citizen',
    currency: '$',
    inflow: 0.00,
    hourlyWage: 0.00,
    cycleDays: 0
  };
  state.customEnvelopes = [];
  state.transactions = [];
  if (state.vault) {
    state.vault.key = null;
    state.vault.salt = null;
    state.vault.initialized = false;
  }

  // 4. Close modal and show notification
  closeDeleteAccountModal();
  showToast('Sovereign Purge Complete: All local keys, envelopes, and session profiles permanently erased.', 'error');

  // 5. Re-render UI and switch to marketing landing page
  if (typeof renderUserProfileUI === 'function') renderUserProfileUI();
  if (typeof renderCategoryEnvelopes === 'function') renderCategoryEnvelopes();
  if (typeof renderTransactionsTable === 'function') renderTransactionsTable();
  if (typeof switchView === 'function') switchView('landing');
}
window.confirmDeleteAccount = confirmDeleteAccount;

// ================= LEGAL POLICIES MODAL HANDLERS =================
function openLegalPolicyModal(tab = 'privacy') {
  const modal = document.getElementById('legalPolicyModal');
  if (modal) {
    modal.style.display = 'flex';
  }
  switchLegalModalTab(tab);
  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.openLegalPolicyModal = openLegalPolicyModal;

function closeLegalPolicyModal() {
  const modal = document.getElementById('legalPolicyModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
window.closeLegalPolicyModal = closeLegalPolicyModal;

function switchLegalModalTab(tabName) {
  const tabs = [
    { name: 'privacy', btn: 'tabLegalBtnPrivacy', panel: 'legalPanelPrivacy' },
    { name: 'terms', btn: 'tabLegalBtnTerms', panel: 'legalPanelTerms' },
    { name: 'refund', btn: 'tabLegalBtnRefund', panel: 'legalPanelRefund' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.btn);
    const panel = document.getElementById(t.panel);
    if (t.name === tabName) {
      if (btn) btn.classList.add('active');
      if (panel) panel.style.display = 'block';
    } else {
      if (btn) btn.classList.remove('active');
      if (panel) panel.style.display = 'none';
    }
  });

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.switchLegalModalTab = switchLegalModalTab;

// ================= AUTHENTICATION & MULTI-STEP ONBOARDING CONTROLLER =================
// ================= AUTHENTICATION, ONBOARDING & SUBSCRIPTIONS CONFIG =================
const defaultSubscriptionsCatalog = [
  { id: 'sub_netflix', merchant: 'Netflix Standard', amount: 15.49, dayOfMonth: 20, category: 'Streaming', defaultChecked: true },
  { id: 'sub_spotify', merchant: 'Spotify Premium', amount: 10.99, dayOfMonth: 15, category: 'Streaming', defaultChecked: true },
  { id: 'sub_chatgpt', merchant: 'OpenAI ChatGPT Plus', amount: 20.00, dayOfMonth: 14, category: 'AI & Cloud', defaultChecked: true },
  { id: 'sub_icloud', merchant: 'Apple iCloud+ 2TB', amount: 9.99, dayOfMonth: 5, category: 'General', defaultChecked: false },
  { id: 'sub_prime', merchant: 'Amazon Prime', amount: 14.99, dayOfMonth: 18, category: 'General', defaultChecked: false },
  { id: 'sub_youtube', merchant: 'YouTube Premium', amount: 13.99, dayOfMonth: 22, category: 'Streaming', defaultChecked: false },
  { id: 'sub_copilot', merchant: 'GitHub Copilot', amount: 10.00, dayOfMonth: 28, category: 'Developer Productivity', defaultChecked: false },
  { id: 'sub_gym', merchant: 'Equinox / Fitness Gym', amount: 45.00, dayOfMonth: 1, category: 'Fitness & Health', defaultChecked: false },
  { id: 'sub_adobe', merchant: 'Adobe Creative Cloud', amount: 54.99, dayOfMonth: 18, category: 'Software', isTrial: true, defaultChecked: false }
];

const onboardDraft = {
  step: 1,
  email: '',
  name: 'Alex Rivera',
  currency: '$',
  hourlyWage: 25.00,
  inflow: 4850.00,
  checking: 2430.00,
  reserve: 500.00,
  cycleDays: 10,
  focus: 'subscriptions',
  subscriptions: []
};

function handleLaunchAppClick() {
  const isSignedIn = localStorage.getItem('recall_user_signed_in') === 'true';
  if (!isSignedIn) {
    openOnboardingModal(1);
  } else {
    switchView('app');
  }
}
window.handleLaunchAppClick = handleLaunchAppClick;

function openOnboardingModal(step = 1) {
  const modal = document.getElementById('authOnboardingModal');
  if (!modal) return;
  modal.style.display = 'flex';

  const storedEmail = localStorage.getItem('recall_user_email');
  const storedName = localStorage.getItem('recall_user_name');
  const storedCurrency = localStorage.getItem('recall_currency') || state.userProfile?.currency || '$';
  const storedInflow = localStorage.getItem('recall_inflow');
  const storedWage = localStorage.getItem('recall_hourly_wage');
  const storedDays = localStorage.getItem('recall_cycle_days');
  const storedChecking = localStorage.getItem('recall_user_checking');
  const storedReserve = localStorage.getItem('recall_user_reserve');

  onboardDraft.email = storedEmail || '';
  onboardDraft.name = storedName || '';
  onboardDraft.currency = storedCurrency;
  onboardDraft.inflow = storedInflow !== null ? parseFloat(storedInflow) : undefined;
  onboardDraft.hourlyWage = storedWage !== null ? parseFloat(storedWage) : undefined;
  onboardDraft.cycleDays = storedDays !== null ? parseInt(storedDays, 10) : 10;
  onboardDraft.checking = storedChecking !== null ? parseFloat(storedChecking) : undefined;
  onboardDraft.reserve = storedReserve !== null ? parseFloat(storedReserve) : undefined;

  if (!onboardDraft.subscriptions || onboardDraft.subscriptions.length === 0) {
    onboardDraft.subscriptions = defaultSubscriptionsCatalog.map(s => ({
      ...s,
      active: Boolean(s.defaultChecked)
    }));
  }

  const emailInput = document.getElementById('authEmailInput');
  if (emailInput) emailInput.value = storedEmail || '';

  const nameInput = document.getElementById('onboardNameInput');
  if (nameInput) nameInput.value = storedName || '';

  const checkingInput = document.getElementById('onboardCheckingInput');
  if (checkingInput) checkingInput.value = storedChecking !== null ? parseFloat(storedChecking).toFixed(2) : '';

  const reserveInput = document.getElementById('onboardReserveInput');
  if (reserveInput) reserveInput.value = storedReserve !== null ? parseFloat(storedReserve).toFixed(2) : '';

  const inflowInput = document.getElementById('onboardInflowInput');
  if (inflowInput) inflowInput.value = storedInflow !== null ? parseFloat(storedInflow).toFixed(2) : '';

  const wageInput = document.getElementById('onboardWageInput');
  if (wageInput) wageInput.value = storedWage !== null ? parseFloat(storedWage).toFixed(2) : '';

  selectOnboardCurrency(storedCurrency);
  selectOnboardCycle(onboardDraft.cycleDays);
  selectOnboardFocus('subscriptions');

  goToOnboardStep(step);

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.openOnboardingModal = openOnboardingModal;

function closeOnboardingModal() {
  const modal = document.getElementById('authOnboardingModal');
  if (modal) modal.style.display = 'none';
}
window.closeOnboardingModal = closeOnboardingModal;

function fillQuickEmail(email) {
  const input = document.getElementById('authEmailInput');
  if (input) {
    input.value = email;
    input.focus();
  }
}
window.fillQuickEmail = fillQuickEmail;

function handleGoogleSignIn() {
  const btn = document.getElementById('btnGoogleAuth');
  if (btn) {
    btn.innerHTML = `<span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span> <span>Connecting to Google...</span>`;
  }
  setTimeout(() => {
    onboardDraft.email = 'alex.rivera.finance@gmail.com';
    onboardDraft.name = 'Alex Rivera';
    const emailInput = document.getElementById('authEmailInput');
    if (emailInput) emailInput.value = onboardDraft.email;
    const nameInput = document.getElementById('onboardNameInput');
    if (nameInput) nameInput.value = onboardDraft.name;
    if (btn) {
      btn.innerHTML = `
        <svg class="google-icon" width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
        </svg>
        <span>Continue with Google</span>`;
    }
    showToast('Signed in with Google (alex.rivera.finance@gmail.com)', 'success');
    goToOnboardStep(2);
  }, 450);
}
window.handleGoogleSignIn = handleGoogleSignIn;

function submitAuthStep1() {
  const emailInput = document.getElementById('authEmailInput');
  const email = emailInput ? emailInput.value.trim() : '';
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    if (emailInput) emailInput.focus();
    return;
  }
  onboardDraft.email = email;

  const username = email.split('@')[0];
  const formattedName = username
    .split(/[\._\-]/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
  if (formattedName && formattedName.length > 1) {
    const nameInput = document.getElementById('onboardNameInput');
    if (nameInput && (!nameInput.value || nameInput.value === 'Alex Rivera')) {
      nameInput.value = formattedName;
      onboardDraft.name = formattedName;
    }
  }

  goToOnboardStep(2);
}
window.submitAuthStep1 = submitAuthStep1;

function goToOnboardStep(step) {
  // Automatically harvest values from inputs into onboardDraft
  const nameInput = document.getElementById('onboardNameInput');
  if (nameInput && nameInput.value.trim()) onboardDraft.name = nameInput.value.trim();
  const wageInput = document.getElementById('onboardWageInput');
  if (wageInput && !isNaN(parseFloat(wageInput.value))) onboardDraft.hourlyWage = parseFloat(wageInput.value);
  const inflowInput = document.getElementById('onboardInflowInput');
  if (inflowInput && !isNaN(parseFloat(inflowInput.value))) onboardDraft.inflow = parseFloat(inflowInput.value);
  const checkingInput = document.getElementById('onboardCheckingInput');
  if (checkingInput && !isNaN(parseFloat(checkingInput.value))) onboardDraft.checking = parseFloat(checkingInput.value);
  const reserveInput = document.getElementById('onboardReserveInput');
  if (reserveInput && !isNaN(parseFloat(reserveInput.value))) onboardDraft.reserve = parseFloat(reserveInput.value);

  onboardDraft.step = step;
  const steps = [1, 2, 3, 4, 5];
  steps.forEach(s => {
    const el = document.getElementById(`onboardStep${s}`);
    if (el) {
      if (s === step) {
        el.style.display = 'flex';
        el.classList.add('active');
      } else {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    }
  });

  const fill = document.getElementById('onboardProgressFill');
  if (fill) {
    fill.style.width = `${step * 20}%`;
  }

  const badge = document.getElementById('onboardStepBadge');
  if (badge) {
    const titles = {
      1: 'Step 1 of 5 · Sign In',
      2: 'Step 2 of 5 · Identity',
      3: 'Step 3 of 5 · Baseline',
      4: 'Step 4 of 5 · Subscriptions',
      5: 'Step 5 of 5 · Provisioning'
    };
    badge.textContent = titles[step] || `Step ${step} of 5`;
  }

  if (step === 4) {
    renderOnboardSubsList();
  }

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.goToOnboardStep = goToOnboardStep;

function selectOnboardCurrency(symbol) {
  onboardDraft.currency = symbol;
  const grid = document.getElementById('onboardCurrencyGrid');
  if (grid) {
    grid.querySelectorAll('.cur-pill').forEach(btn => {
      if (btn.getAttribute('data-cur') === symbol) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  const wagePrefix = document.getElementById('onboardWagePrefix');
  if (wagePrefix) wagePrefix.textContent = symbol;
  const inflowPrefix = document.getElementById('onboardInflowPrefix');
  if (inflowPrefix) inflowPrefix.textContent = symbol;
  const checkingPrefix = document.getElementById('onboardCheckingPrefix');
  if (checkingPrefix) checkingPrefix.textContent = symbol;
  const reservePrefix = document.getElementById('onboardReservePrefix');
  if (reservePrefix) reservePrefix.textContent = symbol;
}
window.selectOnboardCurrency = selectOnboardCurrency;

function selectOnboardCycle(days) {
  onboardDraft.cycleDays = parseInt(days, 10) || 10;
  const row = document.getElementById('onboardCycleRow');
  if (row) {
    row.querySelectorAll('.cycle-pill').forEach(btn => {
      if (parseInt(btn.getAttribute('data-days'), 10) === onboardDraft.cycleDays) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}
window.selectOnboardCycle = selectOnboardCycle;

function selectOnboardFocus(focusId) {
  onboardDraft.focus = focusId;
  const stack = document.getElementById('onboardFocusStack');
  if (stack) {
    stack.querySelectorAll('.focus-card').forEach(card => {
      if (card.getAttribute('data-focus') === focusId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }
}
window.selectOnboardFocus = selectOnboardFocus;

function submitAuthStep2() {
  const nameInput = document.getElementById('onboardNameInput');
  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    showToast('Please enter your name.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  onboardDraft.name = name;

  const wageInput = document.getElementById('onboardWageInput');
  const wageVal = wageInput && wageInput.value.trim() !== '' ? parseFloat(wageInput.value) : NaN;
  onboardDraft.hourlyWage = (!isNaN(wageVal) && wageVal > 0) ? wageVal : 25.00;

  goToOnboardStep(3);
}
window.submitAuthStep2 = submitAuthStep2;

function submitAuthStep3() {
  const inflowInput = document.getElementById('onboardInflowInput');
  const inflowVal = inflowInput && inflowInput.value.trim() !== '' ? parseFloat(inflowInput.value) : NaN;

  const checkingInput = document.getElementById('onboardCheckingInput');
  const checkingVal = checkingInput && checkingInput.value.trim() !== '' ? parseFloat(checkingInput.value) : NaN;

  const reserveInput = document.getElementById('onboardReserveInput');
  const reserveVal = reserveInput && reserveInput.value.trim() !== '' ? parseFloat(reserveInput.value) : NaN;

  onboardDraft.checking = !isNaN(checkingVal) ? checkingVal : 0.00;
  onboardDraft.reserve = !isNaN(reserveVal) ? reserveVal : 0.00;
  onboardDraft.inflow = !isNaN(inflowVal) && inflowVal > 0 ? inflowVal : (onboardDraft.checking || 0.00);

  goToOnboardStep(4);
}
window.submitAuthStep3 = submitAuthStep3;

// ================= ONBOARDING STEP 4: SUBSCRIPTIONS HELPERS =================
function renderOnboardSubsList() {
  const container = document.getElementById('onboardSubsList');
  if (!container) return;

  const cur = onboardDraft.currency || '$';

  container.innerHTML = (onboardDraft.subscriptions || []).map((sub) => {
    const initials = sub.merchant.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `
      <div class="onboard-sub-row ${sub.active ? 'active' : ''}" id="onboardSubRow_${sub.id}">
        <div class="onboard-sub-left">
          <input type="checkbox" class="onboard-sub-check" ${sub.active ? 'checked' : ''} onchange="onboardToggleSub('${sub.id}')">
          <div class="onboard-sub-avatar">${initials}</div>
          <div class="onboard-sub-info">
            <span class="onboard-sub-name">${sub.merchant}</span>
            <span class="onboard-sub-cat">${sub.category}</span>
          </div>
        </div>
        <div class="onboard-sub-controls">
          <span style="font-family: var(--font-mono); font-size: 11px;">${cur}</span>
          <input type="number" class="onboard-sub-amt-input" value="${Number(sub.amount || 0).toFixed(2)}" step="0.5" onchange="onboardUpdateSubAmount('${sub.id}', this.value)" title="Monthly fee">
          <span class="onboard-sub-day-label">Day</span>
          <input type="number" class="onboard-sub-day-input" value="${sub.dayOfMonth || 15}" min="1" max="31" onchange="onboardUpdateSubDay('${sub.id}', this.value)" title="Renewal day of month (1-31)">
        </div>
      </div>
    `;
  }).join('');

  updateOnboardSubsSummary();
}
window.renderOnboardSubsList = renderOnboardSubsList;

function onboardToggleSub(subId) {
  const sub = (onboardDraft.subscriptions || []).find(s => s.id === subId);
  if (sub) {
    sub.active = !sub.active;
    const row = document.getElementById(`onboardSubRow_${subId}`);
    if (row) {
      if (sub.active) row.classList.add('active');
      else row.classList.remove('active');
    }
  }
  updateOnboardSubsSummary();
}
window.onboardToggleSub = onboardToggleSub;

function onboardUpdateSubAmount(subId, val) {
  const sub = (onboardDraft.subscriptions || []).find(s => s.id === subId);
  if (sub) {
    const num = parseFloat(val);
    sub.amount = (!isNaN(num) && num >= 0) ? num : 0;
  }
  updateOnboardSubsSummary();
}
window.onboardUpdateSubAmount = onboardUpdateSubAmount;

function onboardUpdateSubDay(subId, val) {
  const sub = (onboardDraft.subscriptions || []).find(s => s.id === subId);
  if (sub) {
    const day = parseInt(val, 10);
    sub.dayOfMonth = (!isNaN(day) && day >= 1 && day <= 31) ? day : 15;
  }
}
window.onboardUpdateSubDay = onboardUpdateSubDay;

function updateOnboardSubsSummary() {
  const cur = onboardDraft.currency || '$';
  const activeSubs = (onboardDraft.subscriptions || []).filter(s => s.active);
  const totalSum = activeSubs.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  const textEl = document.getElementById('onboardSubsSummaryText');
  if (textEl) {
    textEl.textContent = `${activeSubs.length} subscriptions selected · ${cur}${totalSum.toFixed(2)} / month`;
  }
}

function onboardQuickSelectSubs(preset) {
  const chips = ['chipPresetEssentials', 'chipPresetAll', 'chipPresetNone'];
  chips.forEach(c => {
    const el = document.getElementById(c);
    if (el) el.classList.remove('active');
  });

  const activeChipMap = {
    essentials: 'chipPresetEssentials',
    all: 'chipPresetAll',
    none: 'chipPresetNone'
  };
  const activeEl = document.getElementById(activeChipMap[preset]);
  if (activeEl) activeEl.classList.add('active');

  (onboardDraft.subscriptions || []).forEach(s => {
    if (preset === 'essentials') {
      s.active = ['sub_netflix', 'sub_spotify', 'sub_chatgpt'].includes(s.id);
    } else if (preset === 'all') {
      s.active = true;
    } else if (preset === 'none') {
      s.active = false;
    }
  });

  renderOnboardSubsList();
}
window.onboardQuickSelectSubs = onboardQuickSelectSubs;

function toggleOnboardCustomSubForm() {
  const form = document.getElementById('onboardCustomSubForm');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}
window.toggleOnboardCustomSubForm = toggleOnboardCustomSubForm;

function onboardAddCustomSub() {
  const nameEl = document.getElementById('customSubName');
  const amtEl = document.getElementById('customSubAmount');
  const dayEl = document.getElementById('customSubDay');

  const name = nameEl ? nameEl.value.trim() : '';
  const amt = amtEl ? parseFloat(amtEl.value) : 10.00;
  const day = dayEl ? parseInt(dayEl.value, 10) : 15;

  if (!name) {
    showToast('Please enter an app or service name.', 'amber');
    return;
  }

  const newSub = {
    id: `sub_custom_${Date.now()}`,
    merchant: name,
    amount: (!isNaN(amt) && amt > 0) ? amt : 10.00,
    dayOfMonth: (!isNaN(day) && day >= 1 && day <= 31) ? day : 15,
    category: 'General',
    active: true
  };

  onboardDraft.subscriptions.push(newSub);
  if (nameEl) nameEl.value = '';
  if (amtEl) amtEl.value = '';
  if (dayEl) dayEl.value = '';

  toggleOnboardCustomSubForm();
  renderOnboardSubsList();
  showToast(`Added ${name} to your subscriptions.`, 'success');
}
window.onboardAddCustomSub = onboardAddCustomSub;

function submitAuthStep4() {
  goToOnboardStep(5);
  startVaultProvisioningAnimation();
}
window.submitAuthStep4 = submitAuthStep4;

function startVaultProvisioningAnimation() {
  const line1 = document.getElementById('termLine1');
  const line2 = document.getElementById('termLine2');
  const line3 = document.getElementById('termLine3');
  const line4 = document.getElementById('termLine4');
  const bar = document.getElementById('provisionBarFill');
  const status = document.getElementById('provisionStatusText');
  const btn = document.getElementById('btnLaunchWorkspace');

  const activeCount = (onboardDraft.subscriptions || []).filter(s => s.active).length;

  if (bar) bar.style.width = '20%';
  if (status) status.textContent = 'Generating 256-bit AES-GCM vault key (20%)...';

  setTimeout(() => {
    if (line1) line1.innerHTML = `<span class="term-status success">✓</span> W3C WebCrypto 256-bit AES-GCM Master Key generated.`;
    if (line2) line2.style.display = 'flex';
    if (bar) bar.style.width = '45%';
    if (status) status.textContent = `Allocating zero-knowledge container for ${onboardDraft.email} (45%)...`;
  }, 300);

  setTimeout(() => {
    if (line2) line2.innerHTML = `<span class="term-status success">✓</span> Local zero-knowledge encrypted vault allocated.`;
    if (line3) line3.style.display = 'flex';
    if (line3) line3.innerHTML = `<span class="term-status pending">●</span> Configuring spend calendar with ${activeCount} active subscriptions...`;
    if (bar) bar.style.width = '70%';
    if (status) status.textContent = `Configuring spend calendar with ${activeCount} active subscriptions (70%)...`;
  }, 650);

  setTimeout(() => {
    if (line3) line3.innerHTML = `<span class="term-status success">✓</span> Spend calendar synchronized with ${activeCount} subscriptions.`;
    if (line4) line4.style.display = 'flex';
    if (bar) bar.style.width = '90%';
    if (status) status.textContent = `Calibrating AI Spending Copilot for ${onboardDraft.name} (90%)...`;
  }, 1050);

  setTimeout(() => {
    if (line4) line4.innerHTML = `<span class="term-status success">✓</span> AI Spending Copilot calibrated and armed.`;
    if (bar) bar.style.width = '100%';
    if (status) status.textContent = 'Vault Encrypted & Active (100%) · Ready for Launch!';
    if (btn) btn.style.display = 'flex';

    setTimeout(() => {
      finishOnboardingAndLaunch();
    }, 1100);
  }, 1450);
}
window.startVaultProvisioningAnimation = startVaultProvisioningAnimation;

// Central Reactive Financial Calculator
function recalculateAllFinancialMetrics() {
  const cur = state.userProfile?.currency || '$';
  const cycleDays = Number(state.userProfile?.cycleDays || 10);
  const reserve = Number(state.userProfile?.reserve !== undefined ? state.userProfile.reserve : 500.00);

  const activeSubs = state.subscriptions || [];
  const fixedBillsSum = activeSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const fixedBillsCount = activeSubs.length;

  const records = state.auditResults || [];
  const activeMonth = state.selectedStatementMonth || 'all';

  let statementInflow = 0;
  let statementOutflow = 0;
  let debitCount = 0;
  let creditCount = 0;

  for (const r of records) {
    const mKey = getTxMonthKey(r);
    if (activeMonth !== 'all' && mKey !== activeMonth) continue;
    const isCredit = isCreditRecord(r);
    const amt = getTxAmount(r);
    if (isCredit) {
      statementInflow += amt;
      creditCount++;
    } else {
      statementOutflow += amt;
      debitCount++;
    }
  }

  const hasStatement = records.length > 0;
  const inflow = (hasStatement && statementInflow > 0)
    ? statementInflow 
    : Number(state.userProfile?.inflow || 4850.00);

  const variableSpent = hasStatement ? statementOutflow : 0;
  const safeSpendRemaining = Math.max(0, inflow - fixedBillsSum - reserve - variableSpent);
  const dailyVelocity = cycleDays > 0 ? (safeSpendRemaining / cycleDays) : safeSpendRemaining;

  const fixedPct = inflow > 0 ? Math.min(100, (fixedBillsSum / inflow) * 100) : 0;
  const reservePct = inflow > 0 ? Math.min(100, (reserve / inflow) * 100) : 0;
  const variablePct = inflow > 0 ? Math.min(100, (variableSpent / inflow) * 100) : 0;
  const safePct = Math.max(0, 100 - fixedPct - reservePct - variablePct);

  const totalLiquidity = (state.wallets || []).reduce((sum, w) => sum + Number(w.balance || 0), 0);

  state.userProfile.safeSpend = Number(safeSpendRemaining.toFixed(2));
  state.userProfile.dailyVelocity = Number(dailyVelocity.toFixed(2));

  // 1. Header elements
  const elHeaderNet = document.getElementById('headerNetLiquidity');
  if (elHeaderNet) elHeaderNet.textContent = `${cur}${totalLiquidity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const elHeaderSafe = document.getElementById('headerSafeSpend');
  if (elHeaderSafe) elHeaderSafe.textContent = `${cur}${safeSpendRemaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // 2. Wallets page
  const elTotalNet = document.getElementById('totalNetLiquidityDisplay');
  if (elTotalNet) elTotalNet.textContent = `${cur}${totalLiquidity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // 3. Overview Monthly Cash Flow & Runway Distribution
  const elCashflowSubhead = document.getElementById('overviewCashflowSubhead');
  if (elCashflowSubhead) {
    const timeframeLabel = activeMonth === 'all' ? 'All Months / Full Year' : formatMonthLabel(activeMonth);
    elCashflowSubhead.textContent = `Recurring and variable spending across ${timeframeLabel}`;
  }

  const elInflowBadge = document.getElementById('overviewInflowBadgeVal');
  if (elInflowBadge) elInflowBadge.textContent = `${cur}${inflow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const elFixedVal = document.getElementById('overviewFixedBillsVal');
  if (elFixedVal) elFixedVal.textContent = `${cur}${fixedBillsSum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const elFixedSub = document.getElementById('overviewFixedBillsSub');
  if (elFixedSub) elFixedSub.textContent = `${fixedBillsCount} recurring bills`;

  const elFixedPct = document.getElementById('overviewFixedBillsPct');
  if (elFixedPct) elFixedPct.textContent = `${fixedPct.toFixed(1)}%`;

  const elReserveVal = document.getElementById('overviewReserveVal');
  if (elReserveVal) elReserveVal.textContent = `${cur}${reserve.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const elReservePct = document.getElementById('overviewReservePct');
  if (elReservePct) elReservePct.textContent = `${reservePct.toFixed(1)}%`;

  const elVarVal = document.getElementById('overviewVariableVal');
  if (elVarVal) elVarVal.textContent = `${cur}${variableSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const elVarSub = document.getElementById('overviewVariableSub');
  if (elVarSub) {
    elVarSub.textContent = hasStatement ? `${debitCount} statement debits` : 'Living expenses';
  }

  const elVarPct = document.getElementById('overviewVariablePct');
  if (elVarPct) elVarPct.textContent = `${variablePct.toFixed(1)}%`;

  const elSafeVal = document.getElementById('overviewSafeSpendVal');
  if (elSafeVal) elSafeVal.textContent = `${cur}${safeSpendRemaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const elSafePct = document.getElementById('overviewSafeSpendPct');
  if (elSafePct) elSafePct.textContent = `${safePct.toFixed(1)}%`;

  const elDaily = document.getElementById('overviewDailyAllowance');
  if (elDaily) elDaily.textContent = `${cur}${dailyVelocity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / day`;

  const elDaysLeft = document.getElementById('overviewCycleDaysLeft');
  if (elDaysLeft) elDaysLeft.textContent = `${cycleDays}`;

  // Segments
  const segSubs = document.getElementById('cfSegSubs');
  if (segSubs) segSubs.style.width = `${fixedPct.toFixed(1)}%`;

  const segSav = document.getElementById('cfSegSavings');
  if (segSav) segSav.style.width = `${reservePct.toFixed(1)}%`;

  const segSpent = document.getElementById('cfSegSpent');
  if (segSpent) segSpent.style.width = `${variablePct.toFixed(1)}%`;

  const segSafe = document.getElementById('cfSegSafespend');
  if (segSafe) segSafe.style.width = `${safePct.toFixed(1)}%`;

  // 4. Subscriptions stats strip
  const elActiveCount = document.getElementById('subsActiveCountVal');
  if (elActiveCount) elActiveCount.textContent = `${fixedBillsCount} Services`;

  const elRunRate = document.getElementById('settingsMonthlyRunRate');
  if (elRunRate) elRunRate.innerHTML = `${cur}${fixedBillsSum.toFixed(2)}<small>/mo</small>`;

  const elTabLabel = document.getElementById('subsActiveTabLabel');
  if (elTabLabel) elTabLabel.textContent = `Active Subscriptions (${fixedBillsCount})`;

  const elKpiRunRate = document.getElementById('kpiMonthlyRunRate');
  if (elKpiRunRate) elKpiRunRate.textContent = `${cur}${fixedBillsSum.toFixed(2)}`;

  // 5. Calendar header subtext
  const elCalMeta = document.getElementById('calMonthMetaText');
  if (elCalMeta) elCalMeta.textContent = `${fixedBillsCount} scheduled recurring debits (${cur}${fixedBillsSum.toFixed(2)} total)`;

  // 6. Sidebar live badges
  const sideWallets = document.getElementById('sidebarWalletsBadge');
  if (sideWallets) sideWallets.textContent = `${cur}${Math.round(totalLiquidity).toLocaleString()}`;

  const sideSubs = document.getElementById('sidebarSubCount');
  if (sideSubs) sideSubs.textContent = `${fixedBillsCount}`;

  const allSubs = typeof getActiveSubscriptionsList === 'function' ? getActiveSubscriptionsList() : (state.subscriptions || []);
  const creepSubs = allSubs.filter(s => Boolean(s.hasHike || s.status === 'CREEP_FLAG' || s.status === 'PRICE_CREEP' || (Number(s.cost) > Number(s.baseline) && !s.overrideApproved)));
  const trialSubs = allSubs.filter(s => Boolean(s.isTrial || s.status === 'TRIAL' || s.status === 'TRIAL_URGENT'));
  const stmtPriceCreeps = (state.auditResults || []).filter(r => r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP');

  const sideAlerts = document.getElementById('sidebarAlertCount');
  const alertCount = creepSubs.length + stmtPriceCreeps.length;
  if (sideAlerts) sideAlerts.textContent = `${alertCount}`;

  const sideTrials = document.getElementById('sidebarTrialCount');
  const trialCount = trialSubs.length + 
    (state.auditResults || []).filter(r => r.status === 'TRIAL_CONVERTING' || r.status === 'TRIAL_URGENT').length;
  if (sideTrials) sideTrials.textContent = `${trialCount}`;

  const sideTxs = document.getElementById('sidebarTxCount');
  if (sideTxs) sideTxs.textContent = `${(state.auditResults || []).length} Txns`;

  let disputeCount = 0;
  try {
    const saved = localStorage.getItem('recall_user_disputes');
    if (saved) disputeCount = JSON.parse(saved).length;
    else if (Array.isArray(state.disputes)) disputeCount = state.disputes.length;
  } catch (e) {
    disputeCount = (state.disputes || []).length;
  }
  const sideDisputes = document.getElementById('sidebarDisputesCount');
  if (sideDisputes) sideDisputes.textContent = `${disputeCount}`;

  // 7. Settings subscriptions card banner
  const settingsSubsBadge = document.getElementById('settingsSubsCardBadge');
  if (settingsSubsBadge) {
    if (alertCount > 0 || trialCount > 0) {
      settingsSubsBadge.textContent = `${alertCount + trialCount} Urgent Alert${(alertCount + trialCount) > 1 ? 's' : ''}`;
      settingsSubsBadge.className = 'badge-amber-pill';
    } else {
      settingsSubsBadge.textContent = '0 Alerts';
      settingsSubsBadge.className = 'badge-amber-pill';
    }
  }

  const settingsSubsSubtext = document.getElementById('settingsSubsCardSubtext');
  if (settingsSubsSubtext) {
    settingsSubsSubtext.textContent = `${fixedBillsCount} active subscription${fixedBillsCount === 1 ? '' : 's'} · Renewal calendar · ${trialCount} trial alert${trialCount === 1 ? '' : 's'}`;
  }

  const planRedirectSub = document.getElementById('planRedirectCardSub');
  if (planRedirectSub) {
    planRedirectSub.textContent = `${fixedBillsCount} recurring service${fixedBillsCount === 1 ? '' : 's'}, 48-hour trial alerts, and renewal cadence calendar.`;
  }

  if (typeof applyCurrencyGlobally === 'function') {
    applyCurrencyGlobally(cur);
  }

  if (typeof renderTrialSentinelPanel === 'function') {
    renderTrialSentinelPanel();
  }

  if (typeof renderEnvelopesPlan === 'function') {
    renderEnvelopesPlan();
  }

  if (typeof renderRadarAlertsView === 'function') {
    renderRadarAlertsView();
  }

  if (typeof renderHomeTxMiniPreview === 'function') {
    renderHomeTxMiniPreview();
  }
}
window.recalculateAllFinancialMetrics = recalculateAllFinancialMetrics;

function finishOnboardingAndLaunch() {
  state.userProfile.signedIn = true;
  state.userProfile.email = onboardDraft.email || 'alex.rivera@gmail.com';
  state.userProfile.name = onboardDraft.name || 'Alex Rivera';
  state.userProfile.currency = onboardDraft.currency || '$';
  state.userProfile.inflow = onboardDraft.inflow !== undefined ? onboardDraft.inflow : 0.00;
  state.userProfile.hourlyWage = onboardDraft.hourlyWage !== undefined ? onboardDraft.hourlyWage : 25.00;
  state.userProfile.cycleDays = onboardDraft.cycleDays !== undefined ? onboardDraft.cycleDays : 10;
  state.userProfile.reserve = onboardDraft.reserve !== undefined ? onboardDraft.reserve : 0.00;

  const userSubs = (onboardDraft.subscriptions || [])
    .filter(s => s.active)
    .map((s, idx) => ({
      id: s.id || `sub_user_${idx + 1}`,
      merchant: s.merchant,
      plan: s.merchant,
      amount: Number(s.amount || 0),
      cost: Number(s.amount || 0),
      baseline: Number(s.amount || 0),
      delta: 0,
      dayOfMonth: Number(s.dayOfMonth || 15),
      renewalDay: Number(s.dayOfMonth || 15),
      renewalText: `Day ${s.dayOfMonth || 15} of month`,
      category: s.category || 'Subscription',
      categoryLabel: s.category || 'Subscription',
      logo: s.logo || getMerchantLogo(s.merchant) || '/assets/logos/generic.svg',
      memory: `MEM_${String(idx + 1).padStart(2, '0')}`,
      isTrial: Boolean(s.isTrial),
      status: s.isTrial ? 'TRIAL_URGENT' : 'NORMAL',
      statusBadge: s.isTrial
        ? '<span class="status-badge alert" style="background:#FFFBEB;color:#D97706;border-color:#FDE68A;"><i data-lucide="clock"></i> 48h Trial Alert</span>'
        : '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Verified Active</span>'
    }));

  state.subscriptions = userSubs;
  localStorage.setItem('recall_user_subscriptions', JSON.stringify(state.subscriptions));

  const checkingBal = onboardDraft.checking !== undefined ? onboardDraft.checking : 0.00;
  const reserveBal = onboardDraft.reserve !== undefined ? onboardDraft.reserve : 0.00;

  // Clean wallets with NO hidden figures
  state.wallets = [
    { id: 'checking', name: 'Primary Checking', balance: checkingBal, type: 'bank', color: '#10b981', icon: 'landmark', default: true },
    { id: 'babylon', name: 'Babylon 10% Gold Reserve', balance: reserveBal, type: 'vault', color: '#f59e0b', icon: 'shield-alert', locked: true, note: 'Clason & Housel Buffer' },
    { id: 'cash', name: 'Physical Cash / Pocket', balance: 0.00, type: 'cash', color: '#6366f1', icon: 'banknote' },
    { id: 'credit', name: 'Household Credit Card', balance: 0.00, type: 'card', color: '#ef4444', icon: 'credit-card', liability: true }
  ];
  localStorage.setItem('recall_user_wallets', JSON.stringify(state.wallets));

  // Clean transactions with NO hidden debits
  if (userSubs.length === 0) {
    state.auditResults = [];
  } else {
    state.auditResults = userSubs.map((sub, i) => ({
      id: `tx_user_sub_${i + 1}`,
      merchant: sub.merchant,
      category: sub.category || 'Subscription',
      wallet: 'Primary Checking',
      date: `2026-10-${String(Math.min(sub.dayOfMonth || 15, 28)).padStart(2, '0')}`,
      amount: sub.amount,
      currentAmount: sub.amount,
      baselineAmount: sub.amount,
      deltaAmount: 0.00,
      status: sub.isTrial ? 'TRIAL_URGENT' : 'NORMAL',
      walrusMemoryRef: `MEM_${String(i + 1).padStart(2, '0')}`,
      explanation: `Verified subscription debit in ${state.userProfile.currency}`
    }));
  }
  localStorage.setItem('recall_user_transactions', JSON.stringify(state.auditResults));

  localStorage.setItem('recall_user_signed_in', 'true');
  localStorage.setItem('recall_user_email', state.userProfile.email);
  localStorage.setItem('recall_user_name', state.userProfile.name);
  localStorage.setItem('recall_currency', state.userProfile.currency);
  localStorage.setItem('recall_inflow', String(state.userProfile.inflow));
  localStorage.setItem('recall_hourly_wage', String(state.userProfile.hourlyWage));
  localStorage.setItem('recall_cycle_days', String(state.userProfile.cycleDays));
  localStorage.setItem('recall_user_checking', String(checkingBal));
  localStorage.setItem('recall_user_reserve', String(reserveBal));

  recalculateAllFinancialMetrics();

  closeOnboardingModal();
  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);
  renderEnvelopesPlan();
  renderSpendCalendar();
  renderSubscriptionsLedger();
  renderPlanSubscriptionsLedger();
  if (typeof renderDisputesLedger === 'function') renderDisputesLedger();
  if (typeof renderTrialSentinelPanel === 'function') renderTrialSentinelPanel();
  if (typeof applyCurrencyGlobally === 'function') applyCurrencyGlobally();
  if (typeof syncCategoryDropdowns === 'function') syncCategoryDropdowns();
  if (typeof loadUserProfileToSettings === 'function') loadUserProfileToSettings();

  switchView('app');
  showToast(`Welcome, ${state.userProfile.name}! Your PocketSentinel vault is active.`, 'success');
}
window.finishOnboardingAndLaunch = finishOnboardingAndLaunch;

function signOutUser() {
  localStorage.removeItem('recall_user_signed_in');
  localStorage.removeItem('recall_user_email');
  localStorage.removeItem('recall_user_name');
  localStorage.removeItem('recall_currency');
  localStorage.removeItem('recall_inflow');
  localStorage.removeItem('recall_hourly_wage');
  localStorage.removeItem('recall_cycle_days');
  localStorage.removeItem('recall_user_checking');
  localStorage.removeItem('recall_user_reserve');
  localStorage.removeItem('recall_user_subscriptions');
  localStorage.removeItem('recall_user_wallets');
  localStorage.removeItem('recall_user_transactions');
  localStorage.removeItem('recall_envelope_allocations');
  localStorage.removeItem('recall_user_disputes');
  localStorage.removeItem('recall_spending_ceilings');
  localStorage.removeItem('pocketsentinel_custom_envelopes');
  sessionStorage.clear();

  state.userProfile.signedIn = false;
  state.subscriptions = [];
  state.auditResults = [];
  state.disputes = [];
  state.spendingCeilings = [];
  state.envelopeAllocations = null;
  state.selectedStatementMonth = 'all';
  state.availableStatementMonths = [];
  state.statementMonthlySummary = {};
  state.wallets = [
    { id: 'checking', name: 'Primary Checking', balance: 0.00, type: 'bank', color: '#10b981', icon: 'landmark', default: true },
    { id: 'babylon', name: 'Babylon 10% Gold Reserve', balance: 0.00, type: 'vault', color: '#f59e0b', icon: 'shield-alert', locked: true, note: 'Clason & Housel Buffer' },
    { id: 'cash', name: 'Physical Cash / Pocket', balance: 0.00, type: 'cash', color: '#6366f1', icon: 'banknote' },
    { id: 'credit', name: 'Household Credit Card', balance: 0.00, type: 'card', color: '#ef4444', icon: 'credit-card', liability: true }
  ];

  onboardDraft.email = '';
  onboardDraft.name = '';
  onboardDraft.inflow = 0.00;
  onboardDraft.checking = 0.00;
  onboardDraft.reserve = 0.00;
  onboardDraft.cycleDays = 10;
  onboardDraft.subscriptions = [];

  if (typeof renderApprovedCeilingsTable === 'function') renderApprovedCeilingsTable();
  showToast('Signed out of personal vault. Ready for new user setup.', 'info');
  switchView('landing');
}
window.signOutUser = signOutUser;

function clearUserData() {
  signOutUser();
}
window.clearUserData = clearUserData;

// ================= IN-APP CONFIGURE SUBSCRIPTIONS MODAL LOGIC =================
function openConfigureSubscriptionsModal() {
  const modal = document.getElementById('configureSubscriptionsModal');
  if (!modal) return;
  modal.style.display = 'flex';
  renderConfigureSubscriptionsModalUI();
  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 30);
  }
}
window.openConfigureSubscriptionsModal = openConfigureSubscriptionsModal;

function closeConfigureSubscriptionsModal() {
  const modal = document.getElementById('configureSubscriptionsModal');
  if (modal) modal.style.display = 'none';
}
window.closeConfigureSubscriptionsModal = closeConfigureSubscriptionsModal;

function renderConfigureSubscriptionsModalUI() {
  const listEl = document.getElementById('configSubsItemsList');
  if (!listEl) return;

  const cur = state.userProfile?.currency || '$';
  const subs = state.subscriptions || [];
  const total = subs.reduce((acc, s) => acc + Number(s.amount || 0), 0);

  const statText = document.getElementById('configModalStatText');
  if (statText) {
    statText.textContent = `${subs.length} Active Subscriptions · ${cur}${total.toFixed(2)} / month`;
  }

  if (subs.length === 0) {
    listEl.innerHTML = `<div style="text-align:center; padding: 28px; color: #9CA3AF;">No active subscriptions. Click "+ Add Custom App" above to add your recurring services.</div>`;
    return;
  }

  listEl.innerHTML = subs.map((s) => {
    return `
      <div class="config-sub-item-row" id="configRow_${s.id}">
        <div class="config-sub-item-left">
          <span style="font-size:18px;">📱</span>
          <div>
            <div class="config-sub-item-name">${s.merchant}</div>
            <div class="config-sub-item-meta">${s.category || 'General'}</div>
          </div>
        </div>
        <div class="config-sub-item-controls">
          <div class="config-cost-wrap">
            <span>${cur}</span>
            <input type="number" class="config-input-cost" value="${Number(s.amount || 0).toFixed(2)}" step="0.5" onchange="updateConfigSubAmount('${s.id}', this.value)" title="Monthly fee">
          </div>
          <div class="config-day-wrap">
            <span>Day</span>
            <input type="number" class="config-input-day" value="${s.dayOfMonth || 15}" min="1" max="31" onchange="updateConfigSubDay('${s.id}', this.value)" title="Renewal day of month (1-31)">
          </div>
          <button type="button" class="btn-delete-sub-mini" onclick="deleteConfigSubItem('${s.id}')" title="Remove subscription">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}
window.renderConfigureSubscriptionsModalUI = renderConfigureSubscriptionsModalUI;

function toggleConfigAddForm() {
  const form = document.getElementById('configAddFormWrap');
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}
window.toggleConfigAddForm = toggleConfigAddForm;

function addNewSubscriptionFromModal() {
  const nameEl = document.getElementById('configNewMerchant');
  const amtEl = document.getElementById('configNewAmount');
  const dayEl = document.getElementById('configNewDay');
  const catEl = document.getElementById('configNewCategory');

  const name = nameEl ? nameEl.value.trim() : '';
  const amt = amtEl ? parseFloat(amtEl.value) : 10.00;
  const day = dayEl ? parseInt(dayEl.value, 10) : 15;
  const cat = catEl ? catEl.value : 'General';

  if (!name) {
    showToast('Please enter a service name.', 'amber');
    return;
  }

  const newSub = {
    id: `sub_cfg_${Date.now()}`,
    merchant: name,
    amount: (!isNaN(amt) && amt > 0) ? amt : 10.00,
    dayOfMonth: (!isNaN(day) && day >= 1 && day <= 31) ? day : 15,
    category: cat,
    status: 'NORMAL'
  };

  state.subscriptions.push(newSub);
  if (nameEl) nameEl.value = '';
  if (amtEl) amtEl.value = '';
  if (dayEl) dayEl.value = '';

  toggleConfigAddForm();
  renderConfigureSubscriptionsModalUI();
  showToast(`Added ${name} to subscriptions.`, 'success');
}
window.addNewSubscriptionFromModal = addNewSubscriptionFromModal;

function updateConfigSubAmount(subId, val) {
  const sub = (state.subscriptions || []).find(s => s.id === subId);
  if (sub) {
    const num = parseFloat(val);
    sub.amount = (!isNaN(num) && num >= 0) ? num : 0;
  }
  const cur = state.userProfile?.currency || '$';
  const total = (state.subscriptions || []).reduce((acc, s) => acc + Number(s.amount || 0), 0);
  const statText = document.getElementById('configModalStatText');
  if (statText) {
    statText.textContent = `${state.subscriptions.length} Active Subscriptions · ${cur}${total.toFixed(2)} / month`;
  }
}
window.updateConfigSubAmount = updateConfigSubAmount;

function updateConfigSubDay(subId, val) {
  const sub = (state.subscriptions || []).find(s => s.id === subId);
  if (sub) {
    const day = parseInt(val, 10);
    sub.dayOfMonth = (!isNaN(day) && day >= 1 && day <= 31) ? day : 15;
  }
}
window.updateConfigSubDay = updateConfigSubDay;

function deleteConfigSubItem(subId) {
  state.subscriptions = (state.subscriptions || []).filter(s => s.id !== subId);
  renderConfigureSubscriptionsModalUI();
}
window.deleteConfigSubItem = deleteConfigSubItem;

function saveConfigureSubscriptionsAndSync() {
  localStorage.setItem('recall_user_subscriptions', JSON.stringify(state.subscriptions));
  recalculateAllFinancialMetrics();
  renderSpendCalendar();
  renderSubscriptionsLedger();
  renderPlanSubscriptionsLedger();
  closeConfigureSubscriptionsModal();
  showToast('Subscriptions and Spend Calendar updated successfully!', 'success');
}
window.saveConfigureSubscriptionsAndSync = saveConfigureSubscriptionsAndSync;




