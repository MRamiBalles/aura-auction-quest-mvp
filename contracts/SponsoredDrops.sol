// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title SponsoredDrops - B2B Brand Partnership Platform
 * @notice Enables brands to sponsor in-game drops at specific locations
 * @dev Revenue stream: Brands pay per campaign, users claim branded NFTs
 * 
 * Use Cases:
 * - Starbucks: Drop coffee NFTs near stores → redeem for real drink
 * - Monster Energy: Branded crystals near events → energy boost in-game
 * - Nike: Limited sneaker NFTs at flagship stores
 * 
 * Pricing Model:
 * - Base: $5,000/campaign
 * - Per claim: $0.50
 * - Premium locations: +50%
 */
contract SponsoredDrops is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // === Campaign Structure ===
    struct Campaign {
        uint256 id;
        address sponsor;           // Brand wallet
        string brandName;
        string dropType;           // "nft", "crystal", "powerup"
        uint256 budget;            // Total campaign budget in wei
        uint256 costPerClaim;      // Cost deducted per claim
        uint256 maxClaims;
        uint256 currentClaims;
        uint256 startTime;
        uint256 endTime;
        string[] locationIds;      // GPS location identifiers
        string baseURI;
        bool active;
        bool settled;              // Payment settled
    }
    
    struct ClaimRecord {
        address user;
        uint256 campaignId;
        uint256 tokenId;
        string locationId;
        uint256 timestamp;
    }
    
    // === Storage ===
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => ClaimRecord[]) public campaignClaims;
    mapping(uint256 => mapping(address => bool)) public hasClaimed; // campaign => user => claimed
    mapping(string => uint256[]) public locationCampaigns; // locationId => campaignIds
    
    uint256 public campaignCounter;
    uint256 public tokenCounter;
    uint256 public totalRevenue;
    
    // Platform fee: 20% of campaign budget
    uint256 public constant PLATFORM_FEE = 2000; // 20% in basis points
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Minimum campaign requirements
    uint256 public minBudget = 1 ether; // ~$2,000
    uint256 public minDuration = 1 days;
    
    // === Events ===
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed sponsor,
        string brandName,
        uint256 budget,
        uint256 maxClaims
    );
    event DropClaimed(
        uint256 indexed campaignId,
        address indexed user,
        uint256 tokenId,
        string locationId
    );
    event CampaignEnded(uint256 indexed campaignId, uint256 totalClaims, uint256 refund);
    event CampaignSettled(uint256 indexed campaignId, uint256 spent, uint256 platformFee);
    
    constructor() ERC721("AuraQuest Sponsored", "SPONSOR") Ownable(msg.sender) {}
    
    // === Campaign Management ===
    
    /**
     * @notice Create a new sponsored drop campaign
     * @param brandName Brand/sponsor name
     * @param dropType Type of drop (nft, crystal, powerup)
     * @param maxClaims Maximum number of claims allowed
     * @param duration Campaign duration in seconds
     * @param locationIds Array of GPS location identifiers
     * @param baseURI IPFS base URI for NFT metadata
     */
    function createCampaign(
        string calldata brandName,
        string calldata dropType,
        uint256 maxClaims,
        uint256 duration,
        string[] calldata locationIds,
        string calldata baseURI
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= minBudget, "Budget below minimum");
        require(duration >= minDuration, "Duration too short");
        require(maxClaims > 0, "Must have at least 1 claim");
        require(locationIds.length > 0, "Must have at least 1 location");
        
        campaignCounter++;
        
        uint256 costPerClaim = msg.value / maxClaims;
        
        // Store location IDs separately due to storage limitations
        string[] memory locs = new string[](locationIds.length);
        for (uint256 i = 0; i < locationIds.length; i++) {
            locs[i] = locationIds[i];
            locationCampaigns[locationIds[i]].push(campaignCounter);
        }
        
        campaigns[campaignCounter] = Campaign({
            id: campaignCounter,
            sponsor: msg.sender,
            brandName: brandName,
            dropType: dropType,
            budget: msg.value,
            costPerClaim: costPerClaim,
            maxClaims: maxClaims,
            currentClaims: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            locationIds: locs,
            baseURI: baseURI,
            active: true,
            settled: false
        });
        
        totalRevenue += msg.value;
        
        emit CampaignCreated(
            campaignCounter,
            msg.sender,
            brandName,
            msg.value,
            maxClaims
        );
        
        return campaignCounter;
    }
    
    /**
     * @notice Claim a sponsored drop (called by backend after GPS verification)
     * @param campaignId Campaign to claim from
     * @param user User claiming the drop
     * @param locationId GPS location where claim occurred
     */
    function claimDrop(
        uint256 campaignId,
        address user,
        string calldata locationId
    ) external onlyOwner nonReentrant returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.active, "Campaign not active");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign ended");
        require(campaign.currentClaims < campaign.maxClaims, "Max claims reached");
        require(!hasClaimed[campaignId][user], "Already claimed");
        
        // Verify location is valid for this campaign
        bool validLocation = false;
        for (uint256 i = 0; i < campaign.locationIds.length; i++) {
            if (keccak256(bytes(campaign.locationIds[i])) == keccak256(bytes(locationId))) {
                validLocation = true;
                break;
            }
        }
        require(validLocation, "Invalid location for campaign");
        
        // Mint NFT
        tokenCounter++;
        _safeMint(user, tokenCounter);
        
        string memory uri = string(
            abi.encodePacked(campaign.baseURI, "/", _toString(tokenCounter), ".json")
        );
        _setTokenURI(tokenCounter, uri);
        
        // Record claim
        campaign.currentClaims++;
        hasClaimed[campaignId][user] = true;
        
        campaignClaims[campaignId].push(ClaimRecord({
            user: user,
            campaignId: campaignId,
            tokenId: tokenCounter,
            locationId: locationId,
            timestamp: block.timestamp
        }));
        
        emit DropClaimed(campaignId, user, tokenCounter, locationId);
        
        return tokenCounter;
    }
    
    /**
     * @notice End campaign and settle payments
     */
    function endCampaign(uint256 campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        
        require(
            msg.sender == campaign.sponsor || msg.sender == owner(),
            "Not authorized"
        );
        require(campaign.active, "Already ended");
        require(!campaign.settled, "Already settled");
        
        campaign.active = false;
        
        // Calculate spent and refund
        uint256 spent = campaign.currentClaims * campaign.costPerClaim;
        uint256 refund = campaign.budget > spent ? campaign.budget - spent : 0;
        
        // Platform takes fee from spent amount
        uint256 platformFee = (spent * PLATFORM_FEE) / FEE_DENOMINATOR;
        
        campaign.settled = true;
        
        // Refund unused budget to sponsor
        if (refund > 0) {
            (bool success, ) = payable(campaign.sponsor).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        emit CampaignEnded(campaignId, campaign.currentClaims, refund);
        emit CampaignSettled(campaignId, spent, platformFee);
    }
    
    // === View Functions ===
    
    /**
     * @notice Get campaign details
     */
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }
    
    /**
     * @notice Get active campaigns at a location
     */
    function getCampaignsAtLocation(string calldata locationId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory allCampaigns = locationCampaigns[locationId];
        uint256 activeCount = 0;
        
        // Count active campaigns
        for (uint256 i = 0; i < allCampaigns.length; i++) {
            Campaign storage c = campaigns[allCampaigns[i]];
            if (c.active && block.timestamp <= c.endTime) {
                activeCount++;
            }
        }
        
        // Build result
        uint256[] memory active = new uint256[](activeCount);
        uint256 j = 0;
        for (uint256 i = 0; i < allCampaigns.length; i++) {
            Campaign storage c = campaigns[allCampaigns[i]];
            if (c.active && block.timestamp <= c.endTime) {
                active[j] = allCampaigns[i];
                j++;
            }
        }
        
        return active;
    }
    
    /**
     * @notice Check if user can claim from campaign
     */
    function canClaim(uint256 campaignId, address user) external view returns (bool) {
        Campaign storage campaign = campaigns[campaignId];
        
        return campaign.active &&
               block.timestamp >= campaign.startTime &&
               block.timestamp <= campaign.endTime &&
               campaign.currentClaims < campaign.maxClaims &&
               !hasClaimed[campaignId][user];
    }
    
    /**
     * @notice Get campaign claims
     */
    function getCampaignClaims(uint256 campaignId) 
        external 
        view 
        returns (ClaimRecord[] memory) 
    {
        return campaignClaims[campaignId];
    }
    
    /**
     * @notice Get campaign statistics
     */
    function getCampaignStats(uint256 campaignId) external view returns (
        uint256 claims,
        uint256 maxClaims,
        uint256 spent,
        uint256 remaining,
        uint256 timeLeft
    ) {
        Campaign storage campaign = campaigns[campaignId];
        
        claims = campaign.currentClaims;
        maxClaims = campaign.maxClaims;
        spent = claims * campaign.costPerClaim;
        remaining = campaign.budget > spent ? campaign.budget - spent : 0;
        timeLeft = block.timestamp < campaign.endTime 
            ? campaign.endTime - block.timestamp 
            : 0;
    }
    
    // === Admin Functions ===
    
    function setMinBudget(uint256 newMin) external onlyOwner {
        minBudget = newMin;
    }
    
    function setMinDuration(uint256 newDuration) external onlyOwner {
        minDuration = newDuration;
    }
    
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // === Internal ===
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // === Overrides ===
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Receive ETH for campaigns
    receive() external payable {}
}
