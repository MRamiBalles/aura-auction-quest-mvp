// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LandRegistry
 * @author Manuel Ramírez Ballesteros
 * @notice Virtual real estate system for Aura World - "Aura Landlords"
 * @dev Parcels are ERC-721 NFTs mapped to GPS coordinates
 * 
 * Key differentiators vs Atlas Earth:
 * - Requires physical movement to claim parcels
 * - True NFT ownership on Polygon
 * - Earn 5% of crystals collected in your territory
 */
contract LandRegistry is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    
    // ============ Constants ============
    
    uint256 public constant PARCEL_SIZE = 100; // 100m x 100m grid
    uint256 public constant CLAIM_COST = 10 ether; // 10 MATIC to claim
    uint256 public constant TAX_RATE = 500; // 5% (500 basis points)
    uint256 public constant MAX_IMPROVEMENTS = 3;
    
    // ============ Structs ============
    
    struct Parcel {
        int64 latitude;  // GPS latitude * 1e6 for precision
        int64 longitude; // GPS longitude * 1e6 for precision
        uint256 claimedAt;
        uint256 totalTaxEarned;
        uint8 improvementLevel;
        ImprovementType improvement;
    }
    
    enum ImprovementType {
        NONE,
        AURA_TREE,     // +25% spawn rate
        SHRINE,        // Bonus for allies
        DEFENSE_GRID   // -50% tax when others collect
    }
    
    struct ClaimRequest {
        int64 latitude;
        int64 longitude;
        bytes signature;
        uint256 timestamp;
    }
    
    // ============ State Variables ============
    
    mapping(uint256 => Parcel) public parcels;
    mapping(bytes32 => uint256) public coordinateToParcel; // hash(lat,lng) => tokenId
    mapping(address => uint256) public pendingTaxes;
    
    uint256 private _tokenIdCounter;
    address public backendValidator;
    
    // Improvement costs in MATIC
    mapping(ImprovementType => uint256) public improvementCosts;
    
    // ============ Events ============
    
    event ParcelClaimed(
        uint256 indexed tokenId,
        address indexed owner,
        int64 latitude,
        int64 longitude
    );
    
    event TaxCollected(
        uint256 indexed parcelId,
        address indexed landlord,
        uint256 amount
    );
    
    event ImprovementBuilt(
        uint256 indexed parcelId,
        ImprovementType improvement
    );
    
    event TaxWithdrawn(
        address indexed landlord,
        uint256 amount
    );
    
    // ============ Constructor ============
    
    constructor(address _validator) 
        ERC721("Aura Land", "ALAND")
        Ownable(msg.sender)
    {
        backendValidator = _validator;
        
        // Set improvement costs
        improvementCosts[ImprovementType.AURA_TREE] = 50 ether;
        improvementCosts[ImprovementType.SHRINE] = 100 ether;
        improvementCosts[ImprovementType.DEFENSE_GRID] = 150 ether;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Claim a parcel at your current GPS location
     * @dev Requires backend signature to verify physical presence
     * @param latitude GPS latitude * 1e6
     * @param longitude GPS longitude * 1e6
     * @param signature Backend validator signature
     */
    function claimParcel(
        int64 latitude,
        int64 longitude,
        bytes calldata signature
    ) external payable nonReentrant {
        require(msg.value >= CLAIM_COST, "Insufficient payment");
        
        // Verify backend signature (proves physical presence)
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            latitude,
            longitude,
            block.chainid
        ));
        require(_verifySignature(messageHash, signature), "Invalid signature");
        
        // Check if parcel is already claimed
        bytes32 coordHash = _getCoordinateHash(latitude, longitude);
        require(coordinateToParcel[coordHash] == 0, "Parcel already claimed");
        
        // Mint parcel NFT
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, tokenId);
        
        parcels[tokenId] = Parcel({
            latitude: latitude,
            longitude: longitude,
            claimedAt: block.timestamp,
            totalTaxEarned: 0,
            improvementLevel: 0,
            improvement: ImprovementType.NONE
        });
        
        coordinateToParcel[coordHash] = tokenId;
        
        emit ParcelClaimed(tokenId, msg.sender, latitude, longitude);
        
        // Refund excess payment
        if (msg.value > CLAIM_COST) {
            (bool success, ) = msg.sender.call{value: msg.value - CLAIM_COST}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @notice Build an improvement on your parcel
     * @param tokenId Parcel ID
     * @param improvement Type of improvement
     */
    function buildImprovement(
        uint256 tokenId,
        ImprovementType improvement
    ) external payable nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not parcel owner");
        require(improvement != ImprovementType.NONE, "Invalid improvement");
        require(parcels[tokenId].improvement == ImprovementType.NONE, "Already improved");
        
        uint256 cost = improvementCosts[improvement];
        require(msg.value >= cost, "Insufficient payment");
        
        parcels[tokenId].improvement = improvement;
        parcels[tokenId].improvementLevel = 1;
        
        emit ImprovementBuilt(tokenId, improvement);
        
        // Refund excess
        if (msg.value > cost) {
            (bool success, ) = msg.sender.call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @notice Record tax from crystal collection (called by game backend)
     * @param tokenId Parcel where crystal was collected
     * @param crystalValue Value of collected crystal
     */
    function recordTax(uint256 tokenId, uint256 crystalValue) external {
        require(msg.sender == backendValidator, "Only validator");
        require(_ownerOf(tokenId) != address(0), "Parcel not claimed");
        
        uint256 taxAmount = (crystalValue * TAX_RATE) / 10000;
        
        // Check if defense grid reduces tax
        if (parcels[tokenId].improvement == ImprovementType.DEFENSE_GRID) {
            taxAmount = taxAmount / 2; // 50% reduction
        }
        
        address landlord = ownerOf(tokenId);
        pendingTaxes[landlord] += taxAmount;
        parcels[tokenId].totalTaxEarned += taxAmount;
        
        emit TaxCollected(tokenId, landlord, taxAmount);
    }
    
    /**
     * @notice Withdraw accumulated taxes
     */
    function withdrawTaxes() external nonReentrant {
        uint256 amount = pendingTaxes[msg.sender];
        require(amount > 0, "No taxes to withdraw");
        
        pendingTaxes[msg.sender] = 0;
        
        // In production, this would transfer AURA tokens
        // For now, just emit event
        emit TaxWithdrawn(msg.sender, amount);
    }
    
    /**
     * @notice Get parcel at specific coordinates
     * @param latitude GPS latitude * 1e6
     * @param longitude GPS longitude * 1e6
     */
    function getParcelAt(int64 latitude, int64 longitude) 
        external 
        view 
        returns (uint256 tokenId, address owner) 
    {
        bytes32 coordHash = _getCoordinateHash(latitude, longitude);
        tokenId = coordinateToParcel[coordHash];
        
        if (tokenId != 0) {
            owner = ownerOf(tokenId);
        }
    }
    
    /**
     * @notice Get spawn rate multiplier for a parcel
     * @param tokenId Parcel ID
     * @return uint256 Multiplier * 100 (e.g., 125 = 1.25x)
     */
    function getSpawnMultiplier(uint256 tokenId) external view returns (uint256) {
        if (parcels[tokenId].improvement == ImprovementType.AURA_TREE) {
            return 125; // +25%
        }
        return 100; // 1x default
    }
    
    // ============ Admin Functions ============
    
    function setValidator(address _validator) external onlyOwner {
        backendValidator = _validator;
    }
    
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
    
    // ============ Internal Functions ============
    
    function _getCoordinateHash(int64 lat, int64 lng) internal pure returns (bytes32) {
        // Normalize to grid
        int64 gridLat = lat / int64(int256(PARCEL_SIZE));
        int64 gridLng = lng / int64(int256(PARCEL_SIZE));
        return keccak256(abi.encodePacked(gridLat, gridLng));
    }
    
    function _verifySignature(bytes32 messageHash, bytes memory signature) 
        internal 
        view 
        returns (bool) 
    {
        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));
        
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);
        address signer = ecrecover(ethSignedHash, v, r, s);
        
        return signer == backendValidator;
    }
    
    function _splitSignature(bytes memory sig) 
        internal 
        pure 
        returns (bytes32 r, bytes32 s, uint8 v) 
    {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
    
    // ============ Required Overrides ============
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
