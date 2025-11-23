// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    uint256 private listingCounter;
    mapping(uint256 => Listing) public listings;
    
    // Platform fee: 2.5%
    uint256 public platformFee = 250; // Basis points (250 / 10000 = 2.5%)
    uint256 public constant FEE_DENOMINATOR = 10000;

    event ItemListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price);
    event ItemSold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event PlatformFeeUpdated(uint256 newFee);

    constructor() {}

    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (uint256) {
        require(price > 0, "Price must be > 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        listingCounter++;
        listings[listingCounter] = Listing({
            listingId: listingCounter,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit ItemListed(listingCounter, nftContract, tokenId, msg.sender, price);
        return listingCounter;
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        listing.active = false;

        // Calculate platform fee
        uint256 fee = (listing.price * platformFee) / FEE_DENOMINATOR;
        uint256 sellerProceeds = listing.price - fee;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Transfer payment to seller
        (bool successSeller, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(successSeller, "Seller payment failed");

        // Transfer fee to contract owner
        if (fee > 0) {
            (bool successFee, ) = payable(owner()).call{value: fee}("");
            require(successFee, "Fee payment failed");
        }

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool successRefund, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(successRefund, "Refund failed");
        }

        emit ItemSold(listingId, msg.sender, listing.price);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;
        emit ListingCancelled(listingId);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee cannot exceed 5%");
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
