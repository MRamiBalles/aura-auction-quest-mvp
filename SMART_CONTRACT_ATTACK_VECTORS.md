# 🔍 Smart Contract Security Analysis
## Attack Vectors, Edge Cases & Economic Exploits

**Purpose**: Guide auditors to critical areas requiring extra scrutiny

---

## 📋 Contract Overview

**Contracts to Audit:**
1. **Marketplace.sol** - NFT trading with 2.5% fee
2. **AuctionHouse.sol** - Timed auctions with anti-sniping
3. **Staking.sol** - Token staking with 12-17% APY

---

## 🎯 1. Marketplace.sol - Attack Vectors

### Critical Functions:
- `buyItem()` - Lines 59-95
- `listItem()` - Lines 32-57
- `cancelListing()` - Lines 97-104

### A. Reentrancy Attacks

**Vulnerability Location**: `buyItem()` Lines 72-92

**Attack Scenario**:
```solidity
// Attacker contract
contract MaliciousNFT is ERC721 {
    Marketplace public marketplace;
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public override returns (bytes4) {
        // Reentrancy attempt during NFT transfer
        marketplace.buyItem{value: 1 ether}(123);
        return this.onERC721Received.selector;
    }
}
```

**Current Protection**: ✅ `nonReentrant` modifier
**Status**: **PROTECTED**

**But check**: Order of operations (CEI pattern)
```solidity
// Line 60-92: CURRENT ORDER
1. listing.active = false;  // ✅ State change first
2. NFT transfer              // ✅
3. Seller payment            // ✅
4. Fee payment              // ✅
5. Refund                   // ✅
```

**Auditor Focus**:
- Verify no state changes after external calls
- Check if NFT contract can trigger callbacks
- Validate all `call{}` return values

---

### B. Front-Running / MEV Attacks

**Vulnerability**: Buyer can front-run listing to steal deals

**Attack Scenario**:
```javascript
// Attacker monitors mempool
1. Seller lists rare NFT for 100 MATIC
2. Attacker sees transaction in mempool
3. Attacker submits buyItem() with higher gas price
4. Attacker's tx gets mined first
5. Original buyer's tx fails
```

**Mitigation Options**:
```solidity
// Option 1: Whitelist period
mapping(uint256 => uint256) public listingStartTime;
uint256 public constant WHITELIST_PERIOD = 1 hours;

function buyItem(uint256 listingId) external {
    require(
        block.timestamp >= listingStartTime[listingId] + WHITELIST_PERIOD,
        "Whitelist period active"
    );
    // ... rest of function
}

// Option 2: Commit-reveal scheme
// Buyer commits hash, reveals later
```

**Current Status**: ❌ **NOT PROTECTED**
**Auditor Action**: **RECOMMEND IMPLEMENTATION**

---

### C. Price Manipulation Edge Cases

**Edge Case 1**: Listing price = 0
```solidity
// Line 37: ✅ PROTECTED
require(price > 0, "Price must be > 0");
```

**Edge Case 2**: Price overflow
```solidity
// Line 68: Fee calculation
uint256 fee = (listing.price * platformFee) / FEE_DENOMINATOR;

// If listing.price = 2^256 - 1, could this overflow?
// Math: (2^256 - 1) * 250 / 10000
```

**Auditor Focus**:
- Test with `type(uint256).max` price
- Verify Solidity 0.8+ overflow protection works

---

### D. NFT Ownership Manipulation

**Vulnerability**: Seller transfers NFT after listing

**Attack Scenario**:
```javascript
1. Seller lists NFT #123 for 100 MATIC
2. Seller transfers NFT #123 to alt wallet
3. Buyer tries to buy
4. Transaction reverts (seller no longer owns NFT)
```

**Current Protection**: ✅ Transaction will revert at line 72
```solidity
IERC721(listing.nftContract).safeTransferFrom(
    listing.seller,  // If seller no longer owns, this reverts
    msg.sender,
    listing.tokenId
);
```

**But**: Listing stays active, cluttering marketplace

**Improvement**:
```solidity
// Add ownership check before payment
require(
    IERC721(listing.nftContract).ownerOf(listing.tokenId) == listing.seller,
    "Seller no longer owns NFT"
);
```

**Auditor Action**: **RECOMMEND ADDITION**

---

### E. Fee Manipulation

**Vulnerability**: Owner sets fee too high

**Current Protection**: ✅ Line 111
```solidity
function updatePlatformFee(uint256 newFee) external onlyOwner {
    require(newFee <= 500, "Fee cannot exceed 5%");
    platformFee = newFee;
}
```

**Attack Scenario** (Owner malicious):
```javascript
1. Owner sets fee to 5% (maximum)
2. Users already have active listings at 2.5%
3. Buyers lose more money than expected
```

**Improvement**:
```solidity
// Only apply new fee to NEW listings
mapping(uint256 => uint256) public listingFees;

function listItem(...) external {
    listingFees[listingCounter] = platformFee; // Lock in current fee
}

function buyItem(uint256 listingId) external {
    uint256 fee = (listing.price * listingFees[listingId]) / FEE_DENOMINATOR;
}
```

**Auditor Action**: **RECOMMEND DISCUSSION**

---

### F. Payment Failures

**Vulnerability**: Seller/Owner address cannot receive ETH

**Attack Scenario**:
```solidity
// Seller is a contract that reverts on receive
contract MaliciousSeller {
    receive() external payable {
        revert("Cannot receive"); // Line 79 will fail
    }
}
```

**Current State**: Transaction reverts entirely
**Impact**: Buyer loses gas, NFT stuck

**Improvement Options**:
```solidity
// Option 1: Push to pull pattern
mapping(address => uint256) public pendingWithdrawals;

function buyItem(...) {
    pendingWithdrawals[listing.seller] += sellerProceeds;
    // Don't transfer immediately
}

function withdraw() external {
    uint256 amount = pendingWithdrawals[msg.sender];
    pendingWithdrawals[msg.sender] = 0;
    payable(msg.sender).call{value: amount}("");
}

// Option 2: WETH instead of ETH
// Requires WETH integration
```

**Auditor Action**: **HIGH PRIORITY DISCUSSION**

---

## 🔨 2. AuctionHouse.sol - Attack Vectors

### Critical Functions:
- `placeBid()` - Lines 72-101
- `finalizeAuction()` - Lines 103-138
- `createAuction()` - Lines 38-70

### A. Anti-Sniping Bypass

**Current Implementation**: Line 95-98
```solidity
// Anti-sniping: extend if bid in last 5 minutes
if (auction.endTime - block.timestamp < EXTENSION_WINDOW) {
    auction.endTime += EXTENSION_DURATION;
}
```

**Attack Scenario 1**: Infinite extension loop
```javascript
1. Auction ends in 4:59
2. Attacker bids → extends to 9:59
3. Wait until 9:58
4. Attacker bids again → extends to 14:58
5. Repeat forever (griefing attack)
```

**Protection Needed**:
```solidity
uint256 public constant MAX_EXTENSIONS = 6; // Max 30 minutes extra
mapping(uint256 => uint256) public extensionCount;

function placeBid(uint256 auctionId) external {
    if (auction.endTime - block.timestamp < EXTENSION_WINDOW && 
        extensionCount[auctionId] < MAX_EXTENSIONS) {
        auction.endTime += EXTENSION_DURATION;
        extensionCount[auctionId]++;
    }
}
```

**Auditor Action**: **CRITICAL - ADD EXTENSION LIMIT**

---

### B. Last-Minute Refund Failure

**Vulnerability**: Previous bidder refund fails, blocking new bid

**Attack Scenario**:
```solidity
// Malicious bidder
contract MaliciousBidder {
    receive() external payable {
        revert("Cannot receive refund"); // Line 86 fails
    }
}
```

**Current State**: Line 87 `require(success, "Refund failed");`
**Impact**: Auction STUCK - no one can bid higher

**Improvement**:
```solidity
// Push to pull pattern
mapping(address => uint256) public failedRefunds;

function placeBid(uint256 auctionId) external {
    if (auction.currentBidder != address(0)) {
        (bool success, ) = payable(auction.currentBidder).call{value: auction.currentBid}("");
        if (!success) {
            failedRefunds[auction.currentBidder] += auction.currentBid;
        }
    }
    // Continue with bid
}

function withdrawFailedRefund() external {
    uint256 amount = failedRefunds[msg.sender];
    require(amount > 0, "No failed refunds");
    failedRefunds[msg.sender] = 0;
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "Withdrawal failed");
}
```

**Auditor Action**: **CRITICAL - MUST FIX**

---

### C. Auction Finalization Griefing

**Vulnerability**: Anyone can finalize, seller may delay

**Attack Scenario**:
```javascript
1. Auction ends at timestamp 1000
2. Seller doesn't finalize (waits for price to drop)
3. Winner cannot get NFT
4. Winner's capital locked
```

**Current State**: `finalizeAuction()` callable by anyone
**Check**: Line 103-106 - no access control

**Improvement Options**:
```solidity
// Option 1: Auto-finalize after grace period
uint256 public constant GRACE_PERIOD = 1 hours;

function finalizeAuction(uint256 auctionId) external {
    require(
        msg.sender == auction.seller || 
        msg.sender == auction.currentBidder ||
        block.timestamp >= auction.endTime + GRACE_PERIOD,
        "Not authorized"
    );
}

// Option 2: Penalty for late finalization
uint256 penalty = 0;
if (block.timestamp > auction.endTime + GRACE_PERIOD) {
    penalty = fee / 2; // 50% of platform fee goes to winner
}
```

**Auditor Action**: **RECOMMEND GRACE PERIOD**

---

### D. Minimum Bid Increment Edge Case

**Current**: Line 80
```solidity
uint256 minBid = auction.currentBid + 
    (auction.currentBid * MIN_BID_INCREMENT / FEE_DENOMINATOR);
// MIN_BID_INCREMENT = 50 (0.5%)
```

**Edge Case**: Very small bid amounts
```javascript
currentBid = 1 wei
minIncrement = 1 * 50 / 10000 = 0 (rounds down!)
minBid = 1 + 0 = 1 wei (no increase)
```

**Fix**:
```solidity
uint256 increment = (auction.currentBid * MIN_BID_INCREMENT / FEE_DENOMINATOR);
if (increment == 0) increment = 1; // Minimum 1 wei increase
uint256 minBid = auction.currentBid + increment;
```

**Auditor Action**: **VERIFY ROUNDING**

---

### E. NFT Transfer Failure During Finalization

**Vulnerability**: Line 121-125
```solidity
IERC721(auction.nftContract).safeTransferFrom(
    auction.seller,
    auction.currentBidder,
    auction.tokenId
);
```

**Attack Scenario**:
```javascript
1. Seller revokes approval after auction starts
2. Auction ends, finalize called
3. NFT transfer fails
4. Winner's payment is stuck
```

**Current State**: Transaction reverts, auction stays active
**Issue**: Winner cannot get refund

**Improvement**:
```solidity
try IERC721(auction.nftContract).safeTransferFrom(
    auction.seller,
    auction.currentBidder,
    auction.tokenId
) {
    // Success - proceed with payments
} catch {
    // NFT transfer failed - refund winner
    auction.active = false;
    (bool success, ) = payable(auction.currentBidder).call{value: auction.currentBid}("");
    require(success, "Refund failed");
    emit AuctionCancelled(auctionId);
    return;
}
```

**Auditor Action**: **HIGH PRIORITY - ADD try/catch**

---

## 💰 3. Staking.sol - Attack Vectors

### Critical Functions:
- `stake()` - Lines 36-55
- `unstake()` - Lines 57-71
- `calculateRewards()` - Lines 89-104

### A. Reward Calculation Overflow

**Current**: Line 102
```solidity
uint256 rewards = (stakeInfo.amount * apy * stakingDuration) / 
    (SECONDS_PER_YEAR * PRECISION);
```

**Attack Scenario**: Overflow before division
```javascript
amount = 2^200 (very large)
apy = 1700 (17%)
duration = 365 days

rewards = (2^200 * 1700 * 31536000) / (31536000 * 10000)
        = (2^200 * 1700 * 31536000) ← Could overflow before division
```

**Auditor Focus**:
- Test with max uint256 stake amount
- Verify Solidity 0.8 overflow protection reverts correctly
- Consider using OpenZeppelin SafeMath for clarity

---

### B. Timestamp Manipulation

**Vulnerability**: Miners can manipulate `block.timestamp`

**Attack Scenario**:
```javascript
// Miner is a staker
1. Stake tokens
2. Mine block with timestamp = current + 1 day
3. Claim rewards (get 1 day extra)
4. Repeat
```

**Current Protection**: ⚠️ Limited
**Industry Standard**: Miners can adjust timestamp ±15 seconds

**Mitigation**:
```solidity
// Add sanity checks
uint256 public lastBlockTimestamp;

modifier timestampCheck() {
    require(
        block.timestamp >= lastBlockTimestamp &&
        block.timestamp <= lastBlockTimestamp + 1 hours,
        "Invalid timestamp"
    );
    lastBlockTimestamp = block.timestamp;
    _;
}
```

**Auditor Action**: **LOW RISK** (15 sec manipulation is minimal)

---

### C. Flash Loan Attack on APY Bonus

**Vulnerability**: Manipulate stake time to get bonus

**Attack Scenario**:
```javascript
1. Flash loan 1M AURA tokens
2. Stake for 1 second
3. Wait 30 days
4. Claim rewards with BONUS_APY (5% extra)
5. Unstake
6. Repay flash loan
```

**Current Protection**: ❌ NOT PROTECTED
**Root Cause**: Line 97-99
```solidity
if (block.timestamp - stakeInfo.startTime >= LONG_TERM_THRESHOLD) {
    apy += BONUS_APY;
}
```

**Issue**: Bonus based on `startTime`, not continuous staking

**Fix**:
```solidity
// Track staking duration properly
struct StakeInfo {
    uint256 amount;
    uint256 totalStakingTime; // Accumulated time
    uint256 lastUpdateTime;
    uint256 lastClaimTime;
}

function stake(uint256 amount) external {
    // Update total staking time before adding more
    if (stakes[msg.sender].amount > 0) {
        stakes[msg.sender].totalStakingTime += 
            block.timestamp - stakes[msg.sender].lastUpdateTime;
    }
    
    stakes[msg.sender].amount += amount;
    stakes[msg.sender].lastUpdateTime = block.timestamp;
}

function calculateRewards(address user) public view returns (uint256) {
    uint256 totalTime = stakes[user].totalStakingTime + 
        (block.timestamp - stakes[user].lastUpdateTime);
    
    uint256 apy = BASE_APY;
    if (totalTime >= LONG_TERM_THRESHOLD) {
        apy += BONUS_APY;
    }
    // ... rest
}
```

**Auditor Action**: **CRITICAL - REDESIGN BONUS LOGIC**

---

### D. Reward Pool Depletion

**Vulnerability**: Contract runs out of AURA tokens

**Attack Scenario**:
```javascript
1. 1000 users stake 1M AURA each
2. Total staked = 1B AURA
3. Annual rewards needed = 170M AURA (17% APY)
4. Contract only has 1B AURA
5. After 6 months, rewards run out
6. claimRewards() fails for everyone
```

**Current State**: Line 84
```solidity
require(auraToken.transfer(msg.sender, rewards), "Reward transfer failed");
// If contract balance < rewards, this reverts
```

**Improvement**:
```solidity
// Option 1: Cap total staked
uint256 public constant MAX_TOTAL_STAKE = 100000000 * 10**18; // 100M AURA

function stake(uint256 amount) external {
    require(totalStaked + amount <= MAX_TOTAL_STAKE, "Stake pool full");
    // ... rest
}

// Option 2: Reserve tracking
function getReserveHealth() public view returns (uint256) {
    uint256 contractBalance = auraToken.balanceOf(address(this));
    uint256 requiredReserve = totalStaked; // 1:1 for principal
    uint256 pendingRewards = calculateAllPendingRewards();
    
    return contractBalance >= requiredReserve + pendingRewards;
}

// Option 3: Owner can fund rewards
function fundRewards(uint256 amount) external onlyOwner {
    require(auraToken.transferFrom(msg.sender, address(this), amount));
}
```

**Auditor Action**: **HIGH PRIORITY - ADD SAFEGUARDS**

---

### E. EmergencyWithdraw() Abuse

**Current**: Lines 124-127
```solidity
function emergencyWithdraw() external onlyOwner {
    uint256 balance = auraToken.balanceOf(address(this));
    require(auraToken.transfer(owner(), balance), "Emergency withdrawal failed");
}
```

**Issue**: Owner can steal ALL staked funds + rewards

**Attack Scenario**:
```javascript
1. Users stake 1B AURA
2. Malicious owner calls emergencyWithdraw()
3. All 1B AURA transferred to owner
4. Users cannot unstake (balance = 0)
5. Exit scam complete
```

**Mitigation**:
```solidity
// Option 1: Remove function entirely (RECOMMENDED)
// Only use if contract has Pausable

// Option 2: Add timelock
uint256 public emergencyWithdrawTime;
uint256 public constant TIMELOCK_PERIOD = 7 days;

function initiateEmergencyWithdraw() external onlyOwner {
    emergencyWithdrawTime = block.timestamp + TIMELOCK_PERIOD;
    emit EmergencyWithdrawInitiated(emergencyWithdrawTime);
}

function executeEmergencyWithdraw() external onlyOwner {
    require(block.timestamp >= emergencyWithdrawTime, "Timelock active");
    // ... withdraw logic
}

// Option 3: Multisig required
// Use OpenZeppelin TimelockController
```

**Auditor Action**: **CRITICAL - REMOVE OR ADD TIMELOCK**

---

## 📊 4. Cross-Contract Economic Exploits

### A. Circular Listing Attack

**Scenario**: List NFT in both Marketplace and Auction

```javascript
1. User lists NFT #123 in Marketplace for 100 MATIC
2. Same user lists NFT #123 in Auction starting at 50 MATIC
3. Buyer A wins auction at 80 MATIC
4. Buyer B buys from marketplace for 100 MATIC
5. One fails (whoever's tx is second)
```

**Solution**: Global listing registry

```solidity
// Shared registry contract
contract ListingRegistry {
    mapping(address => mapping(uint256 => bool)) public isListed;
    
    function registerListing(address nftContract, uint256 tokenId) external {
        require(!isListed[nftContract][tokenId], "Already listed");
        isListed[nftContract][tokenId] = true;
    }
    
    function unregisterListing(address nftContract, uint256 tokenId) external {
        isListed[nftContract][tokenId] = false;
    }
}
```

**Auditor Action**: **RECOMMEND IMPLEMENTATION**

---

### B. Fee Extraction Arbitrage

**Scenario**: Abuse fee differences

```javascript
// If marketplace fee changes
1. List NFT when fee = 2.5%
2. Cancel listing
3. Re-list when fee = 5%
4. Buyer pays more fees than seller expected
```

**Already addressed**: See Marketplace Section E

---

## 🎯 5. Priority Recommendations for Auditors

### P0 - Critical (Must Fix):
1. **AuctionHouse**: Add extension limit to prevent infinite loop
2. **AuctionHouse**: Fix failed refund blocking
3. **Staking**: Fix bonus APY flash loan exploit
4. **Staking**: Remove or secure emergencyWithdraw()

### P1 - High (Should Fix):
5. **Marketplace**: Add payment failure handling (push to pull)
6. **AuctionHouse**: Add NFT transfer failure handling
7. **Staking**: Add reward pool safeguards

### P2 - Medium (Recommend):
8. **Marketplace**: Prevent NFT ownership manipulation
9. **Marketplace**: Front-running protection
10. **AuctionHouse**: Finalization grace period

### P3 - Low (Consider):
11. **Marketplace**: Lock fees per listing
12. **AuctionHouse**: Rounding edge case
13. **Global**: Shared listing registry

---

## 📝 Testing Checklist for Auditors

```yaml
Fuzzing Tests:
  - Max uint256 values for all amounts
  - Zero values for all amounts
  - Timestamp edge cases
  - Gas limit attacks

Integration Tests:
  - Cross-contract interactions
  - Failed external calls
  - Reentrancy scenarios
  - Front-running simulations

Economic Tests:
  - Flash loan simulations
  - Reward pool depletion
  - Fee manipulation
  - Arbitrage opportunities

Stress Tests:
  - 1000+ simultaneous auctions
  - 10,000+ listings
  - 100,000 stakers
  - Gas optimization verification
```

---

**Total Issues Identified**: 13
**Critical**: 4
**High**: 3
**Medium**: 3
**Low**: 3

**Estimated Audit Effort**: 2-3 weeks for thorough review
