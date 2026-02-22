// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RupayaToken is ERC20 {
    constructor() ERC20("RupayaToken", "RUPAYA") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}