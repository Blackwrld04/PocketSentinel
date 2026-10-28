# PocketSentinel Terms of Service

**Effective Date:** October 29, 2026  
**Last Updated:** October 29, 2026  
**Software License:** MIT Open Source License  
**Product:** PocketSentinel Autonomous Household Financial Operating System  

---

## 1. Acceptance of Terms

By accessing, installing, deploying, or utilizing the PocketSentinel application, web interface, local daemon, or associated software libraries (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.

---

## 2. Description of the Platform

PocketSentinel is a client-first, privacy-preserving household financial operating system. Its primary features include:
* **Zero-Knowledge Zero-Based Budgeting:** Client-side envelope allocation, real-time burn velocity tracking, and daily safe-to-spend runway calculation.
* **Autonomous Subscription Negotiation:** Generation of cancellation scripts, merchant escalation workflows, and unearned charge dispute logs.
* **Onchain Memory Verification:** Decentralized recording of baseline price agreements and trial expiration horizons anchored via the Walrus Memory Protocol on Sui Mainnet.
* **Multimodal Receipt Ingestion:** Optical character recognition (OCR) and itemization of household receipts via the Google Gemini API.
* **Conversational Financial Copilot:** Natural language assistance and simulation models powered by Groq LPU inference.

---

## 3. Strict Non-Financial Advisor Disclaimer

**POCKETSENTINEL IS AN AUTOMATED INFORMATION AND PRODUCTIVITY UTILITY, NOT A FINANCIAL ADVISORY SERVICE.**

1. **No Fiduciary Duty:** PocketSentinel, its creators, contributors, and maintainers are not registered investment advisers, broker-dealers, certified financial planners (CFP), or Certified Public Accountants (CPA).
2. **Educational and Analytical Purpose Only:** All metrics, envelope suggestions, daily runway figures, simulated tax deductions, and copilot responses are generated algorithmically for informational, organizational, and educational purposes.
3. **User Responsibility:** You are solely responsible for verifying the accuracy of all calculations, bank reconciliation statements, tax categorizations, and subscription cancellation steps before making financial commitments. Consult a qualified financial advisor, tax attorney, or licensed accountant before executing significant financial decisions.

---

## 4. User Security and Cryptographic Key Sovereignty

PocketSentinel enforces client-side cryptographic sovereignty. Consequently:
* **Local WebCrypto Keys:** Encryption keys are derived in your browser via PBKDF2-SHA256 and stored in your device's local storage. PocketSentinel maintains no central database of your keys, passwords, or recovery seeds.
* **Device Security:** You are solely responsible for maintaining physical and digital security over your devices, browser storage, and local environment.
* **Irrevocable Actions:** If you execute the "Delete My Account / Purge Vault" action, or if you clear your browser's local application data without an external backup, your locally encrypted data cannot be recovered by any party.

---

## 5. Third-Party Protocols and Upstream Services

The Platform interacts with third-party networks, application programming interfaces (APIs), and decentralized blockchains, including:
* **Mysten Labs / Walrus Protocol:** Decentralized blob storage and memory relayer.
* **Sui Blockchain Mainnet:** Distributed ledger recording memory epochs and transaction digests.
* **Tatum Sui RPC Gateway:** Node infrastructure providing blockchain connectivity.
* **Groq Cloud AI:** High-speed LPU inference engine for conversational intelligence.
* **Google Gemini API:** Multimodal optical character recognition and image parsing.

PocketSentinel does not control these third-party platforms. We make no warranty or guarantee regarding the continuous availability, response latency, accuracy, or uninterrupted uptime of external blockchain networks or remote cloud APIs.

---

## 6. Intellectual Property and Open Source License

1. **MIT License:** The core PocketSentinel software code is open-source and licensed under the permissive MIT License. You are free to inspect, fork, modify, and run instances of the software in accordance with the MIT License terms.
2. **Trademarks:** The name "PocketSentinel", associated logos, and brand assets remain the property of their respective creators.

---

## 7. Prohibited Uses

You agree not to use PocketSentinel:
* To process, transmit, or record fraudulent financial transactions or illicit funds.
* To attempt to reverse-engineer, exploit, or flood third-party API gateways (Tatum, Groq, Google, Walrus) with malicious or abusive traffic.
* In any manner that violates applicable municipal, state, federal, or international banking, privacy, or wire fraud regulations.

---

## 8. Limitation of Liability and Disclaimer of Warranties

1. **"AS IS" Basis:** The Platform is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
2. **No Consequential Damages:** In no event shall PocketSentinel, its authors, contributors, or distributors be liable for any direct, indirect, incidental, special, exemplary, punitive, or consequential damages (including loss of profits, overdraft fees, subscription renewal charges, onchain gas fee fluctuations, or data loss) arising out of or in connection with the use or inability to use the Platform.

---

## 9. Modifications to Terms

We reserve the right to revise or update these Terms as the Platform evolves. Continued use of PocketSentinel following the publication of updated Terms constitutes acceptance of those changes.

---

## 10. Governing Law and Severability

These Terms shall be interpreted and governed in accordance with standard open-source software norms and applicable law. If any provision of these Terms is found to be unenforceable or invalid, that provision shall be modified to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.

---

## 11. Contact

For legal inquiries, open-source compliance, or security vulnerability disclosures:
* **Email:** legal@pocketsentinel.app
* **Repository:** github.com/your-username/pocketsentinel
