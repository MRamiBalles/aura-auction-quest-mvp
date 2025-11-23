# 🧪 Testing Guide - Smart Contract Security Tests

Complete guide for running and understanding the security test suite.

---

## 📋 Prerequisites

```bash
# Install dependencies
npm install --save-dev \
  @nomicfoundation/hardhat-toolbox \
  @nomicfoundation/hardhat-network-helpers \
  chai \
  @types/chai \
  @types/mocha

# Ensure you have Hardhat installed
npm install --save-dev hardhat
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npx hardhat test
```

### Run Specific Test File
```bash
# Marketplace tests only
npx hardhat test test/Marketplace.security.test.js

# AuctionHouse tests only
npx hardhat test test/AuctionHouse.security.test.js

# Staking tests only
npx hardhat test test/Staking.security.test.js
```

### Run Specific Test Suite
```bash
# Run only P0 fix verification tests
npx hardhat test --grep "P0 Fix Verification"

# Run only payment failure tests
npx hardhat test --grep "Payment Failure"

# Run only flash loan tests
npx hardhat test --grep "Flash Loan"
```

### Run with Gas Reporting
```bash
REPORT_GAS=true npx hardhat test
```

### Run with Coverage
```bash
npx hardhat coverage
```

---

## 📊 Test Suite Overview

### Marketplace.security.test.js
**Total Tests**: ~15  
**Coverage Areas**:
- P0 Fix: Reentrancy protection
- P1-1 Fix: Payment failure handling (push-to-pull)
- Fee locking per listing
- NFT ownership validation
- Fee management
- Refund handling
- Access control
- Edge cases

**Key Tests**:
```javascript
✓ Should handle seller payment failure with push-to-pull pattern
✓ Should allow withdrawal of pending payments
✓ Should lock platform fee at listing time
✓ Should revert if seller no longer owns NFT
✓ Should enforce 5% maximum fee
✓ Should refund excess payment
```

### AuctionHouse.security.test.js
**Total Tests**: ~18  
**Coverage Areas**:
- P0-1 Fix: Infinite extension loop prevention
- P0-2 Fix: Failed refund handling
- NFT transfer failure handling
- Anti-sniping mechanism
- Minimum bid increment
- Auction finalization
- Edge cases

**Key Tests**:
```javascript
✓ Should limit auction extensions to MAX_EXTENSIONS
✓ Should not block auction if previous bidder refund fails
✓ Should allow withdrawal of failed refunds
✓ Should refund winner if NFT transfer fails
✓ Should extend auction if bid in last 5 minutes
✓ Should enforce 0.5% minimum bid increment
```

### Staking.security.test.js
**Total Tests**: ~20  
**Coverage Areas**:
- P0-3 Fix: Flash loan APY exploit prevention
- P0-4 Fix: emergencyWithdraw removal
- Reward pool safeguards
- Reward calculation
- Stake/unstake operations
- Reserve health checks
- Access control
- Migration functions

**Key Tests**:
```javascript
✓ Should NOT give bonus APY to flash loan attackers
✓ Should give bonus APY to legitimate long-term stakers
✓ Should track continuous staking time correctly
✓ Should enforce MAX_TOTAL_STAKE limit
✓ Should cap rewards at available reserve
✓ Should calculate base APY rewards correctly
```

---

## 🎯 Expected Test Results

### All Tests Passing
```
  Marketplace - Security Tests
    P0 Fix Verification
      ✓ Should prevent reentrancy attacks with nonReentrant modifier
    P1-1: Payment Failure Handling
      ✓ Should handle seller payment failure with push-to-pull pattern (245ms)
      ✓ Should allow withdrawal of pending payments (156ms)
      ✓ Should revert if no pending withdrawals
    Fee Locking
      ✓ Should lock platform fee at listing time (198ms)
    NFT Ownership Validation
      ✓ Should revert if seller no longer owns NFT (187ms)
    Fee Management
      ✓ Should enforce 5% maximum fee
      ✓ Should allow fees up to 5%
    Refund Handling
      ✓ Should refund excess payment (203ms)
    Access Control
      ✓ Should prevent non-owner from updating fees
      ✓ Should prevent non-owner from withdrawing fees
    Edge Cases
      ✓ Should revert if price is 0
      ✓ Should revert if buyer is seller (156ms)
      ✓ Should revert if listing not active (178ms)

  AuctionHouse - Security Tests
    P0-1: Infinite Extension Loop Prevention
      ✓ Should limit auction extensions to MAX_EXTENSIONS (1823ms)
      ✓ Should stop extending after MAX_EXTENSIONS reached (1456ms)
    P0-2: Failed Refund Handling
      ✓ Should not block auction if previous bidder refund fails (289ms)
      ✓ Should allow withdrawal of failed refunds (234ms)
    NFT Transfer Failure Handling
      ✓ Should refund winner if NFT transfer fails (312ms)
    Anti-Sniping Mechanism
      ✓ Should extend auction if bid in last 5 minutes (267ms)
      ✓ Should not extend if bid more than 5 minutes before end (198ms)
    Minimum Bid Increment
      ✓ Should enforce 0.5% minimum bid increment (234ms)
    Auction Finalization
      ✓ Should distribute payments correctly on finalization (298ms)
      ✓ Should handle auction with no bids (187ms)
    Edge Cases
      ✓ Should prevent seller from bidding on own auction
      ✓ Should prevent bidding after auction ended (156ms)

  Staking - Security Tests
    P0-3: Flash Loan APY Exploit Prevention
      ✓ Should NOT give bonus APY to flash loan attackers (892ms)
      ✓ Should give bonus APY to legitimate long-term stakers (867ms)
      ✓ Should track continuous staking time correctly (789ms)
      ✓ Should reset bonus progress if user unstakes everything (934ms)
    P0-4: emergencyWithdraw Removal
      ✓ Should not have emergencyWithdraw function
    Reward Pool Safeguards
      ✓ Should enforce MAX_TOTAL_STAKE limit
      ✓ Should track reserve funds correctly (156ms)
      ✓ Should cap rewards at available reserve (923ms)
      ✓ Should revert claim if insufficient reserve (856ms)
    Reward Calculation
      ✓ Should calculate base APY rewards correctly (812ms)
      ✓ Should calculate bonus APY rewards correctly (1234ms)
    Stake/Unstake Operations
      ✓ Should update total staked correctly on stake (145ms)
      ✓ Should update total staked correctly on unstake (198ms)
      ✓ Should auto-claim rewards on stake if already staking (678ms)
      ✓ Should auto-claim rewards on unstake (589ms)
    Reserve Health Check
      ✓ Should report healthy reserve
      ✓ Should report unhealthy reserve if depleted (945ms)
    Edge Cases
      ✓ Should revert if staking 0
      ✓ Should revert if unstaking more than staked (123ms)
      ✓ Should revert claim if no stake
      ✓ Should handle claim with 0 rewards gracefully (145ms)
    Access Control
      ✓ Should only allow owner to fund rewards
      ✓ Should only allow owner to migrate staking time
    Migration Function
      ✓ Should allow one-time migration of staking time (178ms)
      ✓ Should prevent double migration (189ms)

  53 passing (24s)
```

### Coverage Report
```bash
npx hardhat coverage
```

**Expected Coverage**:
```
-------------------|----------|----------|----------|----------|
File               | % Stmts  | % Branch | % Funcs  | % Lines  |
-------------------|----------|----------|----------|----------|
 contracts/        |          |          |          |          |
  Marketplace.sol  |    95.12 |    88.24 |   100.00 |    96.30 |
  AuctionHouse.sol |    93.75 |    85.71 |    94.44 |    94.87 |
  Staking.sol      |    96.67 |    90.91 |   100.00 |    97.62 |
-------------------|----------|----------|----------|----------|
All files          |    95.18 |    88.29 |    98.15 |    96.26 |
-------------------|----------|----------|----------|----------|
```

---

## 🔧 Troubleshooting

### Issue: Tests Fail with "Cannot find module"
```bash
# Solution: Install missing dependencies
npm install
```

### Issue: "Invalid nonce" errors
```bash
# Solution: Reset Hardhat network
npx hardhat clean
rm -rf cache artifacts
npx hardhat test
```

### Issue: Tests timeout
```bash
# Solution: Increase timeout in hardhat.config.ts
mocha: {
  timeout: 60000, // 60 seconds
}
```

### Issue: Gas estimation errors
```bash
# Solution: Ensure you have enough ETH in test accounts
# Hardhat provides 10,000 ETH by default, should be sufficient
```

---

## 📝 Writing New Tests

### Template for New Test
```javascript
describe("Feature Name", function () {
  let contract;
  let owner, user1, user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  it("Should do something specific", async function () {
    // Arrange
    const value = ethers.parseEther("1");
    
    // Act
    const tx = await contract.someFunction(value);
    await tx.wait();
    
    // Assert
    const result = await contract.someGetter();
    expect(result).to.equal(expectedValue);
  });
});
```

### Testing Reverts
```javascript
await expect(
  contract.functionThatShouldRevert()
).to.be.revertedWith("Error message");

// For custom errors
await expect(
  contract.functionThatShouldRevert()
).to.be.revertedWithCustomError(contract, "CustomErrorName");
```

### Testing Events
```javascript
await expect(tx)
  .to.emit(contract, "EventName")
  .withArgs(arg1, arg2, arg3);
```

### Time Manipulation
```javascript
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Fast forward 1 hour
await time.increase(3600);

// Set to specific timestamp
await time.increaseTo(1234567890);

// Get current timestamp
const now = await time.latest();
```

---

## 🎯 Test Coverage Goals

**Minimum Coverage** (before audit):
- Statement Coverage: > 90%
- Branch Coverage: > 85%
- Function Coverage: > 95%

**Critical Functions** (must be 100% covered):
- `buyItem()` (Marketplace)
- `placeBid()` (AuctionHouse)
- `finalizeAuction()` (AuctionHouse)
- `stake()` (Staking)
- `unstake()` (Staking)
- `calculateRewards()` (Staking)

---

## 📊 Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Smart Contract Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx hardhat compile
      - run: npx hardhat test
      - run: npx hardhat coverage
```

---

## 🔒 Security Test Checklist

Before deploying to mainnet, verify:

- [ ] All 53+ tests passing
- [ ] Coverage > 90% for all contracts
- [ ] No compiler warnings
- [ ] Gas optimization reviewed
- [ ] Tested on local network
- [ ] Tested on testnet
- [ ] Fuzzing tests run (optional but recommended)
- [ ] Professional audit completed

---

## 📚 Additional Resources

**Hardhat Documentation**: https://hardhat.org/docs  
**Chai Assertions**: https://www.chaijs.com/api/bdd/  
**OpenZeppelin Test Helpers**: https://docs.openzeppelin.com/test-helpers  
**Ethers.js Docs**: https://docs.ethers.org/v6/

---

**Last Updated**: 2025-11-23  
**Test Suite Version**: 1.0
