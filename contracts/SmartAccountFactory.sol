// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * @title SmartAccountFactory - ERC-4337 Smart Account Creation
 * @notice Creates deterministic smart accounts for users
 * @dev Enables "Ghost Wallet" - users get accounts without knowing about Web3
 * 
 * Flow:
 * 1. User signs up with email/social (Web2 style)
 * 2. Backend generates a unique salt from user ID
 * 3. Factory deploys Smart Account at predictable address
 * 4. User can "upgrade" to full wallet ownership later
 */
contract SmartAccountFactory is Ownable {
    
    // === State ===
    mapping(address => bool) public isSmartAccount;
    mapping(bytes32 => address) public saltToAccount;
    uint256 public totalAccountsCreated;
    
    // === Events ===
    event AccountCreated(
        address indexed account, 
        address indexed owner, 
        bytes32 indexed salt
    );
    event AccountUpgraded(address indexed account, address indexed newOwner);
    
    // === Smart Account Bytecode ===
    // Minimal proxy pattern for gas efficiency
    // In production, use a proper Smart Account implementation (e.g., Safe, Kernel)
    
    /**
     * @notice Compute the address of a smart account before deployment
     * @param salt Unique identifier (e.g., hash of user email)
     * @param owner Initial owner of the account
     */
    function computeAddress(bytes32 salt, address owner) 
        external 
        view 
        returns (address) 
    {
        bytes memory bytecode = _getAccountBytecode(owner);
        return Create2.computeAddress(salt, keccak256(bytecode));
    }
    
    /**
     * @notice Create a new smart account
     * @param salt Unique identifier for deterministic address
     * @param owner Initial owner (can be backend for custodial, or user for self-custody)
     */
    function createAccount(bytes32 salt, address owner) 
        external 
        returns (address account) 
    {
        require(saltToAccount[salt] == address(0), "Account already exists for this salt");
        
        bytes memory bytecode = _getAccountBytecode(owner);
        account = Create2.deploy(0, salt, bytecode);
        
        isSmartAccount[account] = true;
        saltToAccount[salt] = account;
        totalAccountsCreated++;
        
        emit AccountCreated(account, owner, salt);
    }
    
    /**
     * @notice Check if an account exists for a given salt
     */
    function accountExists(bytes32 salt) external view returns (bool) {
        return saltToAccount[salt] != address(0);
    }
    
    /**
     * @notice Get account address for a salt (returns zero if not created)
     */
    function getAccount(bytes32 salt) external view returns (address) {
        return saltToAccount[salt];
    }
    
    /**
     * @notice Generate a deterministic salt from user identifier
     * @param userIdentifier Could be email hash, social ID, etc.
     * @param nonce Additional entropy if needed
     */
    function generateSalt(string calldata userIdentifier, uint256 nonce) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(userIdentifier, nonce));
    }
    
    /**
     * @dev Get bytecode for minimal smart account
     * This is a simplified implementation - use proper ERC-4337 account in production
     */
    function _getAccountBytecode(address owner) internal pure returns (bytes memory) {
        // Minimal account bytecode - stores owner and forwards calls
        // In production, replace with:
        // - Biconomy Smart Account
        // - Safe (Gnosis) Smart Account
        // - Kernel (ZeroDev)
        // - Simple Account (eth-infinitism reference)
        
        return abi.encodePacked(
            type(MinimalSmartAccount).creationCode,
            abi.encode(owner)
        );
    }
}

/**
 * @title MinimalSmartAccount - Basic ERC-4337 Compatible Account
 * @notice Simplified smart account for demonstration
 * @dev In production, use established implementations with full ERC-4337 support
 */
contract MinimalSmartAccount {
    address public owner;
    uint256 public nonce;
    
    event Executed(address indexed target, uint256 value, bytes data);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor(address _owner) {
        owner = _owner;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @notice Execute a transaction
     * @param target Contract to call
     * @param value ETH to send
     * @param data Calldata
     */
    function execute(address target, uint256 value, bytes calldata data) 
        external 
        onlyOwner 
        returns (bytes memory) 
    {
        nonce++;
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Execution failed");
        
        emit Executed(target, value, data);
        return result;
    }
    
    /**
     * @notice Execute multiple transactions (batch)
     */
    function executeBatch(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata datas
    ) external onlyOwner returns (bytes[] memory results) {
        require(
            targets.length == values.length && values.length == datas.length,
            "Length mismatch"
        );
        
        nonce++;
        results = new bytes[](targets.length);
        
        for (uint256 i = 0; i < targets.length; i++) {
            (bool success, bytes memory result) = targets[i].call{value: values[i]}(datas[i]);
            require(success, "Batch execution failed");
            results[i] = result;
            emit Executed(targets[i], values[i], datas[i]);
        }
    }
    
    /**
     * @notice Transfer ownership (upgrade from custodial to self-custody)
     * @param newOwner New owner address (user's MetaMask, etc.)
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @notice Get current nonce (for signature verification)
     */
    function getNonce() external view returns (uint256) {
        return nonce;
    }
    
    // Receive ETH
    receive() external payable {}
}
