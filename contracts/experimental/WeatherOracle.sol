// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WeatherOracle (Environmental NFT Patent Implementation)
 * @notice Validates weather data for on-chain attribute modification.
 * @dev Supports Patent DRAFT_06_ENVIRONMENTAL_NFT
 */
contract WeatherOracle is Ownable {

    struct WeatherData {
        int256 temperature;    // Celsius * 100
        uint256 precipitation; // mm * 100
        uint256 moonPhase;     // 0-100 (0=New, 50=Full, 100=New)
        uint256 timestamp;
    }

    // Mapping from S2 Cell ID (Geo-hash) to Weather Data
    mapping(uint256 => WeatherData) public localWeather;
    
    // Whitelisted oracle feeders
    mapping(address => bool) public isOracle;

    event WeatherUpdated(uint256 indexed cellId, int256 temp, uint256 rain);

    constructor() Ownable(msg.sender) {
        isOracle[msg.sender] = true;
    }

    function addOracle(address _oracle) external onlyOwner {
        isOracle[_oracle] = true;
    }

    /**
     * @notice Trusted oracles push weather data
     */
    function updateWeather(
        uint256 _cellId, 
        int256 _temp, 
        uint256 _rain, 
        uint256 _moon
    ) external {
        require(isOracle[msg.sender], "Not an oracle");

        localWeather[_cellId] = WeatherData({
            temperature: _temp,
            precipitation: _rain,
            moonPhase: _moon,
            timestamp: block.timestamp
        });

        emit WeatherUpdated(_cellId, _temp, _rain);
    }

    /**
     * @notice NFT Contract calls this to calculate stats bonus
     * @dev Core logic for "Environmental Smart Contracts" patent
     */
    function getEnvironmentModifier(uint256 _cellId, string memory _element) external view returns (uint256) {
        WeatherData memory w = localWeather[_cellId];
        
        // Ensure fresh data (< 1 hour old)
        if (block.timestamp > w.timestamp + 1 hours) return 100; // 100% baseline

        // Patent Logic: Rain boosts Water types
        if (keccak256(bytes(_element)) == keccak256(bytes("WATER"))) {
            if (w.precipitation > 500) return 150; // +50% stats
        }

        // Patent Logic: Full Moon boosts Ghost types
        if (keccak256(bytes(_element)) == keccak256(bytes("GHOST"))) {
            if (w.moonPhase >= 45 && w.moonPhase <= 55) return 200; // x2 stats on Full Moon
        }

        return 100;
    }
}
