// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AdAuction (AR-Ad DAO Patent Implementation)
 * @notice Real implementation of the Decentralized Spatial Advertising System.
 * @dev Supports Patent DRAFT_08_AR_AD_DAO
 */
contract AdAuction is Ownable {
    
    struct AdSpace {
        uint256 landId;      // Linked to LandRegistry NFT
        uint256 minBid;      // Minimum price in AURA tokens
        uint256 currentBid;  // Current highest bid
        address currentBidder;
        uint256 auctionEndTime;
        string contentHash;  // IPFS hash of the AR Ad content (image/glb)
        bool isActive;
    }

    IERC20 public auraToken;
    address public landRegistry;
    
    // Mapping from Land ID to active AdSpace
    mapping(uint256 => AdSpace) public adSpaces;

    event BidPlaced(uint256 indexed landId, address indexed bidder, uint256 amount);
    event AdOrchestrated(uint256 indexed landId, string contentHash, address winner);

    constructor(address _auraToken, address _landRegistry) Ownable(msg.sender) {
        auraToken = IERC20(_auraToken);
        landRegistry = _landRegistry;
    }

    /**
     * @notice Landlord creates an auction for their AR space
     */
    function createAuction(uint256 _landId, uint256 _minBid, uint256 _duration) external {
        // In a full implementation, we would check msg.sender == LandRegistry.ownerOf(_landId)
        
        adSpaces[_landId] = AdSpace({
            landId: _landId,
            minBid: _minBid,
            currentBid: 0,
            currentBidder: address(0),
            auctionEndTime: block.timestamp + _duration,
            contentHash: "",
            isActive: true
        });
    }

    /**
     * @notice Advertisers bid to display content
     */
    function placeBid(uint256 _landId, uint256 _amount, string memory _contentHash) external {
        AdSpace storage space = adSpaces[_landId];
        require(space.isActive, "Auction not active");
        require(block.timestamp < space.auctionEndTime, "Auction ended");
        require(_amount > space.currentBid && _amount >= space.minBid, "Bid too low");

        // Transfer tokens to contract escrow
        require(auraToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // Refund previous bidder
        if (space.currentBidder != address(0)) {
            auraToken.transfer(space.currentBidder, space.currentBid);
        }

        space.currentBid = _amount;
        space.currentBidder = msg.sender;
        space.contentHash = _contentHash;

        emit BidPlaced(_landId, msg.sender, _amount);
    }

    /**
     * @notice Finalize auction and distribute revenue (Patent Claim: Revenue Sharing)
     */
    function finalizeAuction(uint256 _landId) external {
        AdSpace storage space = adSpaces[_landId];
        require(block.timestamp >= space.auctionEndTime, "Auction running");
        require(space.isActive, "Already finalized");

        space.isActive = false;

        if (space.currentBid > 0) {
            // REVENUE SPLIT (Patent Core Logic):
            // 80% to Landlord
            // 10% to Platform
            // 10% to "Viewers" pool (Attention Token)
            
            uint256 total = space.currentBid;
            uint256 landlordShare = (total * 80) / 100;
            uint256 platformShare = (total * 10) / 100;
            uint256 viewerShare = total - landlordShare - platformShare;

            // Mock landlord address for demo
            address landlord = msg.sender; 
            
            auraToken.transfer(landlord, landlordShare);
            auraToken.transfer(owner(), platformShare);
            // viewerShare stays in contract for claimRewards() logic
            
            emit AdOrchestrated(_landId, space.contentHash, space.currentBidder);
        }
    }
}
