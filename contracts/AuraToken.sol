// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuraToken is ERC20, Ownable {
    constructor() ERC20("Aura", "AURA") Ownable(msg.sender) {
        _mint(msg.sender, 100000000 * 10 ** decimals()); // 100 Million Initial Supply
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
