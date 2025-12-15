// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PremiumSubscription
 * @author Manuel Ramírez Ballesteros
 * @notice Manages Ghost Mode premium subscriptions on-chain
 * @dev Handles monthly/yearly subscriptions with automatic expiry
 */
contract PremiumSubscription is Ownable, ReentrancyGuard {
    
    // ============ Constants ============
    
    uint256 public constant MONTHLY_PRICE = 5 ether;  // 5 MATIC (~$5)
    uint256 public constant YEARLY_PRICE = 50 ether;  // 50 MATIC (~$50, 2 months free)
    uint256 public constant MONTH_DURATION = 30 days;
    uint256 public constant YEAR_DURATION = 365 days;
    
    // ============ State Variables ============
    
    struct Subscription {
        uint256 expiry;
        bool isYearly;
        uint256 totalPaid;
    }
    
    mapping(address => Subscription) public subscriptions;
    
    uint256 public totalSubscribers;
    uint256 public totalRevenue;
    
    // ============ Events ============
    
    event SubscriptionPurchased(
        address indexed user,
        bool isYearly,
        uint256 expiry,
        uint256 amount
    );
    
    event SubscriptionRenewed(
        address indexed user,
        uint256 newExpiry,
        uint256 amount
    );
    
    event SubscriptionCancelled(address indexed user);
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ External Functions ============
    
    /**
     * @notice Purchase or renew a monthly subscription
     */
    function subscribeMonthly() external payable nonReentrant {
        require(msg.value >= MONTHLY_PRICE, "Insufficient payment");
        _processSubscription(false, MONTH_DURATION);
    }
    
    /**
     * @notice Purchase or renew a yearly subscription (best value)
     */
    function subscribeYearly() external payable nonReentrant {
        require(msg.value >= YEARLY_PRICE, "Insufficient payment");
        _processSubscription(true, YEAR_DURATION);
    }
    
    /**
     * @notice Check if a user has an active premium subscription
     * @param user Address to check
     * @return bool True if subscription is active
     */
    function isPremium(address user) external view returns (bool) {
        return subscriptions[user].expiry > block.timestamp;
    }
    
    /**
     * @notice Get subscription details for a user
     * @param user Address to query
     * @return expiry Expiration timestamp
     * @return isYearly Whether subscription is yearly
     * @return active Whether currently active
     */
    function getSubscription(address user) external view returns (
        uint256 expiry,
        bool isYearly,
        bool active
    ) {
        Subscription memory sub = subscriptions[user];
        return (
            sub.expiry,
            sub.isYearly,
            sub.expiry > block.timestamp
        );
    }
    
    /**
     * @notice Get remaining days on subscription
     * @param user Address to query
     * @return uint256 Days remaining (0 if expired)
     */
    function getRemainingDays(address user) external view returns (uint256) {
        if (subscriptions[user].expiry <= block.timestamp) {
            return 0;
        }
        return (subscriptions[user].expiry - block.timestamp) / 1 days;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Withdraw accumulated subscription fees
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @notice Grant premium to a user (for promotions/giveaways)
     * @param user Address to grant premium
     * @param duration Duration in seconds
     */
    function grantPremium(address user, uint256 duration) external onlyOwner {
        uint256 currentExpiry = subscriptions[user].expiry;
        uint256 newExpiry;
        
        if (currentExpiry > block.timestamp) {
            newExpiry = currentExpiry + duration;
        } else {
            newExpiry = block.timestamp + duration;
            totalSubscribers++;
        }
        
        subscriptions[user].expiry = newExpiry;
        
        emit SubscriptionPurchased(user, false, newExpiry, 0);
    }
    
    // ============ Internal Functions ============
    
    function _processSubscription(bool yearly, uint256 duration) internal {
        Subscription storage sub = subscriptions[msg.sender];
        
        uint256 newExpiry;
        bool isNewSubscriber = sub.expiry < block.timestamp;
        
        if (isNewSubscriber) {
            newExpiry = block.timestamp + duration;
            totalSubscribers++;
        } else {
            // Extend existing subscription
            newExpiry = sub.expiry + duration;
        }
        
        sub.expiry = newExpiry;
        sub.isYearly = yearly;
        sub.totalPaid += msg.value;
        
        totalRevenue += msg.value;
        
        if (isNewSubscriber) {
            emit SubscriptionPurchased(msg.sender, yearly, newExpiry, msg.value);
        } else {
            emit SubscriptionRenewed(msg.sender, newExpiry, msg.value);
        }
        
        // Refund excess payment
        uint256 expectedPrice = yearly ? YEARLY_PRICE : MONTHLY_PRICE;
        if (msg.value > expectedPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - expectedPrice}("");
            require(success, "Refund failed");
        }
    }
}
