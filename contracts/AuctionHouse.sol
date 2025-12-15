// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuctionHouse - SECURITY HARDENED V2
 * @notice Fixed critical vulnerabilities:
 * - P0-1: Added MAX_EXTENSIONS to prevent infinite extension loop
 * - P0-2: Implemented push-to-pull pattern for failed refunds
 * - P1-3: Added grace period with late penalty for delayed finalization
 * - P2-2: Added finalization reward to incentivize third-party finalization
 */
contract AuctionHouse is ReentrancyGuard, Ownable {
    struct Auction {
        uint256 auctionId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 startPrice;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        bool active;
    }

    uint256 private auctionCounter;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => address[]) public bidHistory;
    
    // Anti-sniping: extend auction by 5 minutes if bid in last 5 minutes
    uint256 public constant EXTENSION_DURATION = 5 minutes;
    uint256 public constant EXTENSION_WINDOW = 5 minutes;
    
    // 🔒 FIX P0-1: Prevent infinite extension loop
    uint256 public constant MAX_EXTENSIONS = 6; // Max 30 minutes extra total
    mapping(uint256 => uint256) public extensionCount;
    
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_BID_INCREMENT = 50; // 0.5%

    // 🔒 FIX P0-2: Push-to-pull pattern for failed refunds
    mapping(address => uint256) public failedRefunds;

    // 🔒 FIX P1-3: Grace period for finalization
    uint256 public constant GRACE_PERIOD = 1 hours;
    uint256 public constant LATE_PENALTY_PER_HOUR = 1000; // 10% of platform fee per hour
    
    // 🔒 FIX P2-2: Finalization reward for third parties
    uint256 public constant FINALIZATION_REWARD = 0.001 ether; // ~$2 incentive

    event AuctionCreated(uint256 indexed auctionId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 startPrice, uint256 endTime);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event AuctionCancelled(uint256 indexed auctionId);
    event ExtensionLimitReached(uint256 indexed auctionId);
    event RefundFailed(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event LatePenaltyApplied(uint256 indexed auctionId, uint256 penalty, address indexed recipient);
    event FinalizationRewardPaid(uint256 indexed auctionId, address indexed finalizer, uint256 reward);

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(startPrice > 0, "Start price must be > 0");
        require(duration >= 1 hours && duration <= 7 days, "Duration must be 1h-7d");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "AuctionHouse not approved"
        );

        auctionCounter++;
        uint256 endTime = block.timestamp + duration;
        
        auctions[auctionCounter] = Auction({
            auctionId: auctionCounter,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            startPrice: startPrice,
            currentBid: 0,
            currentBidder: address(0),
            endTime: endTime,
            active: true
        });

        emit AuctionCreated(auctionCounter, nftContract, tokenId, msg.sender, startPrice, endTime);
        return auctionCounter;
    }

    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");

        uint256 minBid = auction.currentBid == 0 
            ? auction.startPrice 
            : auction.currentBid + (auction.currentBid * MIN_BID_INCREMENT / FEE_DENOMINATOR);
        
        require(msg.value >= minBid, "Bid too low");

        // 🔒 FIX P0-2: Refund previous bidder with fallback to pull
        if (auction.currentBidder != address(0)) {
            (bool success, ) = payable(auction.currentBidder).call{value: auction.currentBid}("");
            
            if (!success) {
                // If refund fails, allow bidder to withdraw later
                failedRefunds[auction.currentBidder] += auction.currentBid;
                emit RefundFailed(auctionId, auction.currentBidder, auction.currentBid);
            }
        }

        // Update auction
        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;
        bidHistory[auctionId].push(msg.sender);

        // 🔒 FIX P0-1: Anti-sniping with extension limit
        if (auction.endTime - block.timestamp < EXTENSION_WINDOW && 
            extensionCount[auctionId] < MAX_EXTENSIONS) {
            auction.endTime += EXTENSION_DURATION;
            extensionCount[auctionId]++;
        } else if (extensionCount[auctionId] >= MAX_EXTENSIONS) {
            emit ExtensionLimitReached(auctionId);
        }

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * 🔒 FIX P0-2: Withdraw failed refunds
     * @notice Allows users to withdraw refunds that failed during bidding
     */
    function withdrawFailedRefund() external nonReentrant {
        uint256 amount = failedRefunds[msg.sender];
        require(amount > 0, "No failed refunds");
        
        failedRefunds[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        // 🔒 FIX P1-3: Access control during grace period
        // Only seller or winner can finalize during first hour
        // After grace period, anyone can finalize
        if (block.timestamp < auction.endTime + GRACE_PERIOD) {
            require(
                msg.sender == auction.seller || msg.sender == auction.currentBidder,
                "Only seller or winner during grace period"
            );
        }

        auction.active = false;

        // If no bids, return NFT to seller
        if (auction.currentBidder == address(0)) {
            emit AuctionCancelled(auctionId);
            return;
        }

        // Calculate fees
        uint256 fee = (auction.currentBid * platformFee) / FEE_DENOMINATOR;
        uint256 sellerProceeds = auction.currentBid - fee;
        
        // 🔒 FIX P1-3: Apply late penalty if finalized after grace period
        uint256 penalty = 0;
        if (block.timestamp > auction.endTime + GRACE_PERIOD) {
            uint256 lateTime = block.timestamp - (auction.endTime + GRACE_PERIOD);
            uint256 latePeriods = (lateTime / 1 hours) + 1; // At least 1 period
            
            // Penalty: 10% of fee per hour late, capped at 100% of fee
            penalty = (fee * LATE_PENALTY_PER_HOUR * latePeriods) / FEE_DENOMINATOR;
            if (penalty > fee) penalty = fee;
            
            // Deduct penalty from seller proceeds (goes to winner)
            sellerProceeds -= penalty;
            
            emit LatePenaltyApplied(auctionId, penalty, auction.currentBidder);
        }
        
        // 🔒 FIX P2-2: Calculate finalization reward for third parties
        uint256 finalizerReward = 0;
        if (msg.sender != auction.seller && msg.sender != auction.currentBidder) {
            // Only pay reward if seller has enough proceeds
            if (sellerProceeds > FINALIZATION_REWARD) {
                finalizerReward = FINALIZATION_REWARD;
                sellerProceeds -= finalizerReward;
            }
        }

        // 🔒 IMPROVEMENT: Try-catch for NFT transfer
        try IERC721(auction.nftContract).safeTransferFrom(
            auction.seller,
            auction.currentBidder,
            auction.tokenId
        ) {
            // Transfer successful - proceed with payments
            
            // Transfer payment to seller
            (bool successSeller, ) = payable(auction.seller).call{value: sellerProceeds}("");
            require(successSeller, "Seller payment failed");

            // Transfer fee (minus penalty) to owner
            uint256 ownerFee = fee - penalty;
            if (ownerFee > 0) {
                (bool successFee, ) = payable(owner()).call{value: ownerFee}("");
                require(successFee, "Fee payment failed");
            }
            
            // Transfer penalty to winner as compensation
            if (penalty > 0) {
                (bool successPenalty, ) = payable(auction.currentBidder).call{value: penalty}("");
                // If penalty transfer fails, add to failed refunds
                if (!successPenalty) {
                    failedRefunds[auction.currentBidder] += penalty;
                }
            }
            
            // 🔒 FIX P2-2: Pay finalization reward to third party
            if (finalizerReward > 0) {
                (bool successReward, ) = payable(msg.sender).call{value: finalizerReward}("");
                if (successReward) {
                    emit FinalizationRewardPaid(auctionId, msg.sender, finalizerReward);
                } else {
                    // If reward fails, add to failed refunds
                    failedRefunds[msg.sender] += finalizerReward;
                }
            }

            emit AuctionFinalized(auctionId, auction.currentBidder, auction.currentBid);
        } catch {
            // NFT transfer failed - refund winner
            failedRefunds[auction.currentBidder] += auction.currentBid;
            emit AuctionCancelled(auctionId);
            emit RefundFailed(auctionId, auction.currentBidder, auction.currentBid);
        }
    }

    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(auction.seller == msg.sender, "Not the seller");
        require(auction.currentBidder == address(0), "Auction has bids");

        auction.active = false;
        emit AuctionCancelled(auctionId);
    }

    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    function getBidHistory(uint256 auctionId) external view returns (address[] memory) {
        return bidHistory[auctionId];
    }

    /**
     * @notice Get failed refund balance for an address
     */
    function getFailedRefund(address account) external view returns (uint256) {
        return failedRefunds[account];
    }

    /**
     * @notice Get extension count for an auction
     */
    function getExtensionCount(uint256 auctionId) external view returns (uint256) {
        return extensionCount[auctionId];
    }
}
