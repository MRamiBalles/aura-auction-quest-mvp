# 🧪 Quick Test Setup & Execution Guide

## Prerequisites Check

Before running tests, you need:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Git** (optional but recommended)
   - Download: https://git-scm.com/

---

## Installation Steps

### Step 1: Install Node.js
```bash
# Download and install from:
# https://nodejs.org/en/download/

# After installation, verify:
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Step 2: Install Project Dependencies
```bash
# Navigate to project directory
cd C:\Users\Manu\AuraWorld\aura-auction-quest-mvp

# Install all dependencies
npm install

# This will install:
# - Hardhat
# - OpenZeppelin contracts
# - Testing libraries (Chai, Mocha)
# - Ethers.js
# - TypeScript
# - And all other dependencies
```

### Step 3: Compile Contracts
```bash
# Compile smart contracts
npx hardhat compile

# You should see:
# ✓ Compiled X Solidity files successfully
```

---

## Running Tests

### Quick Test (All tests)
```bash
npx hardhat test
```

### Expected Output:
```
  Marketplace - Security Tests
    P0 Fix Verification
      ✓ Should prevent reentrancy attacks (123ms)
    P1-1: Payment Failure Handling
      ✓ Should handle seller payment failure (245ms)
      ✓ Should allow withdrawal of pending payments (156ms)
    ...

  AuctionHouse - Security Tests
    P0-1: Infinite Extension Loop
      ✓ Should limit extensions to MAX_EXTENSIONS (892ms)
      ✓ Should stop extending after limit (678ms)
    ...

  Staking - Security Tests
    P0-3: Flash Loan Prevention
      ✓ Should NOT give bonus to flash loans (812ms)
      ✓ Should give bonus to long-term stakers (867ms)
    ...

  53 passing (24s)
```

### Run Specific Tests
```bash
# Only Marketplace tests
npx hardhat test test/Marketplace.security.test.js

# Only AuctionHouse tests
npx hardhat test test/AuctionHouse.security.test.js

# Only Staking tests
npx hardhat test test/Staking.security.test.js

# Only P0 tests
npx hardhat test --grep "P0"

# Only payment tests
npx hardhat test --grep "payment"
```

### Run with Coverage
```bash
npx hardhat coverage
```

### Run with Gas Report
```bash
REPORT_GAS=true npx hardhat test
```

---

## Troubleshooting

### Issue: "npm is not recognized"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Cannot find module"
**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Compilation failed"
**Solution**:
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

### Issue: Tests timeout
**Solution**: Increase timeout in `hardhat.config.ts`:
```typescript
mocha: {
  timeout: 60000, // 60 seconds
}
```

### Issue: "Invalid nonce"
**Solution**:
```bash
# Reset Hardhat network
npx hardhat clean
rm -rf cache artifacts
npx hardhat test
```

---

## Alternative: Manual Test Execution

If you can't install Node.js right now, you can:

1. **Review Test Code**: Open the test files to see what's being tested
   - `test/Marketplace.security.test.js`
   - `test/AuctionHouse.security.test.js`
   - `test/Staking.security.test.js`

2. **Use Online IDE**: 
   - Remix IDE: https://remix.ethereum.org/
   - (Upload contracts and test manually)

3. **Check Deployment**: Deploy to testnet first, test via UI

---

## Next Steps After Tests Pass

1. **Deploy to Testnet**:
   ```bash
   npx hardhat run scripts/deploy-amoy-testnet.ts --network amoy
   ```

2. **Verify Contracts**:
   ```bash
   npx hardhat verify --network amoy <CONTRACT_ADDRESS>
   ```

3. **Test on Testnet**: Use frontend/mobile app to interact

4. **Schedule Audit**: Contact professional auditors

---

## Quick Commands Reference

```bash
# Installation
npm install

# Compile
npx hardhat compile

# Test (all)
npx hardhat test

# Test (specific)
npx hardhat test test/Marketplace.security.test.js

# Coverage
npx hardhat coverage

# Deploy (testnet)
npx hardhat run scripts/deploy-amoy-testnet.ts --network amoy

# Verify
npx hardhat verify --network amoy <ADDRESS>

# Clean
npx hardhat clean
```

---

## Do You Have Node.js Installed?

Run this to check:
```bash
node --version
npm --version
```

If not installed:
1. Download from: https://nodejs.org/en/download/
2. Install (default options are fine)
3. Restart terminal
4. Run `node --version` again to verify

---

**Need help installing Node.js? Let me know!**
