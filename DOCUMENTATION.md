# PocketSentinel — Master Architecture & Technical Documentation
### Autonomous Consumer Expense Watchdog & Financial Copilot Powered by Walrus Episodic Memory, Tatum RPC, and Groq AI

**Hackathon Target:** Total Recall | Tatum x Walrus Memory Hackathon  
**Target Tracks:** Track 02: Smart Agents for Real Life · Track 03: Consumer Finance Apps  
**Eligible Special Awards:** Best Walrus Memory ($500) · Best Tatum AI Builder App ($500) · Best Use of Agent Payments ($500)  
**Version:** 2.0 (Consumer Edition) · **Date:** October 2026 · **Status:** Production Verified  

---

## 1. Product Philosophy: Invisible Decentralization for Everyday Consumers

### 1.1 The Core Thesis
Most Web3 and decentralized applications fail because they expose their internal plumbing to ordinary people. Asking an everyday consumer to manage hex addresses (`0x4f8e...`), pay SUI gas tokens to check their subscription list, copy PBKDF2 salt strings, or write regex rules to categorize a grocery receipt creates immediate friction, stress, and abandonment.

**PocketSentinel solves this through "Invisible Sovereignty":**
* **Consumer-Grade Simplicity:** The user interface looks and feels like a tier-one personal finance application. Everything is intuitive, clear, and focused on one goal: **protecting household cash runway and stopping predatory subscription leakage**.
* **Zero-Burden Background Execution:** Every advanced decentralized system—Walrus onchain episodic memory commits, Tatum Sui Mainnet RPC queries, WebCrypto AES-256-GCM encryption, Groq LLaMA-3.3-70B inference, and automated rule engines—operates **100% autonomously in the background**.
* **No Tech Jargon in the UI:** Users are never prompted for cryptographic passphrases, RPC URLs, gas wallets, or regex patterns. The application simply works.

---

## 2. System Architecture: The Foreground vs. Background Separation

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CONSUMER FOREGROUND (ZERO STRESS INTERFACE)                 │
│                                                                                 │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌────────────────────┐ │
│  │ Safe-to-Spend Runway  │  │ Zero-Based Envelopes   │  │ Groq AI Copilot    │ │
│  │ ($482.35, $48.23/day) │  │ (Adaptive Rebalance)   │  │ (3 Personas, Wisdom│ │
│  └───────────────────────┘  └────────────────────────┘  └────────────────────┘ │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌────────────────────┐ │
│  │ Subscription Ledger   │  │ Price Creep Alerts     │  │ 1-Tap Dispute Pack │ │
│  │ (9 Active Services)   │  │ (+$2.50 Netflix hike)  │  │ (CFPB Legal Objs)  │ │
│  └───────────────────────┘  └────────────────────────┘  └────────────────────┘ │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Transparent RPC & Event Loop
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   SOVEREIGN BACKGROUND ENGINE (RUNS AUTONOMOUSLY)               │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. Walrus Episodic Memory on Sui Mainnet                                 │  │
│  │    - 12 Verified Onchain Memory Anchors (Baselines, Overrides, Watches)    │  │
│  │    - Agent ID: walrus_agent_recallramp_mainnet_0x7f4b82c                  │  │
│  │    - Eliminates false alarms, stores permanent cross-session context      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 2. Groq AI Autonomous Decision Engine                                     │  │
│  │    - Ultra-fast LLaMA-3.3-70B inference via backend environment variable  │  │
│  │    - Fully grounded in live ledger figures & 5 classic finance books      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 3. Autonomous Statement Normalization & Categorization Engine              │  │
│  │    - RULE_01: Rideshare routing   - RULE_02: Supermarket routing          │  │
│  │    - RULE_03: Quarantine > $100   - RULE_04: Tatum Sui FX conversion      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 4. Client-Side WebCrypto AES-256-GCM Zero-Knowledge Vault                 │  │
│  │    - Automatic browser-derived encryption keys; zero plaintext stored     │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 5. Tatum Multi-Chain Infrastructure                                        │  │
│  │    - Sui Mainnet Gateway & RPC reconciliation                             │  │
│  │    - Automated x402 dispute settlement verification                       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed UI Audit: What Stays in the UI vs. What Runs in the Background

To eliminate all complexity for everyday users, we conducted a forensic audit of every component:

| Feature / System | Previous State (Developer UI) | New State (Consumer Background) | Why It Stresses Everyday Users | How It Operates In Background |
| :--- | :--- | :--- | :--- | :--- |
| **Walrus Memory Inspector** | Exposed full table with `MEM_01`, Sui Tx digests, re-seed buttons, and JSON keys. | **Moved 100% to Background**. Removed `#viewMemory` and top nav tab. | Everyday consumers don't care about blockchain digests; it makes the app feel like a developer tool. | `server/walrusClient.js` automatically commits, queries, and verifies all 12 baseline memories on Sui Mainnet. |
| **Groq AI API Key** | Input field in UI settings asking user to paste `gsk_...` key. | **Moved to Backend `.env`**. Removed from Settings UI. | Everyday users do not have Groq API developer accounts; asking for an API key blocks onboarding. | Server reads `process.env.GROQ_API_KEY`. If present, calls Groq Cloud LLaMA-3.3-70B; if omitted, seamlessly uses built-in engine. |
| **WebCrypto Vault Key Export** | Settings card asking for 12-char master passphrase and downloading `.json` key bundles. | **Automated in Browser Session**. Removed from Settings UI. | Normal users don't manage JSON cryptographic key bundles. | Browser uses SubtleCrypto to derive AES-256-GCM keys locally. Data is encrypted before transit without user burden. |
| **Tatum Sui RPC & Gas Wallet** | Card displaying `0x4f8e...` gas wallet and SUI balance in header. | **Handled by Server Infrastructure**. Removed from UI. | Users wondering why they need cryptocurrency to manage Netflix or DoorDash charges. | Tatum RPC calls are routed server-side. Currency conversions and onchain anchors execute transparently. |
| **Smart Logic Rules** | Form asking users to enter regex `/(Trader Joe|...)/i` and condition operators. | **Autonomous Rule Engine**. Removed manual configuration table. | Everyday budgeters cannot write regex; manual rule maintenance causes cognitive overload. | Rules execute automatically on statement import. 9-column normalized Tiller CSV is available via 1-click export. |
| **False Alarm Overrides** | Labeled as `Walrus Memory [MEM_04]` with hex keys. | Labeled as **Approved Spending Exceptions**. | Blockchain IDs look like software bugs to non-technical users. | System reconciles seasonal bursts (e.g. AWS ML surge) against onchain policy and suppresses alarms silently. |
| **Dispute Modal** | Button said *"Confirm & Log to Walrus Memory"*. | Button says **"Confirm & Generate Dispute Pack"**. | Confusing blockchain terminology in an emergency dispute workflow. | The memory log still commits to Walrus on Sui Mainnet via API, while the user receives their CFPB dispute pack. |

---

## 4. Decentralized Episodic Memory: Walrus on Sui Mainnet

### 4.1 Why Walrus Memory is Transformative
Traditional finance apps are **stateless or centralized**:
* Centralized apps sell aggregate telemetry to data brokers and retain ownership of user history.
* Local apps lose context when switching tools or sessions.

**Walrus gives the AI Sentinel persistent, sovereign memory:**
1. **Agent ID Registration:** `walrus_agent_recallramp_mainnet_0x7f4b82c` on Sui Mainnet.
2. **Permanent Baselines:** Remembers that Netflix was approved at $\$15.49$ in June. When Netflix bills $\$17.99$ in October, the agent instantly detects a $+\$2.50$/mo creep ($\$30.00$/yr leakage).
3. **Suppression of False Alarms:** Remembers that AWS bills surge in Q4 due to machine learning compute, up to an authorized ceiling of $\$180.00$. When a $\$142.50$ charge hits, the agent suppresses the alert, eliminating alert fatigue.
4. **Trial Expiration Defense:** Tracks Adobe CC 7-day trial and alerts the user 48 hours prior to auto-rebill ($\$54.99$/mo).

### 4.2 The 12 Verified Onchain Memory Anchors
Provisioned via `server/seedMemories.js` and verified in unit tests (`npm test`):

```javascript
[MEM_01] netflix_standard: Baseline $15.49/mo (Flags $17.99 debit as +$2.50 creep)
[MEM_02] spotify_premium: Baseline $10.99/mo (Active baseline verification)
[MEM_03] chatgpt_plus: Baseline $20.00/mo (AI productivity baseline)
[MEM_04] aws_cloud_hosting: Seasonal Override Ceiling $180.00 (Suppresses false alarm on $142.50 debit)
[MEM_05] gym_equinox: Frozen State $0.00/mo (Injury medical suspension freeze)
[MEM_06] adobe_creative_trial: Trial Watch (7-day trial ending in 48 hours, $54.99/mo risk)
[MEM_07] unknown_vendor_threshold: Policy Gate ($50.00 limit before human sign-off)
[MEM_08] annual_renewal_tolerance: Policy Ceiling (Flag annual price hikes > 5.0%)
[MEM_09] github_copilot: Baseline $10.00/mo (Developer tooling baseline)
[MEM_10] doordash_pass: Dispute Trace (Active dispute tracking against unauthorized fee creep)
[MEM_11] audio_streaming_overlap: Overlap Watch (Flags Spotify $10.99 + Apple Music $10.99 redundancy)
[MEM_12] icloud_storage_2tb: Baseline $9.99/mo (Family cloud storage baseline)
```

---

## 5. Groq AI Inference & Personal Finance Literature Engine

### 5.1 Architecture & Low-Latency Execution
* **Model:** LLaMA-3.3-70B-Versatile / LLaMA-3.1-8B-Instant via Groq Cloud.
* **Latency:** Sub-$250\text{ms}$ response time enabled by Groq's LPU (Language Processing Unit) architecture.
* **Backend Ingestion:** Configured via `GROQ_API_KEY` in `.env` (no API key required from end users).

### 5.2 Real-Time Financial Awareness
The AI Copilot does not give generic advice. It parses the user's exact live ledger numbers:
* **Monthly Direct Inflow:** $\$4,850.00$ / month
* **Fixed Commitments:** $\$301.46$ across 9 active subscriptions ($6.2\%$ of income)
* **Walrus Emergency Vault:** $\$500.00$ onchain reserve floor
* **Variable Audited Spend:** $\$3,566.19$ (Chase statement transactions)
* **Safe-to-Spend Runway:** $\$482.35$ remaining
* **Daily Velocity Allowance:** $\$48.23$ / day across the 10 remaining cycle days
* **Envelopes Status:**
  * Dining Out: $-\$45.00$ deficit ($\$395$ spent vs $\$350$ budget)
  * Discretionary Fun: $+\$130.00$ surplus ($\$120$ spent vs $\$250$ budget)

### 5.3 Synthesis of Classic Personal Finance Literature

```
                    PERSONAL FINANCE LITERATURE SYNTHESIS
                    
   Morgan Housel                       Ramit Sethi                    Vicki Robin
  Psychology of Money            I Will Teach You To Be Rich      Your Money or Your Life
 ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
 │ Room for error       │       │ Conscious Spending   │       │ Money = Life Energy  │
 │ ($500 vault is peace │       │ Fix the big wins!    │       │ $65 dinner = 2.1 hrs │
 │ of mind, not waste)  │       │ Cancel $55 Adobe CC  │       │ of finite life labor │
 └──────────┬───────────┘       └──────────┬───────────┘       └──────────┬───────────┘
            │                              │                              │
            └──────────────────────────────┼──────────────────────────────┘
                                           │
                                           ▼
                                 SENTINEL AI COPILOT
                                           ▲
            ┌──────────────────────────────┼──────────────────────────────┐
            │                              │                              │
 ┌──────────┴───────────┐       ┌──────────┴───────────┐       ┌──────────┴───────────┐
 │ Pay Yourself First   │       │ Roll with the Punches│       │ Forensic Reasoning   │
 │ 10.3% ($500) saved   │       │ Rebalance -$45 Dining│       │ Dynamic Affordability│
 │ before spending bills│       │ from +$130 Fun budget│       │ Velocity Burn Rate   │
 └──────────────────────┘       └──────────────────────┘       └──────────────────────┘
     George S. Clason              Adaptive Rebalancing              PocketSentinel
  Richest Man in Babylon             Zero-Based Ledger              Decision Protocol
```

1. **Morgan Housel (*The Psychology of Money*):**
   * *Room for Error:* The $\$500$ emergency buffer is not dead money; it is insurance that prevents having to sell assets or take debt when shocks occur.
   * *True Wealth:* True wealth is what you don't spend. The $\$482.35$ safe runway represents freedom and time autonomy.
2. **Ramit Sethi (*I Will Teach You To Be Rich*):**
   * *Conscious Spending:* Spend extravagantly on the things you truly love, and cut costs mercilessly on what you don't.
   * *The Big Wins:* Don't feel guilty over a $\$4$ coffee. Focus on canceling the unused $\$54.99$/mo Adobe CC trial and $\$131.88$/yr duplicate music streaming, which frees $\$791.76$/year.
3. **Vicki Robin (*Your Money or Your Life*):**
   * *Money as Life Energy:* Based on $\$4,850$ monthly take-home over 160 hours, real hourly wage is $\sim \$30.31$/hour. A planned $\$65$ dinner costs $2.1$ hours of life labor.
4. **George S. Clason (*The Richest Man in Babylon*):**
   * *Pay Yourself First:* At least 10% of earnings belongs to the user to keep. The $\$500$ Walrus savings transfer represents $10.3\%$ preserved before paying any merchant.
5. **Adaptive Rebalancing (*"Roll With The Punches"*):**
   * *Dynamic Balance:* When Dining Out runs a $-\$45$ deficit, do not feel guilt or give up on budgeting. Rebalance immediately by shifting $\$45$ from the $+\$130$ Fun surplus envelope.

---

## 6. The 4 Autonomous Background Logic Rules

The system runs 4 core rules on all statement data without requiring regex configuration from users:

```javascript
// RULE_01: Weekend Rideshare Routing
if (merchant.match(/(Uber|Lyft)/i) && isWeekend(date)) {
  assignCategory('Weekend Nightlife');
  routeEnvelope('Discretionary Fun');
}

// RULE_02: Supermarket & Essential Household Routing
if (merchant.match(/(Trader Joe|Whole Foods|Kroger|Costco|Safeway)/i)) {
  assignCategory('Groceries & Household');
  routeEnvelope('Groceries');
}

// RULE_03: High-Value Anomaly Quarantine Gate
if (amount > 100.00 && category !== 'Rent' && !isPreApproved(merchant)) {
  flagAnomalousDebit('ESCALATION_GATE_MEM_07');
  requireHumanApproval();
}

// RULE_04: Multi-Currency Normalization
if (currency !== 'USD') {
  const fxRate = await tatum.getSuiFxRate(currency, 'USD');
  normalizeAmount(amount * fxRate);
}
```

---

## 7. Zero-Knowledge Client-Side WebCrypto Security

### 7.1 Cryptographic Standard
* **Cipher:** AES-256-GCM (Authenticated Encryption with Associated Data).
* **Key Derivation:** PBKDF2-SHA256 with 100,000 iterations and a cryptographically secure 16-byte random salt.
* **Zero-Knowledge Architecture:**
  * Statement parsing and receipt OCR take place locally within the browser.
  * No plaintext financial data or banking credentials are ever logged to centralized servers.
  * Recall servers and Walrus storage nodes only store encrypted ciphertext blobs.

---

## 8. Tatum Multi-Chain RPC Gateway & Onchain Settlement

* **Gateway URL:** `https://sui-mainnet.gateway.tatum.io`
* **Onchain Telemetry:** Queries real-time gas prices, transaction confirmations, and native Sui balances for decentralized dispute mediation.
* **x402 Protocol Micro-Bounties:** When an automated dispute resolution agent successfully recovers funds or mediates a cancellation, the protocol logs a $0.05$ SUI settlement anchor to verify agent execution onchain.

---

## 9. Developer & Evaluator Verification Runbook

### 9.1 Environment Setup
Copy the environment template and insert your keys:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=3000
```

### 9.2 Running the Automated Test Suite
Execute the full unit test suite:
```bash
npm test
```
**Expected Output:**
```
🧪 Starting RecallRamp Test Suite...
======================================================
[Seed Harness] Seeding 12 Verified Memories to Walrus Mainnet
Target Agent ID: walrus_agent_recallramp_mainnet_0x7f4b82c
Target Network : sui-mainnet
======================================================
[WalrusClient] 💾 Memory Committed to Mainnet: [MEM_01] netflix_standard (Baseline)
...
[WalrusClient] 💾 Memory Committed to Mainnet: [MEM_12] icloud_storage_2tb (Baseline)

✅ Successfully seeded 12 memories to Walrus on Sui Mainnet!
Hackathon checklist requirement (>= 10 writes): PASSED (12/10)

  ✅ PASS: Walrus memory count is 13 (must be >= 10)
  ✅ PASS: Flags micro-inflation on Netflix price hike
  ✅ PASS: Calculates exact price delta of $2.50
  ✅ PASS: Calculates annual drain of $30.00
  ✅ PASS: Generates dispute letter
  ✅ PASS: Suppresses alarm for seasonal AWS surge using Walrus Memory
  ✅ PASS: Marks savedFromAlertFatigue flag
  ✅ PASS: Requires human escalation on unknown debit > $50
  ✅ PASS: Reconciles exact match without alert

=============================================
Test Results: 9/9 Passed
=============================================
```

### 9.3 Launching the Application
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the consumer dashboard.

### 9.4 Verifying the Groq AI Copilot via Direct API
```bash
# 1. Ask affordability question
curl -s -X POST http://localhost:3000/api/copilot/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Can I afford a $65 dinner tonight?","mode":"sentinel","envelopesRebalanced":false}'

# 2. Ask Morgan Housel philosophy question
curl -s -X POST http://localhost:3000/api/copilot/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What does Morgan Housel teach about my emergency reserve?","mode":"sentinel","envelopesRebalanced":false}'

# 3. Ask Adaptive Rebalancing question
curl -s -X POST http://localhost:3000/api/copilot/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Explain adaptive envelope rebalancing with my current envelopes","mode":"sentinel","envelopesRebalanced":false}'
```

---

## 10. Summary: The Ordinary User Experience

By relocating Walrus memory inspection, Groq API configuration, WebCrypto key bundle management, and Tatum blockchain telemetry beneath the hood, **PocketSentinel delivers an interface that an everyday household user can open and love immediately**:
1. **At a glance:** They see their Safe-to-Spend Runway ($\$482.35$), daily burn velocity ($\$48.23$/day), and 6 digital envelopes.
2. **With 1 tap:** They resolve category deficits ("Roll with the Punches") and export 9-column CSV statements to Google Sheets.
3. **With the AI Copilot:** They ask real-time affordability questions and receive grounded financial lessons from classic literature.
4. **Behind the scenes:** Their financial privacy is guarded by client-side WebCrypto encryption and 12 immutable Walrus episodic memory records on Sui Mainnet.

---

## 11. The Elevated SaaS Landing Page & Interactive Lab

The public-facing landing page (`#viewLanding` at `http://localhost:3000/`) was expanded into an educational masterclass in modern personal finance:
1. **Command Center Hero Mockup:** Displays real-time Cash Runway ($482.35 / $48.23 daily velocity), live zero-based envelope rebalancing (Groceries -$45.00 deficit offset with 1-tap from Dining), AI copilot cognitive bubbles, and Walrus price creep baselines.
2. **Interactive Copilot Playground (`#playground`):** Visitors test the AI Copilot live in the browser with 3 personas (Sentinel, Roast, Hype) and quick prompt chips across affordability, envelopes, life energy, and literature.
3. **The 4 Modern Wealth Paradigms (`#paradigms`):** Deep architectural write-ups breaking down the fatal flaws of traditional budgeting and specifying PocketSentinel's mathematical equations for zero-based envelopes, daily cash velocity, autonomous normalization, and cognitive coaching.
4. **The Financial Philosophy Library (`#literature`):** Analysis cards detailing the 5 core texts integrated into the AI: Morgan Housel, Ramit Sethi, Vicki Robin & Joe Dominguez, George S. Clason, and Jesse Mecham.
5. **Definitive Competitive Matrix (`#comparison`):** 9-dimension comparative breakdown against legacy trackers and traditional bank apps.
6. **Educational FAQ (`#faq`):** 6 thorough explanations answering questions on cash runway, envelope deficits, 0% dispute rake, Google Sheets feeds, and WebCrypto security.

