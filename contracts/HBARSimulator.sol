// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface HBARToken {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract HBARTokenSimulator {
    string public constant name = "Hedera Hashgraph Token";
    string public constant symbol = "HBAR";
    uint8 public constant decimals = 8;
    address public constant hbarContractAddress = 0xa43C7F27E36279645Bd1620070414e564ec291a9;

    HBARToken private hbarToken;

    constructor(address customer, uint256 amount) {
        hbarToken = HBARToken(hbarContractAddress);
        allocateTokens(customer, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return hbarToken.balanceOf(account);
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        return hbarToken.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        return hbarToken.transferFrom(sender, recipient, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        return hbarToken.approve(spender, amount);
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return hbarToken.allowance(owner, spender);
    }
  
    function allocateTokens(address recipient, uint256 amount) internal {
        hbarToken.transfer(recipient, amount);
    }
}
