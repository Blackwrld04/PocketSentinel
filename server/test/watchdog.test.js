/**
 * watchdog.test.js — Automated Test Suite for PocketSentinel & Walrus Memory
 * 
 * Verifies:
 * 1. 12 Walrus memories are stored and conform to >= 10 Mainnet rule.
 * 2. Micro-inflation detects +$2.50 hike on Netflix.
 * 3. Historical override suppresses alert on Q4 AWS surge.
 * 4. Unknown merchant charge > $50 triggers Human-in-the-Loop gate.
 * 5. 1-Tap Dispute Pack is populated accurately.
 */

import { WalrusClient } from '../walrusClient.js';
import { WatchdogEngine } from '../watchdogEngine.js';
import { seedAllMemories } from '../seedMemories.js';

async function runTests() {
  console.log('🧪 Starting PocketSentinel Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  const walrus = new WalrusClient();
  await seedAllMemories(walrus);
  const watchdog = new WatchdogEngine(walrus);

  // Test 1: Check Walrus Mainnet Memory Count >= 10
  const memories = await walrus.listMemories();
  assert(memories.length >= 10, `Walrus memory count is ${memories.length} (must be >= 10)`);

  // Test 2: Micro-Inflation Detection (Netflix $17.99 vs $15.49 baseline)
  const netflixResult = await watchdog.auditTransaction({
    merchant: 'Netflix',
    amount: 17.99,
    date: '2026-10-20'
  });
  assert(netflixResult.status === 'MICRO_INFLATION_ALERT', 'Flags micro-inflation on Netflix price hike');
  assert(netflixResult.deltaAmount === 2.50, 'Calculates exact price delta of $2.50');
  assert(netflixResult.annualDrainFormatted === '$30.00', 'Calculates annual drain of $30.00');
  assert(netflixResult.disputePack && netflixResult.disputePack.letterBody.includes('Netflix'), 'Generates dispute letter');

  // Test 3: False Alarm Suppression via Learned Override (AWS $142.50 vs $180 ceiling)
  const awsResult = await watchdog.auditTransaction({
    merchant: 'Amazon Web Services (AWS)',
    amount: 142.50,
    date: '2026-10-19'
  });
  assert(awsResult.status === 'SUPPRESSED_BY_MEMORY', 'Suppresses alarm for seasonal AWS surge using Walrus Memory');
  assert(awsResult.savedFromAlertFatigue === true, 'Marks savedFromAlertFatigue flag');

  // Test 4: Unknown Merchant High Debit Gate ($89 > $50 threshold)
  const unknownResult = await watchdog.auditTransaction({
    merchant: 'Apex Luxury LLC',
    amount: 89.00,
    date: '2026-10-21'
  });
  assert(unknownResult.status === 'ESCALATION_REQUIRED', 'Requires human escalation on unknown debit > $50');

  // Test 5: Baseline Exact Match Reconciled (ChatGPT Plus $20.00)
  const chatgptResult = await watchdog.auditTransaction({
    merchant: 'OpenAI (ChatGPT Plus)',
    amount: 20.00,
    date: '2026-10-14'
  });
  assert(chatgptResult.status === 'VERIFIED_OK', 'Reconciles exact match without alert');

  console.log(`\n=============================================`);
  console.log(`Test Results: ${passed}/${total} Passed`);
  console.log(`=============================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
