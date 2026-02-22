// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RupayaTraceVault {
    IERC20 public token;
    address public owner;

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    // 🟢 WE ARE ADDING THIS MISSING FUNCTION 🟢
    function getVaultBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}