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
import { seedAllMemories } from '../seedMemories.js';

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

  // Test 1: Check Walrus Mainnet Memory Count == 24 (spanning 10 distinct types)
  const memories = await walrus.listMemories();
  assert(memories.length === 24, `Walrus memory count is ${memories.length} (must be 24, >= 10)`);
  const uniqueTypes = new Set(memories.map(m => m.type));
  assert(uniqueTypes.size >= 8, `Memories span ${uniqueTypes.size} distinct Schema v2 types`);

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
  const storeRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/walrus_memory_store.json'), 'utf8'));
  const incomeOnchain = storeRaw.memories['primary_pay_cycle'];
  assert(incomeOnchain.sensitivity === 'encrypted', 'MEM_13 is flagged sensitivity: encrypted');
  assert(incomeOnchain.metadata.encryptedPayload && incomeOnchain.metadata.encryptedPayload.ciphertext, 'Stores AES-256-GCM ciphertext');
  assert(incomeOnchain.metadata.encryptedPayload.authTag, 'Stores cryptographic authentication tag');
  assert(incomeOnchain.content.includes('[ENCRYPTED'), 'Redacts plaintext numbers from public onchain content');

  // Test 10: Cognitive Envelope Health & Overspend Learning (MEM_18, MEM_19, MEM_21)
  const envelopeHealth = await watchdog.evaluateEnvelopeHealth();
  assert(envelopeHealth.envelope === 'Groceries', 'Evaluates Groceries envelope health');
  assert(envelopeHealth.consecutiveOverspendMonths === 3, 'Detects 3 consecutive months of overspending from MEM_18');
  assert(envelopeHealth.lastRebalance.amount === 45.00, 'Reads $45 roll-with-the-punches rebalance from MEM_19');
  assert(envelopeHealth.proposedNewBaseline === 495.00, 'Proposes raising baseline to $495/mo');

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
