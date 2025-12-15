// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuraToken - Ultra Sound AURA
 * @notice Deflationary ERC-20 with burn tracking
 * @dev Implements "Ultra Sound" tokenomics where burn rate > emission rate
 * 
 * Burn Sinks:
 * - NFT Minting: 10 AURA
 * - Premium Auction: 50 AURA  
 * - Guild Creation: 1000 AURA
 * - PvP Duel (loser): 2 AURA
 * - Name Change: 20 AURA
 */
contract AuraToken is ERC20, ERC20Burnable, Ownable {
    
    // === Burn Tracking ===
    uint256 public totalBurned;
    uint256 public dailyBurned;
    uint256 public lastBurnResetDay;
    
    // Burn categories for analytics
    mapping(string => uint256) public burnByCategory;
    
    // Authorized burners (game contracts)
    mapping(address => bool) public authorizedBurners;
    
    // === Events ===
    event TokensBurned(address indexed from, uint256 amount, string category);
    event BurnerAuthorized(address indexed burner, bool status);
    event DailyBurnReset(uint256 previousDayBurn, uint256 dayNumber);
    
    // === Burn Constants (can be updated via governance) ===
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100M
    
    constructor() ERC20("Aura", "AURA") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
        lastBurnResetDay = block.timestamp / 1 days;
    }
    
    // === Burn Functions ===
    
    /**
     * @notice Burn tokens with category tracking
     * @param amount Amount to burn
     * @param category Burn category for analytics
     */
    function burnWithCategory(uint256 amount, string calldata category) 
        external 
    {
        _burnInternal(msg.sender, amount, category);
    }
    
    /**
     * @notice Authorized burner burns on behalf of user
     * @dev Used by game contracts (Marketplace, AuctionHouse, etc.)
     */
    function burnFrom(address account, uint256 amount, string calldata category) 
        external 
    {
        require(authorizedBurners[msg.sender], "Not authorized burner");
        _burnInternal(account, amount, category);
    }
    
    /**
     * @dev Internal burn with tracking
     */
    function _burnInternal(address account, uint256 amount, string calldata category) 
        internal 
    {
        // Reset daily counter if new day
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastBurnResetDay) {
            emit DailyBurnReset(dailyBurned, lastBurnResetDay);
            dailyBurned = 0;
            lastBurnResetDay = currentDay;
        }
        
        // Burn tokens
        _burn(account, amount);
        
        // Update tracking
        totalBurned += amount;
        dailyBurned += amount;
        burnByCategory[category] += amount;
        
        emit TokensBurned(account, amount, category);
    }
    
    // === Admin Functions ===
    
    /**
     * @notice Authorize a contract to burn tokens
     * @param burner Address to authorize
     * @param status True to authorize, false to revoke
     */
    function setAuthorizedBurner(address burner, bool status) external onlyOwner {
        authorizedBurners[burner] = status;
        emit BurnerAuthorized(burner, status);
    }
    
    /**
     * @notice Mint new tokens (for staking rewards, controlled emission)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // === View Functions ===
    
    /**
     * @notice Get burn statistics
     */
    function getBurnStats() external view returns (
        uint256 total,
        uint256 today,
        uint256 circulating,
        uint256 burnPercentage
    ) {
        total = totalBurned;
        
        uint256 currentDay = block.timestamp / 1 days;
        today = currentDay > lastBurnResetDay ? 0 : dailyBurned;
        
        circulating = totalSupply();
        
        // Burn percentage (basis points - divide by 100 for %)
        if (INITIAL_SUPPLY > 0) {
            burnPercentage = (totalBurned * 10000) / INITIAL_SUPPLY;
        }
    }
    
    /**
     * @notice Get burn amount for a specific category
     */
    function getCategoryBurn(string calldata category) external view returns (uint256) {
        return burnByCategory[category];
    }
    
    /**
     * @notice Check if deflation is active (burn > emission)
     * @dev Returns true if more tokens burned today than minted
     */
    function isDeflationary() external view returns (bool) {
        // In a real implementation, you'd track daily minting too
        // For now, we assume 10,000 AURA/day emission from staking
        uint256 dailyEmission = 10_000 * 10**18;
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 todayBurn = currentDay > lastBurnResetDay ? 0 : dailyBurned;
        
        return todayBurn > dailyEmission;
    }
}

