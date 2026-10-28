# Past Chat Transcript: Total Recall Hackathon & RecallRamp
**Source Conversation ID:** `0a75221e-d3a7-4072-a844-48841595523a`  
**Reference Document:** [PROJECT_REQUIREMENTS.md](file:///home/blackwrld04/.gemini/antigravity-ide/scratch/recall_ramp/docs/PROJECT_REQUIREMENTS.md)  
**PDF Document:** [RecallRamp_Project_Requirements.pdf](file:///home/blackwrld04/.gemini/antigravity-ide/scratch/recall_ramp/RecallRamp_Project_Requirements.pdf)

---

## 💬 Exchange 1: Selecting the Track & Archetype

### 👤 USER:
> no this Smart Agents for Real Life  
> Agents that monitor inboxes, expenses, habits, or workflows. Portable memory means they pick up where they left off across tools and sessions.  
> 
> **Best fit for:**  
> AI builders and anyone who wished their assistant remembered last Tuesday.  
> 
> ▸ Research agent with source trust scores  
> ▸ Expense watchdog with long term memory  
> ▸ Workflow bots that learn your escalation rules  
> Track  

### 🤖 ASSISTANT:
I found it. It's the chat from **Oct 19, 2026** (conversation `4c910e8b-6ffa-443d-a86d-50d6b52af4b1`). It was about the **"Smart Agents for Real Life"** track. Full transcript exported to [smart_agents_chat.md](file:///home/blackwrld04/.gemini/antigravity-ide/brain/0a75221e-d3a7-4072-a844-48841595523a/smart_agents_chat.md).

### Research Summary
**Core thesis:** LLMs are stateless, and RAG isn't episodic memory. The "remembers last Tuesday" idea needs a portable memory layer that works across tools through MCP.

#### Portable Memory (The Foundation)
| Project | Approach |
|---|---|
| [Mem0](https://github.com/mem0ai/mem0) | Pluggable `add/get/search` API with a vector and graph store, scoped by user, agent or session |
| [Letta (MemGPT)](https://github.com/letta-ai/letta) | The agent manages its own memory, and state moves between environments as `.af` files |
| [Zep](https://github.com/getzep/zep) | Temporal knowledge graph that tracks changes over weeks and months |

#### 1. Research Agent with Source Trust Scores
- **[Stanford STORM](https://github.com/stanford-oval/storm)**, **[GPT-Researcher](https://github.com/assafelovic/gpt-researcher)**, **[recommend-agentic-trust-layer](https://github.com/recommend-dev/recommend-agentic-trust-layer)**, **[OpenDraft](https://github.com/federicodeponte/opendraft)**, **[Cleanlab TLM](https://github.com/cleanlab/cleanlab-tlm)**.
- Trust techniques: Entity-graph grounding, author provenance, Shapley marginal value, sentence-level citation verification.

#### 2. Expense Watchdog with Long-Term Memory
- **[SentinelBudget](https://github.com/sundar139/SentinelBudget-Local-Proactive-Finance-Agent)**, **[personal-finance-copilot](https://github.com/Stephen-Fan/personal-finance-copilot)**, **[financial-inteligence-agent](https://github.com/leojg/financial-inteligence-agent)**, **[expense-agent](https://github.com/Yogendra404/expense-agent)**, plus **Ramp** and **Brex** as production benchmarks.
- Key idea: Episodic memory cuts false positives (e.g. *"Datadog renews annually in October and was approved in 2024 & 2025 -> suppress false alarm"*).

#### 3. Workflow Bots that Learn Escalation Rules
- **[hitl-protocol](https://github.com/rotorstar/hitl-protocol)**, **[gohumanloop](https://github.com/tonlix/gohumanloop)**, **[trIAge](https://github.com/latentspace-lab/trIAge)**, **[LangGraph HITL](https://langchain-ai.github.io/langgraph/how-tos/human-in-the-loop/)**.
- Key idea: Store rules as data (YAML/JSON) updated from human overrides rather than expensive retraining.

---

## 💬 Exchange 2: Concept Inception ("Ramp AI for Everyday Users")

### 👤 USER:
> i did like something like ramp al but for users let us analyze that and rememder it depens on the trems give in the hackthons

### 🤖 ASSISTANT:
Here is the complete architectural and strategic analysis for building **"Ramp AI for Everyday Users"** (Consumer Expense Watchdog & Autonomous Financial Sentinel), mapped directly against the active hackathon terms and sponsor prize tracks.

### 1. The Core Idea: What Ramp Does vs. What Everyday Users Need

| Enterprise Ramp Feature | What Everyday Consumers & Freelancers Experience | The "Ramp for Users" Solution |
| :--- | :--- | :--- |
| **SaaS Contract Creep** | Streaming services, cloud storage, and gyms quietly raise prices by $1–$4/month without clear notice. | **Micro-Inflation Sentinel**: Tracks vendor price histories and flags silent creep (e.g., *"Netflix increased from $15.49 to $17.99 — +16.1% hike"*). |
| **Duplicate Seat / License Waste** | Forgetting a 7-day free trial or paying for both Disney+ and Hulu separately when a bundle exists. | **Zombie Subscription Slayer**: Maps recurring cycles and sends 1-tap cancellation alerts 48 hours before trial rebills. |
| **Automated Receipt Reconciliation** | Dreaded shoebox of paper receipts or unread email receipts needed for personal budgets. | **Zero-Effort Multimodal Receipt Ingestion**: Snap a photo or forward an email; an open-weight vision model extracts line items and matches them to bank transactions. |

---

## 💬 Exchange 3: Identifying the True Hackathon Host & Requirements

### 👤 USER:
> now this is who organize the hackathon https://tatum.io/hackathon/total-recall not dev

### 👤 USER:
> continue

### 🤖 ASSISTANT:
The exact terms, criteria, and requirements for the **[Total Recall | Tatum x Walrus Memory Hackathon](https://tatum.io/hackathon/total-recall)** are now clear:

* **Hackathon**: **Total Recall** (Co-organized by **Tatum** & **Walrus Foundation**)
* **Live Site**: `recall-tatum-walrus.vercel.app`
* **Dates**: **October 20 – November 10, 2026** (3-week build window)
* **Prize Pool**: **$4,500** ($1,000 per track + $1,500 in craft bonuses)

### 1. Where "Ramp AI for Users" Fits in the Hackathon Tracks
"Ramp AI for everyday users" sits at the exact intersection of **Track 02** and **Track 03**:
* **Track 02: Smart Agents for Real Life ($1,000)**: Prompt specifically highlights: *"Expense watchdog with long term memory."*
* **Track 03: Consumer Finance Apps ($1,000)**: Prompt specifically highlights: *"Subscription managers with learned spend limits."*

### 2. Strict Hackathon Submission Checklist (Non-Negotiables)
1. **Walrus Memory on Mainnet**: Must integrate Walrus Memory and write memory states to Mainnet.
2. **$\ge$ 10 Memories Stored**: Must store at least 10 memories on Mainnet before submitting.
3. **Tatum RPC / Data API**: Tatum RPC used for onchain data where relevant (e.g. Sui balance checks).
4. **Published Blog Post**: Article explaining what it does, how it uses Tatum + Walrus, and **how it learned over time**.
5. **Demo & Public Repo**: Live working URL and public GitHub repository.
6. **Tatum AI Builder ($500 Bonus)**: Dedicated prize for builds using `ai.tatum.io` (features an "Expense watchdog agent" prompt chip).

### 3. Prize Opportunity ($2,500+ Maximum Stack)
* Track 02 or 03 Winner: $500 (1st) / $300 (2nd) / $200 (3rd)
* Best Walrus Memory: $500
* Best Tatum AI Builder App: $500
* Best Use of Agent Payments: $500

---

## 💬 Exchange 4: Research Competitors & Generate Formal PRD PDF

### 👤 USER:
> NOW GO ONLINE AND DO RESEARCH ON OTHER PROJECT THAT DO THE SAME AND MAKE A PRPPER PROJECT REQUIREMENTS PDF

### 🤖 ASSISTANT:
### 🔍 Competitive Research & Market Teardown

| Capability / Dimension | **Ramp AI** *(Enterprise)* | **Rocket Money** *(Consumer)* | **Copilot Money** *(Consumer)* | **RecallRamp** *(Our Solution)* |
| :--- | :--- | :--- | :--- | :--- |
| **Target User** | Corporate Finance Teams ($15/seat/mo) | General Consumers ($7–$15/mo) | Apple-only Budgeters ($95/yr) | **Consumers, Freelancers & Prosumers** |
| **Subscription Price Creep** | Detects per-seat and baseline license hikes | Partial / delayed alerts | None (only static recurring lists) | **Full:** Real-time percentage & dollar delta vs. Walrus baseline |
| **Zombie & Trial Slaying** | Flags underutilized corporate licenses | Concierge cancellation | DIY manual cancellation | **Yes:** 48-hr pre-rebill countdown & service overlap tags |
| **Memory Architecture** | Centralized Relational SQL DB | Centralized AWS Cloud DB | Local device cache + iCloud sync | **Decentralized Walrus Memory (Sui Mainnet)** |
| **Cancellation / Dispute Fee** | 0% (Platform subscription) | **30%–40%** cut of 1st year savings | 0% (DIY manual cancellation) | **0% Rake:** Free, autonomous 1-tap dispute packs |
| **Data Privacy & Sovereignty** | Enterprise SOC-II | Sells aggregate data to ad brokers | Apple sandbox privacy | **100% Sovereign:** Encrypted Walrus memory blobs |
| **Multi-Asset & Web3** | Corporate cards only | Fiat bank accounts only | Fiat bank accounts only | **Hybrid Fiat & Web3:** Tatum RPC reads Sui/EVM balances |

#### Key Takeaways from the Research:
1. **Ramp AI's Magic**: Price intelligence (flagging unannounced +10% price increases) and duplicate license detection.
2. **Rocket Money's Vulnerability**: 30%–40% extortionate fee rake on bill negotiations and selling user data to credit bureaus.
3. **The Total Recall Advantage**: Combining an autonomous watchdog with **Walrus Memory on Sui Mainnet** allows cross-session episodic memory with zero data leakage.

### 📄 PRD Documents Created:
* [RecallRamp_Project_Requirements.pdf](file:///home/blackwrld04/.gemini/antigravity-ide/scratch/recall_ramp/RecallRamp_Project_Requirements.pdf) *(Compiled publication-grade PDF)*
* [PROJECT_REQUIREMENTS.md](file:///home/blackwrld04/.gemini/antigravity-ide/scratch/recall_ramp/docs/PROJECT_REQUIREMENTS.md)
* [generate_prd.py](file:///home/blackwrld04/.gemini/antigravity-ide/scratch/recall_ramp/generate_prd.py)

### The 12 Walrus Mainnet Memories Designed:
* `MEM_01` & `MEM_02`: Netflix ($15.49) & Spotify ($10.99) baseline baselines with zero-tolerance price hike rules.
* `MEM_03`: ChatGPT Plus ($20.00/mo) auto-reconcile rules.
* `MEM_04`: AWS Cloud Hosting seasonal Q4 traffic surge approval (up to $180/mo).
* `MEM_05`: Equinox Gym ($120.00/mo) with scheduled January freeze memory.
* `MEM_06`: Adobe Creative Cloud 7-day trial watch with 48-hour pre-rebill notification.
* `MEM_07`: Unknown merchant gate (mandatory human push approval for charges $> \$50$).
* `MEM_08`: Annual renewal tolerance (Amazon Prime $139 allowed $+5\%$ max inflation vs. prior year).
* `MEM_09`: GitHub Copilot developer tool baseline.
* `MEM_10`: DoorDash Pass duplicate dispute history & rebill sentinel.
* `MEM_11`: Audio streaming overlap alert (flags holding both Spotify and Apple Music).
* `MEM_12`: iCloud Storage ($9.99/mo) utility tier.
