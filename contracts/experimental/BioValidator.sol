// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BioValidator (Proof of Movement & Bio-Auth Patent Implementation)
 * @notice Verifies hashes derived from human movement data.
 * @dev Supports Patent DRAFT_03_PROOF_OF_MOVEMENT & DRAFT_04_BIO_KINETIC_AUTH
 */
contract BioValidator is Ownable {
    using ECDSA for bytes32;

    // Mapping of used motion hashes to prevent replay
    mapping(bytes32 => bool) public usedProofHashes;

    event BioAuthSuccess(address indexed user, bytes32 indexed proofHash);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Validates a transaction was signed with bio-kinetic data
     * @param _proofHash The hash of the vector (accel_x, accel_y, heart_rate)
     * @param _signature Signature from the user's device enclave/backend
     */
    function validateMovement(bytes32 _proofHash, bytes memory _signature) external returns (bool) {
        require(!usedProofHashes[_proofHash], "Proof already used");
        
        // Recover signer from the proof hash
        address signer = _proofHash.toEthSignedMessageHash().recover(_signature);
        
        // In this experimental version, signer must be sender
        // In prod, signer might be a specific "Bio-Enclave" key on the phone
        require(signer == msg.sender, "Invalid bio-signature");

        usedProofHashes[_proofHash] = true;
        
        emit BioAuthSuccess(msg.sender, _proofHash);
        return true;
    }
}
