# MiCA Compliance Roadmap: AuraAuction Quest (2025)

**Status:** DRAFT  
**Jurisdiction:** Malta (EU)  
**Applicability:** Utility Tokens & NFTs with "substance over form"

---

## 1. Executive Summary: The 2025 Regulatory Landscape

The **Markets in Crypto-Assets (MiCA)** regulation is fully active as of December 30, 2024. For *AuraAuction Quest*, this means the "Wild West" era is over. We must transition from a "move fast" mindset to a "compliance-first" architecture.

**Key Definition:** Our token ($AURA) bridges the gap between a **Utility Token** (access to services) and a potential **Financial Instrument** due to the "Ultra Sound" deflationary mechanics (burns leading to value appreciation).

> **Crucial Warning:** The implementation of "Viral Loops" (referrals) and "Staking" puts us at higher risk of being classified as a financial service. We must tread carefully.

---

## 2. Mandatory Whitepaper Requirements (Article 4 & 5)

We cannot launch a public token sale or listing without a notified Whitepaper. It must be a legal document, not a marketing deck.

**Required Sections:**
1.  **Responsible Persons:** Full identities of directors (no anon founders).
2.  **Project Description:** Non-technical explanation of the game loop.
3.  **Token Rights:** Clear functionality (e.g., "AURA is used for governance and in-game transaction fees, not strictly for investment").
4.  **Risks:** Bold, unavoidable "Risk Factors" section (volatility, loss of funds).
5.  **Environmental Impact:** Consensus mechanism energy consumption (Polygon is favorable here).

**Action Item:** Draft `AURA_WHITEPAPER_LEGAL_V1.md` replacing marketing hype with legal clarity.

---

## 3. CASP Licensing (Crypto-Asset Service Provider)

Hosting a "Custodial Wallet" (Part of our Dual Economy strategy) classifies us as a Wallet Custodian.

**Implications:**
- **Capital Requirement:** €125,000 minimum reserve.
- **Segregation of Funds:** User assets MUST be on separate on-chain addresses, not commingled with company operations.
- **Liability:** We are liable for hacks if security negligence is proven.

**Strategic Pivot:**
We should prioritize **Account Abstraction (ERC-4337)** which allows "Self-Custody with better UX" rather than full Custodial Wallets. This significantly lowers our regulatory burden as we never "hold" the private keys.

---

## 4. NFT Classification ("Substance Over Form")

MiCA theoretically exempts unique NFTs. However, our **"Safari Zone"** events create large collections of similar assets.

- **Risk:** If NFTs are interchangeable and mass-produced (e.g., 10,000 identical "London Event Generic Badges"), they are NOT NFTs under MiCA—they are crypto-assets subject to regulation.
- **Mitigation:** Ensure meaningful metadata variance (unique stats, diverse visuals) for every generated NFT. See `SafariZoneNFT.sol`.

---

## 5. Anti-Money Laundering (AML) & KYC

**Thresholds:**
- **Incoming Crypto:** Any deposit > €1,000 in value requires KYC.
- **Fiat Ramp:** All credit card purchases require full identity verification.

**Implementation Plan:**
1.  Integrate **Sumsub** for ID verification.
2.  Implement **Geo-blocking** for sanctioned regions (OFAC list).
3.  Transaction Monitoring: Use **Chainalysis** or **Elliptic** APIs to block dirty wallets interacting with our contracts.

---

## 6. Actionable Checklist for Q1 2026

- [ ] **Legal Opinion:** Obtain a "MiCA Classification Letter" from a Maltese law firm (~€5,000).
- [ ] **Whitepaper Rewrite:** Remove terms like "profit," "moon," "ROI," "yield." Use "utility," "access," "rewards."
- [ ] **Treasury Audit:** Proof of funds for the €125k capital requirement if pursuing CASP license.
- [ ] **Smart Contract Audit:** Verify `BurnManager` and `Staking` do not chemically resemble dividend payouts (security-like features).

---

*Disclaimer: This document is for internal planning only and does not constitute legal advice. Consult with our legal counsel in Malta.*
