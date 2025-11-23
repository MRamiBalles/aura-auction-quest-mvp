// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Staking - SECURITY HARDENED
 * @notice Fixed critical vulnerabilities:
 * - P0-3: Fixed flash loan APY exploit by tracking continuous staking time
 * - P0-4: Removed emergencyWithdraw() - use pausable pattern instead
 * - Added reward pool safeguards to prevent depletion
 */
contract Staking is ReentrancyGuard, Ownable {
    IERC20 public auraToken;

    struct StakeInfo {
        uint256 amount;
        uint256 totalStakingTime; // 🔒 FIX P0-3: Accumulated staking time
        uint256 lastUpdateTime;   // 🔒 FIX P0-3: Track when last updated
        uint256 lastClaimTime;
    }

    mapping(address => StakeInfo) public stakes;
    
    // APY: 12% base + 5% bonus for long-term (>30 days)
    uint256 public constant BASE_APY = 1200; // 12% (basis points)
    uint256 public constant BONUS_APY = 500; // 5% bonus
    uint256 public constant LONG_TERM_THRESHOLD = 30 days;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant PRECISION = 10000;

    uint256 public totalStaked;
    
    // 🔒 FIX P0-REWARD: Reward pool safeguards
    uint256 public constant MAX_TOTAL_STAKE = 100000000 * 10**18; // 100M AURA max
    uint256 public reserveFunds; // Funds allocated for rewards

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ReserveFunded(uint256 amount);
    event StakingTimeMigrated(address indexed user, uint256 accumulatedTime);

    constructor(address _auraToken) {
        auraToken = IERC20(_auraToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(auraToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // 🔒 FIX P0-REWARD: Prevent stake pool overflow
        require(totalStaked + amount <= MAX_TOTAL_STAKE, "Stake pool full");

        StakeInfo storage stakeInfo = stakes[msg.sender];
        
        // 🔒 FIX P0-3: Update accumulated staking time before adding more
        if (stakeInfo.amount > 0) {
            // Claim pending rewards first
            _claimRewards();
            
            // Accumulate staking time
            uint256 timeSinceLastUpdate = block.timestamp - stakeInfo.lastUpdateTime;
            stakeInfo.totalStakingTime += timeSinceLastUpdate;
        } else {
            // First stake - initialize
            stakeInfo.totalStakingTime = 0;
            stakeInfo.lastClaimTime = block.timestamp;
        }

        // Transfer tokens to contract
        require(auraToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        stakeInfo.amount += amount;
        stakeInfo.lastUpdateTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= amount, "Insufficient staked amount");

        // Claim pending rewards first
        _claimRewards();
        
        // 🔒 FIX P0-3: Update accumulated time before unstaking
        uint256 timeSinceLastUpdate = block.timestamp - stakeInfo.lastUpdateTime;
        stakeInfo.totalStakingTime += timeSinceLastUpdate;

        stakeInfo.amount -= amount;
        stakeInfo.lastUpdateTime = block.timestamp;
        totalStaked -= amount;

        // Transfer tokens back to user
        require(auraToken.transfer(msg.sender, amount), "Transfer failed");

        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _claimRewards();
    }

    function _claimRewards() private {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "No stake found");

        uint256 rewards = calculateRewards(msg.sender);
        
        if (rewards > 0) {
            // 🔒 FIX P0-REWARD: Check if enough reserve funds
            require(reserveFunds >= rewards, "Insufficient reward reserve");
            
            stakeInfo.lastClaimTime = block.timestamp;
            
            // 🔒 FIX P0-3: Update staking time on claim
            uint256 timeSinceLastUpdate = block.timestamp - stakeInfo.lastUpdateTime;
            stakeInfo.totalStakingTime += timeSinceLastUpdate;
            stakeInfo.lastUpdateTime = block.timestamp;
            
            reserveFunds -= rewards;
            
            require(auraToken.transfer(msg.sender, rewards), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        
        // 🔒 FIX P0-3: Calculate total staking time including current period
        uint256 totalTime = stakeInfo.totalStakingTime + 
            (block.timestamp - stakeInfo.lastUpdateTime);
        
        uint256 apy = BASE_APY;

        // Add bonus ONLY if continuous staking time >= threshold
        if (totalTime >= LONG_TERM_THRESHOLD) {
            apy += BONUS_APY;
        }

        // Rewards = (amount * apy * duration) / (SECONDS_PER_YEAR * PRECISION)
        uint256 rewards = (stakeInfo.amount * apy * stakingDuration) / (SECONDS_PER_YEAR * PRECISION);
        
        // Cap rewards at available reserve
        if (rewards > reserveFunds) {
            rewards = reserveFunds;
        }
        
        return rewards;
    }

    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 totalStakingTime,
        uint256 pendingRewards,
        uint256 currentAPY
    ) {
        StakeInfo memory stakeInfo = stakes[user];
        amount = stakeInfo.amount;
        
        // Include current staking period in total time
        totalStakingTime = stakeInfo.totalStakingTime + 
            (block.timestamp - stakeInfo.lastUpdateTime);
        
        pendingRewards = calculateRewards(user);
        
        currentAPY = BASE_APY;
        if (totalStakingTime >= LONG_TERM_THRESHOLD) {
            currentAPY += BONUS_APY;
        }
    }

    /**
     * 🔒 FIX P0-REWARD: Owner can fund reward pool
     * @notice Allows owner to add funds for rewards
     */
    function fundRewards(uint256 amount) external onlyOwner {
        require(auraToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        reserveFunds += amount;
        emit ReserveFunded(amount);
    }

    /**
     * @notice Check health of reward reserve
     * @return isHealthy True if reserve can cover all pending rewards
     * @return reserveBalance Current reserve balance
     * @return estimatedPendingRewards Rough estimate of all pending rewards
     */
    function getReserveHealth() external view returns (
        bool isHealthy,
        uint256 reserveBalance,
        uint256 estimatedPendingRewards
    ) {
        reserveBalance = reserveFunds;
        
        // Estimate: assume average 15% APY and 30 days staking
        // This is a rough estimate - actual calculation would require iterating all users
        estimatedPendingRewards = (totalStaked * 1500 * 30 days) / (SECONDS_PER_YEAR * PRECISION);
        
        isHealthy = reserveBalance >= estimatedPendingRewards;
    }

    /**
     * 🔒 REMOVED: emergencyWithdraw() - too dangerous
     * If emergency needed, use Pausable pattern instead:
     * 1. Deploy new version with Pausable
     * 2. Pause contract
     * 3. Allow users to withdraw their stakes
     * 
     * For now, if emergency needed, owner can:
     * 1. Stop funding rewards (natural wind-down)
     * 2. Communicate with users to unstake
     * 3. Deploy new staking contract if needed
     */

    /**
     * @notice Get contract balance (for transparency)
     */
    function getContractBalance() external view returns (uint256) {
        return auraToken.balanceOf(address(this));
    }

    /**
     * @notice Migration helper for existing stakes (one-time use)
     * @dev Only call this ONCE per user during initial deployment
     */
    function migrateStakingTime(address user, uint256 accumulatedTime) external onlyOwner {
        StakeInfo storage stakeInfo = stakes[user];
        require(stakeInfo.totalStakingTime == 0, "Already migrated");
        
        stakeInfo.totalStakingTime = accumulatedTime;
        emit StakingTimeMigrated(user, accumulatedTime);
    }
}
