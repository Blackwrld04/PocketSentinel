import puppeteer from 'puppeteer-core';

async function runE2ETest() {
  console.log('🚀 Starting Puppeteer Core with /usr/bin/chromium...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // Mobile viewport like user's device

  console.log('🌐 Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1. Reset localStorage to guarantee pristine new user state
  console.log('🧹 Clearing client storage for fresh test...');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // 2. Open Onboarding Modal
  console.log('👤 Opening Onboarding Modal...');
  await page.evaluate(() => {
    openOnboardingModal(1);
  });
  await new Promise(r => setTimeout(r, 300));

  // Step 1: Email
  console.log('📝 Submitting Step 1 (Email)...');
  await page.evaluate(() => {
    const input = document.getElementById('authEmailInput');
    input.value = 'abayomi@example.com';
    submitAuthStep1();
  });
  await new Promise(r => setTimeout(r, 300));

  // Step 2: Name & Currency
  console.log('📝 Submitting Step 2 (Name & Currency £)...');
  await page.evaluate(() => {
    const nameInput = document.getElementById('onboardNameInput');
    nameInput.value = 'Abayomi';
    selectOnboardCurrency('£');
    submitAuthStep2();
  });
  await new Promise(r => setTimeout(r, 300));

  // Step 3: Baseline numbers (Inflow: 6000, Checking: 2500, Reserve: 500)
  console.log('📝 Submitting Step 3 (Inflow £6000, Checking £2500, Reserve £500)...');
  await page.evaluate(() => {
    const inflow = document.getElementById('onboardInflowInput');
    inflow.value = '6000.00';
    const checking = document.getElementById('onboardCheckingInput');
    checking.value = '2500.00';
    const reserve = document.getElementById('onboardReserveInput');
    reserve.value = '500.00';
    submitAuthStep3();
  });
  await new Promise(r => setTimeout(r, 300));

  // Step 4: Verify Subscriptions default clean state
  console.log('📝 Inspecting Step 4 Subscriptions list...');
  const step4Data = await page.evaluate(() => {
    const activeCount = (onboardDraft.subscriptions || []).filter(s => s.active).length;
    const summaryText = document.getElementById('onboardSubsSummaryText')?.textContent || '';
    const chipNoneActive = document.getElementById('chipPresetNone')?.classList.contains('active');
    return { activeCount, summaryText, chipNoneActive };
  });
  console.log('Step 4 Status:', step4Data);
  if (step4Data.activeCount !== 0) {
    throw new Error(`Expected 0 active subscriptions, found ${step4Data.activeCount}`);
  }

  // Submit Step 4 & 5 (Launch into app)
  console.log('🚀 Finalizing Onboarding and Launching Workspace...');
  await page.evaluate(() => {
    finishOnboardingAndLaunch();
  });
  await new Promise(r => setTimeout(r, 500));

  // 3. Inspect Home Screen Metrics
  console.log('📊 Verifying Home Screen Metrics...');
  const homeMetrics = await page.evaluate(() => {
    return {
      inflowBadge: document.getElementById('overviewInflowBadgeVal')?.textContent?.trim(),
      fixedBillsVal: document.getElementById('overviewFixedBillsVal')?.textContent?.trim(),
      fixedBillsPct: document.getElementById('overviewFixedBillsPct')?.textContent?.trim(),
      fixedBillsSub: document.getElementById('overviewFixedBillsSub')?.textContent?.trim(),
      reserveVal: document.getElementById('overviewReserveVal')?.textContent?.trim(),
      reservePct: document.getElementById('overviewReservePct')?.textContent?.trim(),
      variableVal: document.getElementById('overviewVariableVal')?.textContent?.trim(),
      variablePct: document.getElementById('overviewVariablePct')?.textContent?.trim(),
      safeSpendVal: document.getElementById('overviewSafeSpendVal')?.textContent?.trim(),
      safeDaily: document.getElementById('overviewDailyAllowance')?.textContent?.trim(),
      safeDays: document.getElementById('overviewCycleDaysLeft')?.textContent?.trim(),
      headerNet: document.getElementById('headerNetLiquidity')?.textContent?.trim(),
      headerSafe: document.getElementById('headerSafeSpend')?.textContent?.trim(),
      overviewSafe: document.getElementById('overviewSafe')?.textContent?.trim(),
      overviewDaily: document.getElementById('overviewDaily')?.textContent?.trim()
    };
  });

  console.log('Home Metrics Result:');
  console.log(JSON.stringify(homeMetrics, null, 2));

  // Assertions for Home screen:
  if (homeMetrics.inflowBadge !== '£6,000.00') {
    throw new Error(`Expected Inflow badge £6,000.00, got ${homeMetrics.inflowBadge}`);
  }
  if (homeMetrics.fixedBillsVal !== '£0.00') {
    throw new Error(`Expected Fixed Bills £0.00, got ${homeMetrics.fixedBillsVal}`);
  }
  if (homeMetrics.reserveVal !== '£500.00') {
    throw new Error(`Expected Reserve £500.00, got ${homeMetrics.reserveVal}`);
  }
  if (homeMetrics.variableVal !== '£0.00') {
    throw new Error(`Expected Variable Spent £0.00, got ${homeMetrics.variableVal}`);
  }
  if (homeMetrics.safeSpendVal !== '£5,500.00') {
    throw new Error(`Expected Safe Spend £5,500.00, got ${homeMetrics.safeSpendVal}`);
  }
  if (homeMetrics.headerNet !== '£3,000.00') {
    throw new Error(`Expected Header Net £3,000.00, got ${homeMetrics.headerNet}`);
  }

  // 4. Inspect Wallets View
  console.log('💼 Verifying Wallets View...');
  await page.evaluate(() => {
    if (typeof filterAppView === 'function') filterAppView('wallets');
  });
  await new Promise(r => setTimeout(r, 300));

  const walletsMetrics = await page.evaluate(() => {
    return {
      netLiquidity: document.getElementById('totalNetLiquidityDisplay')?.textContent?.trim(),
      checkingHint: document.getElementById('walletCheckingHint')?.textContent?.trim()
    };
  });
  console.log('Wallets Metrics Result:', walletsMetrics);
  if (walletsMetrics.netLiquidity !== '£3000.00') {
    throw new Error(`Expected Wallets net £3000.00, got ${walletsMetrics.netLiquidity}`);
  }

  // 5. Inspect Subscriptions Tab
  console.log('📱 Verifying Subscriptions Tab...');
  await page.evaluate(() => {
    if (typeof filterAppView === 'function') filterAppView('subscriptions');
  });
  await new Promise(r => setTimeout(r, 300));

  const subsMetrics = await page.evaluate(() => {
    return {
      activeCountVal: document.getElementById('subsActiveCountVal')?.textContent?.trim(),
      monthlyRunRate: document.getElementById('settingsMonthlyRunRate')?.textContent?.trim(),
      activeTabLabel: document.getElementById('subsActiveTabLabel')?.textContent?.trim(),
      rowsCount: document.getElementById('subsLedgerBody')?.querySelectorAll('tr')?.length || 0
    };
  });
  console.log('Subscriptions Metrics Result:', subsMetrics);
  if (subsMetrics.activeCountVal !== '0 Services') {
    throw new Error(`Expected 0 Services, got ${subsMetrics.activeCountVal}`);
  }
  if (subsMetrics.monthlyRunRate !== '£0.00/mo') {
    throw new Error(`Expected £0.00/mo, got ${subsMetrics.monthlyRunRate}`);
  }

  // 6. Test Adding a Subscription: Add £20 ChatGPT
  console.log('➕ Testing Subscription Addition & Reactive Re-calculation...');
  await page.evaluate(() => {
    state.subscriptions.push({
      id: 'sub_test_chatgpt',
      merchant: 'OpenAI ChatGPT Plus',
      amount: 20.00,
      dayOfMonth: 14,
      category: 'AI & Cloud',
      status: 'NORMAL'
    });
    localStorage.setItem('recall_user_subscriptions', JSON.stringify(state.subscriptions));
    recalculateAllFinancialMetrics();
    renderSpendCalendar();
    renderSubscriptionsLedger();
    renderPlanSubscriptionsLedger();
  });
  await new Promise(r => setTimeout(r, 300));

  const afterSubMetrics = await page.evaluate(() => {
    return {
      fixedBillsVal: document.getElementById('overviewFixedBillsVal')?.textContent?.trim(),
      fixedBillsSub: document.getElementById('overviewFixedBillsSub')?.textContent?.trim(),
      safeSpendVal: document.getElementById('overviewSafeSpendVal')?.textContent?.trim(),
      safeDaily: document.getElementById('overviewDailyAllowance')?.textContent?.trim(),
      activeCountVal: document.getElementById('subsActiveCountVal')?.textContent?.trim(),
      monthlyRunRate: document.getElementById('settingsMonthlyRunRate')?.textContent?.trim()
    };
  });
  console.log('After Adding £20 Subscription Result:', afterSubMetrics);

  if (afterSubMetrics.fixedBillsVal !== '£20.00') {
    throw new Error(`Expected Fixed Bills £20.00 after addition, got ${afterSubMetrics.fixedBillsVal}`);
  }
  if (afterSubMetrics.safeSpendVal !== '£5,480.00') {
    throw new Error(`Expected Safe Spend £5,480.00, got ${afterSubMetrics.safeSpendVal}`);
  }
  if (afterSubMetrics.monthlyRunRate !== '£20.00/mo') {
    throw new Error(`Expected £20.00/mo, got ${afterSubMetrics.monthlyRunRate}`);
  }

  // 7. Test Log Spend Modal & Custom Wallet Picker
  console.log('💳 Testing Log Spend Modal & Custom Wallet Picker...');
  await page.evaluate(() => {
    openQuickAddModal();
  });
  await new Promise(r => setTimeout(r, 300));

  const walletPickerData = await page.evaluate(() => {
    const cards = document.querySelectorAll('.wallet-picker-card');
    const selected = document.getElementById('tx-wallet')?.value;
    return {
      cardCount: cards.length,
      selected
    };
  });
  console.log('Wallet Picker Status:', walletPickerData);
  if (walletPickerData.cardCount !== 4) {
    throw new Error(`Expected 4 wallet picker cards, got ${walletPickerData.cardCount}`);
  }

  // 8. Test Receipt Scanner Fallback & Decoding
  console.log('📸 Testing Receipt Scanner...');
  await page.evaluate(async () => {
    await runReceiptScan({ demoPreset: 'grocery', filename: 'grocery_receipt.jpg' });
  });
  await new Promise(r => setTimeout(r, 400));

  const scanResult = await page.evaluate(() => {
    const amount = document.getElementById('tx-amount')?.value;
    const merchant = document.getElementById('tx-merchant')?.value;
    const resultHtml = document.getElementById('ocr-audit-result')?.innerHTML || '';
    return { amount, merchant, hasError: resultHtml.includes('Unexpected token') };
  });
  console.log('Scan Result:', scanResult);
  if (scanResult.hasError) {
    throw new Error('Receipt scanner produced Unexpected token error!');
  }
  if (scanResult.merchant !== 'Whole Foods Market' || scanResult.amount !== '64.20') {
    throw new Error(`Expected Whole Foods Market 64.20, got ${scanResult.merchant} ${scanResult.amount}`);
  }

  await browser.close();
  console.log('🎉 Full End-to-End Simulation Passed Successfully with 100% Correlation!');
}

runE2ETest().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
