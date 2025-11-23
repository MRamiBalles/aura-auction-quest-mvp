// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AuraMarketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;
    IERC20 public auraToken;
    IERC721 public auraNFT;

    event ItemListed(address indexed seller, uint256 indexed tokenId, uint256 price);
    event ItemSold(address indexed buyer, uint256 indexed tokenId, uint256 price);

    constructor(address _token, address _nft) {
        auraToken = IERC20(_token);
        auraNFT = IERC721(_nft);
    }

    function list(uint256 tokenId, uint256 price) external {
        require(auraNFT.ownerOf(tokenId) == msg.sender, "Not owner");
        require(auraNFT.isApprovedForAll(msg.sender, address(this)), "Not approved");

        listings[address(auraNFT)][tokenId] = Listing(msg.sender, price, true);
        emit ItemListed(msg.sender, tokenId, price);
    }

    function buy(uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[address(auraNFT)][tokenId];
        require(listing.active, "Not active");
        require(auraToken.balanceOf(msg.sender) >= listing.price, "Insufficient funds");

        listings[address(auraNFT)][tokenId].active = false;
        
        auraToken.transferFrom(msg.sender, listing.seller, listing.price);
        auraNFT.transferFrom(listing.seller, msg.sender, tokenId);

        emit ItemSold(msg.sender, tokenId, listing.price);
    }
}
