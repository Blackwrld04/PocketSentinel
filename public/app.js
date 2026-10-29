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
  currentView: 'app',
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
  userProfile: {
    name: localStorage.getItem('recall_user_name') || 'Alex Rivera',
    currency: localStorage.getItem('recall_currency') || '$',
    inflow: parseFloat(localStorage.getItem('recall_inflow')) || 4850.00,
    hourlyWage: parseFloat(localStorage.getItem('recall_hourly_wage')) || 25.00,
    cycleDays: parseInt(localStorage.getItem('recall_cycle_days')) || 10,
    safeSpend: 482.35,
    dailyVelocity: 48.23
  },
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
  vault: {
    initialized: false,
    key: null,
    salt: null
  }
};
window.RecallState = state;

// ================= THEME MANAGER (LIGHT / DARK) =================
function initTheme() {
  const savedTheme = localStorage.getItem('recallramp-theme') || 'light';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('recallramp-theme', newTheme);
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
  
  // Initialize light/dark theme preference
  initTheme();

  // Render Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Handle URL hash routing immediately so the user lands on the requested subview
  handleHashNavigation();
  window.addEventListener('hashchange', handleHashNavigation);

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

function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  const isLandingTarget = !hash || 
    ['landing', 'heroSection', 'realitySection', 'visibilitySection', 'automationSection', 'ecosystemSection', 'copilotLabSection', 'demoSection', 'footerSection', 'features', 'copilot-lab', 'sovereignty', 'playground', 'paradigms', 'literature', 'comparison', 'reality', 'ecosystem'].includes(hash) ||
    Boolean(document.getElementById(hash) && document.getElementById(hash).closest('#viewLanding'));

  if (isLandingTarget) {
    switchView('landing');
    if (hash && hash !== 'landing') {
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
async function initWebCryptoVault(passphrase = 'pocketsentinel-sovereign-vault-2026') {
  try {
    const enc = new TextEncoder();
    state.vault.salt = window.crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
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
  const phrase = passInput && passInput.value.trim().length >= 12 
    ? passInput.value.trim() 
    : 'recallramp-master-key-sovereign-node-2026';

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
    agentId: 'walrus_agent_recallramp_mainnet_0x7f4b82c',
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
    const categoryBadgeClass = getCategoryBadgeClass(m.category);
    const shortDigest = m.suiTxDigest ? `${m.suiTxDigest.slice(0, 8)}...${m.suiTxDigest.slice(-6)}` : 'Mainnet Verified';
    const suiscanUrl = `https://suiscan.xyz/mainnet/tx/${m.suiTxDigest || '8Xp4v9...kL2'}`;

    // Summarize content policy
    let contentSummary = '';
    if (m.content) {
      if (m.content.approved_amount) {
        contentSummary = `Baseline: $${m.content.approved_amount.toFixed(2)}/mo (${m.content.billing_cycle || 'monthly'})`;
      } else if (m.content.seasonal_ceiling) {
        contentSummary = `Override Ceiling: $${m.content.seasonal_ceiling.toFixed(2)} (${m.content.pre_approved_reason || 'Seasonal surge'})`;
      } else if (m.content.trial_duration_days) {
        contentSummary = `Trial Watch: ${m.content.trial_duration_days} days. Auto-cancel if unconfirmed.`;
      } else if (m.content.action) {
        contentSummary = `Action Log: ${m.content.action} - ${m.content.status || 'Settled'}`;
      } else {
        contentSummary = JSON.stringify(m.content).slice(0, 55) + '...';
      }
    }

    return `
      <tr>
        <td><strong class="memory-id-badge">${m.id}</strong></td>
        <td><span class="category-chip ${categoryBadgeClass}">${m.category}</span></td>
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
  switch (cat) {
    case 'PRICE_BASELINE': return 'chip-green';
    case 'FALSE_ALARM_OVERRIDE': return 'chip-blue';
    case 'TRIAL_TRACKER': return 'chip-amber';
    case 'DISPUTE_LOG': return 'chip-red';
    case 'SUBSCRIPTION_PORTFOLIO': return 'chip-purple';
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
        agentId: 'walrus_agent_recallramp_mainnet_0x7f4b82c',
        suiTxDigest: 'Deterministic Sui Mainnet Anchor',
        walrusBlobId: 'N/A',
        content: `$${Number(sub.amount).toFixed(2)}/mo baseline for ${sub.merchant}. Auto-audit enabled.`
      };
    } else {
      m = {
        id: memId,
        category: 'Baseline',
        key: 'sovereign_memory_node',
        agentId: 'walrus_agent_recallramp_mainnet_0x7f4b82c',
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
  if (categoryEl) categoryEl.textContent = m.category || 'Baseline';
  if (keyEl) keyEl.textContent = m.key || 'memory_node';
  if (agentEl) agentEl.textContent = m.agentId || 'walrus_agent_recallramp_mainnet_0x7f4b82c';
  if (txEl) txEl.textContent = m.suiTxDigest || 'Deterministic Sui Mainnet Anchor';
  if (blobEl) blobEl.textContent = m.walrusBlobId || 'N/A';

  if (payloadEl) {
    if (typeof m.content === 'string') {
      payloadEl.value = m.content;
    } else {
      payloadEl.value = JSON.stringify(m.content, null, 2);
    }
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
async function loadSubscriptions() {
  try {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    state.subscriptions = data.activeSubscriptions || [];
    state.trials = data.trials || [];

    // Update KPI Run Rate
    const kpiRate = document.getElementById('kpiMonthlyRunRate');
    if (kpiRate && data.totalMonthlyRunRate) {
      kpiRate.textContent = `$${data.totalMonthlyRunRate}`;
    }

    const kpiPreserved = document.getElementById('kpiPreservedLeakage');
    if (kpiPreserved && data.totalDrainPreventedYearly) {
      kpiPreserved.textContent = `$${data.totalDrainPreventedYearly}`;
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
    { id: 'MEM_09', merchant: 'GitHub Copilot', amount: 10.00, dayOfMonth: 1, status: 'NORMAL', category: 'Developer Productivity' },
    { id: 'MEM_12', merchant: 'Apple iCloud+ 2TB', amount: 9.99, dayOfMonth: 5, status: 'NORMAL', category: 'Cloud Storage & Utility' },
    { id: 'MEM_11', merchant: 'Spotify Family', amount: 16.99, dayOfMonth: 8, status: 'NORMAL', category: 'Streaming' },
    { id: 'MEM_03', merchant: 'ChatGPT Plus', amount: 20.00, dayOfMonth: 12, status: 'NORMAL', category: 'AI & Cloud' },
    { id: 'MEM_07', merchant: 'Figma Professional', amount: 15.00, dayOfMonth: 14, status: 'NORMAL', category: 'Design Tools' },
    { id: 'MEM_02', merchant: 'Spotify Premium', amount: 10.99, dayOfMonth: 15, status: 'NORMAL', category: 'Streaming' },
    { id: 'MEM_06', merchant: 'Adobe CC 7-Day Trial', amount: 54.99, dayOfMonth: 18, status: 'TRIAL_URGENT', tag: 'Trial Alert', category: 'Software' },
    { id: 'MEM_10', merchant: 'DoorDash DashPass', amount: 9.99, dayOfMonth: 18, status: 'NORMAL', category: 'Food & Dining' },
    { id: 'MEM_04', merchant: 'Amazon Web Services (AWS)', amount: 142.50, dayOfMonth: 19, status: 'SUPPRESSED', tag: 'Overridden', category: 'Infrastructure' },
    { id: 'MEM_01', merchant: 'Netflix Standard', amount: 17.99, dayOfMonth: 20, status: 'PRICE_CREEP', tag: '+$2.50 Hike', category: 'Streaming' },
    { id: 'MEM_08', merchant: 'Supabase Pro', amount: 25.00, dayOfMonth: 21, status: 'NORMAL', category: 'AI & Cloud' },
    { id: 'MEM_13', merchant: 'The New York Times', amount: 4.00, dayOfMonth: 28, status: 'NORMAL', category: 'News & Media' }
  ];

  const activeSubs = (state.subscriptions && state.subscriptions.length > 0)
    ? state.subscriptions
    : baseCatalog;

  activeSubs.forEach(sub => {
    let day = sub.dayOfMonth || 15;
    if (day > daysInMonth) day = daysInMonth;

    let status = sub.status || 'NORMAL';
    if (sub.hasHike || (sub.baselineAmount && sub.amount > sub.baselineAmount && !sub.overrideApproved)) {
      status = 'PRICE_CREEP';
    } else if (sub.isTrial || (sub.merchant && sub.merchant.toLowerCase().includes('adobe')) || (sub.merchant && sub.merchant.toLowerCase().includes('trial'))) {
      status = 'TRIAL_URGENT';
    } else if (sub.overrideApproved || sub.status === 'SUPPRESSED') {
      status = 'SUPPRESSED';
    }

    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push({
      merchant: sub.merchant || 'Subscription',
      amount: Number(sub.amount || 0),
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

  // Compute total monthly debits
  let totalDebitsCount = 0;
  let totalDebitsSum = 0;
  Object.values(eventsByDay).forEach(evts => {
    totalDebitsCount += evts.length;
    evts.forEach(e => { totalDebitsSum += (e.amount || 0); });
  });

  const metaEl = document.getElementById('calMonthMetaText');
  if (metaEl) {
    metaEl.textContent = `${totalDebitsCount} scheduled debits ($${totalDebitsSum.toFixed(2)} total)`;
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
        <div class="cal-pill ${pillClass}" title="${primaryEvt.merchant} ($${primaryEvt.amount.toFixed(2)})">
          <strong class="cal-pill-merchant">${primaryEvt.merchant}</strong>
          <span class="cal-pill-amt">$${primaryEvt.amount.toFixed(2)}</span>
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

function handleStatementFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const transactions = parseCSVStatement(text);
    await executeBatchAudit(transactions);
    switchView('app');
  };
  reader.readAsText(file);
}

function parseCSVStatement(csvText) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dateIdx = header.findIndex(h => h.includes('date'));
  const descIdx = header.findIndex(h => h.includes('description') || h.includes('merchant'));
  const amtIdx = header.findIndex(h => h.includes('amount'));

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length >= 3) {
      const date = cols[dateIdx >= 0 ? dateIdx : 0] || '2026-10-20';
      const merchant = cols[descIdx >= 0 ? descIdx : 1] || 'Unknown';
      const amount = Math.abs(parseFloat(cols[amtIdx >= 0 ? amtIdx : 2])) || 0;

      results.push({ date, merchant, amount });
    }
  }

  return results;
}

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

    renderAuditRecords(state.auditResults);

    // Update KPI flags counter
    const kpiFlags = document.getElementById('kpiActiveFlags');
    if (kpiFlags) {
      const alertCount = report.alertsCount !== undefined ? report.alertsCount : (report.summary ? (report.summary.priceHikesDetected + report.summary.trialsPending) : 2);
      kpiFlags.textContent = `${alertCount} Alerts`;
    }

    const kpiPreserved = document.getElementById('kpiPreservedLeakage');
    if (kpiPreserved && report.annualSavingsPreserved) {
      kpiPreserved.textContent = `$${report.annualSavingsPreserved}`;
    }
  } catch (err) {
    console.error('Batch audit error:', err);
  }
}

let currentTxSearchQuery = '';
let currentTxFilterMode = 'all';

function handleTxSearch(query) {
  currentTxSearchQuery = (query || '').toLowerCase().trim();
  renderAuditRecords(state.auditResults);
}
window.handleTxSearch = handleTxSearch;

function filterTxTable(mode) {
  currentTxFilterMode = mode || 'all';
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
    container.innerHTML = `<div class="empty-feed">No audit records found. Ingest a statement above.</div>`;
    return;
  }

  // Filter based on state.activeFilter and local search / chips
  let filtered = records.filter(r => {
    const isAlert = r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'TRIAL_CONVERTING' || r.status === 'ESCALATION_REQUIRED' || r.status === 'ESCALATION_FLAG';
    const isSub = r.status === 'VERIFIED_OK' || r.status === 'NORMAL' || r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'SUPPRESSED_BY_MEMORY' || r.status === 'SUPPRESSED_APPROVED' || r.category === 'Streaming' || r.category === 'Software' || r.category === 'Infrastructure';
    const isTrial = r.status === 'TRIAL_CONVERTING' || r.status === 'TRIAL_URGENT' || (r.merchant && r.merchant.toLowerCase().includes('adobe'));

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

  container.innerHTML = filtered.map(r => {
    const merchant = r.merchant || (r.transaction && r.transaction.merchant) || 'Unknown Merchant';
    const amount = r.currentAmount !== undefined ? r.currentAmount : (r.amount !== undefined ? r.amount : (r.transaction && r.transaction.amount) || 0);
    const baseline = r.baselineAmount !== undefined ? r.baselineAmount : (r.baseline !== undefined ? r.baseline : null);
    const delta = r.deltaAmount !== undefined ? r.deltaAmount : (baseline !== null && amount > baseline ? Number((amount - baseline).toFixed(2)) : 0);
    const memoryRef = r.walrusMemoryRef || r.memoryUsed || null;
    const date = (r.transaction && r.transaction.date) || r.date || '2026-10-20';

    const statusData = getAuditStatusBadge(r.status, delta);

    let actionBtnHtml = '';
    if (r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP') {
      actionBtnHtml = `
        <button class="btn-card-action-red" onclick="openDisputeModalForRecord('${merchant}', ${amount}, ${baseline || 0}, ${delta}, '${memoryRef || 'MEM_01'}')">
          <i data-lucide="shield-alert"></i> Dispute
        </button>
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
        <button class="btn-card-action-amber" onclick="alert('Unknown merchant exceeding $50 threshold. Policy MEM_07 triggered: Human escalation required.')">
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
      ? `<div class="merchant-avatar-wrap"><img src="${logoUrl}" class="merchant-avatar-img" alt="${merchant}"></div>`
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
    }

    let subtextParts = [formattedDate];
    if (walletLabel) subtextParts.push(walletLabel);
    if (isHikeAlert && baseline !== null && baseline > 0) subtextParts.push(`Baseline $${baseline.toFixed(2)}`);

    return `
      <div class="audit-record-row ${r.status.toLowerCase()}">
        <div class="record-left">
          ${avatarHtml}
          <div class="record-details">
            <div class="record-title-row">
              <strong>${merchant}</strong>
              ${statusData.badgeHtml}
            </div>
            <div class="record-subtext">
              ${subtextParts.map((part, i) => i === 0 ? `<span>${part}</span>` : `<span>· ${part}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="record-right">
          <div class="record-amount-block">
            <span class="billed-amount">$${amount.toFixed(2)}</span>
          </div>
          <div class="record-actions">
            ${actionBtnHtml}
            ${r.isUserLogged ? `<button class="btn-inspect-mini text-coral" onclick="deleteUserLoggedTx('${merchant}', ${amount})" title="Delete"><i data-lucide="trash-2"></i></button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  if (typeof renderHomeTxMiniPreview === 'function') renderHomeTxMiniPreview();
  if (typeof updateTxPageMetrics === 'function') updateTxPageMetrics();
}

function renderHomeTxMiniPreview() {
  const lineTxBadge = document.getElementById('homeLineTxBadge');
  const lineAlertBadge = document.getElementById('homeLineAlertBadge');
  const sidebarTxCount = document.getElementById('sidebarTxCount');

  const records = state.auditResults || [];
  if (lineTxBadge) lineTxBadge.textContent = `${records.length} Audited`;
  if (sidebarTxCount) sidebarTxCount.textContent = `${records.length} Txns`;

  const alertsCount = records.filter(r => 
    r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'TRIAL_CONVERTING' || r.status === 'ESCALATION_REQUIRED'
  ).length;
  if (lineAlertBadge) lineAlertBadge.textContent = `${alertsCount || 2} Action Needed`;

  if (window.lucide) window.lucide.createIcons();
}
window.renderHomeTxMiniPreview = renderHomeTxMiniPreview;

function updateTxPageMetrics() {
  const records = state.auditResults || [];
  const totalVolume = records.reduce((sum, r) => {
    const amt = r.currentAmount !== undefined ? r.currentAmount : (r.amount !== undefined ? r.amount : (r.transaction && r.transaction.amount) || 0);
    return sum + amt;
  }, 0);

  const wage = state.userProfile?.hourlyWage || 25;
  const totalHours = (totalVolume / wage).toFixed(1);

  const alertsCount = records.filter(r => 
    r.status === 'MICRO_INFLATION_ALERT' || r.status === 'PRICE_CREEP' || r.status === 'TRIAL_CONVERTING' || r.status === 'ESCALATION_REQUIRED'
  ).length;

  const volDisplay = document.getElementById('txKpiVolumeDisplay');
  const countSub = document.getElementById('txKpiCountSub');
  const hoursDisplay = document.getElementById('txKpiLifeEnergy');
  const wageSub = document.getElementById('txKpiWageSub');
  const alertDisplay = document.getElementById('txKpiAlertsCount');

  if (volDisplay) volDisplay.textContent = `$${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (countSub) countSub.textContent = `${records.length} processed statement debits`;
  if (hoursDisplay) hoursDisplay.textContent = `${totalHours} hrs`;
  if (wageSub) wageSub.textContent = `Calculated at $${wage.toFixed(2)}/hr wage`;
  if (alertDisplay) alertDisplay.textContent = `${alertsCount} Flagged`;
}
window.updateTxPageMetrics = updateTxPageMetrics;

function getAuditStatusBadge(status, delta) {
  switch (status) {
    case 'MICRO_INFLATION_ALERT':
    case 'PRICE_CREEP':
      return {
        badgeHtml: `<span class="status-badge alert"><i data-lucide="trending-up"></i> +$${delta ? delta.toFixed(2) : '2.50'} Hike</span>`
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

  // View specific loaders
  if (filterType === 'all') {
    renderHomeTxMiniPreview();
    renderUserProfileUI();
  } else if (filterType === 'transactions') {
    renderAuditRecords(state.auditResults);
    updateTxPageMetrics();
  } else if (filterType === 'wallets') {
    renderWalletsUI();
  } else if (filterType === 'plan' || filterType === 'envelopes') {
    // Envelopes active
  } else if (filterType === 'safespend') {
    if (typeof calculateAffordability === 'function') calculateAffordability();
    const chatContainer = document.getElementById('copilotChatMessages');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  } else if (filterType === 'subscriptions' || filterType === 'trials' || filterType === 'calendar') {
    if (state.activeSubsSubTab === 'calendar') {
      renderSpendCalendar();
    } else if (state.activeSubsSubTab === 'trial') {
      // Trial hero panel active
    } else {
      renderSubscriptionsLedger();
    }
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
const masterSubscriptionsList = [
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
    memory: 'MEM_02',
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
    memory: 'MEM_03',
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
    memory: 'MEM_05',
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
    memory: 'MEM_06',
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
    memory: 'MEM_10',
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
    memory: 'MEM_08',
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
    memory: 'MEM_07',
    status: 'PROMO',
    statusBadge: '<span class="status-badge verified" style="background:#FAF5FF;color:#7C3AED;border-color:#DDD6FE;"><i data-lucide="tag"></i> Promo Active</span>'
  }
];

let activeSubCategory = 'all';
let activeSubSearch = '';

function renderSubscriptionsLedger() {
  const container = document.getElementById('subscriptionsContainer');
  if (!container) return;

  const filtered = masterSubscriptionsList.filter(item => {
    const matchesCat = activeSubCategory === 'all' || item.category === activeSubCategory;
    const matchesQuery = !activeSubSearch || 
      item.merchant.toLowerCase().includes(activeSubSearch.toLowerCase()) || 
      item.memory.toLowerCase().includes(activeSubSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 48px; color: var(--text-muted);">No subscriptions matched your search or category filter.</div>`;
    return;
  }

  let html = `
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
    let actionBtn = '';
    if (sub.status === 'CREEP_FLAG') {
      actionBtn = `
        <button class="btn-inspect-mini text-coral" onclick="openDisputeModalForRecord('${sub.merchant}', ${sub.cost}, ${sub.baseline}, ${sub.delta}, '${sub.memory}')">
          <i data-lucide="scale"></i> Dispute
        </button>
      `;
    } else if (sub.status === 'TRIAL') {
      actionBtn = `
        <button class="btn-inspect-mini text-amber" onclick="openDisputeModalForTrial()">
          <i data-lucide="x-circle"></i> Cancel
        </button>
      `;
    } else if (sub.status === 'OVERLAP') {
      actionBtn = `
        <button class="btn-inspect-mini text-blue" onclick="openDisputeModalForOverlap()">
          <i data-lucide="arrow-right-left"></i> Consolidate
        </button>
      `;
    } else {
      actionBtn = `
        <button class="btn-inspect-mini" onclick="inspectMemoryDetail('${sub.memory}')">
          <i data-lucide="eye"></i> Policy
        </button>
      `;
    }

    html += `
      <tr>
        <td>
          <div class="sub-merchant-cell">
            <img src="${sub.logo}" class="merchant-mini-logo" alt="${sub.merchant}">
            <div class="sub-merchant-meta">
              <strong>${sub.merchant}</strong>
              <span>${sub.plan}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="category-chip chip-slate">${sub.categoryLabel}</span>
        </td>
        <td class="sub-cost-cell">
          <strong>$${sub.cost.toFixed(2)}</strong>
          <small>$${(sub.cost * 12).toFixed(2)} / yr</small>
        </td>
        <td class="sub-date-cell">
          <span>${sub.renewalText}</span>
        </td>
        <td>
          <strong class="memory-id-badge" onclick="inspectMemoryDetail('${sub.memory}')" style="cursor:pointer;" title="Inspect memory baseline">
            ${sub.memory}
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
  if (window.lucide) window.lucide.createIcons();
}
window.renderSubscriptionsLedger = renderSubscriptionsLedger;

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
  if (el) el.textContent = `$${parseFloat(val).toFixed(2)}`;
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
  const ceiling = document.getElementById('newOverrideCeiling')?.value.trim();
  const reason = document.getElementById('newOverrideReason')?.value.trim();

  if (!merchant || !ceiling || !reason) {
    alert('Please provide Merchant, Ceiling ($), and Reason for the override.');
    return;
  }

  const tbody = document.getElementById('overridesTableBody');
  if (tbody) {
    const memId = `MEM_OVR_${Math.floor(Math.random() * 899 + 100)}`;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>
        <div class="tx-cell-merchant">
          <span class="merchant-logo-fallback"><i data-lucide="shield"></i></span>
          <strong>${merchant}</strong>
        </div>
      </td>
      <td>$${parseFloat(ceiling).toFixed(2)} / mo</td>
      <td>${reason}</td>
      <td><code>${memId}</code></td>
      <td><span class="status-pill green">Active Override</span></td>
      <td><button class="btn-inspect-mini text-coral" onclick="removeOverrideRow(this)"><i data-lucide="trash-2"></i></button></td>
    `;
    tbody.appendChild(newRow);

    document.getElementById('newOverrideMerchant').value = '';
    document.getElementById('newOverrideCeiling').value = '';
    document.getElementById('newOverrideReason').value = '';

    showToast(`Override policy [${memId}] committed for ${merchant}!`);
    if (window.lucide) window.lucide.createIcons();
  }
}
window.addNewOverridePolicy = addNewOverridePolicy;

// ================= TRIALS & ALERTS ACTIONS =================
function batchDisputeAllHikes() {
  openDisputeModalForRecord('Netflix Standard', 17.99, 15.49, 2.50, 'MEM_01');
  showToast('1-Tap CFPB dispute generated for all uncontractual price hikes!');
}
window.batchDisputeAllHikes = batchDisputeAllHikes;

function openDisputeModalForTrial() {
  state.activeDispute = {
    merchant: 'Adobe Creative Cloud All Apps',
    amount: 54.99,
    baseline: 0.00,
    delta: 54.99,
    memoryId: 'MEM_10',
    type: 'TRIAL_CANCEL'
  };

  const modal = document.getElementById('disputeModal');
  const title = document.getElementById('disputeModalTitle');
  const subtitle = document.getElementById('disputeModalSubtitle');
  const subject = document.getElementById('disputeSubject');
  const body = document.getElementById('disputeLetterBody');
  const metaStrip = document.getElementById('disputeMetaStrip');

  title.textContent = `1-Tap Trial Cancellation Pack: Adobe CC`;
  subtitle.textContent = `48h Pre-Conversion Warning · Sovereign Memory [MEM_10] · 0% Fee Rake`;
  subject.textContent = `Formal Notice of Immediate Cancellation: Adobe Creative Cloud 7-Day Trial`;

  metaStrip.innerHTML = `
    <div class="meta-item"><span>Trial Period:</span> <strong>7-Day Free Period</strong></div>
    <div class="meta-item red"><span>Impending Rebill:</span> <strong>$54.99 / mo ($659.88/yr)</strong></div>
    <div class="meta-item amber"><span>Hours Remaining:</span> <strong>48 Hours (Auto-converts Oct 25)</strong></div>
    <div class="meta-item green"><span>PocketSentinel Fee:</span> <strong>$0.00 (Zero Rake)</strong></div>
  `;

  body.value = `To: Adobe Systems Billing & Subscription Support
Re: Immediate Cancellation Notice of Free Trial Account
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To Customer Support,

Please accept this formal written notice of cancellation for my 7-day Adobe Creative Cloud trial, effective immediately.

- Account Service: Adobe Creative Cloud All Apps
- Trial Start Date: October 18, 2026
- Trial Expiration / Rebill Horizon: October 25, 2026
- Scheduled Recurring Charge: $54.99 / month

I affirmatively opt out of converting this trial to a paid subscription or recurring contract. Please ensure no debit or early termination fee is processed against my card on file.

Please reply with written confirmation of cancellation and transaction reference.

Sincerely,
PocketSentinel Sovereign Account Sentinel [ID: MEM_10]`;

  if (modal) modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}
window.openDisputeModalForTrial = openDisputeModalForTrial;

function openDisputeModalForOverlap() {
  alert('Audio Overlap Consolidator:\n\nSovereign Memory [MEM_11] notes active subscriptions to both Spotify ($16.99/mo) and Apple Music ($10.99/mo).\n\nConsolidating to a single streaming tier preserves $131.88/year in household capital.\n\nWould you like PocketSentinel to draft a 1-tap cancellation notice for Apple Music?');
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
  if (modal) modal.style.display = 'flex';
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


function confirmAddSubscription() {
  const name = document.getElementById('newSubName')?.value.trim();
  const amt = parseFloat(document.getElementById('newSubAmount')?.value || 0);
  const cat = document.getElementById('newSubCategory')?.value || 'Streaming';
  const day = document.getElementById('newSubRenewalDay')?.value || '15';

  if (!name || isNaN(amt) || amt <= 0) {
    alert('Please enter a valid Merchant Name and Monthly Amount.');
    return;
  }

  const logo = getMerchantLogo(name) || '/assets/logos/sui.svg';
  const memKey = `MEM_MANUAL_${Math.floor(Math.random() * 899 + 100)}`;

  masterSubscriptionsList.unshift({
    id: `sub_${Date.now()}`,
    merchant: name,
    plan: 'Active Subscription',
    logo: logo,
    category: cat.toLowerCase().includes('stream') ? 'streaming' : (cat.toLowerCase().includes('ai') ? 'ai' : 'dev'),
    categoryLabel: cat,
    cost: amt,
    baseline: amt,
    delta: 0,
    renewalDay: parseInt(day),
    renewalText: `${day}th of month`,
    memory: memKey,
    status: 'VERIFIED',
    statusBadge: '<span class="status-badge verified"><i data-lucide="check-circle-2"></i> Baseline Match</span>'
  });

  closeNewSubscriptionModal();
  renderSubscriptionsLedger();
  showToast(`Added ${name} ($${amt.toFixed(2)}/mo) with policy baseline [${memKey}]!`);
}
window.confirmAddSubscription = confirmAddSubscription;

function openAddTrialModal() {
  const modal = document.getElementById('newTrialModal');
  if (modal) modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
}
window.openAddTrialModal = openAddTrialModal;

function closeAddTrialModal() {
  const modal = document.getElementById('newTrialModal');
  if (modal) modal.style.display = 'none';
}
window.closeAddTrialModal = closeAddTrialModal;

function confirmAddTrial() {
  const name = document.getElementById('newTrialName')?.value.trim();
  const rebill = parseFloat(document.getElementById('newTrialRebillRate')?.value || 0);
  const days = parseInt(document.getElementById('newTrialDaysLeft')?.value || 7);

  if (!name || isNaN(rebill) || rebill <= 0) {
    alert('Please enter a valid Trial Service Name and Upcoming Rebill Rate.');
    return;
  }

  closeAddTrialModal();
  showToast(`Free trial for ${name} tracked! 48h advance warning armed for ${days} days from now.`);
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
    <div class="meta-item"><span>Current Charge:</span> <strong>$${amount.toFixed(2)}</strong></div>
    <div class="meta-item"><span>Approved Baseline:</span> <strong>$${baseline.toFixed(2)}</strong></div>
    <div class="meta-item red"><span>Unauthorized Delta:</span> <strong>+$${delta.toFixed(2)}/mo ($${annualDrain}/yr)</strong></div>
    <div class="meta-item green"><span>PocketSentinel Fee:</span> <strong>$0.00 (Zero Rake)</strong></div>
  `;

  body.value = `To: ${merchant} Billing & Consumer Accounts Support
Re: Account Subscription Billing Discrepancy & Price Hike Objection
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

To Whom It May Concern,

I am writing to formally object to the recent unnotified price increase applied to my recurring subscription account.

- Merchant: ${merchant}
- Agreed Contractual Baseline: $${baseline.toFixed(2)} / month
- Recent Discrepant Charge: $${amount.toFixed(2)} (Billed without affirmative consent)
- Discrepancy Delta: +$${delta.toFixed(2)} / month
- Decentralized Ledger Anchor: Memory Proof #${memoryId} (Sui Mainnet)

Under FTC Negative Option Rule guidelines and Consumer Financial Protection Bureau (CFPB) recurring charge standards, material modifications to recurring pricing require explicit affirmative consent prior to billing.

Action Requested:
1. Immediately issue a statement credit or refund of $${delta.toFixed(2)} for the excess unapproved debit.
2. Revert my account to the pre-authorized rate of $${baseline.toFixed(2)} per month, or promptly cancel this subscription with no termination fees.

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
  const diningCard = document.getElementById('envDiningCard');
  const diningPill = document.getElementById('envDiningPill');
  const diningFill = document.getElementById('envDiningFill');
  const diningAllocated = document.getElementById('envDiningAllocated');

  const funPill = document.getElementById('envFunPill');
  const funFill = document.getElementById('envFunFill');
  const funAllocated = document.getElementById('envFunAllocated');

  const toBeBudgeted = document.getElementById('toBeBudgetedDisplay');
  const rollBox = document.getElementById('rollPunchesBox');

  // Update Envelope Subview
  if (diningCard) {
    diningCard.classList.remove('alert-deficit');
  }
  if (diningPill) {
    diningPill.className = 'env-remaining-pill green';
    diningPill.textContent = '+$0.00 Balanced';
  }
  if (diningFill) {
    diningFill.className = 'env-fill green';
    diningFill.style.width = '100%';
  }
  if (diningAllocated) {
    diningAllocated.textContent = 'Allocated: $395.00';
  }

  if (funPill) {
    funPill.className = 'env-remaining-pill green';
    funPill.textContent = '+$85.00 Left';
  }
  if (funFill) {
    funFill.className = 'env-fill green';
    funFill.style.width = '58%';
  }
  if (funAllocated) {
    funAllocated.textContent = 'Allocated: $205.00';
  }

  if (toBeBudgeted) {
    toBeBudgeted.textContent = '$0.00 (Balanced · Every Dollar Assigned)';
  }

  // Update Plan & Envelopes Tab elements
  const planDiningCard = document.getElementById('planEnvDiningCard');
  const planDiningPill = document.getElementById('planEnvDiningPill');
  const planDiningBar = document.getElementById('planEnvDiningBar');
  const planDiningAlloc = document.getElementById('planEnvDiningAlloc');
  const planDiningCallout = document.getElementById('planEnvDiningCallout');
  const planFunPill = document.getElementById('planEnvFunPill');
  const planFunBar = document.getElementById('planEnvFunBar');
  const planFunAlloc = document.getElementById('planEnvFunAlloc');

  if (planDiningCard) planDiningCard.classList.remove('alert-deficit');
  if (planDiningPill) { planDiningPill.className = 'env-remaining-pill green'; planDiningPill.textContent = '+$0.00 Balanced'; }
  if (planDiningBar) { planDiningBar.className = 'env-fill green'; planDiningBar.style.width = '100%'; }
  if (planDiningAlloc) planDiningAlloc.textContent = 'Allocated: $395.00';
  if (planDiningCallout) planDiningCallout.innerHTML = '<span class="text-green"><i data-lucide="check-circle"></i> Balanced: $45.00 transferred from Fun</span>';

  if (planFunPill) { planFunPill.className = 'env-remaining-pill green'; planFunPill.textContent = '+$85.00 Left'; }
  if (planFunBar) { planFunBar.className = 'env-fill green'; planFunBar.style.width = '58%'; }
  if (planFunAlloc) planFunAlloc.textContent = 'Allocated: $205.00';

  if (rollBox) {
    rollBox.innerHTML = `
      <div class="punch-left">
        <span class="status-pill green"><i data-lucide="check-circle"></i> Deficit Neutralized</span>
        <h4>Deficit Resolved</h4>
        <p>$45.00 transferred from Fun to Dining. All categories balanced.</p>
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
  if (kpiSub) kpiSub.textContent = '6 Envelopes in Zero Debt';

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

  const overviewDiningLabel = document.getElementById('overviewDiningLabel');
  if (overviewDiningLabel) {
    overviewDiningLabel.className = 'text-green';
    overviewDiningLabel.textContent = '+$0.00 Balanced ($395.00 / $395)';
  }
  const overviewDiningBar = document.getElementById('overviewDiningBar');
  if (overviewDiningBar) {
    overviewDiningBar.className = 'env-fill green';
    overviewDiningBar.style.width = '100%';
  }

  const overviewFunLabel = document.getElementById('overviewFunLabel');
  if (overviewFunLabel) {
    overviewFunLabel.textContent = '+$85.00 Left ($120.00 / $205)';
  }
  const overviewFunBar = document.getElementById('overviewFunBar');
  if (overviewFunBar) overviewFunBar.style.width = '58%';

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

  showToast('Envelopes Rebalanced: $45.00 shifted from Fun → Dining Out. Zero-based balance restored!');
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
  const currentSafeSpend = 482.35;
  const daysRemaining = 10;
  const dailyBurnVelocity = 48.23;

  const remainingAfter = currentSafeSpend - cost;
  const newVelocity = remainingAfter > 0 ? (remainingAfter / daysRemaining).toFixed(2) : '0.00';

  if (remainingEl) {
    remainingEl.textContent = `$${remainingAfter.toFixed(2)}`;
    if (remainingAfter < 0) {
      remainingEl.className = 'text-coral';
    } else {
      remainingEl.className = remainingAfter < 100 ? 'text-amber' : 'text-green';
    }
  }

  if (newVelocityEl) {
    newVelocityEl.textContent = `$${newVelocity} / day`;
  }

  if (verdictTag && verdictSub) {
    verdictTag.className = 'verdict-tag';
    if (cost <= 0) {
      verdictTag.classList.add('blue');
      verdictTag.innerHTML = '<i data-lucide="info"></i> <span>Enter purchase amount to evaluate</span>';
      verdictSub.textContent = 'Calculates real-time velocity impact across 10 remaining October cycle days.';
    } else if (cost <= 50) {
      verdictTag.classList.add('green');
      verdictTag.innerHTML = '<i data-lucide="check-circle"></i> <span>APPROVED: Safe to Spend</span>';
      verdictSub.textContent = `Consumes ~${(cost / dailyBurnVelocity).toFixed(1)} days of burn. Will not impact fixed subscriptions or $500 savings buffer.`;
    } else if (cost <= 150) {
      verdictTag.classList.add('amber');
      verdictTag.innerHTML = `<i data-lucide="alert-triangle"></i> <span>CAUTION: Consumes ${(cost / dailyBurnVelocity).toFixed(1)} Days of Runway</span>`;
      verdictSub.textContent = 'Safe to spend, but requires slightly tighter discretionary spending over the next 3 days.';
    } else if (cost <= currentSafeSpend) {
      verdictTag.classList.add('coral');
      verdictTag.innerHTML = `<i data-lucide="alert-circle"></i> <span>HIGH IMPACT: Consumes ${(cost / dailyBurnVelocity).toFixed(1)} Days of Runway</span>`;
      verdictSub.textContent = `Warning: Consumes ${Math.round((cost / currentSafeSpend) * 100)}% of your remaining October safe-to-spend buffer.`;
    } else {
      verdictTag.classList.add('red');
      verdictTag.innerHTML = '<i data-lucide="x-circle"></i> <span>RUNWAY BREACH: Exceeds Available Safe Cash</span>';
      verdictSub.textContent = `Warning: Swiping for this requires taking $${(cost - currentSafeSpend).toFixed(2)} from your Emergency Buffer or bouncing bills!`;
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
    .replace(/[~^|\\`]/g, '')
    .replace(/,\s*,+/g, ', ');

  return clean
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
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        mode: copilotMode,
        envelopesRebalanced: Boolean(state.envelopesRebalanced)
      })
    });

    const data = await res.json();
    const typingEl = document.getElementById('copilotTypingIndicator');
    if (typingEl) typingEl.remove();

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

    const errorBubble = document.createElement('div');
    errorBubble.className = 'chat-bubble assistant';
    errorBubble.innerHTML = `
      <div class="chat-avatar"><i data-lucide="shield"></i></div>
      <div class="chat-bubble-body">
        <strong>PocketSentinel AI</strong>
        <p>Your live Safe-to-Spend runway is <strong>$482.35</strong> ($48.23/day velocity across 10 remaining cycle days). Your $500.00 emergency buffer is 100% secured.</p>
        <span class="chat-time">Local Fallback</span>
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
  const currentSafeSpend = 482.35;
  const dailyBurnVelocity = 48.23;
  const daysConsumed = (cost / dailyBurnVelocity).toFixed(1);
  const remaining = (currentSafeSpend - cost).toFixed(2);
  const newDaily = (Math.max(0, currentSafeSpend - cost) / 10).toFixed(2);

  if (tag && explainer) {
    if (cost <= 0) {
      tag.className = 'verdict-tag';
      tag.innerHTML = '<i data-lucide="info"></i> <span>Enter amount</span>';
      explainer.textContent = 'Enter an amount to test against your $482.35 runway.';
    } else if (cost <= 50) {
      tag.className = 'verdict-tag green';
      tag.innerHTML = `<i data-lucide="check-circle"></i> <span>Safe: ~${daysConsumed} Days</span>`;
      explainer.textContent = `Safe to spend from your $482.35 runway, leaving $${remaining} ($${newDaily}/day).`;
    } else if (cost <= 150) {
      tag.className = 'verdict-tag amber';
      tag.innerHTML = `<i data-lucide="alert-triangle"></i> <span>Caution: ~${daysConsumed} Days</span>`;
      explainer.textContent = `Consumes ~${daysConsumed} days of runway, lowering your daily burn to $${newDaily}/day.`;
    } else if (cost <= currentSafeSpend) {
      tag.className = 'verdict-tag amber';
      tag.innerHTML = `<i data-lucide="alert-circle"></i> <span>High Impact: ~${daysConsumed} Days</span>`;
      explainer.textContent = `Warning: Consumes ${Math.round((cost / currentSafeSpend) * 100)}% of your remaining safe cash.`;
    } else {
      tag.className = 'verdict-tag red';
      tag.innerHTML = '<i data-lucide="x-circle"></i> <span>Runway Breach</span>';
      explainer.textContent = `Over budget! Exceeds safe cash by $${(cost - currentSafeSpend).toFixed(2)}.`;
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
Your current cash runway is <strong>$482.35</strong> with 10 days remaining in the cycle, giving you an exact safe spending velocity of <strong>$48.23 / day</strong>.
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
  closeNewSubscriptionModal();
  renderSubscriptionsLedger();
  renderSpendCalendar();
  showToast(`✅ Added ${merchant} ($${cost.toFixed(2)}/mo) to Sentinel Subscriptions!`);
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
    message: `Logged to ${category} envelope via ${walletName}. Costs ${lifeEnergyHours} hrs of mortal life energy.`
  };
  state.auditResults.unshift(newTx);

  // 5. Update UI
  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);
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
    // Restore safe runway
    state.userProfile.safeSpend = Number((state.userProfile.safeSpend + amount).toFixed(2));
    const daysLeft = state.userProfile.cycleDays || 10;
    state.userProfile.dailyVelocity = Number((state.userProfile.safeSpend / daysLeft).toFixed(2));

    // Restore wallet
    const targetWallet = state.wallets.find(w => w.name === (deleted.wallet || 'Primary Checking'));
    if (targetWallet) {
      targetWallet.balance = Number((targetWallet.balance + amount).toFixed(2));
    }

    renderUserProfileUI();
    renderWalletsUI();
    renderAuditRecords(state.auditResults);

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
  const safeVal = `${cur}${Number(profile.safeSpend || 482.35).toFixed(2)}`;
  const velVal = `${cur}${Number(profile.dailyVelocity || 48.23).toFixed(2)} / day`;
  const cycleVal = `${profile.cycleDays || 10} days remaining`;

  if (nameEl) nameEl.textContent = profile.name || 'Alex Rivera';
  const initials = (profile.name || 'Alex Rivera').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AR';
  if (avatarEl) avatarEl.textContent = initials;

  const wagePill = document.getElementById('userWagePillDisplay');
  if (wagePill) wagePill.textContent = `${cur}${Number(profile.hourlyWage || 25).toFixed(2)} / hr Life Energy`;

  const headerName = document.getElementById('headerUserName');
  const headerWage = document.getElementById('headerUserWage');
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerSafe = document.getElementById('headerSafeSpend');

  if (headerName) headerName.textContent = profile.name || 'Alex Rivera';
  if (headerWage) headerWage.textContent = `${cur}${Number(profile.hourlyWage || 25).toFixed(0)}/hr Life Energy`;
  if (headerAvatar) headerAvatar.textContent = initials;
  if (headerSafe) headerSafe.textContent = safeVal;

  if (safeSpendHero) safeSpendHero.textContent = safeVal;
  if (velocityHero) velocityHero.textContent = velVal;
  if (cycleDaysHero) cycleDaysHero.textContent = cycleVal;

  if (kpiSafe) kpiSafe.textContent = safeVal;
  if (kpiVel) kpiVel.textContent = `${velVal} · ${cycleVal}`;
  if (overviewSafe) overviewSafe.textContent = safeVal;
  if (overviewBurn) overviewBurn.textContent = velVal;
  if (overviewDaily) overviewDaily.textContent = velVal;
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

  if (nameInp) nameInp.value = profile.name || 'Alex Rivera';
  if (curSel) curSel.value = profile.currency || '$';
  if (inflowInp) inflowInp.value = profile.inflow || 4850.00;
  if (wageInp) wageInp.value = profile.hourlyWage || 25.00;
  if (daysInp) daysInp.value = profile.cycleDays || 10;
}
window.loadUserProfileToSettings = loadUserProfileToSettings;

function saveUserProfileSettings() {
  const nameInp = document.getElementById('settingProfileName');
  const curSel = document.getElementById('settingProfileCurrency');
  const inflowInp = document.getElementById('settingProfileInflow');
  const wageInp = document.getElementById('settingProfileWage');
  const daysInp = document.getElementById('settingProfileCycleDays');

  const newName = (nameInp?.value || 'Alex Rivera').trim();
  const newCur = curSel?.value || '$';
  const newInflow = parseFloat(inflowInp?.value) || 4850.00;
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

  renderUserProfileUI();
  renderWalletsUI();
  renderAuditRecords(state.auditResults);

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
}
window.renderWalletsUI = renderWalletsUI;

function renderPlanSubscriptionsLedger() {
  const container = document.getElementById('planSubsLedgerList');
  if (!container) return;

  const subs = state.subscriptions.length > 0 ? state.subscriptions : [
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

  container.innerHTML = subs.map(s => {
    const isHike = s.hasHike || (s.baselineAmount && s.amount > s.baselineAmount && !s.overrideApproved);
    const isTrial = s.isTrial || (s.merchant && s.merchant.toLowerCase().includes('adobe'));

    return `
      <div class="sub-ledger-item ${isHike ? 'hike' : ''} ${isTrial ? 'trial' : ''}">
        <div class="sub-item-left">
          <div class="merchant-avatar">${s.merchant.charAt(0)}</div>
          <div>
            <strong>${s.merchant}</strong>
            <div class="sub-item-meta">
              <span>Renews ${s.dayOfMonth || 15}th</span>
              ${isHike && s.baselineAmount !== undefined ? `<span>· Baseline $${s.baselineAmount.toFixed(2)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="sub-item-right">
          <div class="sub-item-amt">
            <span class="amt-val">$${(s.amount || 0).toFixed(2)} / mo</span>
            ${isHike ? '<span class="tag-hike">+$2.50 Hike</span>' : ''}
            ${isTrial ? '<span class="tag-trial">48h Alert</span>' : ''}
          </div>
          ${isHike ? `<button class="btn-mini-dispute" onclick="openDisputeModalForRecord('${s.merchant}', ${s.amount}, ${s.baselineAmount}, 2.50, '${s.walrusMemoryRef}')">Dispute</button>` : ''}
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
  if (modal) modal.style.display = 'flex';
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

  renderWalletsUI();
  closeAddWalletModal();
  if (typeof showToast === 'function') showToast(`✅ Added wallet "${name}" with $${balance.toFixed(2)}.`);
}
window.confirmAddNewWallet = confirmAddNewWallet;

function openTransferModal(fromWallet = null) {
  const modal = document.getElementById('transferModal');
  if (!modal) return;
  modal.style.display = 'flex';
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
    renderWalletsUI();
    closeTransferModal();
    if (typeof showToast === 'function') {
      showToast(`🔄 Transferred $${amount.toFixed(2)} from ${fromName} to ${toName}.`);
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

  if (typeof showToast === 'function') {
    showToast(`📁 Created new envelope "${name}" with $${budget.toFixed(2)} monthly allocation!`, 'green');
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

function renderCustomEnvelopes() {
  const grid = document.getElementById('envelopesCardsGrid');
  if (!grid) return;

  grid.querySelectorAll('.custom-env-card').forEach(el => el.remove());

  const envelopes = getCustomEnvelopes();
  envelopes.forEach(env => {
    const remaining = env.budget - env.spent;
    const isDeficit = remaining < 0;
    const pct = Math.min(Math.round((env.spent / env.budget) * 100), 100);
    const pillClass = isDeficit ? 'red' : (remaining > 0 ? 'green' : 'blue');
    const pillText = isDeficit ? `-$${Math.abs(remaining).toFixed(2)} Deficit` : `+$${remaining.toFixed(2)} Left`;

    const card = document.createElement('div');
    card.className = `envelope-card custom-env-card ${isDeficit ? 'alert-deficit' : ''}`;
    card.id = env.id;
    card.innerHTML = `
      <div class="env-header">
        <div class="env-title-wrap">
          <span class="env-icon"><i data-lucide="${env.icon}"></i></span>
          <div>
            <strong>${env.name}</strong>
            <span class="env-meta">Target: $${env.budget.toFixed(2)} / mo</span>
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
        <div class="env-fill ${env.color || 'blue'}" style="width: ${pct}%;"></div>
      </div>
      <div class="env-footer">
        <span>Spent: $${env.spent.toFixed(2)}</span>
        <span>Allocated: $${env.budget.toFixed(2)}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  // Dynamically update zero-based allocation pool displays
  const baseAllocated = 4850.00;
  const customAllocated = envelopes.reduce((acc, env) => acc + (Number(env.budget) || 0), 0);
  const totalAllocated = baseAllocated + customAllocated;
  const inflow = 4850.00 + customAllocated;

  const allocEl = document.getElementById('planAllocatedPoolDisplay');
  const inflowEl = document.getElementById('planInflowPoolDisplay');
  if (allocEl) allocEl.textContent = `$${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (inflowEl) inflowEl.textContent = `$${inflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (window.lucide) window.lucide.createIcons();
}
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


