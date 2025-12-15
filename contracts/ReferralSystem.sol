// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ReferralSystem - Viral Growth Loop Engine
 * @notice Implements "Double-Sided Reward" referral system
 * @dev Creates perpetual income streams for referrers
 * 
 * Features:
 * - 5% perpetual commission on referee's earnings (lifetime)
 * - Starter Pack reward for new users ($5 value)
 * - Multi-level tracking (up to 2 levels)
 * - Anti-gaming protection
 */
contract ReferralSystem is Ownable, ReentrancyGuard {
    
    IERC20 public auraToken;
    
    // === Configuration ===
    uint256 public constant REFERRAL_COMMISSION = 500; // 5% in basis points
    uint256 public constant LEVEL2_COMMISSION = 100;   // 1% for level 2
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant STARTER_PACK = 50 * 10**18; // 50 AURA (~$5)
    uint256 public constant MIN_EARNINGS_FOR_COMMISSION = 10 * 10**18; // Min 10 AURA
    
    // === Referral Tracking ===
    mapping(address => address) public referredBy;      // user => referrer
    mapping(address => address[]) public referrals;     // referrer => list of referrals
    mapping(address => uint256) public totalEarnings;   // user => total lifetime earnings
    mapping(address => uint256) public pendingCommissions; // referrer => pending to claim
    mapping(address => uint256) public totalCommissionsEarned;
    mapping(address => uint256) public referralCount;
    
    // === Anti-Gaming ===
    mapping(address => uint256) public lastClaimTime;
    uint256 public constant CLAIM_COOLDOWN = 1 hours;
    mapping(address => bool) public isBlacklisted;
    
    // === Stats ===
    uint256 public totalUsersReferred;
    uint256 public totalCommissionsPaid;
    uint256 public starterPacksDistributed;
    
    // === Events ===
    event ReferralRegistered(address indexed referee, address indexed referrer);
    event CommissionEarned(address indexed referrer, address indexed referee, uint256 amount, uint8 level);
    event CommissionClaimed(address indexed referrer, uint256 amount);
    event StarterPackClaimed(address indexed user, uint256 amount);
    event EarningsRecorded(address indexed user, uint256 amount);
    
    constructor(address _auraToken) Ownable(msg.sender) {
        auraToken = IERC20(_auraToken);
    }
    
    // === Registration ===
    
    /**
     * @notice Register a new user with a referral code
     * @param referrer Address of the person who referred this user
     */
    function registerWithReferral(address referrer) external {
        require(referredBy[msg.sender] == address(0), "Already registered");
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(!isBlacklisted[referrer], "Referrer blacklisted");
        
        // Register referral relationship
        referredBy[msg.sender] = referrer;
        referrals[referrer].push(msg.sender);
        referralCount[referrer]++;
        totalUsersReferred++;
        
        emit ReferralRegistered(msg.sender, referrer);
        
        // Distribute starter pack if available
        _distributeStarterPack(msg.sender);
    }
    
    /**
     * @notice Generate a unique referral code for frontend
     * @dev Creates a deterministic hash that can be verified
     */
    function getReferralCode(address referrer) external pure returns (bytes32) {
        return keccak256(abi.encodePacked("AURA_REF:", referrer));
    }
    
    /**
     * @notice Verify a referral code and get the referrer address
     */
    function verifyReferralCode(bytes32 code, address claimedReferrer) 
        external 
        pure 
        returns (bool) 
    {
        return code == keccak256(abi.encodePacked("AURA_REF:", claimedReferrer));
    }
    
    // === Commission Distribution ===
    
    /**
     * @notice Record user earnings and distribute commissions
     * @dev Called by game contracts when user earns AURA
     * @param user The user who earned tokens
     * @param amount The amount earned
     */
    function recordEarnings(address user, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        
        totalEarnings[user] += amount;
        emit EarningsRecorded(user, amount);
        
        // Distribute Level 1 commission (5%)
        address level1Referrer = referredBy[user];
        if (level1Referrer != address(0) && !isBlacklisted[level1Referrer]) {
            uint256 commission1 = (amount * REFERRAL_COMMISSION) / FEE_DENOMINATOR;
            if (commission1 >= MIN_EARNINGS_FOR_COMMISSION) {
                pendingCommissions[level1Referrer] += commission1;
                emit CommissionEarned(level1Referrer, user, commission1, 1);
            }
            
            // Distribute Level 2 commission (1%)
            address level2Referrer = referredBy[level1Referrer];
            if (level2Referrer != address(0) && !isBlacklisted[level2Referrer]) {
                uint256 commission2 = (amount * LEVEL2_COMMISSION) / FEE_DENOMINATOR;
                if (commission2 > 0) {
                    pendingCommissions[level2Referrer] += commission2;
                    emit CommissionEarned(level2Referrer, user, commission2, 2);
                }
            }
        }
    }
    
    /**
     * @notice Claim accumulated referral commissions
     */
    function claimCommissions() external nonReentrant {
        require(!isBlacklisted[msg.sender], "Blacklisted");
        require(
            block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN,
            "Claim cooldown active"
        );
        
        uint256 amount = pendingCommissions[msg.sender];
        require(amount > 0, "No commissions to claim");
        
        pendingCommissions[msg.sender] = 0;
        lastClaimTime[msg.sender] = block.timestamp;
        totalCommissionsEarned[msg.sender] += amount;
        totalCommissionsPaid += amount;
        
        require(
            auraToken.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit CommissionClaimed(msg.sender, amount);
    }
    
    // === Starter Pack ===
    
    /**
     * @dev Distribute starter pack to new user
     */
    function _distributeStarterPack(address user) internal {
        if (auraToken.balanceOf(address(this)) >= STARTER_PACK) {
            require(
                auraToken.transfer(user, STARTER_PACK),
                "Starter pack transfer failed"
            );
            starterPacksDistributed++;
            emit StarterPackClaimed(user, STARTER_PACK);
        }
    }
    
    // === View Functions ===
    
    /**
     * @notice Get referral statistics for a user
     */
    function getReferralStats(address user) external view returns (
        address referrer,
        uint256 directReferrals,
        uint256 pendingAmount,
        uint256 totalClaimed,
        uint256 refereeEarnings
    ) {
        referrer = referredBy[user];
        directReferrals = referralCount[user];
        pendingAmount = pendingCommissions[user];
        totalClaimed = totalCommissionsEarned[user];
        refereeEarnings = totalEarnings[user];
    }
    
    /**
     * @notice Get list of direct referrals
     */
    function getDirectReferrals(address referrer) 
        external 
        view 
        returns (address[] memory) 
    {
        return referrals[referrer];
    }
    
    /**
     * @notice Get global referral stats
     */
    function getGlobalStats() external view returns (
        uint256 users,
        uint256 commissions,
        uint256 starterPacks
    ) {
        users = totalUsersReferred;
        commissions = totalCommissionsPaid;
        starterPacks = starterPacksDistributed;
    }
    
    /**
     * @notice Calculate potential commission for an amount
     */
    function calculateCommission(uint256 amount) 
        external 
        pure 
        returns (uint256 level1, uint256 level2) 
    {
        level1 = (amount * REFERRAL_COMMISSION) / FEE_DENOMINATOR;
        level2 = (amount * LEVEL2_COMMISSION) / FEE_DENOMINATOR;
    }
    
    // === Admin Functions ===
    
    /**
     * @notice Fund the starter pack pool
     */
    function fundStarterPacks(uint256 amount) external {
        require(
            auraToken.transferFrom(msg.sender, address(this), amount),
            "Funding failed"
        );
    }
    
    /**
     * @notice Blacklist a user for abuse
     */
    function setBlacklist(address user, bool status) external onlyOwner {
        isBlacklisted[user] = status;
    }
    
    /**
     * @notice Withdraw excess tokens (emergency)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(
            auraToken.transfer(owner(), amount),
            "Withdrawal failed"
        );
    }
}
