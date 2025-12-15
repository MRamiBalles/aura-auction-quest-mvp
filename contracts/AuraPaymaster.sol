// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AuraPaymaster - Gas Sponsorship for ERC-4337
 * @notice Sponsors gas fees for new users during onboarding
 * @dev This is a simplified Paymaster for demonstration
 * 
 * In production, integrate with:
 * - Biconomy SDK (https://docs.biconomy.io)
 * - Stackup Paymaster (https://docs.stackup.sh)
 * - Alchemy Account Kit (https://accountkit.alchemy.com)
 * 
 * Features:
 * - Sponsors first N transactions per user
 * - Daily/monthly gas budgets
 * - Whitelist for sponsored actions
 */
contract AuraPaymaster is Ownable, ReentrancyGuard {
    
    // === Configuration ===
    uint256 public constant MAX_SPONSORED_TXS = 10; // First 10 tx free
    uint256 public constant MAX_GAS_PER_TX = 500000; // 500k gas max per tx
    uint256 public dailyBudget;
    uint256 public dailySpent;
    uint256 public lastResetDay;
    
    // === User Tracking ===
    mapping(address => uint256) public sponsoredTxCount;
    mapping(address => uint256) public lastSponsoredTimestamp;
    mapping(address => bool) public isBlacklisted;
    
    // === Whitelisted Operations ===
    mapping(bytes4 => bool) public whitelistedSelectors;
    
    // === Events ===
    event GasSponsored(address indexed user, uint256 gasUsed, uint256 txNumber);
    event UserBlacklisted(address indexed user, string reason);
    event DailyBudgetUpdated(uint256 newBudget);
    event FundsDeposited(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event SelectorWhitelisted(bytes4 indexed selector, bool status);
    
    constructor(uint256 _dailyBudget) {
        dailyBudget = _dailyBudget;
        lastResetDay = block.timestamp / 1 days;
        
        // Whitelist common game operations by default
        // These are function selectors that will be sponsored
        whitelistedSelectors[bytes4(keccak256("claimCrystal(uint256)"))] = true;
        whitelistedSelectors[bytes4(keccak256("mintNFT(address,uint256)"))] = true;
        whitelistedSelectors[bytes4(keccak256("placeBid(uint256)"))] = true;
        whitelistedSelectors[bytes4(keccak256("startDuel(address)"))] = true;
    }
    
    // === Core Paymaster Logic ===
    
    /**
     * @notice Check if a user is eligible for gas sponsorship
     * @param user The user address
     * @param selector The function selector being called
     * @return eligible Whether the user can be sponsored
     * @return reason Explanation if not eligible
     */
    function canSponsor(address user, bytes4 selector) 
        external 
        view 
        returns (bool eligible, string memory reason) 
    {
        // Check blacklist
        if (isBlacklisted[user]) {
            return (false, "User blacklisted");
        }
        
        // Check transaction limit
        if (sponsoredTxCount[user] >= MAX_SPONSORED_TXS) {
            return (false, "Sponsorship limit reached");
        }
        
        // Check whitelisted operation
        if (!whitelistedSelectors[selector]) {
            return (false, "Operation not sponsored");
        }
        
        // Check daily budget
        uint256 currentDay = block.timestamp / 1 days;
        uint256 spent = currentDay > lastResetDay ? 0 : dailySpent;
        if (spent >= dailyBudget) {
            return (false, "Daily budget exhausted");
        }
        
        return (true, "");
    }
    
    /**
     * @notice Record a sponsored transaction
     * @dev Called by the bundler/relayer after successful sponsorship
     * @param user The user who was sponsored
     * @param gasUsed Actual gas used
     */
    function recordSponsorship(address user, uint256 gasUsed) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(!isBlacklisted[user], "User blacklisted");
        require(sponsoredTxCount[user] < MAX_SPONSORED_TXS, "Limit reached");
        
        // Reset daily counter if new day
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            dailySpent = 0;
            lastResetDay = currentDay;
        }
        
        // Update tracking
        sponsoredTxCount[user]++;
        lastSponsoredTimestamp[user] = block.timestamp;
        dailySpent += gasUsed;
        
        emit GasSponsored(user, gasUsed, sponsoredTxCount[user]);
    }
    
    // === User Status ===
    
    /**
     * @notice Get user's sponsorship status
     * @param user The user address
     */
    function getUserStatus(address user) 
        external 
        view 
        returns (
            uint256 txUsed,
            uint256 txRemaining,
            bool blacklisted,
            uint256 lastSponsored
        ) 
    {
        txUsed = sponsoredTxCount[user];
        txRemaining = txUsed >= MAX_SPONSORED_TXS ? 0 : MAX_SPONSORED_TXS - txUsed;
        blacklisted = isBlacklisted[user];
        lastSponsored = lastSponsoredTimestamp[user];
    }
    
    /**
     * @notice Get daily budget status
     */
    function getDailyStatus() 
        external 
        view 
        returns (
            uint256 budget,
            uint256 spent,
            uint256 remaining,
            uint256 dayNumber
        ) 
    {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentSpent = currentDay > lastResetDay ? 0 : dailySpent;
        
        budget = dailyBudget;
        spent = currentSpent;
        remaining = currentSpent >= dailyBudget ? 0 : dailyBudget - currentSpent;
        dayNumber = currentDay;
    }
    
    // === Admin Functions ===
    
    /**
     * @notice Blacklist a user (anti-abuse)
     */
    function blacklistUser(address user, string calldata reason) external onlyOwner {
        isBlacklisted[user] = true;
        emit UserBlacklisted(user, reason);
    }
    
    /**
     * @notice Remove user from blacklist
     */
    function unblacklistUser(address user) external onlyOwner {
        isBlacklisted[user] = false;
    }
    
    /**
     * @notice Update daily gas budget
     */
    function setDailyBudget(uint256 newBudget) external onlyOwner {
        dailyBudget = newBudget;
        emit DailyBudgetUpdated(newBudget);
    }
    
    /**
     * @notice Add/remove whitelisted function selector
     */
    function setWhitelistedSelector(bytes4 selector, bool status) external onlyOwner {
        whitelistedSelectors[selector] = status;
        emit SelectorWhitelisted(selector, status);
    }
    
    /**
     * @notice Reset a user's sponsorship count (support cases)
     */
    function resetUserCount(address user) external onlyOwner {
        sponsoredTxCount[user] = 0;
    }
    
    // === Funding ===
    
    /**
     * @notice Deposit funds for gas sponsorship
     */
    function deposit() external payable {
        require(msg.value > 0, "Must send value");
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw funds (owner only)
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner(), amount);
    }
    
    /**
     * @notice Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Receive ETH
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}
