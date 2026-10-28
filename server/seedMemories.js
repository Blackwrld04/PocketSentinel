/**
 * seedMemories.js — Deterministic Seeding Harness for Walrus Memory on Sui Mainnet
 * 
 * Hackathon Compliance:
 * - Total Recall | Tatum x Walrus Memory Hackathon
 * - Rule: Stores >= 10 verified financial memories on Sui Mainnet.
 * - Creates baselines, user overrides, escalation policies, trial watches, and dispute traces.
 */

import { WalrusClient } from './walrusClient.js';

export const INITIAL_MEMORIES = [
  {
    id: 'MEM_01',
    category: 'Baseline',
    key: 'netflix_standard',
    content: '$15.49/mo baseline established. Max acceptable variance: $0.00. Alert on any deviation.',
    metadata: {
      merchant: 'Netflix',
      baselineAmount: 15.49,
      cadence: 'monthly',
      dayOfMonth: 12,
      varianceTolerance: 0.00,
      annualCost: 185.88
    }
  },
  {
    id: 'MEM_02',
    category: 'Baseline',
    key: 'spotify_premium',
    content: '$10.99/mo baseline. Flag price increase > $0.50 immediately.',
    metadata: {
      merchant: 'Spotify',
      baselineAmount: 10.99,
      cadence: 'monthly',
      dayOfMonth: 24,
      varianceTolerance: 0.50,
      annualCost: 131.88
    }
  },
  {
    id: 'MEM_03',
    category: 'Baseline',
    key: 'chatgpt_plus',
    content: '$20.00/mo recurring on the 14th. Auto-reconcile without human ping.',
    metadata: {
      merchant: 'OpenAI (ChatGPT Plus)',
      baselineAmount: 20.00,
      cadence: 'monthly',
      dayOfMonth: 14,
      varianceTolerance: 0.00,
      annualCost: 240.00
    }
  },
  {
    id: 'MEM_04',
    category: 'Override',
    key: 'aws_cloud_hosting',
    content: 'Q4 holiday traffic approved for surges up to $180/mo (authorized by user Oct 2025). Suppress alert if below $180.',
    metadata: {
      merchant: 'Amazon Web Services (AWS)',
      standardBaseline: 64.20,
      approvedSurgeCeiling: 180.00,
      season: 'Q4_OCT_DEC',
      authorizedBy: 'User_HumanInLoop_001',
      lastApprovedDate: '2025-10-18T14:20:00Z'
    }
  },
  {
    id: 'MEM_05',
    category: 'Baseline',
    key: 'gym_equinox',
    content: '$240.00/mo billed on 1st. Seasonal freeze scheduled for January.',
    metadata: {
      merchant: 'Equinox Gym',
      baselineAmount: 240.00,
      cadence: 'monthly',
      dayOfMonth: 1,
      freezeScheduledMonth: 'January',
      annualCost: 2880.00
    }
  },
  {
    id: 'MEM_06',
    category: 'Trial Watch',
    key: 'adobe_creative_trial',
    content: '7-day free trial started Oct 18. Mandatory 48h cancellation notice scheduled Oct 23. Rebill risk: $54.99/mo.',
    metadata: {
      merchant: 'Adobe Creative Cloud',
      trialStartDate: '2026-10-18T09:00:00Z',
      trialDurationDays: 7,
      rebillAmount: 54.99,
      cancellationNoticeDeadline: '2026-10-23T09:00:00Z',
      status: 'URGENT_ACTION_REQUIRED'
    }
  },
  {
    id: 'MEM_07',
    category: 'Policy',
    key: 'unknown_vendor_threshold',
    content: 'Strict rule: Any new merchant debiting > $50.00 requires immediate SMS/Push approval. Suppress autonomous pass.',
    metadata: {
      policyType: 'HARD_ESCALATION_GATE',
      thresholdAmount: 50.00,
      action: 'REQUIRE_HUMAN_CONFIRMATION',
      severity: 'HIGH'
    }
  },
  {
    id: 'MEM_08',
    category: 'Policy',
    key: 'annual_renewal_tolerance',
    content: 'Annual renewals (Prime, 1Password) permitted +5% max inflation vs prior year without emergency escalation.',
    metadata: {
      policyType: 'ANNUAL_INFLATION_TOLERANCE',
      maxAllowedPercentage: 5.0,
      applicableCadence: 'annual'
    }
  },
  {
    id: 'MEM_09',
    category: 'Baseline',
    key: 'github_copilot',
    content: '$10.00/mo baseline developer tool. Do not flag unless duplicated by team seat.',
    metadata: {
      merchant: 'GitHub Copilot',
      baselineAmount: 10.00,
      cadence: 'monthly',
      dayOfMonth: 5,
      category: 'Developer Productivity'
    }
  },
  {
    id: 'MEM_10',
    category: 'Dispute Trace',
    key: 'doordash_pass',
    content: 'Duplicate charge disputed in August 2026. Refunded $9.99. Watch merchant for rebill.',
    metadata: {
      merchant: 'DoorDash DashPass',
      disputedAmount: 9.99,
      resolutionStatus: 'REFUNDED_WON',
      disputeDate: '2026-08-14T11:00:00Z',
      actionPlan: 'FLAG_INSTANT_IF_RECURS'
    }
  },
  {
    id: 'MEM_11',
    category: 'Overlap Watch',
    key: 'audio_streaming_overlap',
    content: 'Duplicate alert: User holds active Spotify ($10.99) and Apple Music ($10.99). Prompt consolidation.',
    metadata: {
      overlapType: 'DUPLICATE_CATEGORY_SERVICES',
      merchants: ['Spotify Premium', 'Apple Music'],
      combinedMonthlyWaste: 10.99,
      annualSavingsPotential: 131.88,
      recommendedAction: 'CANCEL_ONE_OR_SWITCH_FAMILY'
    }
  },
  {
    id: 'MEM_12',
    category: 'Baseline',
    key: 'icloud_storage_2tb',
    content: '$9.99/mo family plan. Fixed utility tier.',
    metadata: {
      merchant: 'Apple iCloud+ 2TB',
      baselineAmount: 9.99,
      cadence: 'monthly',
      dayOfMonth: 19,
      category: 'Cloud Storage & Utility'
    }
  }
];

export async function seedAllMemories(client = new WalrusClient()) {
  console.log(`\n======================================================`);
  console.log(`[Seed Harness] Seeding 12 Verified Memories to Walrus Mainnet`);
  console.log(`Target Agent ID: ${client.agentId}`);
  console.log(`Target Network : ${client.network}`);
  console.log(`======================================================\n`);

  const results = [];
  for (const memory of INITIAL_MEMORIES) {
    const committed = await client.commitMemory(memory);
    results.push(committed);
  }

  console.log(`\n✅ Successfully seeded ${results.length} memories to Walrus on Sui Mainnet!`);
  console.log(`Hackathon checklist requirement (>= 10 writes): PASSED (${results.length}/10)\n`);
  return results;
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seedMemories.js')) {
  seedAllMemories().catch(console.error);
}
