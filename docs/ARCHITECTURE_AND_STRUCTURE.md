# RecallRamp — System Architecture & Repository Structure Specification
**Version:** 2.0 · **Target Hackathon:** Total Recall (Tatum x Walrus Memory)  
**Design Standards:** Modular Design System (MDS) & Anti-Slop Design Contract  
**Security Model:** Sovereign Local-First Client-Side AES-256-GCM + PBKDF2-SHA256

---

## 1. High-Level Architecture & Data Flow

```
┌──────────────────────────────────────── BROWSER (CLIENT-SIDE EXECUTION ONLY) ────────────────────────────────────────┐
│                                                                                                                      │
│  ┌───────────────────────────────┐     ┌──────────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │    Ingestion & Parser         │     │     Watchdog Detection Engine    │     │      Policy Resolver (7.4)      │  │
│  │  - Chase CSV normalization    │────►│  - Cadence clustering (28-31d)   │────►│  - USER_OVERRIDE check          │  │
│  │  - Regex processor strip     │     │  - Baseline delta calculation    │     │  - Vendor escalation threshold  │  │
│  │  - Deduplication engine       │     │  - Trial & duplicate clustering  │     │  - Annual renewal +5% exception │  │
│  └───────────────────────────────┘     └──────────────────────────────────┘     └────────────────┬────────────────┘  │
│                                                                                                  │                   │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────▼────────────────┐  │
│  │                                  Encrypted Local Data Layer (IndexedDB / Dexie.js)                             │  │
│  │  - Plaintext Transactions & Vendor Profiles (survive only in local browser memory)                            │  │
│  │  - Local Mirror of Decrypted Memories for <350ms instant UI recall                                            │  │
│  └───────────────────────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
│                                                                  │                                                   │
│  ┌───────────────────────────────────────────────────────────────▼────────────────────────────────────────────────┐  │
│  │                             WebCrypto Sovereign Encryption Vault (NFR-2)                                       │  │
│  │  - 12+ Char Passphrase ──► PBKDF2-SHA256 (600,000 iter) ──► AES-256-GCM Key                                   │  │
│  │  - Payloads encrypted with fresh 96-bit IV before touching network: { v, iv, ciphertext, tag }                │  │
│  │  - Key bundle export/import: `recallramp-key.json` for multi-device restore                                    │  │
│  └───────────────────────────────────────────────────────────────┬────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────┘
                                                                   │ Ciphertext Only
                                                                   ▼
┌──────────────────────────────────────── SERVER / THIN API (NEXT.JS ROUTE HANDLERS) ──────────────────────────────────┐
│                                                                                                                      │
│  ┌───────────────────────────────┐     ┌──────────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │    /api/memory/commit         │     │     /api/chain/balance           │     │      /api/dispute/render        │  │
│  │  Relays encrypted blobs to    │     │  Calls Tatum Sui RPC gateway     │     │  Stateless template renderer    │  │
│  │  Walrus & Sui anchors         │     │  Cached 30s; server-only secret  │     │  Stores zero user financial data│  │
│  └───────────────┬───────────────┘     └─────────────────┬────────────────┘     └─────────────────────────────────┘  │
└──────────────────┼───────────────────────────────────────┼───────────────────────────────────────────────────────────┘
                   │                                       │
                   ▼                                       ▼
┌───────────────────────────────────────┐ ┌────────────────────────────────────────────────────────────────────────────┐
│      Walrus Memory Decentralized      │ │                    Tatum Sui Mainnet Gateway Rails                         │
│  - `@mysten-incubation/memwal` SDK    │ │  - Gateway URL: `https://sui-mainnet.gateway.tatum.io`                     │
│  - Direct HTTP Publisher/Aggregator   │ │  - Authenticated via `x-api-key` header                                    │
│  - 12 Verified Anchors (ledger.json)  │ │  - Methods: `suix_getBalance`, `suix_queryTransactionBlocks`                │
└───────────────────────────────────────┘ └────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & File Organization

```
recallramp/
├── app/                                    # Next.js 15 App Router (UI & Thin Endpoints)
│   ├── layout.tsx                          # Root layout injecting Modular Design System Provider
│   ├── page.tsx                            # Main Sentinel Dashboard (Anti-slop compliant)
│   ├── memory/page.tsx                     # Walrus Memory Inspector & Suiscan Explorer verifier
│   ├── keys/page.tsx                       # Passphrase vault & key bundle export/import
│   └── api/
│       ├── memory/
│       │   ├── commit/route.ts             # Broadcasts encrypted blob to Walrus / Sui
│       │   ├── recall/route.ts             # Fetches encrypted blobs by namespace
│       │   └── verify/route.ts             # Validates Sui transaction digest onchain
│       ├── chain/balance/route.ts          # Queries Tatum Sui RPC for live wallet balance
│       └── dispute/render/route.ts         # Stateless generator for 1-tap objection letters
├── src/
│   ├── ingest/                             # Ingestion & Normalization Subsystem
│   │   ├── csvParser.ts                    # PapaParse Chase CSV header-mapped ingest
│   │   ├── normalizer.ts                   # Regex processor strip & fuzzy merchant matching
│   │   └── dedupe.ts                       # Deterministic transaction signature deduplication
│   ├── detect/                             # Spend Intelligence Engines
│   │   ├── cadence.ts                      # 28-31 day monthly & 365-day annual clustering
│   │   ├── baseline.ts                     # Median baseline selection algorithm
│   │   ├── trialWatch.ts                   # 48-hour pre-rebill countdown & zero-dollar trigger
│   │   └── overlap.ts                      # Multi-service categorization (Spotify + Apple Music)
│   ├── policy/                             # Precedence & Rule Resolver (PRD Section 7.4)
│   │   ├── precedence.ts                   # USER_OVERRIDE > Vendor Policy > Global > Annual +5%
│   │   └── alertEvaluator.ts               # Absolute cent & percentage breach evaluator
│   ├── memory/                             # Decentralized Memory Architecture
│   │   ├── schema.ts                       # Zod schemas for all MemoryEvent types
│   │   ├── envelope.ts                     # WebCrypto AES-256-GCM encryption/decryption
│   │   ├── store.ts                        # MemoryStore TypeScript interface
│   │   ├── adapter-memwal.ts               # Official @mysten-incubation/memwal adapter
│   │   ├── adapter-walrus-direct.ts        # Direct Walrus HTTP + Sui SDK fallback adapter
│   │   └── mirror.ts                       # IndexedDB Dexie.js local mirror for <350ms recall
│   ├── keys/                               # Cryptographic Key Vault
│   │   ├── kdf.ts                          # PBKDF2-SHA256 (600,000 iterations) key derivation
│   │   └── keyBundle.ts                    # Export/import `recallramp-key.json`
│   ├── chain/                              # Server-Side Web3 Infrastructure
│   │   ├── tatumClient.ts                  # Tatum Sui RPC Gateway wrapper
│   │   └── suiSigner.ts                    # Funded Sui Mainnet signer for memory anchors
│   └── dispute/                            # Human-in-the-Loop Dispute Generation
│       ├── templates.ts                    # Formal objection & cancellation letter templates
│       └── generator.ts                    # Context-injected dispute builder
├── components/                             # UI Components (Anti-Slop Calibrated)
│   ├── dashboard/                          # Hero metrics, Savings Ticker, Run Rate
│   ├── alerts/                             # Micro-Inflation Cards with Walrus Memory Proof
│   ├── subscriptions/                      # Active Streams & 48-Hour Trial Countdown Bar
│   ├── memory/                             # Memory Inspector table with Suiscan links
│   ├── dispute/                            # 1-Tap Dispute Drawer with explicit confirmation
│   └── ui/                                 # Custom styled primitives (MDS compliant)
├── design-system/                          # Modular Design System (MDS) Tokens & Engine
│   ├── CONFIG.yaml                         # Master design configuration
│   ├── tokens.css                          # Color, typography, density, and motion tokens
│   ├── registry.ts                         # Category & look preset registry
│   └── provider.tsx                        # HTML data-attribute and CSS variable injector
├── fixtures/                               # Synthetic Demo Data (Strictly Labeled)
│   ├── sample_chase_statement.csv          # Sample bank CSV with Netflix hike & AWS surge
│   └── seeded_memories.json                # The 12 mandatory Walrus Mainnet fixtures
├── tests/
│   ├── unit/                               # Boundary tests (cents, precedence, zero baseline)
│   └── e2e/                                # Playwright flows (import -> alert -> dispute)
├── memory-ledger.json                      # Verifiable Mainnet digests for hackathon judges
├── .env.example                            # Public variable documentation
└── README.md                               # Project documentation & reproduction steps
```

---

## 3. Modular Design System (MDS) Calibration & Anti-Slop Configuration

To ensure RecallRamp is **completely free of AI slop** and adheres to the Adrian Krebs 16-pattern and 925studios rubrics, the design system is explicitly configured as follows:

### 3.1 MDS Master Configuration (`CONFIG.yaml`)
```yaml
status: configured
category: saas-dashboard
look: minimal-clean

# Theme Tokens (Tailored Financial Sentinel)
mode: dark
primary: "#10B981"          # Mint Sentinel (Signals capital preserved; NOT lavender/indigo)
neutral: slate              # Slate-900 canvas; NOT washed-out low-contrast mud
font_sans: "Plus Jakarta Sans" # Crisp, deliberate UI sans; NOT unchosen Inter
font_display: "Syne"        # Distinctive architectural display font for hero metrics
font_mono: "JetBrains Mono" # Tabular numbers for minor currency units (amountCents)
radius: subtle              # 4px subtle corners; NO uniform 16px bubble cards
density: compact            # High information density for financial telemetry
border: hairline            # 1px crisp borders (var(--border)); NO stacked shadow+glow+gradient
shadow: none                # Flat, surgical plane; zero muddy colored glows
motion: subtle              # Transform & opacity only (150ms); zero ambient floating orbs
```

### 3.2 Anti-Slop Design Enforcement Matrix
| The 16 AI Slop Tells (Adrian Krebs / 925studios) | How RecallRamp Eliminates It |
| :--- | :--- |
| **Tells 1–3: Inter Font & Clichés** | Headlines set in **Syne** (800 weight), body in **Plus Jakarta Sans**, numbers in **JetBrains Mono** with `font-variant-numeric: tabular-nums`. Inter is completely excluded. |
| **Tells 4–7: VibeCode Purple & Muddy Darks** | Primary accent is **Mint Sentinel (`#10B981`)** representing preserved funds. Canvas is rich Obsidian Slate (`#0B0F19`), surface cards (`#111827`). Text contrast strictly verified at $\ge 7:1$ (WCAG AAA). Zero purple gradients or blurred glowing orbs. |
| **Tells 8–11: Centered Hero & 3-Card Row** | Asymmetric command-center layout: Left 2/3 dedicated to Active Subscriptions & Micro-Inflation Radar; Right 1/3 dedicated to live Walrus Memory Inspector and 48-hr Trial Countdown. No 3-card rows. |
| **Tells 12–15: Fake 1-2-3 & Emojis** | No fake numbered steps. No emojis as UI navigation icons. Crisp, single-stroke Lucide icons (`1.5px` stroke). |
| **Tell 16: Raw shadcn/ui Defaults** | All components override default radiuses (`--radius: 0.25rem`), custom compact heights (`--control-h: 2.25rem`), and strict semantic tokens (`--color-action-primary`). |

---

## 4. Core Data Models & TypeScript Contracts

### 4.1 Minor Units Transaction (`src/ingest/types.ts`)
```typescript
export interface Transaction {
  id: string;              // UUIDv4
  postedAt: string;        // ISO-8601 (YYYY-MM-DD)
  amountCents: number;     // Integer minor units (e.g. $15.49 = 1549). Negative = debit.
  currency: 'USD';
  descriptorRaw: string;   // e.g. "TST* NETFLIX.COM 866-579-7172 CA"
  merchantKey: string;     // Normalized slug e.g. "netflix"
  category: string;        // "Streaming Video", "Cloud Hosting"
  sourceFile: string;      // Import batch identifier
}
```

### 4.2 Append-Only Memory Event (`src/memory/schema.ts`)
```typescript
import { z } from 'zod';

export const MemoryEventSchema = z.object({
  schema: z.literal('recallramp.memory.v1'),
  id: z.string(),                  // SHA-256 hash of canonical JSON
  type: z.enum([
    'VENDOR_BASELINE',
    'USER_OVERRIDE',
    'ESCALATION_POLICY',
    'DISPUTE_TRACE',
    'TRIAL_WATCH',
    'OVERLAP_NOTE'
  ]),
  vendorKey: z.string().nullable(),// null for global policies
  payload: z.record(z.unknown()),  // Encrypted client-side before transport
  createdAt: z.string(),           // ISO timestamp
  supersedes: z.string().optional(),// ID of replaced event (versioning, not mutation)
  ownerNamespace: z.string(),      // Hash of user public key
});

export type MemoryEvent = z.infer<typeof MemoryEventSchema>;
```

### 4.3 Policy Precedence Resolution (PRD Section 7.4)
```typescript
export function resolveAlert(
  vendorKey: string,
  chargeCents: number,
  baselineCents: number,
  cadence: 'monthly' | 'annual',
  activeOverride?: UserOverride,
  vendorPolicy?: EscalationPolicy,
  globalPolicy?: EscalationPolicy
): AlertResult {
  // Gate 1: Active, non-expired USER_OVERRIDE suppresses alert immediately
  if (activeOverride && !isExpired(activeOverride) && chargeCents <= activeOverride.approvedCeilingCents) {
    return { status: 'SUPPRESSED', memoryId: activeOverride.id, reason: 'Seasonal override active' };
  }

  const deltaCents = chargeCents - baselineCents;
  const deltaPct = (deltaCents / baselineCents) * 100;

  // Gate 2: Vendor-specific policy (e.g. Netflix $0.00 tolerance)
  if (vendorPolicy) {
    if (deltaCents > vendorPolicy.toleranceCents) {
      return { status: 'ALERT', memoryId: vendorPolicy.id, deltaCents, deltaPct };
    }
    return { status: 'OK' };
  }

  // Gate 3: Annual renewal exception (Prime / 1Password +5% tolerance)
  if (cadence === 'annual' && deltaPct <= 5.0) {
    return { status: 'SUPPRESSED', reason: 'Within annual +5% inflation tolerance' };
  }

  // Gate 4: Global fallback policy (>= $0.50 OR >= 3.0%)
  if (deltaCents >= 50 || deltaPct >= 3.0) {
    return { status: 'ALERT', memoryId: globalPolicy?.id || 'MEM_07', deltaCents, deltaPct };
  }

  return { status: 'OK' };
}
```

---

## 5. Security & Privacy Guarantees

1. **Sovereign Client-Side Encryption**:
   - Plaintext transaction records and account figures reside **only in the browser's IndexedDB**.
   - Before any memory event is transmitted across the network, its payload is encrypted via native `window.crypto.subtle.encrypt` using AES-256-GCM.
   - The Walrus publisher and Sui Mainnet transactions store only encrypted ciphertext envelopes: `{ v: 1, iv: "...", ciphertext: "...", tag: "..." }`.
2. **Key Derivation & Multi-Device Portability**:
   - Keys are derived via `PBKDF2-SHA256` (600,000 rounds) using a user passphrase ($\ge 12$ characters) and a cryptographically random salt.
   - Users can download an encrypted `recallramp-key.json` file. To access memories on a second browser, they import the file, enter their passphrase, and the local mirror is rebuilt without sending secrets to any server.
3. **Secret Isolation**:
   - `TATUM_API_KEY` and `SUI_SIGNER_PRIVATE_KEY` remain strictly in server-side environment variables and are never bundled into client JavaScript.

---

## 6. Implementation Phase Gates

* **Phase 1 Gate**: Directory scaffolding complete; `@mysten-incubation/memwal` or Walrus direct adapter verified with 1 live test write; Tatum Sui RPC balance route returns live data.
* **Phase 2 Gate**: `MemoryStore` adapter committed with the 12 fixture memories to Sui Mainnet; `memory-ledger.json` populated with live transaction digests; key export/import tested in a secondary browser context.
* **Phase 3 Gate**: Ingestion engine parses Chase CSV; cadence detection clusters monthly/annual streams; policy resolver unit tests pass on all boundary conditions.
* **Phase 4 Gate**: Dashboard built with Modular Design System (`CONFIG.yaml`); live Memory Inspector verifies onchain digests; 1-tap dispute generator renders objection letters with HITL sign-off.
* **Phase 5 Gate**: Vercel deployment verified; Lighthouse accessibility score $\ge 90$; public GitHub repo published with complete technical writeup and demo video walkthrough.
