import { ethers } from "hardhat";

function parseUSDC(value: string | number) {
    const decimals = 6; // USDC has 6 decimal places
    const parsedValue = ethers.utils.parseUnits(value.toString(), decimals);
    return parsedValue;
  }

  export default parseUSDC