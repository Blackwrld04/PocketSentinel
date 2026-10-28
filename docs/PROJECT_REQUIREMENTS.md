 # RecallRamp — Project Requirements Document & Technical Specification
### Autonomous Consumer Expense Watchdog & Subscription Sentinel Powered by Walrus Memory & Tatum
**Hackathon Target:** Total Recall | Tatum x Walrus Memory Hackathon  
**Target Tracks:** Track 02: Smart Agents for Real Life · Track 03: Consumer Finance Apps  
**Eligible Special Awards:** Best Walrus Memory ($500) · Best Tatum AI Builder App ($500) · Best Use of Agent Payments ($500)  
**Version:** 1.0 (Production Blueprint) · **Date:** October 2026 · **Status:** Approved for Implementation  

---

## 1. Executive Summary & Problem Space

### 1.1 The Market Paradox: Enterprise Privilege vs. Consumer Bleed
In modern corporate finance, companies deploy autonomous platforms like **Ramp**, **Brex**, and **Vendr** to audit every dollar. Enterprise platforms automatically flag duplicate software licenses, alert CFOs when vendors sneak in a 5% price hike at renewal, and negotiate volume discounts. 

Conversely, everyday consumers and freelancers navigate an increasingly predatory, fragmented financial landscape:
1. **Silent Subscription Price Creep:** Streaming services, productivity apps, cloud storage, and gyms quietly hike monthly fees by $1.00 to $4.00 without transparent notification. Across an average household with 11 subscriptions, this "micro-inflation" silently drains $300 to $600 per year.
2. **The "Free Trial" Ambush & Zombie Charges:** Forgotten 7-day trials, split multi-account billing (e.g., paying for Disney+ and Hulu separately instead of a bundle), and continuing memberships after cancellation rob users who lack the time to manually audit monthly PDF statements.
3. **The Dreaded Audit Chores:** Manually logging into 4 banking apps, downloading CSVs, matching paper supermarket receipts, and categorizing transactions is universally dreaded. Consumers put it off indefinitely.
4. **The Flaws of Existing Consumer Tools (Rocket Money / Copilot):**
   * *Centralized Data Harvesting:* Legacy Web2 apps like Rocket Money (formerly Truebill) demand full banking credentials, store transaction records in centralized databases, and sell aggregate financial telemetry to credit rating agencies and advertising brokers.
   * *Extortionate Fee Rakes:* When Rocket Money negotiates a bill down, they charge a punishing 30% to 40% rake of the first year's savings.
   * *Stateless & Fragile:* Copilot Money provides beautiful dashboards, but has zero autonomous cancellation agents, lacks portable memory, and locks users into Apple-only walled gardens.

### 1.2 The RecallRamp Solution
**RecallRamp** is the world's first **decentralized, sovereign personal financial sentinel** engineered for everyday users. It pairs an autonomous AI expense agent with **Walrus Memory on Sui Mainnet** and **Tatum RPC/Data APIs**:
* **Autonomous Expense Watchdog:** Runs silently in the background, continuously auditing transaction feeds, receipt uploads, and recurring charges.
* **Decentralized Long-Term Memory (Walrus):** The agent possesses permanent, cross-session memory stored on Sui Mainnet. It remembers that Netflix was approved at $15.49 in June, remembers your personal tolerance rules ($50 threshold before human sign-off), and suppresses false alarms on annual insurance renewals because it "remembers last year."
* **Tatum Multi-Chain Rails:** Reads onchain balances, monitors Web3 subscription streams, and allows invisible wallet management through Tatum RPC and Data APIs.
* **100% Data Sovereignty:** Financial rules and memories belong entirely to the user—encrypted, sovereign, and portable across tools (Claude, Cursor, web dashboard) via Model Context Protocol (MCP).

---

## 2. Competitive Intelligence & In-Depth Teardown

| Capability / Metric | Ramp AI (Enterprise) | Rocket Money (Consumer) | Copilot Money (Consumer) | RecallRamp (Our Solution) |
| :--- | :--- | :--- | :--- | :--- |
| **Target User** | Mid-to-Large Corporations | General Consumers | Detail-Oriented Budgeters | Everyday Consumers, Freelancers & Prosumers |
| **Subscription Price Creep Detection** | **Yes:** Detects per-seat and baseline license price hikes. | **Partial:** Flags some price spikes; often delayed. | **No:** Only shows recurring list without delta analysis. | **Yes (Core):** Exact percentage and dollar delta alerts against stored Walrus baselines. |
| **Duplicate / Zombie Subscription Slaying** | **Yes:** Flags overlapping tools across employees. | **Yes:** Identifies recurring charges. | **No:** Displays subscriptions, but cannot cancel. | **Yes:** Maps overlapping services (e.g., individual vs. bundle) and fires 48-hr trial expiration alarms. |
| **Memory Architecture** | Centralized Relational SQL DB | Centralized Cloud DB (AWS) | Local device cache + iCloud sync | **Decentralized Walrus Memory (Sui Mainnet)**: Immutable, portable, cross-session episodic memory. |
| **Cancellation & Dispute Execution** | Internal corporate approval workflows | Human call center / automated scripts (Takes 30-40% fee) | Manual DIY (User must cancel themselves) | **1-Tap Autonomous Dispute Pack:** Agent drafts dispute emails/letters; user signs off with 1 tap for $0 rake. |
| **Data Privacy & Monetization** | High (SOC-II, Enterprise NDA) | **Low:** Sells aggregated consumer behavioral data to marketers | Moderate (Apple ecosystem privacy) | **Zero-Knowledge Sovereign:** Client-side encryption; zero data monetization or ad profiling. |
| **Multi-Asset & Web3 Support** | Traditional Fiat / Corporate Credit Cards | Fiat Bank Checking / Credit only | Fiat Bank Accounts only | **Hybrid Fiat & Web3:** Tatum RPC reads Sui/EVM balances alongside standard financial feeds. |

---

## 3. Total Recall Hackathon Alignment & Compliance

### 3.1 Track 02 Alignment: Smart Agents for Real Life
RecallRamp directly fulfills Track 02's primary prompt:
* *"Agents that monitor inboxes, expenses, habits, or workflows. Portable memory means they pick up where they left off across tools and sessions."*
* **Core deliverable:** An Expense Watchdog with Long-Term Memory that eliminates the dreaded Sunday afternoon financial chore.

### 3.2 Track 03 Alignment: Consumer Finance Apps
RecallRamp fulfills Track 03's consumer money mandate:
* *"Money products people actually open. Shared budgets, spend tracking, savings goals, and payment flows that feel normal. Blockchain stays invisible. Walrus Memory makes balances, habits, and preferences stick across sessions."*
* **Core deliverable:** Subscription manager with learned spend limits and adaptive cash flow pattern detection.

### 3.3 Mandatory Technical Checklist & Verification Plan
1. **Walrus Memory Mainnet Writes:** The backend connects to the Walrus Memory API (`https://memory.walrus.xyz`) using a registered `MEMWAL_AGENT_ID`. Every detected vendor rule, user override, and expense baseline is written as a permanent memory blob.
2. **$\ge$ 10 Mainnet Memory Writes:** The repository includes a deterministic seeding test harness (`test_walrus_mainnet.py`) that provisions 12 distinct financial memory nodes covering Netflix, Spotify, AWS, Gym, Uber, and user budget escalation boundaries.
3. **Tatum Integration:** Utilizes Tatum's Sui RPC (`https://sui-mainnet.gateway.tatum.io`) and Data APIs to query wallet balances, verify transaction states, and monitor agent payment streams.
4. **Tatum AI Builder Acceleration:** The application prototype is initialized using `ai.tatum.io` using the *"Expense watchdog agent"* specification to secure the $500 dedicated award.
5. **Open Source & Documentation:** A complete public repository with automated test suites, clean architectural diagrams, and an insightful technical blog post demonstrating the before-and-after of an agent with memory.

---

## 4. System Architecture & Information Flow

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │                    Multi-Channel Financial Ingestion                   │
   │      - Bank CSV Statement Uploads   - Real-Time Webhooks / Plaid       │
   │      - Camera Receipt OCR (Gemma 2) - Manual Quick-Add                 │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ Raw Transaction Stream
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                      RecallRamp Core Intelligence                      │
   │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
   │  │ Micro-Inflation Engine  │  │   Zombie Trial & Renewal Watchdog   │  │
   │  │ Compares tx amount      │  │   Tracks renewal cadence (monthly,  │  │
   │  │ against Walrus baseline │  │   annual) and 48-hr pre-rebill flags│  │
   │  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
   └──────────────┼───────────────────────────────────┼─────────────────────┘
                  │                                   │
                  ▼                                   ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                  Walrus Memory Integration Module                      │
   │  - `read_vendor_memory(vendor_id)`: Fetches baseline, history & limits │
   │  - `commit_memory_event(memory_payload)`: Writes Mainnet memory blob   │
   │  - `resolve_override(user_action)`: Updates policy rules as data       │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │
                  ┌────────────────────┴────────────────────┐
                  ▼                                         ▼
   ┌───────────────────────────────┐       ┌───────────────────────────────┐
   │  Walrus Memory (Sui Mainnet)  │       │     Tatum Infrastructure      │
   │  Permanent decentralized state│       │  Sui RPC & Data APIs          │
   │  Delegate Key / Agent ID Auth │       │  Onchain Balance Verification │
   └───────────────────────────────┘       └───────────────────────────────┘
```

---

## 5. Functional Requirements (FR)

### FR-1: Ingestion & Transaction Parsing Engine
* **FR-1.1:** The system shall ingest financial transactions via direct JSON payload, CSV statement upload (standard Chase, Bank of America, Monzo formats), and image receipt uploads.
* **FR-1.2:** For receipt images, the system shall extract merchant name, transaction date, line items, and total amount with $>95\%$ OCR accuracy.

### FR-2: Micro-Inflation & Stealth Price Creep Sentinel
* **FR-2.1:** Upon ingesting a transaction, the system shall query Walrus Memory for prior baseline charges from the same merchant entity.
* **FR-2.2:** If the current charge exceeds the established baseline by $\ge \$0.50$ or $\ge 3\%$ without a corresponding recorded user override, the system shall flag the transaction as a `MICRO_INFLATION_ALERT`.
* **FR-2.3:** The alert shall quantify the annualized financial impact (e.g., *"+$2.50/mo = $30.00/year drain"*).

### FR-3: Zombie Subscription & Free Trial Tracker
* **FR-3.1:** The system shall cluster periodic transactions (28–31 day intervals, 365-day intervals) to catalog active subscriptions.
* **FR-3.2:** For free trial signups, the system shall register a countdown timer and issue an actionable reminder **48 hours before the first auto-rebill occurs**.
* **FR-3.3:** The system shall identify overlapping duplicate software/services (e.g., Spotify Individual + Apple Music active simultaneously).

### FR-4: Walrus Decentralized Memory Spine
* **FR-4.1:** The system shall interface with the Walrus Memory REST API using `MEMWAL_AGENT_ID` credentials on Sui Mainnet.
* **FR-4.2:** The system shall store four core memory types:
  1. `VENDOR_BASELINE`: Merchant name, category, expected amount, cadence.
  2. `USER_OVERRIDE`: Historical approvals for seasonal surges (e.g., Q4 AWS hosting spike).
  3. `ESCALATION_POLICY`: Threshold amounts requiring human confirmation (e.g., Flag any unknown charge $> \$50$).
  4. `DISPUTE_TRACE`: History of contested charges and vendor outcomes.
* **FR-4.3:** The system must guarantee at least 10 verified memory writes are committed to Mainnet during initialization.

### FR-5: 1-Tap Dispute & Cancellation Assistant (Human-in-the-Loop)
* **FR-5.1:** When a price creep or unauthorized subscription is flagged, the agent shall generate a pre-drafted **Dispute Pack** containing:
  - Formal cancellation or refund request text citing charge dates and transaction IDs.
  - Merchant customer support contact endpoint or cancellation URL.
* **FR-5.2:** The system shall enforce a strict Human-in-the-Loop gate: no dispute email or cancellation webhook shall fire without explicit user confirmation.

### FR-6: Tatum Onchain Multi-Asset Verification
* **FR-6.1:** The system shall integrate Tatum's Sui RPC to query live wallet balances and onchain stablecoin reserves.
* **FR-6.2:** If enabled, the system can disburse micro-bounties or agent payments over Sui using x402 / MPP rails.

### FR-7: Consumer-Grade Dashboard & Memory Inspector
* **FR-7.1:** The UI shall feature a high-contrast Neo-Brutalist dashboard with:
  - **Live Savings Ticker:** Total dollars preserved by the watchdog.
  - **Active Subscriptions Board:** Renewal calendar, cadence, and price-creep indicators.
  - **Walrus Memory Inspector:** Transparent feed of memories stored on Mainnet showing exact keys and timestamps.
  - **Pending Decision Cards:** Actionable 1-tap approval/dispute modal.

### FR-8: 20-Second Lazy Audio Financial Pulse
* **FR-8.1:** The system shall synthesize a concise, 20-second audio summary designed for morning routines, detailing active alerts and saved funds without requiring dashboard inspection.

---

## 6. Non-Functional Requirements (NFR)

* **NFR-1 (Performance & Latency):** Memory query and baseline comparison must execute in $<350	ext{ ms}$. Full statement processing of 100 transactions must complete in $<2.5	ext{ seconds}$.
* **NFR-2 (Security & Sovereignty):** All transaction data stored in Walrus Memory must be encrypted using AES-256-GCM before transport. The user retains the decryption key in browser storage.
* **NFR-3 (Availability & Durability):** Walrus Memory guarantees decentralized persistence. The agent's memory must remain completely intact across app uninstalls, browser restarts, and server redeployments.
* **NFR-4 (Explainability):** Every notification must cite the exact memory key and historical date used to justify the alert (e.g., *"Based on Memory #04 written on June 14, 2026"*).
* **NFR-5 (Modularity & MCP Support):** The core memory engine shall be wrapped as a Model Context Protocol (MCP) server, allowing users to query their financial memory directly from Claude Desktop or Antigravity IDE.

---

## 7. The 10+ Walrus Mainnet Memory Specification

| Memory ID | Category | Merchant / Key | Stored Content & Policy Semantics | Mainnet Status |
| :--- | :--- | :--- | :--- | :--- |
| `MEM_01` | Baseline | `netflix_standard` | `$15.49/mo baseline established. Max acceptable variance: $0.00. Alert on any deviation.` | Committed |
| `MEM_02` | Baseline | `spotify_premium` | `$10.99/mo baseline. Flag price increase > $0.50 immediately.` | Committed |
| `MEM_03` | Baseline | `chatgpt_plus` | `$20.00/mo recurring on the 14th. Auto-reconcile without human ping.` | Committed |
| `MEM_04` | Override | `aws_cloud_hosting` | `Q4 holiday traffic approved for surges up to $180/mo (authorized by user Oct 2025).` | Committed |
| `MEM_05` | Baseline | `gym_equinox` | `$240.00/mo billed on 1st. Seasonal freeze scheduled for January.` | Committed |
| `MEM_06` | Trial Watch | `adobe_creative_trial` | `7-day free trial started Oct 18. Mandatory 48h cancellation notice scheduled Oct 23.` | Committed |
| `MEM_07` | Policy | `unknown_vendor_threshold` | `Strict rule: Any new merchant debiting > $50.00 requires immediate SMS/Push approval.` | Committed |
| `MEM_08` | Policy | `annual_renewal_tolerance` | `Annual renewals (Prime, 1Password) permitted +5% max inflation vs prior year.` | Committed |
| `MEM_09` | Baseline | `github_copilot` | `$10.00/mo baseline developer tool. Do not flag unless duplicated by team seat.` | Committed |
| `MEM_10` | Dispute Trace | `doordash_pass` | `Duplicate charge disputed in August 2026. Refunded $9.99. Watch merchant for rebill.` | Committed |
| `MEM_11` | Overlap Watch | `audio_streaming_overlap` | `Duplicate alert: User holds active Spotify ($10.99) and Apple Music ($10.99). Prompt consolidation.` | Committed |
| `MEM_12` | Baseline | `icloud_storage_2tb` | `$9.99/mo family plan. Fixed utility tier.` | Committed |

---

## 8. Development, Verification & Submission Roadmap

* **Phase 1: Environment & Keys (Day 1):**
  - Provision Tatum API key via [dashboard.tatum.io](https://dashboard.tatum.io/).
  - Create Walrus Memory agent via [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) and export `MEMWAL_AGENT_ID`.
  - Prompt initial shell on `ai.tatum.io` for the $500 AI Builder award.
* **Phase 2: Core Engine & Walrus Mainnet Seeding (Days 2–4):**
  - Implement `app/engine/watchdog.py` and `app/services/walrus_memory.py`.
  - Execute automated Mainnet test suite writing the 12 verified financial memories.
* **Phase 3: Tatum RPC & Multi-Asset Binding (Days 5–7):**
  - Wire Tatum Sui RPC for real-time wallet balance queries and transaction state indexing.
* **Phase 4: Consumer Neo-Brutalist Dashboard (Days 8–11):**
  - Build responsive React UI with live memory inspector, micro-inflation tags, and 1-tap dispute drawer.
* **Phase 5: Testing, Blog Post & Hackathon Submission (Days 12–14):**
  - Publish public repository on GitHub.
  - Deploy production application to Render / Vercel.
  - Publish required blog post documenting the Walrus Memory learning loop.
  - Submit entry to Total Recall Hackathon before November 10, 2026.
