// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SafariZoneNFT - Location-Locked Event NFTs
 * @notice NFTs that can only be claimed at specific GPS coordinates during events
 * @dev Based on Niantic Safari Zone model ($16M case study)
 * 
 * Features:
 * - Time-limited events (e.g., 48 hours)
 * - Location verification (backend validates GPS)
 * - Exclusive drops per location
 * - Event ticketing integration
 */
contract SafariZoneNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    
    // === Event Structure ===
    struct SafariEvent {
        uint256 id;
        string name;
        string location;           // e.g., "Tottori, Japan"
        int256 latitude;           // GPS lat * 1e6 (e.g., 35.5011 -> 35501100)
        int256 longitude;          // GPS lon * 1e6
        uint256 radiusMeters;      // Claim radius in meters
        uint256 startTime;
        uint256 endTime;
        uint256 maxMints;
        uint256 currentMints;
        string baseURI;
        bool active;
    }
    
    struct ClaimTicket {
        address user;
        uint256 eventId;
        bool used;
        uint256 issuedAt;
    }
    
    // === Storage ===
    mapping(uint256 => SafariEvent) public events;
    mapping(bytes32 => ClaimTicket) public tickets;     // ticketHash => ticket
    mapping(uint256 => mapping(address => bool)) public hasClaimed; // eventId => user => claimed
    mapping(uint256 => uint256[]) public eventTokens;   // eventId => tokenIds
    
    uint256 public eventCounter;
    uint256 public tokenCounter;
    
    // Authorized GPS validators (backend signers)
    mapping(address => bool) public validators;
    
    // === Events ===
    event SafariEventCreated(
        uint256 indexed eventId, 
        string name, 
        string location,
        uint256 startTime,
        uint256 endTime
    );
    event TicketIssued(bytes32 indexed ticketHash, address indexed user, uint256 eventId);
    event NFTClaimed(uint256 indexed eventId, address indexed user, uint256 tokenId);
    event EventDeactivated(uint256 indexed eventId);
    
    constructor() ERC721("AuraQuest Safari", "SAFARI") Ownable(msg.sender) {}
    
    // === Event Management ===
    
    /**
     * @notice Create a new Safari Zone event
     * @param name Event name (e.g., "Tokyo Safari 2026")
     * @param location Human-readable location
     * @param latitude GPS latitude * 1e6
     * @param longitude GPS longitude * 1e6
     * @param radiusMeters Claim radius
     * @param startTime Unix timestamp
     * @param endTime Unix timestamp
     * @param maxMints Maximum NFTs for this event
     * @param baseURI Base URI for NFT metadata
     */
    function createEvent(
        string calldata name,
        string calldata location,
        int256 latitude,
        int256 longitude,
        uint256 radiusMeters,
        uint256 startTime,
        uint256 endTime,
        uint256 maxMints,
        string calldata baseURI
    ) external onlyOwner returns (uint256) {
        require(startTime < endTime, "Invalid time range");
        require(maxMints > 0, "Max mints must be positive");
        
        eventCounter++;
        
        events[eventCounter] = SafariEvent({
            id: eventCounter,
            name: name,
            location: location,
            latitude: latitude,
            longitude: longitude,
            radiusMeters: radiusMeters,
            startTime: startTime,
            endTime: endTime,
            maxMints: maxMints,
            currentMints: 0,
            baseURI: baseURI,
            active: true
        });
        
        emit SafariEventCreated(eventCounter, name, location, startTime, endTime);
        return eventCounter;
    }
    
    /**
     * @notice Issue a claim ticket (after GPS verification by backend)
     * @param user User who verified their location
     * @param eventId Event to issue ticket for
     * @param gpsSignature Backend signature proving GPS verification
     */
    function issueTicket(
        address user,
        uint256 eventId,
        bytes calldata gpsSignature
    ) external returns (bytes32) {
        require(validators[msg.sender], "Not authorized validator");
        
        SafariEvent storage evt = events[eventId];
        require(evt.active, "Event not active");
        require(block.timestamp >= evt.startTime, "Event not started");
        require(block.timestamp <= evt.endTime, "Event ended");
        require(!hasClaimed[eventId][user], "Already claimed for this event");
        
        // Generate unique ticket hash
        bytes32 ticketHash = keccak256(
            abi.encodePacked(user, eventId, block.timestamp, gpsSignature)
        );
        
        tickets[ticketHash] = ClaimTicket({
            user: user,
            eventId: eventId,
            used: false,
            issuedAt: block.timestamp
        });
        
        emit TicketIssued(ticketHash, user, eventId);
        return ticketHash;
    }
    
    /**
     * @notice Claim Safari Zone NFT with valid ticket
     * @param ticketHash Ticket hash from issueTicket
     */
    function claimNFT(bytes32 ticketHash) external nonReentrant {
        ClaimTicket storage ticket = tickets[ticketHash];
        require(ticket.user == msg.sender, "Not your ticket");
        require(!ticket.used, "Ticket already used");
        
        SafariEvent storage evt = events[ticket.eventId];
        require(evt.active, "Event not active");
        require(evt.currentMints < evt.maxMints, "Event sold out");
        require(block.timestamp <= evt.endTime, "Event ended");
        
        // Mark as used
        ticket.used = true;
        hasClaimed[ticket.eventId][msg.sender] = true;
        evt.currentMints++;
        
        // Mint NFT
        tokenCounter++;
        _safeMint(msg.sender, tokenCounter);
        
        // Set token URI with event-specific metadata
        string memory uri = string(
            abi.encodePacked(evt.baseURI, "/", _toString(tokenCounter), ".json")
        );
        _setTokenURI(tokenCounter, uri);
        
        eventTokens[ticket.eventId].push(tokenCounter);
        
        emit NFTClaimed(ticket.eventId, msg.sender, tokenCounter);
    }
    
    // === View Functions ===
    
    /**
     * @notice Get event details
     */
    function getEvent(uint256 eventId) external view returns (SafariEvent memory) {
        return events[eventId];
    }
    
    /**
     * @notice Check if event is currently active
     */
    function isEventLive(uint256 eventId) external view returns (bool) {
        SafariEvent storage evt = events[eventId];
        return evt.active && 
               block.timestamp >= evt.startTime && 
               block.timestamp <= evt.endTime &&
               evt.currentMints < evt.maxMints;
    }
    
    /**
     * @notice Get remaining mints for event
     */
    function getRemainingMints(uint256 eventId) external view returns (uint256) {
        SafariEvent storage evt = events[eventId];
        if (evt.currentMints >= evt.maxMints) return 0;
        return evt.maxMints - evt.currentMints;
    }
    
    /**
     * @notice Check if user has claimed for event
     */
    function hasUserClaimed(uint256 eventId, address user) external view returns (bool) {
        return hasClaimed[eventId][user];
    }
    
    /**
     * @notice Get all tokens minted for an event
     */
    function getEventTokens(uint256 eventId) external view returns (uint256[] memory) {
        return eventTokens[eventId];
    }
    
    /**
     * @notice Get active events
     */
    function getActiveEvents() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count active events
        for (uint256 i = 1; i <= eventCounter; i++) {
            if (events[i].active && 
                block.timestamp >= events[i].startTime && 
                block.timestamp <= events[i].endTime) {
                count++;
            }
        }
        
        // Build result
        uint256[] memory active = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 1; i <= eventCounter; i++) {
            if (events[i].active && 
                block.timestamp >= events[i].startTime && 
                block.timestamp <= events[i].endTime) {
                active[j] = i;
                j++;
            }
        }
        
        return active;
    }
    
    // === Admin ===
    
    function setValidator(address validator, bool status) external onlyOwner {
        validators[validator] = status;
    }
    
    function deactivateEvent(uint256 eventId) external onlyOwner {
        events[eventId].active = false;
        emit EventDeactivated(eventId);
    }
    
    function extendEvent(uint256 eventId, uint256 newEndTime) external onlyOwner {
        require(newEndTime > events[eventId].endTime, "Must extend, not reduce");
        events[eventId].endTime = newEndTime;
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
}
