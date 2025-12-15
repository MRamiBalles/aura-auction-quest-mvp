# 🐛 Aura World - Bug Bounty Program

**Program Status**: 🟢 ACTIVE  
**Platform**: Immunefi / Self-Hosted  
**Last Updated**: 2025-11-23

---

## 📋 Program Overview

AuraAuction Quest is committed to the security of our platform and the safety of our users' funds. We invite security researchers, ethical hackers, and the broader community to help us identify vulnerabilities in our smart contracts and application infrastructure.

**Total Rewards Pool**: Up to **$50,000 USD** in bounties  
**Payment Methods**: 
- USDC (preferred)
- MATIC
- Bank transfer (for high-value findings)

---

## 🎯 Program Scope

### ✅ **In Scope - Smart Contracts** (Priority)

**Network**: Polygon Mainnet  
**Contracts**:

| Contract | Address | Priority |
|----------|---------|----------|
| Marketplace | `0x...` (TBD after deployment) | 🔴 CRITICAL |
| AuctionHouse | `0x...` (TBD after deployment) | 🔴 CRITICAL |
| Staking | `0x...` (TBD after deployment) | 🔴 CRITICAL |
| AuraToken | `0x...` (TBD after deployment) | 🟡 MEDIUM |
| AuraNFT | `0x...` (TBD after deployment) | 🟡 MEDIUM |

**Focus Areas**:
- Fund theft or loss
- Unauthorized access to user funds
- Economic exploits (flash loans, MEV, front-running)
- Denial of Service affecting fund access
- Smart contract logic errors
- Reentrancy attacks
- Integer overflow/underflow
- Access control bypasses

### ✅ **In Scope - Backend Application**

**Domain**: `api.auraquest.com` (production)  
**Technology**: NestJS, MongoDB, Redis

**Focus Areas**:
- Authentication bypass
- Privilege escalation
- SQL/NoSQL injection
- Server-side request forgery (SSRF)
- Remote code execution
- Data breaches (user data exposure)
- API abuse leading to economic loss
- Anti-cheat bypass

### ✅ **In Scope - Frontend Application**

**Domain**: `auraquest.com` (production)  
**Technology**: React, Vite

**Focus Areas**:
- Cross-Site Scripting (XSS) leading to fund theft
- Cross-Site Request Forgery (CSRF) with financial impact
- Wallet signature phishing
- Local storage manipulation affecting funds
- Prototype pollution

### ✅ **In Scope - Mobile Applications**

**Platforms**: iOS App Store, Android Play Store

**Focus Areas**:
- Wallet private key exposure
- API key extraction
- Authentication bypass
- In-app purchase bypasses

---

## ❌ Out of Scope

The following are **NOT eligible** for bounties:

### General Exclusions
- ❌ Social engineering attacks on team members
- ❌ Physical attacks on infrastructure
- ❌ Denial of Service (DoS) attacks
- ❌ Spam or social media account takeovers
- ❌ Publicly disclosed bugs (prior to our awareness)
- ❌ Vulnerabilities in third-party services (MetaMask, Polygon RPC)

### Low-Impact Issues
- ❌ Self-XSS
- ❌ Missing security headers without proof of exploitability
- ❌ Clickjacking without financial impact
- ❌ Information disclosure without sensitive data
- ❌ SSL/TLS configuration issues (if using standard configs)
- ❌ Rate limiting bypasses without economic impact
- ❌ Reports from automated scanners without validation

### Known Issues
- ❌ Front-running on public blockchain (inherent to design)
- ❌ MEV extraction (blockchain limitation)
- ❌ Gas price manipulation
- ❌ Network congestion attacks

---

## 💰 Reward Tiers

### 🔴 **Critical Severity** ($10,000 - $50,000)

Vulnerabilities that directly lead to:
- Theft or permanent freezing of user funds (any amount)
- Complete takeover of smart contracts
- Large-scale data breach (>1000 users)
- Unauthorized minting of tokens
- Drain of staking rewards pool

**Examples**:
- Reentrancy allowing fund theft from Marketplace
- Flash loan attack draining Staking contract
- Authentication bypass allowing wallet takeover
- Smart contract upgrade exploit

**Reward Range**: 
- $50,000: >$100k funds at risk
- $25,000: $10k-$100k funds at risk
- $10,000: <$10k funds at risk

---

### 🟠 **High Severity** ($5,000 - $10,000)

Vulnerabilities that lead to:
- Theft of unclaimed yield/rewards
- Temporary freezing of funds (< 24 hours)
- Protocol insolvency without immediate fund loss
- Privilege escalation to admin role
- Unauthorized access to private user data

**Examples**:
- Manipulation of APY calculations
- Auction extension loop exploit
- Admin function access control bypass
- GPS anti-cheat bypass at scale

**Reward Range**:
- $10,000: Affects all users
- $7,500: Affects >100 users
- $5,000: Affects <100 users

---

### 🟡 **Medium Severity** ($1,000 - $5,000)

Vulnerabilities that lead to:
- Griefing attacks (preventing others from using platform)
- Information disclosure of sensitive non-financial data
- Smart contract logic errors without fund loss
- Bypass of rate limiting with economic impact

**Examples**:
- Denial of service on specific smart contract functions
- Auction finalization griefing
- Leaderboard manipulation
- Session hijacking without fund access

**Reward Range**:
- $5,000: Widespread impact
- $3,000: Moderate impact
- $1,000: Limited impact

---

### 🟢 **Low Severity** ($250 - $1,000)

Vulnerabilities that lead to:
- Minor information disclosure
- Logic errors with minimal impact
- UI/UX exploits without financial consequence

**Examples**:
- Bypassing CAPTCHA or rate limits (non-financial)
- Limited XSS without wallet access
- Invalid listing cleanup bypass
- Minor smart contract inefficiencies

**Reward Range**:
- $1,000: Still valuable but limited scope
- $500: Edge case exploitation
- $250: Minor issue with proof of concept

---

## 📝 Submission Guidelines

### How to Submit

**Email**: security@auraquest.com  
**PGP Key**: [PGP Public Key] (for encrypted communication)  
**Alternative**: Immunefi platform (preferred)

### Required Information

Your submission **must** include:

1. **Impact Assessment**
   - Severity: Critical/High/Medium/Low
   - Affected component(s)
   - Estimated funds at risk
   - Number of users affected

2. **Vulnerability Details**
   - Clear description of the vulnerability
   - Affected smart contract address or API endpoint
   - Vulnerable code location (file, line number)
   - Root cause analysis

3. **Proof of Concept**
   - Step-by-step reproduction steps
   - Code snippets or scripts
   - Screenshots/videos (if applicable)
   - **DO NOT** exploit on mainnet with real funds

4. **Suggested Fix** (optional but valued)
   - Code patch or mitigation strategy
   - Alternative approaches

### Submission Template

```markdown
## Vulnerability Report

**Researcher**: [Your Name/Handle]
**Date**: [YYYY-MM-DD]
**Severity**: [Critical/High/Medium/Low]

### Impact
- Component: [Smart Contract / Backend API / Frontend]
- Estimated Loss: [$X USD]
- Users Affected: [Number]

### Description
[Clear explanation of the vulnerability]

### Affected Code
- Contract: [Contract name]
- Function: [Function name]
- Lines: [Line numbers]
- Code snippet:
```solidity
// Vulnerable code here
```

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Expected malicious outcome]

### Proof of Concept
[Code, screenshots, or video]

### Suggested Fix
[Optional: Your recommended solution]

### Additional Notes
[Any extra context]
```

---

## ⚖️ Responsible Disclosure Policy

### Our Commitments

We commit to:
- ✅ Acknowledge receipt within **24 hours**
- ✅ Provide initial assessment within **72 hours**
- ✅ Keep you updated on remediation progress weekly
- ✅ Credit you publicly (if desired) after fix deployment
- ✅ Pay bounties within **30 days** of validated fix

### Your Responsibilities

As a security researcher, you must:
- ✅ **Not exploit** vulnerabilities beyond proof of concept
- ✅ **Not disclose** vulnerabilities publicly before we fix them
- ✅ **Not access** user data beyond what's necessary for PoC
- ✅ **Not perform** DoS attacks on production systems
- ✅ **Use testnet** for testing whenever possible
- ✅ **Communicate** in good faith

### Disclosure Timeline

**Standard Timeline**:
- Day 0: Researcher reports vulnerability
- Day 1: We acknowledge and begin investigation
- Day 3: We provide initial severity assessment
- Day 7-30: We develop and test fix
- Day 30: Public disclosure (coordinated)

**Critical Vulnerabilities**:
- Expedited fix deployment (24-72 hours)
- Communication every 12 hours
- Emergency mainnet deployment if necessary

---

## 🏆 Hall of Fame

We recognize and thank our top security researchers:

| Researcher | Finding | Severity | Reward | Date |
|------------|---------|----------|--------|------|
| [Name] | [Brief description] | Critical | $50,000 | 2025-XX-XX |
| - | - | - | - | - |

*Hall of Fame updated monthly*

---

## 🚫 Disqualification Criteria

Submissions will be **disqualified** if:
- ❌ Researcher exploited vulnerability with malicious intent
- ❌ Vulnerability was already known/reported
- ❌ Researcher disclosed vulnerability publicly before our fix
- ❌ Researcher attempted extortion or threats
- ❌ Submission lacks sufficient detail for reproduction
- ❌ Researcher violated terms of service during testing
- ❌ Finding is out of scope (see exclusions above)

---

## 📞 Contact & Support

**Security Team**: security@auraquest.com  
**Emergency Hotline**: [Phone number] (critical issues only)  
**PGP Fingerprint**: [Fingerprint]  
**Response Time**: 24 hours (business days)

**Preferred Communication**:
1. Immunefi platform (highest priority)
2. Encrypted email (PGP)
3. Regular email (non-sensitive)

---

## 💡 Tips for Researchers

### Maximize Your Bounty

1. **Be thorough**: Include detailed PoC and reproduction steps
2. **Assess impact**: Clearly explain the financial/user impact
3. **Suggest fixes**: Provide code patches or mitigation strategies
4. **Test on testnet**: Use Polygon Amoy for testing when possible
5. **Be responsive**: Answer our questions promptly
6. **Follow up**: Check on your submission status weekly

### Testing Environments

**Testnet (Recommended)**:
- Network: Polygon Amoy
- Contracts: [Testnet addresses]
- Free MATIC: https://faucet.polygon.technology/

**Local Testing**:
- Clone repo: `git clone [repo]`
- Run local Hardhat network
- Deploy contracts locally

### Common Pitfalls to Avoid

- ❌ Testing with real funds on mainnet
- ❌ Submitting duplicates of known issues
- ❌ Lack of proof of concept
- ❌ Vague or incomplete descriptions
- ❌ Unrealistic severity assessments

---

## 📜 Legal & Terms

### Eligibility

- Must be 18 years or older
- Cannot be resident of sanctioned countries (OFAC list)
- Cannot be employee/contractor of AuraAuction Quest
- Must comply with all local laws regarding security research

### Payment Terms

- Payments in USDC on Polygon (preferred)
- Alternative: MATIC or bank transfer
- KYC required for payments >$5,000
- Tax reporting as per local regulations
- Payment within 30 days of fix deployment

### Intellectual Property

- Researcher retains rights to their work
- AuraAuction Quest may use PoC for internal testing
- Public disclosure coordinated between both parties

### Limitation of Liability

- Bug bounty participation is voluntary
- No employment relationship is created
- AuraAuction Quest reserves right to modify program terms
- Final severity assessment at our discretion

---

## 🎯 Program Goals

Our bug bounty program aims to:

1. **Protect Users**: Identify vulnerabilities before malicious actors
2. **Build Trust**: Demonstrate commitment to security
3. **Community Engagement**: Collaborate with security researchers
4. **Continuous Improvement**: Iterate on security posture
5. **Fair Compensation**: Reward valuable contributions

---

## 📊 Program Statistics

**Program Launch**: 2025-XX-XX (after mainnet)  
**Total Paid Out**: $0 (to be updated)  
**Valid Reports**: 0  
**Average Response Time**: TBD  
**Average Resolution Time**: TBD

*Statistics updated monthly*

---

## 🔄 Program Updates

**Version History**:
- v1.0 (2025-11-23): Initial program launch
- Future updates will be posted here

**Subscribe to Updates**: security-bounty@auraquest.com

---

## ❓ FAQ

### Q: Can I test on mainnet?
**A**: Use testnet (Polygon Amoy) for testing. Mainnet testing allowed only for:
- Read-only operations
- Your own funds (not others')
- Non-disruptive testing

### Q: What if I find a critical vulnerability?
**A**: Email security@auraquest.com immediately with subject "CRITICAL VULNERABILITY". We'll respond within 2 hours.

### Q: Can I submit anonymously?
**A**: Yes, but KYC required for payments >$5,000.

### Q: What if my submission is a duplicate?
**A**: First valid submission wins. We'll notify if it's a duplicate.

### Q: How long until I get paid?
**A**: Within 30 days of fix deployment and validation.

### Q: Can I post about my finding on social media?
**A**: Only after coordinated public disclosure (30-90 days).

---

**Thank you for helping us keep AuraAuction Quest secure!** 🛡️

---

**Program Managed By**: AuraAuction Quest Security Team  
**Last Review**: 2025-11-23  
**Next Review**: 2026-02-23
