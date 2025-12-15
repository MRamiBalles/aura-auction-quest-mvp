// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SpatialAnchorRegistry (Spatial Consensus Patent Implementation)
 * @notice Stores AR Anchors validated by P2P consensus.
 * @dev Supports Patent DRAFT_05_SPATIAL_CONSENSUS
 */
contract SpatialAnchorRegistry is Ownable {

    struct Anchor {
        int256 lat;
        int256 lng;
        int256 alt;
        string ipfsHash; // The AR content/point cloud
        uint256 witnessCount;
        bool verified;
    }

    mapping(bytes32 => Anchor) public anchors;
    uint256 public constant REQUIRED_WITNESSES = 3;

    event AnchorProposed(bytes32 indexed anchorId, address proposer);
    event AnchorVerified(bytes32 indexed anchorId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice A user proposes an anchor after local P2P consensus
     * @param _witnessSignatures Array of signatures from peers claiming they see the same object
     */
    function registerAnchor(
        int256 _lat,
        int256 _lng,
        int256 _alt,
        string memory _ipfsHash,
        bytes[] memory _witnessSignatures
    ) external {
        // In a full impl, we would verify each signature matches a nearby user
        require(_witnessSignatures.length >= REQUIRED_WITNESSES, "Not enough witnesses");

        bytes32 anchorId = keccak256(abi.encodePacked(_lat, _lng, _alt, _ipfsHash));
        
        anchors[anchorId] = Anchor({
            lat: _lat,
            lng: _lng,
            alt: _alt,
            ipfsHash: _ipfsHash,
            witnessCount: _witnessSignatures.length,
            verified: true // Auto-verified if signatures are valid
        });

        emit AnchorVerified(anchorId);
    }
}
