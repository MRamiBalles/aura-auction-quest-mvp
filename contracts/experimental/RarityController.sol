// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RarityController (Crowd-Sourced Rarity Patent Implementation)
 * @notice Adjusts drop rates based on population density.
 * @dev Supports Patent DRAFT_07_CROWD_RARITY
 */
contract RarityController is Ownable {

    // Base drop rate (e.g., 1000 = 1%)
    uint256 public constant BASE_DROP_RATE = 1000;
    
    // Mapping from S2 Cell ID to Player Count
    mapping(uint256 => uint256) public cellDensity;

    event DensityUpdated(uint256 indexed cellId, uint256 count);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Backend updates player density for a region
     */
    function updateRegionDensity(uint256 _cellId, uint256 _playerCount) external onlyOwner {
        cellDensity[_cellId] = _playerCount;
        emit DensityUpdated(_cellId, _playerCount);
    }

    /**
     * @notice Calculates dynamic drop rate
     * @dev Patent Logic: Inverse relationship to density
     */
    function getDynamicDropRate(uint256 _cellId) external view returns (uint256) {
        uint256 density = cellDensity[_cellId];
        
        // If empty, standard rate
        if (density == 0) return BASE_DROP_RATE;

        // If highly crowded (>100 people), drop rate plummets
        // Formula: Rate = Base / (1 + log(density))
        // Simplified for Solidity:
        if (density > 1000) return BASE_DROP_RATE / 10; // 0.1% -> 0.01%
        if (density > 100) return BASE_DROP_RATE / 2;   // 0.1% -> 0.05%
        
        return BASE_DROP_RATE;
    }
}
