// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EconomyController (Algorithmic Central Bank)
 * @notice AUTOMATED MONETARY POLICY
 * @dev Implements Algorithm #2: PID Controller for Token Stability.
 * 
 * "The Fed" of Aura World.
 * If inflation is too high -> Increases Taxes, Decreases Rewards.
 * If economy slows down -> Lowers Taxes, Increases Rewards.
 */
contract EconomyController is Ownable {

    // Target Inflation Rate (2% per year approx)
    uint256 public constant TARGET_INFLATION_BPS = 200; // 2.00%
    
    // Current Economic Metrics
    uint256 public currentInflationRate;
    uint256 public totalTokenSupply;
    uint256 public lastCheckTimestamp;

    // Adjustable Parameters (Levers)
    uint256 public taxRateBps = 500;       // 5% (Landlord Tax)
    uint256 public miningDifficulty = 100; // 1.0x (Crystal Drop Rate)
    uint256 public repairCostFactor = 100; // 1.0x

    event EconomicAdjustment(uint256 newTax, uint256 newDifficulty, string reason);

    constructor() Ownable(msg.sender) {
        lastCheckTimestamp = block.timestamp;
    }

    /**
     * @notice The 'Heartbeat' of the economy. Called weekly by a Keeper.
     */
    function adjustMonetaryPolicy(uint256 _newTotalSupply) external onlyOwner {
        // Calculate new inflation since last check
        if (block.timestamp < lastCheckTimestamp + 7 days) return;

        // Simplified Inflation Calc: ((New - Old) / Old) * 10000
        uint256 minted = _newTotalSupply - totalTokenSupply;
        uint256 inflammationBps = (minted * 10000) / totalTokenSupply;
        
        currentInflationRate = inflammationBps;
        totalTokenSupply = _newTotalSupply;
        lastCheckTimestamp = block.timestamp;

        // --- PID CONTROL LOGIC ---
        
        if (inflammationBps > TARGET_INFLATION_BPS) {
            // INFLATION TOO HIGH (Overheating)
            // Cooling measures: Raise Taxes, Lower Rewards (Higher Difficulty)
            
            taxRateBps += 50; // +0.5% Tax
            miningDifficulty += 10; // +10% Harder to find crystals
            repairCostFactor += 5; // +5% Repair cost
            
            emit EconomicAdjustment(taxRateBps, miningDifficulty, "Cooling Inflation");
        } 
        else if (inflammationBps < TARGET_INFLATION_BPS / 2) {
            // DEFLATION / STAGNATION (Recession)
            // Stimulus measures: Lower Taxes, Higher Rewards
            
            if (taxRateBps > 100) taxRateBps -= 25; // -0.25% Tax
            if (miningDifficulty > 50) miningDifficulty -= 5;
            if (repairCostFactor > 80) repairCostFactor -= 5;
            
            emit EconomicAdjustment(taxRateBps, miningDifficulty, "Stimulating Economy");
        }
    }

    // Getters for other contracts to read current policy
    function getTaxRate() external view returns (uint256) { return taxRateBps; }
    function getMiningDifficulty() external view returns (uint256) { return miningDifficulty; }
}
