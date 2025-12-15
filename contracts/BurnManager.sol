// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IAuraToken {
    function burnFrom(address account, uint256 amount, string calldata category) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title BurnManager - Centralized Burn Sink Orchestrator
 * @notice Handles all token burn operations across the ecosystem
 * @dev Single point of integration for all game contracts
 * 
 * Burn Categories:
 * - nft_mint: Burning for minting NFTs (10 AURA)
 * - auction_premium: Premium auction listing (50 AURA)
 * - guild_creation: Creating a new guild (1000 AURA)
 * - pvp_duel: PvP duel loser fee (2 AURA)
 * - name_change: Changing display name (20 AURA)
 * - crystal_boost: Boosting crystal spawn rate (5 AURA)
 */
contract BurnManager is Ownable, ReentrancyGuard {
    
    IAuraToken public auraToken;
    
    // === Burn Amounts (in wei, 18 decimals) ===
    uint256 public constant BURN_NFT_MINT = 10 * 10**18;
    uint256 public constant BURN_AUCTION_PREMIUM = 50 * 10**18;
    uint256 public constant BURN_GUILD_CREATION = 1000 * 10**18;
    uint256 public constant BURN_PVP_DUEL = 2 * 10**18;
    uint256 public constant BURN_NAME_CHANGE = 20 * 10**18;
    uint256 public constant BURN_CRYSTAL_BOOST = 5 * 10**18;
    
    // === Tracking ===
    mapping(address => uint256) public userTotalBurned;
    mapping(string => uint256) public actionCount;
    
    // === Authorized Callers ===
    mapping(address => bool) public authorizedCallers;
    
    // === Events ===
    event BurnExecuted(
        address indexed user, 
        uint256 amount, 
        string category, 
        string action
    );
    event CallerAuthorized(address indexed caller, bool status);
    
    constructor(address _auraToken) Ownable(msg.sender) {
        auraToken = IAuraToken(_auraToken);
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedCallers[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    // === Burn Functions ===
    
    /**
     * @notice Burn for NFT minting
     * @param user User whose tokens to burn
     */
    function burnForNFTMint(address user) external onlyAuthorized nonReentrant {
        _executeBurn(user, BURN_NFT_MINT, "nft_mint", "NFT Minting");
    }
    
    /**
     * @notice Burn for premium auction listing
     */
    function burnForPremiumAuction(address user) external onlyAuthorized nonReentrant {
        _executeBurn(user, BURN_AUCTION_PREMIUM, "auction_premium", "Premium Auction");
    }
    
    /**
     * @notice Burn for guild creation
     */
    function burnForGuildCreation(address user) external onlyAuthorized nonReentrant {
        _executeBurn(user, BURN_GUILD_CREATION, "guild_creation", "Guild Creation");
    }
    
    /**
     * @notice Burn for PvP duel (loser pays)
     */
    function burnForPvPDuel(address loser) external onlyAuthorized nonReentrant {
        _executeBurn(loser, BURN_PVP_DUEL, "pvp_duel", "PvP Duel Loss");
    }
    
    /**
     * @notice Burn for name change
     */
    function burnForNameChange(address user) external onlyAuthorized nonReentrant {
        _executeBurn(user, BURN_NAME_CHANGE, "name_change", "Name Change");
    }
    
    /**
     * @notice Burn for crystal boost
     */
    function burnForCrystalBoost(address user) external onlyAuthorized nonReentrant {
        _executeBurn(user, BURN_CRYSTAL_BOOST, "crystal_boost", "Crystal Boost");
    }
    
    /**
     * @notice Generic burn with custom amount (for future expansion)
     */
    function burnCustom(
        address user, 
        uint256 amount, 
        string calldata category
    ) external onlyAuthorized nonReentrant {
        _executeBurn(user, amount, category, category);
    }
    
    /**
     * @dev Internal burn execution
     */
    function _executeBurn(
        address user,
        uint256 amount,
        string memory category,
        string memory action
    ) internal {
        require(auraToken.balanceOf(user) >= amount, "Insufficient AURA balance");
        
        // Execute burn via AuraToken
        auraToken.burnFrom(user, amount, category);
        
        // Update tracking
        userTotalBurned[user] += amount;
        actionCount[category]++;
        
        emit BurnExecuted(user, amount, category, action);
    }
    
    // === Admin ===
    
    /**
     * @notice Authorize a caller (game contracts)
     */
    function setAuthorizedCaller(address caller, bool status) external onlyOwner {
        authorizedCallers[caller] = status;
        emit CallerAuthorized(caller, status);
    }
    
    /**
     * @notice Update AuraToken address (if migrated)
     */
    function setAuraToken(address newToken) external onlyOwner {
        auraToken = IAuraToken(newToken);
    }
    
    // === View Functions ===
    
    /**
     * @notice Get all burn amounts
     */
    function getBurnAmounts() external pure returns (
        uint256 nftMint,
        uint256 auctionPremium,
        uint256 guildCreation,
        uint256 pvpDuel,
        uint256 nameChange,
        uint256 crystalBoost
    ) {
        return (
            BURN_NFT_MINT,
            BURN_AUCTION_PREMIUM,
            BURN_GUILD_CREATION,
            BURN_PVP_DUEL,
            BURN_NAME_CHANGE,
            BURN_CRYSTAL_BOOST
        );
    }
    
    /**
     * @notice Get user's total burned amount
     */
    function getUserBurned(address user) external view returns (uint256) {
        return userTotalBurned[user];
    }
    
    /**
     * @notice Get action execution count
     */
    function getActionCount(string calldata category) external view returns (uint256) {
        return actionCount[category];
    }
    
    /**
     * @notice Check if user has enough balance for an action
     */
    function canAffordAction(address user, string calldata action) external view returns (bool) {
        uint256 cost = _getActionCost(action);
        return auraToken.balanceOf(user) >= cost;
    }
    
    function _getActionCost(string calldata action) internal pure returns (uint256) {
        bytes32 actionHash = keccak256(bytes(action));
        
        if (actionHash == keccak256("nft_mint")) return BURN_NFT_MINT;
        if (actionHash == keccak256("auction_premium")) return BURN_AUCTION_PREMIUM;
        if (actionHash == keccak256("guild_creation")) return BURN_GUILD_CREATION;
        if (actionHash == keccak256("pvp_duel")) return BURN_PVP_DUEL;
        if (actionHash == keccak256("name_change")) return BURN_NAME_CHANGE;
        if (actionHash == keccak256("crystal_boost")) return BURN_CRYSTAL_BOOST;
        
        return 0;
    }
}
