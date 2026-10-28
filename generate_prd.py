#!/usr/bin/env python3
"""
RecallRamp Project Requirements Document (PRD / SRS) Generator
Compiles institutional, publication-grade Software Requirements Specification PDF via WeasyPrint
and writes docs/PROJECT_REQUIREMENTS.md.
"""

import os
import weasyprint

def generate_markdown():
    return """# RecallRamp — Project Requirements Document & Technical Specification
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

* **NFR-1 (Performance & Latency):** Memory query and baseline comparison must execute in $<350\text{ ms}$. Full statement processing of 100 transactions must complete in $<2.5\text{ seconds}$.
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
"""

def generate_html_content():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RecallRamp — Software Requirements Specification & Project Requirements Document (SRS/PRD)</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @top-left {
      content: "RecallRamp • Software Requirements Specification (SRS/PRD)";
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    @top-right {
      content: "Tatum x Walrus Hackathon • Total Recall • v1.0";
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      color: #2ccd9a;
      font-weight: 700;
    }
    @bottom-left {
      content: "RecallRamp • Autonomous Consumer Expense Watchdog • Walrus Memory on Sui Mainnet";
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.2pt;
      color: #94a3b8;
    }
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #0f172a;
    }
  }

  @page:first {
    margin: 12mm 16mm 14mm 16mm;
    @top-left { content: normal; }
    @top-right { content: normal; }
    @bottom-left { content: normal; }
    @bottom-right { content: normal; }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.45;
    font-size: 8.6pt;
    text-align: justify;
    margin: 0;
    padding: 0;
  }

  /* Cover Banner & Headers */
  .cover-header {
    background: linear-gradient(135deg, #0b0c20 0%, #171838 50%, #0d1e2d 100%);
    border-radius: 8px;
    padding: 22px 24px;
    color: #ffffff;
    margin-bottom: 16px;
    border: 1px solid rgba(79, 55, 253, 0.4);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .badge-row {
    margin-bottom: 10px;
  }

  .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-right: 6px;
  }

  .badge-green {
    background: rgba(44, 205, 154, 0.15);
    color: #2ccd9a;
    border: 1px solid rgba(44, 205, 154, 0.4);
  }

  .badge-purple {
    background: rgba(79, 55, 253, 0.2);
    color: #a594fd;
    border: 1px solid rgba(79, 55, 253, 0.4);
  }

  .badge-blue {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
  }

  .cover-title {
    font-size: 20pt;
    font-weight: 900;
    letter-spacing: -0.03em;
    margin: 0 0 4px 0;
    color: #ffffff;
  }

  .cover-subtitle {
    font-size: 10.5pt;
    color: #94a3b8;
    margin: 0 0 12px 0;
    font-weight: 500;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 10px;
    font-size: 7.2pt;
  }

  .meta-item strong {
    display: block;
    color: #cbd5e1;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 6.5pt;
    letter-spacing: 0.05em;
  }

  .meta-item span {
    color: #2ccd9a;
    font-weight: 600;
  }

  /* Typography */
  h1 {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin-top: 14pt;
    margin-bottom: 5pt;
    border-bottom: 1.5px solid #2ccd9a;
    padding-bottom: 3pt;
    page-break-after: avoid;
  }

  h2 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #1e1b4b;
    margin-top: 10pt;
    margin-bottom: 4pt;
    page-break-after: avoid;
  }

  h3 {
    font-size: 9pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 7pt;
    margin-bottom: 3pt;
    page-break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 4.5pt;
  }

  ul, ol {
    margin-top: 0;
    margin-bottom: 5pt;
    padding-left: 15px;
  }

  li {
    margin-bottom: 2pt;
  }

  strong {
    font-weight: 700;
    color: #0f172a;
  }

  /* Callouts & Alert Boxes */
  .alert-box {
    border-radius: 6px;
    padding: 8px 12px;
    margin: 6pt 0;
    font-size: 8pt;
    page-break-inside: avoid;
  }

  .alert-purple {
    background: #f5f3ff;
    border-left: 3.5px solid #6366f1;
    color: #312e81;
  }

  .alert-green {
    background: #f0fdf4;
    border-left: 3.5px solid #10b981;
    color: #064e3b;
  }

  .alert-blue {
    background: #f0f9ff;
    border-left: 3.5px solid #0284c7;
    color: #0c4a6e;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6pt 0 10pt 0;
    font-size: 7.7pt;
    page-break-inside: avoid;
  }

  th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 5px 7px;
    border: 1px solid #0f172a;
    text-transform: uppercase;
    font-size: 6.8pt;
    letter-spacing: 0.04em;
  }

  td {
    padding: 4.5px 7px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* Code & Pre */
  pre {
    background: #0b0c20;
    color: #e2e8f0;
    padding: 8px 10px;
    border-radius: 5px;
    font-size: 7pt;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    overflow-x: hidden;
    line-height: 1.35;
    margin: 6pt 0;
    border: 1px solid #1e1b4b;
    page-break-inside: avoid;
  }

  .tag {
    display: inline-block;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 6.8pt;
    font-family: monospace;
    font-weight: 600;
  }

  .tag-red { background: #fee2e2; color: #991b1b; }
  .tag-green { background: #dcfce7; color: #166534; }
  .tag-purple { background: #ede9fe; color: #5b21b6; }

</style>
</head>
<body>

<div class="cover-header">
  <div class="badge-row">
    <span class="badge badge-green">Total Recall Hackathon</span>
    <span class="badge badge-purple">Tatum x Walrus Memory</span>
    <span class="badge badge-blue">Tracks 02 &amp; 03</span>
  </div>
  <div class="cover-title">RecallRamp</div>
  <div class="cover-subtitle">Autonomous Consumer Expense Watchdog &amp; Subscription Sentinel with Decentralized Episodic Memory</div>
  <div class="meta-grid">
    <div class="meta-item">
      <strong>Target Tracks</strong>
      <span>Track 02 (Smart Agents) &amp; 03 (Finance)</span>
    </div>
    <div class="meta-item">
      <strong>Core Infrastructure</strong>
      <span>Walrus Memory (Sui Mainnet) + Tatum</span>
    </div>
    <div class="meta-item">
      <strong>Award Targets</strong>
      <span>$500 Walrus + $500 AI Builder</span>
    </div>
    <div class="meta-item">
      <strong>Status &amp; Date</strong>
      <span>v1.0 Production PRD • October 2026</span>
    </div>
  </div>
</div>

<h1>1. Executive Summary &amp; Market Need</h1>

<p>Enterprise CFOs use corporate platforms like <strong>Ramp</strong> and <strong>Brex</strong> to automatically police software seat inflation, kill zombie subscriptions, and audit vendor invoices. Normal consumers and freelancers, however, have no such defense. Across an average household with 11 subscriptions, subtle "micro-inflation" (unannounced $1 to $4/month hikes across streaming, cloud storage, utilities, and gyms) silently drains <strong>$300 to $600 per year</strong>.</p>

<p>Existing consumer apps like <strong>Rocket Money (formerly Truebill)</strong> solve this poorly: they harvest user banking records onto centralized servers, resell aggregate purchase behaviors to marketing brokers, and take an exorbitant <strong>30% to 40% cut</strong> of any savings when negotiating a bill. Meanwhile, modern trackers like <strong>Copilot Money</strong> offer polished dashboards but lack proactive, autonomous action and lock users into Apple-only walled gardens.</p>

<div class="alert-box alert-green">
  <strong>The RecallRamp Thesis:</strong> By combining an autonomous expense monitoring agent with <strong>Walrus Memory on Sui Mainnet</strong> and <strong>Tatum RPC &amp; Data APIs</strong>, RecallRamp delivers the power of Ramp AI directly to everyday consumers. It operates with zero-knowledge data sovereignty, remembers past billing cycles across sessions ("remembers last Tuesday"), and arms users with 1-tap automated dispute resolution without rent-seeking fees.
</div>

<h1>2. Competitive Teardown &amp; Market Gap</h1>

<table>
  <thead>
    <tr>
      <th>Feature / Dimension</th>
      <th>Ramp AI (Enterprise)</th>
      <th>Rocket Money (Consumer)</th>
      <th>Copilot Money (Consumer)</th>
      <th>RecallRamp (Our Solution)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Target User</strong></td>
      <td>Corporate finance teams ($15/seat/mo)</td>
      <td>General consumers ($7–$15/mo)</td>
      <td>Apple-only budgeters ($95/year)</td>
      <td><strong>Everyday consumers, freelancers &amp; prosumers</strong></td>
    </tr>
    <tr>
      <td><strong>Price Creep Detection</strong></td>
      <td><span class="tag tag-green">Full</span> Detects per-seat license hikes</td>
      <td><span class="tag tag-purple">Partial</span> Delayed notification</td>
      <td><span class="tag tag-red">None</span> Static recurring list only</td>
      <td><span class="tag tag-green">Full</span> Compares transaction to stored Walrus baseline</td>
    </tr>
    <tr>
      <td><strong>Trial &amp; Zombie Slaying</strong></td>
      <td><span class="tag tag-green">Yes</span> Flags unused team seats</td>
      <td><span class="tag tag-green">Yes</span> Concierge cancellation</td>
      <td><span class="tag tag-red">No</span> Manual DIY cancellation</td>
      <td><span class="tag tag-green">Yes</span> 48-hr pre-rebill alarms + duplicate service tags</td>
    </tr>
    <tr>
      <td><strong>Memory Architecture</strong></td>
      <td>Centralized corporate SQL DB</td>
      <td>Centralized AWS Cloud DB</td>
      <td>Local device SQLite + iCloud</td>
      <td><strong>Decentralized Walrus Memory (Sui Mainnet)</strong></td>
    </tr>
    <tr>
      <td><strong>Rake / Savings Fee</strong></td>
      <td>0% (Subscription model)</td>
      <td><span class="tag tag-red">30%–40%</span> of 1st year savings</td>
      <td>0% (Subscription model)</td>
      <td><span class="tag tag-green">0% Rake</span> 100% sovereign free open-source tool</td>
    </tr>
    <tr>
      <td><strong>Data Sovereignty</strong></td>
      <td>Enterprise SOC-II protection</td>
      <td><span class="tag tag-red">Low</span> Sells telemetry to ad brokers</td>
      <td>Moderate Apple ecosystem sandbox</td>
      <td><strong>100% Sovereign:</strong> Client-side encrypted Walrus state</td>
    </tr>
    <tr>
      <td><strong>Multi-Asset &amp; Web3</strong></td>
      <td>Corporate cards only</td>
      <td>Fiat checking/savings only</td>
      <td>Fiat checking/savings only</td>
      <td><strong>Hybrid Fiat &amp; Web3:</strong> Tatum RPC reads Sui/EVM balances</td>
    </tr>
  </tbody>
</table>

<h1>3. Hackathon Alignment &amp; Prize Maximization</h1>

<p>RecallRamp is engineered to fulfill all rules of the <strong>Total Recall | Tatum x Walrus Memory Hackathon</strong>:</p>

<ul>
  <li><strong>Track 02 (Smart Agents for Real Life — $1,000):</strong> Fulfills the explicit track prompt for an <em>"Expense watchdog with long term memory."</em> The agent remembers past baselines, approved overrides, and vendor rules across sessions.</li>
  <li><strong>Track 03 (Consumer Finance Apps — $1,000):</strong> Fulfills the prompt for <em>"Subscription managers with learned spend limits."</em> Blockchain remains invisible while Walrus makes habits stick.</li>
  <li><strong>Best Walrus Memory Award ($500):</strong> Delivers a deep learning loop where Walrus memories visibly change the product—suppressing false alarms on annual insurance renewals and calculating micro-inflation deltas.</li>
  <li><strong>Best Tatum AI Builder App ($500):</strong> Prototype scaffolded via <code>ai.tatum.io</code> matching the prompt chip: <em>"Expense watchdog agent."</em></li>
  <li><strong>Mandatory Checklist Compliance:</strong> Implements $\ge 10$ verified memory writes to Sui Mainnet, connects to Tatum Sui RPCs, and provides an open-source demo repository and public technical writeup.</li>
</ul>

<h1>4. System Architecture &amp; Data Pipeline</h1>

<pre>
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   Multi-Channel Transaction Ingestion                  │
 │      - Bank CSV Statement Uploads   - Real-Time Webhooks / Plaid       │
 │      - Camera Receipt OCR (Gemma 2) - Manual Quick-Add                 │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ Raw Transactions
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      RecallRamp Core Intelligence                      │
 │  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
 │  │ Micro-Inflation Engine  │  │   Zombie Trial &amp; Renewal Watchdog   │  │
 │  │ Compares tx amount      │  │   Tracks renewal cadence (monthly,  │  │
 │  │ against Walrus baseline │  │   annual) and 48-hr pre-rebill flags│  │
 │  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
 └──────────────┼───────────────────────────────────┼─────────────────────┘
                │                                   │
                ▼                                   ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                  Walrus Memory Integration Module                      │
 │  - `read_vendor_memory(vendor_id)`: Fetches baseline, history &amp; limits │
 │  - `commit_memory_event(memory_payload)`: Writes Mainnet memory blob   │
 │  - `resolve_override(user_action)`: Updates policy rules as data       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                ▼                                         ▼
 ┌───────────────────────────────┐       ┌───────────────────────────────┐
 │  Walrus Memory (Sui Mainnet)  │       │     Tatum Infrastructure      │
 │  Permanent decentralized state│       │  Sui RPC &amp; Data APIs          │
 │  Delegate Key / Agent ID Auth │       │  Onchain Balance Verification │
 └───────────────────────────────┘       └───────────────────────────────┘
</pre>

<h1>5. Functional Requirements (FR)</h1>

<h2>FR-1: Ingestion &amp; Statement Normalization</h2>
<ul>
  <li><strong>FR-1.1:</strong> Ingest bank transaction feeds via CSV uploads (supporting Chase, BoA, Monzo, Revolut) and JSON API webhooks.</li>
  <li><strong>FR-1.2:</strong> Normalize raw statement descriptors (e.g. <code>"SQ *SPOTIFY USA 877-778-1"</code> $\rightarrow$ <code>"Spotify"</code>, category: <code>Streaming Audio</code>).</li>
</ul>

<h2>FR-2: Micro-Inflation &amp; Stealth Price Creep Sentinel</h2>
<ul>
  <li><strong>FR-2.1:</strong> For every incoming transaction, query Walrus Memory for prior baseline charges from that vendor.</li>
  <li><strong>FR-2.2:</strong> If the current charge exceeds the established baseline by $\ge \$0.50$ or $\ge 3\%$ without a recorded override, fire a <code>MICRO_INFLATION_ALERT</code>.</li>
  <li><strong>FR-2.3:</strong> Calculate annualized leakage (e.g. <em>"+$2.00/mo = $24.00/yr"</em>) and display it prominently on the user dashboard.</li>
</ul>

<h2>FR-3: Zombie Subscription &amp; Free Trial Tracker</h2>
<ul>
  <li><strong>FR-3.1:</strong> Cluster repeating transactions (28–31 days or 365 days) into active subscription profiles.</li>
  <li><strong>FR-3.2:</strong> Issue an actionable alert <strong>48 hours prior</strong> to free-trial expiration dates.</li>
  <li><strong>FR-3.3:</strong> Detect overlapping services (e.g., holding both Spotify and Apple Music simultaneously).</li>
</ul>

<h2>FR-4: Walrus Decentralized Memory Implementation</h2>
<ul>
  <li><strong>FR-4.1:</strong> Interface with the Walrus Memory API using <code>MEMWAL_AGENT_ID</code> on Sui Mainnet.</li>
  <li><strong>FR-4.2:</strong> Store and query four core episodic memory types: <code>VENDOR_BASELINE</code>, <code>USER_OVERRIDE</code>, <code>ESCALATION_POLICY</code>, and <code>DISPUTE_TRACE</code>.</li>
  <li><strong>FR-4.3:</strong> Maintain at least 10 active memories on Sui Mainnet with cryptographic verifiability.</li>
</ul>

<h2>FR-5: 1-Tap Dispute &amp; Cancellation Assistant (HITL)</h2>
<ul>
  <li><strong>FR-5.1:</strong> Generate pre-filled dispute and refund request letters citing charge dates, transaction IDs, and merchant terms.</li>
  <li><strong>FR-5.2:</strong> Enforce strict Human-in-the-Loop gates: no email, webhook, or dispute action is executed without explicit 1-tap confirmation.</li>
</ul>

<h2>FR-6: Tatum Onchain Multi-Asset Verification</h2>
<ul>
  <li><strong>FR-6.1:</strong> Query live Sui wallet balances and transaction statuses using Tatum Sui RPC and Data APIs.</li>
  <li><strong>FR-6.2:</strong> Support optional agent micro-allowance payment streams via x402 / MPP rails on Sui.</li>
</ul>

<h1>6. The 10+ Walrus Mainnet Memory Specification</h1>

<table>
  <thead>
    <tr>
      <th>Memory ID</th>
      <th>Type</th>
      <th>Key / Target</th>
      <th>Stored Content &amp; Policy Semantics</th>
      <th>State</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>MEM_01</code></td>
      <td>Baseline</td>
      <td><code>netflix_standard</code></td>
      <td>$15.49/mo baseline. Max acceptable variance: $0.00. Alert on any hike.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_02</code></td>
      <td>Baseline</td>
      <td><code>spotify_premium</code></td>
      <td>$10.99/mo baseline. Flag price increase &gt; $0.50 immediately.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_03</code></td>
      <td>Baseline</td>
      <td><code>chatgpt_plus</code></td>
      <td>$20.00/mo billed on the 14th. Auto-reconcile without pinging user.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_04</code></td>
      <td>Override</td>
      <td><code>aws_cloud_hosting</code></td>
      <td>Q4 traffic approved for surges up to $180/mo (authorized by user).</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_05</code></td>
      <td>Baseline</td>
      <td><code>gym_membership</code></td>
      <td>$120.00/mo billed on 1st. Seasonal freeze scheduled for January.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_06</code></td>
      <td>Trial Watch</td>
      <td><code>adobe_creative_trial</code></td>
      <td>7-day trial started Oct 18. Mandatory 48h cancellation notice Oct 23.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_07</code></td>
      <td>Policy</td>
      <td><code>unknown_merchant_gate</code></td>
      <td>Strict rule: Any new merchant debiting &gt; $50.00 requires push confirmation.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_08</code></td>
      <td>Policy</td>
      <td><code>annual_renewal_tolerance</code></td>
      <td>Annual renewals (Amazon Prime $139) permitted +5% max inflation.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_09</code></td>
      <td>Baseline</td>
      <td><code>github_copilot</code></td>
      <td>$10.00/mo baseline tool. Do not flag unless duplicated by team seat.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_10</code></td>
      <td>Dispute Trace</td>
      <td><code>doordash_pass</code></td>
      <td>Duplicate charge disputed Aug 2026. Refunded $9.99. Watch for rebills.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_11</code></td>
      <td>Overlap</td>
      <td><code>streaming_audio_overlap</code></td>
      <td>Duplicate alert: User holds Spotify ($10.99) &amp; Apple Music ($10.99). Prompt.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
    <tr>
      <td><code>MEM_12</code></td>
      <td>Baseline</td>
      <td><code>icloud_storage_2tb</code></td>
      <td>$9.99/mo family plan. Fixed baseline utility tier.</td>
      <td><span class="tag tag-green">Mainnet Active</span></td>
    </tr>
  </tbody>
</table>

<h1>7. Non-Functional Requirements &amp; Invariants</h1>

<ul>
  <li><strong>NFR-1 (Sub-Second Latency):</strong> Memory recall and baseline comparison must execute in $&lt;350\text{ ms}$. Full statement processing of 100 transactions must complete in $&lt;2.5\text{ seconds}$.</li>
  <li><strong>NFR-2 (Sovereign Security):** All transaction data stored in Walrus Memory is encrypted using AES-256-GCM before transport. The user holds their encryption key in local browser storage; zero unencrypted data touches cloud servers.</li>
  <li><strong>NFR-3 (Decentralized Durability):</strong> State survives client reinstalls and machine switches because episodic memory is anchored directly to Sui Mainnet via Walrus.</li>
  <li><strong>NFR-4 (Explainability):</strong> Every alert must display the exact Walrus Memory ID and original date referenced to ensure complete transparency.</li>
</ul>

<h1>8. Verification &amp; Submission Roadmap</h1>

<table>
  <thead>
    <tr>
      <th>Sprint Phase</th>
      <th>Milestones &amp; Deliverables</th>
      <th>Timeline</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Phase 1: Setup &amp; AI Builder</strong></td>
      <td>Get Tatum API key &amp; Walrus Agent ID. Scaffold prototype via <code>ai.tatum.io</code> for $500 bonus.</td>
      <td>Day 1 – 2</td>
    </tr>
    <tr>
      <td><strong>Phase 2: Walrus Memory Spine</strong></td>
      <td>Build <code>walrus_memory.py</code> SDK wrapper and commit 12 verified Mainnet memories.</td>
      <td>Day 3 – 5</td>
    </tr>
    <tr>
      <td><strong>Phase 3: Sentinel Intelligence</strong></td>
      <td>Build micro-inflation engine, zombie trial countdowns, and Tatum Sui RPC balance queries.</td>
      <td>Day 6 – 8</td>
    </tr>
    <tr>
      <td><strong>Phase 4: Consumer UI &amp; Audio</strong></td>
      <td>Build responsive Neo-Brutalist dashboard with Memory Inspector and 1-tap dispute drawer.</td>
      <td>Day 9 – 11</td>
    </tr>
    <tr>
      <td><strong>Phase 5: Deploy &amp; Submit</strong></td>
      <td>Deploy live on Render/Vercel, publish blog post on learning loop, submit to Total Recall.</td>
      <td>Day 12 – 14</td>
    </tr>
  </tbody>
</table>

</body>
</html>
"""

def main():
    docs_dir = "/home/blackwrld04/.gemini/antigravity-ide/scratch/recall_ramp/docs"
    os.makedirs(docs_dir, exist_ok=True)
    
    # 1. Write Markdown PRD
    md_path = os.path.join(docs_dir, "PROJECT_REQUIREMENTS.md")
    print(f"Generating Markdown PRD at: {md_path}")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(generate_markdown())
    print("Markdown PRD generated successfully.")
    
    # 2. Write HTML and compile PDF via WeasyPrint
    html_content = generate_html_content()
    pdf_path = os.path.join(docs_dir, "PROJECT_REQUIREMENTS.pdf")
    print(f"Compiling publication-grade PDF via WeasyPrint at: {pdf_path}")
    weasyprint.HTML(string=html_content).write_pdf(pdf_path)
    print(f"PDF generated successfully! File size: {os.path.getsize(pdf_path)} bytes.")

if __name__ == "__main__":
    main()
