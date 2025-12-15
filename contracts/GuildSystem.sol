// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title GuildSystem - YGG-Style Scholarship Platform
 * @notice Enables NFT lending and revenue sharing between guilds and scholars
 * @dev Based on Yield Guild Games model with 70/30 split
 * 
 * Revenue Split:
 * - 70% Scholar (player who earns)
 * - 30% Guild (split between sub-guild and global DAO)
 * 
 * Flow:
 * 1. Guild leader deposits NFTs into guild treasury
 * 2. Scholars apply and are approved
 * 3. Scholars use guild NFTs to play and earn
 * 4. Earnings automatically split: 70% scholar, 30% guild
 */
contract GuildSystem is Ownable, ReentrancyGuard {
    
    IERC20 public auraToken;
    
    // === Revenue Split Configuration ===
    uint256 public constant SCHOLAR_SHARE = 7000;     // 70%
    uint256 public constant GUILD_SHARE = 3000;       // 30%
    uint256 public constant GLOBAL_DAO_CUT = 1000;    // 10% of guild share (3% total)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // === Guild Structure ===
    struct Guild {
        uint256 id;
        string name;
        string region;              // e.g., "ES" for Spain, "MX" for Mexico
        address leader;
        uint256 totalEarnings;
        uint256 scholarCount;
        bool active;
    }
    
    struct Scholar {
        address wallet;
        uint256 guildId;
        uint256 totalEarned;
        uint256 joinedAt;
        bool active;
    }
    
    struct LentNFT {
        address nftContract;
        uint256 tokenId;
        uint256 guildId;
        address scholar;            // address(0) if available
        uint256 lentAt;
    }
    
    // === Storage ===
    mapping(uint256 => Guild) public guilds;
    mapping(address => Scholar) public scholars;
    mapping(bytes32 => LentNFT) public lentNFTs;     // keccak256(nftContract, tokenId)
    mapping(uint256 => address[]) public guildScholars;
    mapping(uint256 => bytes32[]) public guildNFTs;
    
    uint256 public guildCounter;
    uint256 public totalScholars;
    address public globalDAO;
    
    // === Events ===
    event GuildCreated(uint256 indexed guildId, string name, string region, address leader);
    event ScholarJoined(address indexed scholar, uint256 indexed guildId);
    event ScholarLeft(address indexed scholar, uint256 indexed guildId);
    event NFTDeposited(uint256 indexed guildId, address nftContract, uint256 tokenId);
    event NFTLent(bytes32 indexed nftKey, address indexed scholar);
    event NFTReturned(bytes32 indexed nftKey, address indexed scholar);
    event EarningsSplit(
        address indexed scholar, 
        uint256 indexed guildId, 
        uint256 totalAmount,
        uint256 scholarAmount,
        uint256 guildAmount
    );
    
    constructor(address _auraToken, address _globalDAO) Ownable(msg.sender) {
        auraToken = IERC20(_auraToken);
        globalDAO = _globalDAO;
    }
    
    // === Guild Management ===
    
    /**
     * @notice Create a new guild (sub-DAO)
     * @param name Guild name
     * @param region Region code (e.g., "ES", "MX", "AR")
     */
    function createGuild(string calldata name, string calldata region) 
        external 
        returns (uint256) 
    {
        guildCounter++;
        
        guilds[guildCounter] = Guild({
            id: guildCounter,
            name: name,
            region: region,
            leader: msg.sender,
            totalEarnings: 0,
            scholarCount: 0,
            active: true
        });
        
        emit GuildCreated(guildCounter, name, region, msg.sender);
        return guildCounter;
    }
    
    /**
     * @notice Deposit NFT into guild treasury for scholars
     */
    function depositNFT(
        uint256 guildId, 
        address nftContract, 
        uint256 tokenId
    ) external nonReentrant {
        require(guilds[guildId].active, "Guild not active");
        require(
            guilds[guildId].leader == msg.sender || msg.sender == owner(),
            "Not guild leader"
        );
        
        // Transfer NFT to this contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        bytes32 nftKey = _getNFTKey(nftContract, tokenId);
        lentNFTs[nftKey] = LentNFT({
            nftContract: nftContract,
            tokenId: tokenId,
            guildId: guildId,
            scholar: address(0),
            lentAt: 0
        });
        
        guildNFTs[guildId].push(nftKey);
        
        emit NFTDeposited(guildId, nftContract, tokenId);
    }
    
    // === Scholar Management ===
    
    /**
     * @notice Join a guild as a scholar
     */
    function joinGuild(uint256 guildId) external {
        require(guilds[guildId].active, "Guild not active");
        require(scholars[msg.sender].guildId == 0, "Already in a guild");
        
        scholars[msg.sender] = Scholar({
            wallet: msg.sender,
            guildId: guildId,
            totalEarned: 0,
            joinedAt: block.timestamp,
            active: true
        });
        
        guildScholars[guildId].push(msg.sender);
        guilds[guildId].scholarCount++;
        totalScholars++;
        
        emit ScholarJoined(msg.sender, guildId);
    }
    
    /**
     * @notice Leave current guild
     */
    function leaveGuild() external {
        Scholar storage scholar = scholars[msg.sender];
        require(scholar.active, "Not an active scholar");
        
        uint256 guildId = scholar.guildId;
        
        // Return any borrowed NFTs
        _returnAllScholarNFTs(msg.sender);
        
        scholar.active = false;
        scholar.guildId = 0;
        guilds[guildId].scholarCount--;
        
        emit ScholarLeft(msg.sender, guildId);
    }
    
    /**
     * @notice Borrow an available NFT from guild
     */
    function borrowNFT(address nftContract, uint256 tokenId) external {
        Scholar storage scholar = scholars[msg.sender];
        require(scholar.active, "Not an active scholar");
        
        bytes32 nftKey = _getNFTKey(nftContract, tokenId);
        LentNFT storage nft = lentNFTs[nftKey];
        
        require(nft.guildId == scholar.guildId, "NFT not in your guild");
        require(nft.scholar == address(0), "NFT already borrowed");
        
        nft.scholar = msg.sender;
        nft.lentAt = block.timestamp;
        
        emit NFTLent(nftKey, msg.sender);
    }
    
    /**
     * @notice Return a borrowed NFT
     */
    function returnNFT(address nftContract, uint256 tokenId) external {
        bytes32 nftKey = _getNFTKey(nftContract, tokenId);
        LentNFT storage nft = lentNFTs[nftKey];
        
        require(nft.scholar == msg.sender, "Not your borrowed NFT");
        
        nft.scholar = address(0);
        nft.lentAt = 0;
        
        emit NFTReturned(nftKey, msg.sender);
    }
    
    // === Revenue Distribution ===
    
    /**
     * @notice Distribute earnings with 70/30 split
     * @dev Called by game contracts when scholar earns tokens
     */
    function distributeEarnings(address scholarAddress, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        Scholar storage scholar = scholars[scholarAddress];
        require(scholar.active, "Not an active scholar");
        
        uint256 guildId = scholar.guildId;
        Guild storage guild = guilds[guildId];
        
        // Calculate splits
        uint256 scholarAmount = (amount * SCHOLAR_SHARE) / FEE_DENOMINATOR;
        uint256 guildAmount = (amount * GUILD_SHARE) / FEE_DENOMINATOR;
        uint256 daoAmount = (guildAmount * GLOBAL_DAO_CUT) / FEE_DENOMINATOR;
        uint256 localGuildAmount = guildAmount - daoAmount;
        
        // Update tracking
        scholar.totalEarned += scholarAmount;
        guild.totalEarnings += guildAmount;
        
        // Transfer to scholar (70%)
        require(
            auraToken.transfer(scholarAddress, scholarAmount),
            "Scholar transfer failed"
        );
        
        // Transfer to guild leader (27%)
        require(
            auraToken.transfer(guild.leader, localGuildAmount),
            "Guild transfer failed"
        );
        
        // Transfer to global DAO (3%)
        require(
            auraToken.transfer(globalDAO, daoAmount),
            "DAO transfer failed"
        );
        
        emit EarningsSplit(scholarAddress, guildId, amount, scholarAmount, guildAmount);
    }
    
    // === View Functions ===
    
    /**
     * @notice Get guild information
     */
    function getGuild(uint256 guildId) external view returns (Guild memory) {
        return guilds[guildId];
    }
    
    /**
     * @notice Get scholar information
     */
    function getScholar(address wallet) external view returns (Scholar memory) {
        return scholars[wallet];
    }
    
    /**
     * @notice Get available NFTs in a guild
     */
    function getAvailableNFTs(uint256 guildId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        bytes32[] memory allNFTs = guildNFTs[guildId];
        uint256 count = 0;
        
        // Count available
        for (uint256 i = 0; i < allNFTs.length; i++) {
            if (lentNFTs[allNFTs[i]].scholar == address(0)) {
                count++;
            }
        }
        
        // Build result
        bytes32[] memory available = new bytes32[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < allNFTs.length; i++) {
            if (lentNFTs[allNFTs[i]].scholar == address(0)) {
                available[j] = allNFTs[i];
                j++;
            }
        }
        
        return available;
    }
    
    /**
     * @notice Get scholars in a guild
     */
    function getGuildScholars(uint256 guildId) 
        external 
        view 
        returns (address[] memory) 
    {
        return guildScholars[guildId];
    }
    
    // === Internal ===
    
    function _getNFTKey(address nftContract, uint256 tokenId) 
        internal 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(nftContract, tokenId));
    }
    
    function _returnAllScholarNFTs(address scholarAddress) internal {
        Scholar storage scholar = scholars[scholarAddress];
        bytes32[] memory nfts = guildNFTs[scholar.guildId];
        
        for (uint256 i = 0; i < nfts.length; i++) {
            if (lentNFTs[nfts[i]].scholar == scholarAddress) {
                lentNFTs[nfts[i]].scholar = address(0);
                lentNFTs[nfts[i]].lentAt = 0;
                emit NFTReturned(nfts[i], scholarAddress);
            }
        }
    }
    
    // === Admin ===
    
    function setGlobalDAO(address newDAO) external onlyOwner {
        globalDAO = newDAO;
    }
    
    function deactivateGuild(uint256 guildId) external onlyOwner {
        guilds[guildId].active = false;
    }
}
