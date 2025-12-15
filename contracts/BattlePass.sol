// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title BattlePass - Seasonal Progression System
 * @notice Implements Fortnite-style Battle Pass with free and premium tracks
 * @dev Key revenue driver - projected +40% DAU, +60% session length
 * 
 * Structure:
 * - 100 tiers per season (90 days)
 * - Free track: Basic rewards every 5 tiers
 * - Premium track: Rewards every tier ($9.99 purchase)
 * - XP required per tier increases with level
 */
contract BattlePass is Ownable, ReentrancyGuard {
    
    IERC20 public auraToken;
    
    // === Season Configuration ===
    uint256 public constant TIERS_PER_SEASON = 100;
    uint256 public constant SEASON_DURATION = 90 days;
    uint256 public constant BASE_XP_PER_TIER = 1000;
    uint256 public constant XP_INCREASE_PER_TIER = 50; // +50 XP per tier
    
    // Premium pass price
    uint256 public premiumPrice = 1000 * 10**18; // 1000 AURA (~$10)
    
    // === Season Structure ===
    struct Season {
        uint256 id;
        string name;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 totalPlayers;
        uint256 premiumPlayers;
    }
    
    struct PlayerProgress {
        uint256 currentTier;
        uint256 currentXP;
        bool hasPremium;
        uint256 joinedAt;
        mapping(uint256 => bool) claimedTiers; // tier => claimed
    }
    
    struct TierReward {
        uint8 rewardType;        // 0=AURA, 1=NFT, 2=Cosmetic, 3=Boost
        uint256 amount;          // For AURA rewards
        address nftContract;     // For NFT rewards
        string metadata;         // Description or cosmetic ID
        bool premiumOnly;
    }
    
    // === Storage ===
    mapping(uint256 => Season) public seasons;
    mapping(uint256 => mapping(address => PlayerProgress)) public playerProgress;
    mapping(uint256 => mapping(uint256 => TierReward)) public tierRewards; // season => tier => reward
    
    uint256 public currentSeasonId;
    uint256 public totalSeasonsCreated;
    
    // === Events ===
    event SeasonCreated(uint256 indexed seasonId, string name, uint256 startTime, uint256 endTime);
    event SeasonEnded(uint256 indexed seasonId, uint256 totalPlayers);
    event PremiumPurchased(uint256 indexed seasonId, address indexed player);
    event XPEarned(uint256 indexed seasonId, address indexed player, uint256 amount, uint256 newTotal);
    event TierUnlocked(uint256 indexed seasonId, address indexed player, uint256 tier);
    event RewardClaimed(uint256 indexed seasonId, address indexed player, uint256 tier, uint8 rewardType);
    
    constructor(address _auraToken) Ownable(msg.sender) {
        auraToken = IERC20(_auraToken);
    }
    
    // === Season Management ===
    
    /**
     * @notice Create a new Battle Pass season
     */
    function createSeason(string calldata name) external onlyOwner returns (uint256) {
        // End current season if active
        if (currentSeasonId > 0 && seasons[currentSeasonId].active) {
            _endSeason(currentSeasonId);
        }
        
        totalSeasonsCreated++;
        currentSeasonId = totalSeasonsCreated;
        
        seasons[currentSeasonId] = Season({
            id: currentSeasonId,
            name: name,
            startTime: block.timestamp,
            endTime: block.timestamp + SEASON_DURATION,
            active: true,
            totalPlayers: 0,
            premiumPlayers: 0
        });
        
        emit SeasonCreated(currentSeasonId, name, block.timestamp, block.timestamp + SEASON_DURATION);
        return currentSeasonId;
    }
    
    /**
     * @notice Set rewards for a tier
     */
    function setTierReward(
        uint256 seasonId,
        uint256 tier,
        uint8 rewardType,
        uint256 amount,
        address nftContract,
        string calldata metadata,
        bool premiumOnly
    ) external onlyOwner {
        require(tier > 0 && tier <= TIERS_PER_SEASON, "Invalid tier");
        
        tierRewards[seasonId][tier] = TierReward({
            rewardType: rewardType,
            amount: amount,
            nftContract: nftContract,
            metadata: metadata,
            premiumOnly: premiumOnly
        });
    }
    
    /**
     * @notice Batch set multiple tier rewards
     */
    function batchSetRewards(
        uint256 seasonId,
        uint256[] calldata tiers,
        uint8[] calldata rewardTypes,
        uint256[] calldata amounts,
        bool[] calldata premiumOnly
    ) external onlyOwner {
        require(tiers.length == rewardTypes.length, "Length mismatch");
        
        for (uint256 i = 0; i < tiers.length; i++) {
            tierRewards[seasonId][tiers[i]] = TierReward({
                rewardType: rewardTypes[i],
                amount: amounts[i],
                nftContract: address(0),
                metadata: "",
                premiumOnly: premiumOnly[i]
            });
        }
    }
    
    // === Player Actions ===
    
    /**
     * @notice Purchase premium Battle Pass
     */
    function purchasePremium() external nonReentrant {
        Season storage season = seasons[currentSeasonId];
        require(season.active, "No active season");
        require(block.timestamp < season.endTime, "Season ended");
        
        PlayerProgress storage progress = playerProgress[currentSeasonId][msg.sender];
        require(!progress.hasPremium, "Already premium");
        
        // Transfer payment
        require(
            auraToken.transferFrom(msg.sender, address(this), premiumPrice),
            "Payment failed"
        );
        
        progress.hasPremium = true;
        season.premiumPlayers++;
        
        // If new player, initialize
        if (progress.joinedAt == 0) {
            progress.joinedAt = block.timestamp;
            season.totalPlayers++;
        }
        
        emit PremiumPurchased(currentSeasonId, msg.sender);
    }
    
    /**
     * @notice Add XP to player (called by game contracts)
     */
    function addXP(address player, uint256 amount) external onlyOwner {
        Season storage season = seasons[currentSeasonId];
        require(season.active, "No active season");
        
        PlayerProgress storage progress = playerProgress[currentSeasonId][player];
        
        // Initialize if new player
        if (progress.joinedAt == 0) {
            progress.joinedAt = block.timestamp;
            season.totalPlayers++;
        }
        
        progress.currentXP += amount;
        
        // Check for tier ups
        uint256 newTier = _calculateTier(progress.currentXP);
        if (newTier > progress.currentTier) {
            uint256 oldTier = progress.currentTier;
            progress.currentTier = newTier > TIERS_PER_SEASON ? TIERS_PER_SEASON : newTier;
            
            // Emit events for each tier unlocked
            for (uint256 t = oldTier + 1; t <= progress.currentTier; t++) {
                emit TierUnlocked(currentSeasonId, player, t);
            }
        }
        
        emit XPEarned(currentSeasonId, player, amount, progress.currentXP);
    }
    
    /**
     * @notice Claim reward for a completed tier
     */
    function claimReward(uint256 tier) external nonReentrant {
        PlayerProgress storage progress = playerProgress[currentSeasonId][msg.sender];
        require(progress.currentTier >= tier, "Tier not unlocked");
        require(!progress.claimedTiers[tier], "Already claimed");
        
        TierReward storage reward = tierRewards[currentSeasonId][tier];
        
        // Check premium requirement
        if (reward.premiumOnly) {
            require(progress.hasPremium, "Premium required");
        }
        
        progress.claimedTiers[tier] = true;
        
        // Distribute reward based on type
        if (reward.rewardType == 0 && reward.amount > 0) {
            // AURA tokens
            require(
                auraToken.transfer(msg.sender, reward.amount),
                "Reward transfer failed"
            );
        }
        // Types 1, 2, 3 would need external NFT minting or off-chain cosmetics
        
        emit RewardClaimed(currentSeasonId, msg.sender, tier, reward.rewardType);
    }
    
    /**
     * @notice Claim all available rewards at once
     */
    function claimAllRewards() external nonReentrant {
        PlayerProgress storage progress = playerProgress[currentSeasonId][msg.sender];
        uint256 totalAura = 0;
        
        for (uint256 t = 1; t <= progress.currentTier; t++) {
            if (!progress.claimedTiers[t]) {
                TierReward storage reward = tierRewards[currentSeasonId][t];
                
                // Skip if premium required and player doesn't have it
                if (reward.premiumOnly && !progress.hasPremium) {
                    continue;
                }
                
                progress.claimedTiers[t] = true;
                
                if (reward.rewardType == 0) {
                    totalAura += reward.amount;
                }
                
                emit RewardClaimed(currentSeasonId, msg.sender, t, reward.rewardType);
            }
        }
        
        if (totalAura > 0) {
            require(
                auraToken.transfer(msg.sender, totalAura),
                "Bulk reward transfer failed"
            );
        }
    }
    
    // === View Functions ===
    
    /**
     * @notice Get player's current progress
     */
    function getPlayerProgress(address player) external view returns (
        uint256 tier,
        uint256 xp,
        uint256 xpToNextTier,
        bool premium,
        uint256 unclaimedRewards
    ) {
        PlayerProgress storage progress = playerProgress[currentSeasonId][player];
        
        tier = progress.currentTier;
        xp = progress.currentXP;
        premium = progress.hasPremium;
        
        if (tier < TIERS_PER_SEASON) {
            uint256 xpForCurrentTier = _xpRequiredForTier(tier);
            uint256 xpForNextTier = _xpRequiredForTier(tier + 1);
            xpToNextTier = xpForNextTier - xp;
        }
        
        // Count unclaimed rewards
        for (uint256 t = 1; t <= tier; t++) {
            if (!progress.claimedTiers[t]) {
                TierReward storage reward = tierRewards[currentSeasonId][t];
                if (!reward.premiumOnly || premium) {
                    unclaimedRewards++;
                }
            }
        }
    }
    
    /**
     * @notice Get current season info
     */
    function getCurrentSeason() external view returns (Season memory) {
        return seasons[currentSeasonId];
    }
    
    /**
     * @notice Get time remaining in season
     */
    function getSeasonTimeRemaining() external view returns (uint256) {
        Season storage season = seasons[currentSeasonId];
        if (block.timestamp >= season.endTime) return 0;
        return season.endTime - block.timestamp;
    }
    
    /**
     * @notice Check if tier reward is claimed
     */
    function isRewardClaimed(address player, uint256 tier) external view returns (bool) {
        return playerProgress[currentSeasonId][player].claimedTiers[tier];
    }
    
    // === Internal Functions ===
    
    function _calculateTier(uint256 totalXP) internal pure returns (uint256) {
        uint256 tier = 0;
        uint256 xpUsed = 0;
        
        while (tier < TIERS_PER_SEASON) {
            uint256 xpNeeded = BASE_XP_PER_TIER + (tier * XP_INCREASE_PER_TIER);
            if (xpUsed + xpNeeded > totalXP) break;
            xpUsed += xpNeeded;
            tier++;
        }
        
        return tier;
    }
    
    function _xpRequiredForTier(uint256 tier) internal pure returns (uint256) {
        uint256 totalXP = 0;
        for (uint256 t = 0; t < tier; t++) {
            totalXP += BASE_XP_PER_TIER + (t * XP_INCREASE_PER_TIER);
        }
        return totalXP;
    }
    
    function _endSeason(uint256 seasonId) internal {
        seasons[seasonId].active = false;
        emit SeasonEnded(seasonId, seasons[seasonId].totalPlayers);
    }
    
    // === Admin Functions ===
    
    function setPremiumPrice(uint256 newPrice) external onlyOwner {
        premiumPrice = newPrice;
    }
    
    function endCurrentSeason() external onlyOwner {
        require(seasons[currentSeasonId].active, "No active season");
        _endSeason(currentSeasonId);
    }
    
    function withdrawRevenue(uint256 amount) external onlyOwner nonReentrant {
        require(
            auraToken.transfer(owner(), amount),
            "Withdrawal failed"
        );
    }
    
    function fundRewards(uint256 amount) external {
        require(
            auraToken.transferFrom(msg.sender, address(this), amount),
            "Funding failed"
        );
    }
}
