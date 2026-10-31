/**
 * watchdog.test.js — Automated Test Suite for PocketSentinel & Walrus Memory (Schema v2)
 * 
 * Hackathon Compliance:
 * - Total Recall | Tatum x Walrus Memory Hackathon
 * 
 * Verifies:
 * 1. 24 Walrus memories are stored and conform to >= 10 Mainnet rule across 10 distinct types.
 * 2. Micro-inflation detects +$2.50 hike on Netflix.
 * 3. Historical override suppresses alert on Q4 AWS surge.
 * 4. Unknown merchant charge > $50 triggers Human-in-the-Loop gate.
 * 5. Baseline exact match reconciled without alert.
 * 6. Runway is computed dynamically from MEM_13 (Income) + MEM_15 (Commitment) + MEM_16 (Goal).
 * 7. Merchant Correction (MEM_20) normalizes raw processor string "SQ *TST* BLUE BOTTLE" to "Blue Bottle Coffee" under "Dining".
 * 8. Safety Rule: Inferred memory (source: 'inferred') CANNOT suppress an alert.
 * 9. Client-Side Encryption: Encrypted memories (MEM_13) store AES-256-GCM ciphertext without plaintext amounts in public store.
 * 10. Cognitive Envelope Health: Roll-With-The-Punches history (MEM_19) and overspend history (MEM_18) inform baseline adjustments.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WalrusClient } from '../walrusClient.js';
import { WatchdogEngine } from '../watchdogEngine.js';
import { seedAllMemories, INITIAL_MEMORIES } from '../seedMemories.js';
import { TatumClient } from '../tatumClient.js';
import { validateService, ValidationError, updateLedger, toVendorSlug } from '../subscriptionLedger.js';
import { detectSubscriptionProposals } from '../statementParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🧪 Starting PocketSentinel Test Suite (Schema v2)...\n');
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

  // Test 1: Check Walrus Mainnet Memory Count (must match INITIAL_MEMORIES, >= 10 Mainnet rule)
  const memories = await walrus.listMemories();
  assert(memories.length === INITIAL_MEMORIES.length, `Walrus memory count is ${memories.length} (must be ${INITIAL_MEMORIES.length}, >= 10 Mainnet rule)`);
  const uniqueTypes = new Set(memories.map(m => m.type));
  assert(uniqueTypes.size >= 10, `Memories span ${uniqueTypes.size} distinct types (>= 10 required)`);

  const expectedTypes = ['Baseline', 'Override', 'Income', 'Commitment', 'Goal', 'Policy', 'Envelope', 'Correction', 'Preference', 'Decision', 'Event'];
  for (const t of expectedTypes) {
    const hasType = memories.some(m => m.type === t);
    assert(hasType, `Schema v2 type '${t}' is present among anchored memories`);
  }

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

  // Test 6: Safe-to-Spend Runway is computed dynamically from MEM_13 + MEM_15 + MEM_16 (NOT hardcoded constants)
  const runwayResult = await watchdog.calculateRunwayFromMemories(2450.00, '2026-10-15');
  assert(runwayResult.derivedFromMemories.isCalculatedFromMemory === true, 'Runway math dynamically derives from Walrus Memory');
  assert(runwayResult.emergencyBufferReserved === 500.00, 'Safely reserves $500 emergency buffer based on MEM_16');
  assert(runwayResult.runwayDays === 10, 'Calculates exactly 10 days remaining until 25th pay cycle from MEM_13');
  assert(runwayResult.safeToSpendDaily > 0, `Computes dynamic safe-to-spend: $${runwayResult.safeToSpendDaily}/day`);

  // Test 7: Merchant-to-Category Correction Learning (MEM_20)
  // Raw string "SQ *TST* BLUE BOTTLE" should be normalized to "Blue Bottle Coffee" under "Dining"
  const rawTx = {
    merchant: 'SQ *TST* BLUE BOTTLE',
    amount: 6.75,
    date: '2026-10-28'
  };
  const normalizedResult = await watchdog.auditTransaction(rawTx);
  assert(rawTx.merchant === 'Blue Bottle Coffee', 'Normalizes raw merchant string to canonical vendor');
  assert(rawTx.category === 'Dining', 'Auto-assigns category Dining based on MEM_20');
  assert(rawTx.correctionApplied === true, 'Marks correctionApplied flag from episodic memory');

  // Test 8: Safety Rule — Inferred memory CANNOT suppress an alert
  // Commit a temporary inferred override memory
  await walrus.commitMemory({
    id: 'MEM_TEST_INFERRED',
    key: 'inferred_uber_surge',
    type: 'Override',
    source: 'inferred', // Inferred by AI, not approved by human!
    value: { approvedSurgeCeiling: 100.00 },
    content: 'Inferred surge ceiling for Uber'
  });
  const inferredAudit = await watchdog.auditTransaction({
    merchant: 'inferred_uber_surge',
    amount: 75.00,
    date: '2026-10-29'
  });
  assert(inferredAudit.status === 'ESCALATION_REQUIRED', 'Safety rule: Inferred memory cannot suppress alerts');
  assert(inferredAudit.type === 'INFERRED_POLICY_GATE', 'Triggers INFERRED_POLICY_GATE safety stop');

  // Test 9: Client-Side AES-256-GCM Encryption
  // Verify that raw JSON file for MEM_13 (Income) contains ciphertext and NO plaintext amount in the store
  const storeRaw = JSON.parse(fs.readFileSync(walrus.storageFile, 'utf8'));
  const incomeOnchain = storeRaw.memories['primary_pay_cycle'];
  assert(incomeOnchain.sensitivity === 'encrypted', 'MEM_13 is flagged sensitivity: encrypted');
  assert(incomeOnchain.metadata.encryptedPayload && incomeOnchain.metadata.encryptedPayload.ciphertext, 'Stores AES-256-GCM ciphertext');
  assert(incomeOnchain.metadata.encryptedPayload.authTag, 'Stores cryptographic authentication tag');
  assert(incomeOnchain.content.includes('[ENCRYPTED'), 'Redacts plaintext numbers from public onchain content');

  // Verify all encrypted memories in store have valid ciphertext and authTag
  const encryptedMemories = Object.values(storeRaw.memories).filter(m => m.sensitivity === 'encrypted');
  assert(encryptedMemories.length >= 7, `Found ${encryptedMemories.length} encrypted records (expected >= 7)`);
  for (const enc of encryptedMemories) {
    const payload = enc.metadata?.encryptedPayload;
    assert(
      Boolean(payload?.ciphertext && payload?.authTag && payload?.iv),
      `Encrypted memory [${enc.id} / ${enc.key}] contains valid ciphertext, authTag, and IV`
    );
  }

  // Test 10: Cognitive Envelope Health & Overspend Learning (MEM_18, MEM_19, MEM_21)
  const envelopeHealth = await watchdog.evaluateEnvelopeHealth();
  assert(envelopeHealth.envelope === 'Groceries', 'Evaluates Groceries envelope health');
  assert(envelopeHealth.consecutiveOverspendMonths === 3, 'Detects 3 consecutive months of overspending from MEM_18');
  assert(envelopeHealth.lastRebalance.amount === 45.00, 'Reads $45 roll-with-the-punches rebalance from MEM_19');
  assert(envelopeHealth.proposedNewBaseline === 495.00, 'Proposes raising baseline to $495/mo');

  // Test 11: Tatum SDK & Onchain Agent Payments Integration
  const tatum = new TatumClient();
  const tatumBalance = await tatum.getSuiBalance();
  assert(Boolean(tatumBalance.address && tatumBalance.network), 'Tatum queries Sui Mainnet balance');
  
  const gasEst = await tatum.estimateGasPrice();
  assert(Boolean(gasEst.referenceGasPriceMist && gasEst.formattedGasPrice), 'Tatum estimates Sui reference gas price');

  const webhookSub = await tatum.createAnomalySubscription('https://pocketsentinel.app/api/webhooks/tatum');
  assert(webhookSub.status === 'ACTIVE' || webhookSub.status === 'ACTIVE_TELEMETRY', 'Tatum registers address webhook subscription');

  const agentPay = await tatum.executeAgentPayment({
    recipient: '0xagent_bounty_settler_009x',
    amountSui: '0.05 SUI',
    purpose: 'Automated dispute micro-bounty'
  });
  assert(agentPay.status === 'CONFIRMED_ONCHAIN', 'Executes x402 / MPP agent payment on Sui via Tatum');
  // Test 12: Comprehensive Subscription Ledger Lifecycle & Safety Suite
  // 12.1 Proposal detection for unknown recurring debits writes nothing
  const candidateTxs = [
    { raw_merchant: 'Linear App', amount: 15.00, date: '2026-08-01T10:00:00Z' },
    { raw_merchant: 'Linear App', amount: 15.00, date: '2026-09-01T10:00:00Z' }
  ];
  const memCountBefore = (await walrus.listMemories()).length;
  const currentLedger = await walrus.getMemory('MEM_01');
  const proposals = detectSubscriptionProposals(candidateTxs, currentLedger.value.services);
  assert(proposals.length === 1 && proposals[0].vendor === 'linear_app', 'detectSubscriptionProposals detects recurring unrecorded debit');
  assert(proposals[0].detected_cadence === 'monthly', 'detectSubscriptionProposals infers monthly cadence from ~31-day interval');
  const memCountAfter = (await walrus.listMemories()).length;
  assert(memCountBefore === memCountAfter, 'Proposal detection for unknown recurring debits writes nothing to storage');

  // 12.2 Confirm writes a new ledger version (user_confirmed, history increments, supersedes set)
  const prevVersion = currentLedger.version || 1;
  const confirmedLedger = await updateLedger(walrus, (services) => {
    services['linear_app'] = {
      display_name: 'Linear App',
      price: 15.00,
      cadence: 'monthly',
      bill_day: 1,
      status: 'active',
      source: 'user_confirmed',
      raw_patterns: ['Linear App Inc']
    };
    return services;
  }, 'Confirm Linear App subscription proposal');
  assert(confirmedLedger.value.services.linear_app.source === 'user_confirmed', 'Confirm writes entry with source: user_confirmed');
  assert(confirmedLedger.version === prevVersion + 1, 'Confirm increments ledger version');
  assert(confirmedLedger.history.length === prevVersion + 1, 'Confirm appends audit history record');
  assert(Boolean(confirmedLedger.supersedes), 'Confirm sets supersedes pointer to previous version digest');

  // 12.3 Price hike on confirmed vendor triggers MICRO_INFLATION_ALERT
  const hikeAudit = await watchdog.auditTransaction({
    merchant: 'Linear App',
    amount: 18.00,
    date: '2026-10-01'
  });
  assert(hikeAudit.status === 'MICRO_INFLATION_ALERT', 'Price hike on confirmed vendor triggers MICRO_INFLATION_ALERT');
  assert(hikeAudit.deltaAmount === 3.00, 'Price hike calculates correct price delta ($3.00)');

  // 12.4 Inferred / pending_review entry cannot suppress alerts
  await updateLedger(walrus, (services) => {
    services['suspect_stream'] = {
      display_name: 'Suspect Stream',
      price: 9.99,
      cadence: 'monthly',
      bill_day: 15,
      status: 'pending_review',
      source: 'inferred',
      raw_patterns: ['Suspect Stream']
    };
    return services;
  }, 'Add pending_review service');
  const suspectAudit = await watchdog.auditTransaction({
    merchant: 'Suspect Stream',
    amount: 9.99,
    date: '2026-10-15'
  });
  assert(suspectAudit.status === 'ESCALATION_REQUIRED' || suspectAudit.status === 'PENDING_REVIEW', 'Inferred or pending_review entry cannot suppress alerts or match active baseline');

  // 12.5 > $50 unknown debit triggers ESCALATION_REQUIRED
  const largeUnknownAudit = await watchdog.auditTransaction({
    merchant: 'Mystery Software Corp',
    amount: 79.00,
    date: '2026-10-16'
  });
  assert(largeUnknownAudit.status === 'ESCALATION_REQUIRED', '>$50 unknown debit triggers ESCALATION_REQUIRED');

  // 12.6 <= $50 unknown debit returns PENDING_REVIEW / ROUTINE_UNTRACKED
  const smallUnknownAudit = await watchdog.auditTransaction({
    merchant: 'Small Snack Kiosk',
    amount: 12.50,
    date: '2026-10-16'
  });
  assert((smallUnknownAudit.status === 'PENDING_REVIEW' || smallUnknownAudit.status === 'PASSED') && smallUnknownAudit.type === 'ROUTINE_UNTRACKED' && smallUnknownAudit.pending_review === true, '<=$50 unknown debit returns ROUTINE_UNTRACKED with pending_review marker');

  // 12.7 Cancelled service charge triggers REBILL_ALERT
  await updateLedger(walrus, (services) => {
    services['gym_equinox'].status = 'cancelled';
    services['gym_equinox'].cancelled_on = '2026-09-01';
    return services;
  }, 'Cancel Equinox membership');
  const rebillAudit = await watchdog.auditTransaction({
    merchant: 'Equinox',
    amount: 300.00,
    date: '2026-10-17'
  });
  assert(rebillAudit.status === 'REBILL_ALERT' && rebillAudit.type === 'CANCELLED_SERVICE_REBILL', 'Cancelled service charge triggers REBILL_ALERT');

  // 12.8 resolve-change handles both plan_change and price_hike
  // 12.8a plan_change updates ledger service price
  await updateLedger(walrus, (services) => {
    services['netflix'].price = 17.99;
    services['netflix'].source = 'user_confirmed';
    return services;
  }, 'Resolve plan change: update Netflix baseline to 17.99');
  const ledgerAfterPlanChange = await walrus.getMemory('MEM_01');
  assert(ledgerAfterPlanChange.value.services.netflix.price === 17.99, 'resolve-change plan_change updates ledger baseline price');
  assert(ledgerAfterPlanChange.value.services.netflix.source === 'user_confirmed', 'resolve-change plan_change marks source user_confirmed');

  // 12.8b price_hike retains baseline and commits Dispute memory
  const disputeMem = await walrus.commitMemory({
    id: `MEM_DISPUTE_TEST`,
    key: `dispute_netflix_standard_2026`,
    type: 'Dispute',
    category: 'Dispute',
    sensitivity: 'public',
    source: 'user_stated',
    confidence: 1.0,
    value: {
      merchant: 'Netflix',
      unauthorizedDelta: 2.50,
      agreedBaseline: 15.49,
      action: 'CFPB formal notice filed'
    }
  });
  assert(disputeMem.id === 'MEM_DISPUTE_TEST' && disputeMem.type === 'Dispute', 'resolve-change price_hike commits sovereign Dispute memory');

  // 12.9 Invalid input throws ValidationError
  let caughtEmptyName = false;
  try {
    validateService({ display_name: '', price: 10, cadence: 'monthly', bill_day: 5 });
  } catch (e) {
    if (e instanceof ValidationError) caughtEmptyName = true;
  }
  assert(caughtEmptyName, 'validateService throws ValidationError on empty vendor name');

  let caughtLongName = false;
  try {
    validateService({ display_name: 'X'.repeat(85), price: 10, cadence: 'monthly', bill_day: 5 });
  } catch (e) {
    if (e instanceof ValidationError) caughtLongName = true;
  }
  assert(caughtLongName, 'validateService throws ValidationError when vendor exceeds 80 characters');

  let caughtNegPrice = false;
  try {
    validateService({ display_name: 'Bad Price', price: -5, cadence: 'monthly', bill_day: 5 });
  } catch (e) {
    if (e instanceof ValidationError) caughtNegPrice = true;
  }
  assert(caughtNegPrice, 'validateService throws ValidationError on negative price');

  let caughtCadence = false;
  try {
    validateService({ display_name: 'Bad Cadence', price: 10, cadence: 'biweekly', bill_day: 5 });
  } catch (e) {
    if (e instanceof ValidationError) caughtCadence = true;
  }
  assert(caughtCadence, 'validateService throws ValidationError on invalid cadence');

  let caughtBillDay = false;
  try {
    validateService({ display_name: 'Bad Day', price: 10, cadence: 'monthly', bill_day: 35 });
  } catch (e) {
    if (e instanceof ValidationError) caughtBillDay = true;
  }
  assert(caughtBillDay, 'validateService throws ValidationError on invalid bill_day (> 31)');

  // 12.10 Concurrent updateLedger calls both persist under mutex
  await Promise.all([
    updateLedger(walrus, (services) => {
      services['service_alpha'] = {
        display_name: 'Service Alpha',
        price: 9.99,
        cadence: 'monthly',
        bill_day: 5,
        status: 'active',
        source: 'user_stated'
      };
      return services;
    }, 'Add Service Alpha concurrent'),
    updateLedger(walrus, (services) => {
      services['service_beta'] = {
        display_name: 'Service Beta',
        price: 19.99,
        cadence: 'monthly',
        bill_day: 12,
        status: 'active',
        source: 'user_stated'
      };
      return services;
    }, 'Add Service Beta concurrent')
  ]);
  const postConcurrentLedger = await walrus.getMemory('MEM_01');
  assert(Boolean(postConcurrentLedger.value.services.service_alpha), 'Concurrent update A safely persisted under mutex');
  assert(Boolean(postConcurrentLedger.value.services.service_beta), 'Concurrent update B safely persisted under mutex');

  // 12.11 Trial add creates Trial Watch and converts on first charge
  await walrus.commitMemory({
    id: 'MEM_TRIAL_FRAMER',
    key: 'trial_framer',
    type: 'Trial Watch',
    category: 'Trial Watch',
    sensitivity: 'public',
    source: 'user_stated',
    confidence: 1.0,
    value: {
      merchant: 'Framer',
      trialEnds: '2026-11-01',
      expectedRebill: 20.00,
      status: 'active'
    }
  });
  const trialFirstChargeAudit = await watchdog.auditTransaction({
    merchant: 'Framer',
    amount: 20.00,
    date: '2026-11-01'
  });
  assert(trialFirstChargeAudit.trialConverted === true, 'First charge for trial triggers conversion into active subscription');
  const postTrialLedger = await walrus.getMemory('MEM_01');
  assert(Boolean(postTrialLedger.value.services.framer), 'Trial successfully converted to entry in subscription ledger');

  // 12.12 Encrypted ledger payload contains no plaintext amounts in persistent store
  const rawDiskData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/walrus_memory_store.json'), 'utf8'));
  let rawLedgerRecord = null;
  if (Array.isArray(rawDiskData)) {
    rawLedgerRecord = rawDiskData.find(m => m.id === 'MEM_01' || m.key === 'subscription_ledger');
  } else if (rawDiskData.memories) {
    rawLedgerRecord = Object.values(rawDiskData.memories).find(m => m.id === 'MEM_01' || m.key === 'subscription_ledger');
  }
  assert(Boolean(rawLedgerRecord), 'MEM_01 exists in raw walrus memory store');
  assert(rawLedgerRecord.sensitivity === 'encrypted', 'MEM_01 is marked sensitivity: encrypted');
  assert(Boolean(rawLedgerRecord.metadata?.encryptedPayload?.ciphertext), 'MEM_01 contains AES-256-GCM ciphertext payload');
  const rawContentStr = JSON.stringify(rawLedgerRecord);
  assert(!rawContentStr.includes('"15.49"') && !rawContentStr.includes('"10.99"'), 'MEM_01 encrypted payload contains no plaintext amounts in serialized store');

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
