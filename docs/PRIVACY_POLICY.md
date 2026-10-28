# PocketSentinel Privacy Policy

**Effective Date:** October 29, 2026  
**Last Updated:** October 29, 2026  
**Software License:** MIT Open Source  
**Governance Standard:** Zero-Knowledge Data Sovereignty, GDPR, and CCPA Compliant  

---

## 1. Executive Privacy Commitment

PocketSentinel ("we", "us", "our", or "the Platform") is an autonomous household financial operating system engineered on the philosophy of **Invisible Sovereignty**. Unlike legacy personal finance applications and centralized budgeting trackers that monetize consumer telemetry by selling transaction histories to marketing brokers and credit bureaus, **PocketSentinel collects zero unencrypted financial telemetry on its backend servers**.

All core encryption is performed client-side inside your browser using the native WebCrypto API (AES-256-GCM with PBKDF2-SHA256).

---

## 2. Comprehensive Third-Party Services Audit & Data Collection Matrix

The following table provides an exhaustive disclosure of every third-party API, external protocol, and decentralized service integrated into PocketSentinel, along with the precise scope of data shared:

| Third-Party Service | Entity & Protocol | Integration Surface | Data Transmitted / Processed | Data Retention & Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Walrus Memory Protocol** | Mysten Labs / Walrus Foundation (`https://relayer.memory.walrus.xyz`) | Server-side (`server/walrusClient.js`) via `@mysten-incubation/memwal` SDK | Pseudonymous vendor baselines (e.g., Netflix, Spotify), baseline price records ($15.49), trial expiration countdown horizons, and Sui Mainnet transaction hashes (`0x...`). **No unencrypted personal names, bank account numbers, or passwords are ever committed onchain.** | Permanent, immutable decentralized ledger on Sui Mainnet. Anchored pseudonymously to Agent ID `walrus_agent_recallramp_mainnet_0x7f4b82c`. |
| **Tatum Sui RPC Gateway** | Tatum Technologies LLC (`https://sui-mainnet.gateway.tatum.io`) | Server-side (`server/tatumClient.js`) via JSON-RPC API | Public Sui wallet addresses (`0x...`) queried to read onchain token balances (SUI, USDC) and gas transaction states. | Ephemeral transit. Tatum processes RPC requests to query the Sui blockchain. No offchain personal identity is attached to queries. |
| **Groq Cloud AI** | Groq Inc. (`https://api.groq.com/openai/v1/chat/completions`) | Server-side (`server/groqClient.js`) via OpenAI-compatible REST API | User-initiated financial queries, conversation context (last 6 messages), and high-level numeric metrics (monthly inflow, safe-to-spend runway, daily burn velocity, envelope deficits). | Processed statelessly in volatile RAM on Groq Language Processing Units (LPUs). Groq's developer API terms strictly prohibit retaining user prompts for public model training. |
| **Google Gemini Multimodal Vision** | Google LLC (`https://generativelanguage.googleapis.com`) | Server-side (`server/geminiVision.js`) via Google AI Studio API | Base64-encoded receipt images uploaded by the user to extract merchant names, line-item costs, sales tax, and transaction dates. | Processed statelessly to return structured receipt JSON. PocketSentinel does not persist receipt image files on remote servers after extraction completes. |
| **Google Sheets (Optional)** | Google LLC (`https://sheets.google.com`) | User-configured via `=IMPORTDATA` CSV endpoint (`/api/feed/csv`) | 9-column normalized statement data (Date, Merchant, Amount, Category, Envelope, Card Mask, Proof ID, Tax Tag, Rule ID). | Transmitted only if the user chooses to paste their unique local feed formula into Google Sheets. Governed by the user's personal Google account settings. |
| **Suiscan Block Explorer** | Suiscan / Mysten Labs (`https://suiscan.xyz`) | Client-side hyperlinks (`public/app.js`) | Sui transaction digest hashes clicked by the user to verify cryptographic Walrus proofs. | Standard public web link redirection. No private data transmitted. |

---

## 3. Data We Store Locally on Your Device

PocketSentinel operates as a client-first application. The following information is stored strictly within your browser's `localStorage` and `sessionStorage`:
* **User Profile Preferences:** Display Name (`recall_user_name`), preferred currency symbol (`recall_currency`), monthly direct inflow baseline (`recall_inflow`), real hourly wage (`recall_hourly_wage`), and billing cycle days (`recall_cycle_days`).
* **Custom Envelopes:** Any custom zero-based category envelopes created by the user (`pocketsentinel_custom_envelopes`).
* **UI Theme:** Active visual theme preference (`recallramp-theme`).
* **Client-Side WebCrypto Key Bundle:** Your derived AES-256-GCM encryption key and cryptographic salt. PocketSentinel servers do not possess your key bundle; if you lose your browser storage without exporting a backup, encrypted payloads cannot be decrypted.

---

## 4. What We Do NOT Collect

* **NO Banking Credentials:** We never ask for or store your bank login username, password, or two-factor authentication codes.
* **NO Data Broker Commercialization:** We do not track you across other websites, compile marketing profiles, or sell aggregate transaction trends to advertisers, credit card issuers, or data brokers.
* **NO Analytics Trackers:** PocketSentinel does not embed Google Analytics, Meta Pixel, Mixpanel, or third-party behavioral telemetry scripts.

---

## 5. Security & Encryption Standards

1. **Client-Side Encryption:** All confidential transaction exports and memory payloads are encrypted with AES-256-GCM using keys derived via PBKDF2-SHA256 with 100,000 hashing rounds.
2. **Server-Side API Key Quarantine:** All third-party provider keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `TATUM_API_KEY`, `MEMWAL_KEY`) are quarantined on the backend server environment and are never bundled, transmitted, or exposed to the client-side browser DOM.

---

## 6. Your Rights Under GDPR and CCPA

Under the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), you retain full sovereignty over your data:
* **Right of Access:** You can inspect all 12 Walrus episodic memory records onchain at any time via the built-in Memory Inspector or through Suiscan.
* **Right to Data Portability:** You can export all statement data, normalized 9-column CSV feeds, and IRS audit bundles with a single click.
* **Right to Erasure ("Right to be Forgotten"):** You can permanently delete your profile, clear all local custom envelopes, destroy your WebCrypto key bundle, and wipe all local storage using the **"Delete My Account"** feature in Settings.

---

## 7. Contact & Open Source Auditing

PocketSentinel is open-source under the MIT License. You can audit our entire source code, network endpoints, and data processing pipelines at any time:
* **Repository:** `github.com/your-username/pocketsentinel`
* **Contact:** `privacy@pocketsentinel.app`
