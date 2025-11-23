// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    IERC20 public auraToken;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
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

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _auraToken) {
        auraToken = IERC20(_auraToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(auraToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Claim pending rewards before updating stake
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }

        // Transfer tokens to contract
        require(auraToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        StakeInfo storage stakeInfo = stakes[msg.sender];
        stakeInfo.amount += amount;
        stakeInfo.startTime = block.timestamp;
        stakeInfo.lastClaimTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= amount, "Insufficient staked amount");

        // Claim pending rewards
        _claimRewards();

        stakeInfo.amount -= amount;
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
            stakeInfo.lastClaimTime = block.timestamp;
            require(auraToken.transfer(msg.sender, rewards), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[user];
        if (stakeInfo.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 apy = BASE_APY;

        // Add bonus for long-term staking
        if (block.timestamp - stakeInfo.startTime >= LONG_TERM_THRESHOLD) {
            apy += BONUS_APY;
        }

        // Rewards = (amount * apy * duration) / (SECONDS_PER_YEAR * PRECISION)
        uint256 rewards = (stakeInfo.amount * apy * stakingDuration) / (SECONDS_PER_YEAR * PRECISION);
        return rewards;
    }

    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 pendingRewards,
        uint256 currentAPY
    ) {
        StakeInfo memory stakeInfo = stakes[user];
        amount = stakeInfo.amount;
        startTime = stakeInfo.startTime;
        pendingRewards = calculateRewards(user);
        
        currentAPY = BASE_APY;
        if (block.timestamp - stakeInfo.startTime >= LONG_TERM_THRESHOLD) {
            currentAPY += BONUS_APY;
        }
    }

    // Emergency withdrawal function for owner to refund users if needed
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = auraToken.balanceOf(address(this));
        require(auraToken.transfer(owner(), balance), "Emergency withdrawal failed");
    }
}
