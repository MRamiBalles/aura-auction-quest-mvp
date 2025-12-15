// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title RWARedemption - NFT to Physical Asset Portal
 * @notice Burn NFTs to redeem physical products (sneakers, merch, etc.)
 * @dev Part of RWA (Real World Assets) integration strategy
 * 
 * Flow:
 * 1. Partner adds redeemable product with NFT requirements
 * 2. User requests redemption (locks NFT)
 * 3. User provides shipping info off-chain
 * 4. Partner confirms shipment
 * 5. NFT is burned, user gets physical product
 */
contract RWARedemption is Ownable, ReentrancyGuard {
    
    // === Product Structure ===
    struct Product {
        uint256 id;
        address partner;           // Brand/partner wallet
        string name;
        string description;
        address requiredNFTContract;
        uint256[] eligibleTokenIds; // Empty = any token from contract
        uint256 stock;
        uint256 redeemed;
        bool active;
    }
    
    struct RedemptionRequest {
        uint256 id;
        uint256 productId;
        address user;
        address nftContract;
        uint256 tokenId;
        uint8 status;              // 0=pending, 1=approved, 2=shipped, 3=completed, 4=cancelled
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // === Storage ===
    mapping(uint256 => Product) public products;
    mapping(uint256 => RedemptionRequest) public redemptions;
    mapping(address => bool) public partners;
    mapping(uint256 => mapping(uint256 => bool)) public eligibleTokens; // productId => tokenId => eligible
    
    uint256 public productCounter;
    uint256 public redemptionCounter;
    
    // === Events ===
    event PartnerAdded(address indexed partner);
    event PartnerRemoved(address indexed partner);
    event ProductCreated(uint256 indexed productId, address indexed partner, string name);
    event ProductUpdated(uint256 indexed productId, uint256 newStock);
    event RedemptionRequested(uint256 indexed redemptionId, uint256 indexed productId, address indexed user, uint256 tokenId);
    event RedemptionApproved(uint256 indexed redemptionId);
    event RedemptionShipped(uint256 indexed redemptionId, string trackingInfo);
    event RedemptionCompleted(uint256 indexed redemptionId);
    event RedemptionCancelled(uint256 indexed redemptionId, string reason);
    
    constructor() Ownable(msg.sender) {}
    
    // === Partner Management ===
    
    function addPartner(address partner) external onlyOwner {
        partners[partner] = true;
        emit PartnerAdded(partner);
    }
    
    function removePartner(address partner) external onlyOwner {
        partners[partner] = false;
        emit PartnerRemoved(partner);
    }
    
    modifier onlyPartner() {
        require(partners[msg.sender] || msg.sender == owner(), "Not a partner");
        _;
    }
    
    // === Product Management ===
    
    /**
     * @notice Create a redeemable product
     */
    function createProduct(
        string calldata name,
        string calldata description,
        address nftContract,
        uint256[] calldata tokenIds,
        uint256 stock
    ) external onlyPartner returns (uint256) {
        productCounter++;
        
        products[productCounter] = Product({
            id: productCounter,
            partner: msg.sender,
            name: name,
            description: description,
            requiredNFTContract: nftContract,
            eligibleTokenIds: tokenIds,
            stock: stock,
            redeemed: 0,
            active: true
        });
        
        // Mark eligible tokens
        for (uint256 i = 0; i < tokenIds.length; i++) {
            eligibleTokens[productCounter][tokenIds[i]] = true;
        }
        
        emit ProductCreated(productCounter, msg.sender, name);
        return productCounter;
    }
    
    /**
     * @notice Update product stock
     */
    function updateStock(uint256 productId, uint256 newStock) external {
        Product storage product = products[productId];
        require(
            product.partner == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        
        product.stock = newStock;
        emit ProductUpdated(productId, newStock);
    }
    
    /**
     * @notice Deactivate product
     */
    function deactivateProduct(uint256 productId) external {
        Product storage product = products[productId];
        require(
            product.partner == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        
        product.active = false;
    }
    
    // === Redemption Flow ===
    
    /**
     * @notice Request redemption (user burns NFT for physical product)
     */
    function requestRedemption(
        uint256 productId,
        uint256 tokenId
    ) external nonReentrant returns (uint256) {
        Product storage product = products[productId];
        
        require(product.active, "Product not active");
        require(product.stock > product.redeemed, "Out of stock");
        
        // Verify NFT ownership
        IERC721 nft = IERC721(product.requiredNFTContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        
        // Verify token eligibility (if specific tokens required)
        if (product.eligibleTokenIds.length > 0) {
            require(eligibleTokens[productId][tokenId], "Token not eligible");
        }
        
        // Transfer NFT to this contract (locked until completion)
        nft.transferFrom(msg.sender, address(this), tokenId);
        
        redemptionCounter++;
        
        redemptions[redemptionCounter] = RedemptionRequest({
            id: redemptionCounter,
            productId: productId,
            user: msg.sender,
            nftContract: product.requiredNFTContract,
            tokenId: tokenId,
            status: 0, // Pending
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        emit RedemptionRequested(redemptionCounter, productId, msg.sender, tokenId);
        return redemptionCounter;
    }
    
    /**
     * @notice Partner approves redemption (after verifying shipping info)
     */
    function approveRedemption(uint256 redemptionId) external {
        RedemptionRequest storage request = redemptions[redemptionId];
        Product storage product = products[request.productId];
        
        require(
            product.partner == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        require(request.status == 0, "Invalid status");
        
        request.status = 1; // Approved
        request.updatedAt = block.timestamp;
        
        emit RedemptionApproved(redemptionId);
    }
    
    /**
     * @notice Partner marks as shipped
     */
    function markShipped(uint256 redemptionId, string calldata trackingInfo) external {
        RedemptionRequest storage request = redemptions[redemptionId];
        Product storage product = products[request.productId];
        
        require(
            product.partner == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        require(request.status == 1, "Must be approved first");
        
        request.status = 2; // Shipped
        request.updatedAt = block.timestamp;
        
        emit RedemptionShipped(redemptionId, trackingInfo);
    }
    
    /**
     * @notice Complete redemption (burn NFT)
     */
    function completeRedemption(uint256 redemptionId) external {
        RedemptionRequest storage request = redemptions[redemptionId];
        Product storage product = products[request.productId];
        
        require(
            product.partner == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        require(request.status == 2, "Must be shipped first");
        
        request.status = 3; // Completed
        request.updatedAt = block.timestamp;
        product.redeemed++;
        
        // Burn the NFT (send to dead address)
        // Note: If the NFT contract supports burn, call burn instead
        IERC721(request.nftContract).transferFrom(
            address(this),
            address(0xdead),
            request.tokenId
        );
        
        emit RedemptionCompleted(redemptionId);
    }
    
    /**
     * @notice Cancel redemption (return NFT to user)
     */
    function cancelRedemption(uint256 redemptionId, string calldata reason) external {
        RedemptionRequest storage request = redemptions[redemptionId];
        Product storage product = products[request.productId];
        
        require(
            request.user == msg.sender || 
            product.partner == msg.sender || 
            msg.sender == owner(),
            "Not authorized"
        );
        require(request.status < 3, "Cannot cancel completed redemption");
        
        request.status = 4; // Cancelled
        request.updatedAt = block.timestamp;
        
        // Return NFT to user
        IERC721(request.nftContract).transferFrom(
            address(this),
            request.user,
            request.tokenId
        );
        
        emit RedemptionCancelled(redemptionId, reason);
    }
    
    // === View Functions ===
    
    function getProduct(uint256 productId) external view returns (Product memory) {
        return products[productId];
    }
    
    function getRedemption(uint256 redemptionId) external view returns (RedemptionRequest memory) {
        return redemptions[redemptionId];
    }
    
    function getAvailableStock(uint256 productId) external view returns (uint256) {
        Product storage product = products[productId];
        return product.stock > product.redeemed ? product.stock - product.redeemed : 0;
    }
    
    function isTokenEligible(uint256 productId, uint256 tokenId) external view returns (bool) {
        Product storage product = products[productId];
        if (product.eligibleTokenIds.length == 0) return true;
        return eligibleTokens[productId][tokenId];
    }
}
