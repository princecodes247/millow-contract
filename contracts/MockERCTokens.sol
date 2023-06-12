// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20Tokens is ERC20 {

    address public customer;

  constructor(string memory name, string memory symbol, address _customer) ERC20(name, symbol) {
    _mint(_customer, 1000000 * 10**decimals());
  }
}