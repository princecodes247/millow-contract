import { ethers } from "hardhat";

function parseUSDT(value: string | number) {
    const decimals = 6; // USDT has 6 decimal places
    const parsedValue = ethers.utils.parseUnits(value.toString(), decimals);
    return parsedValue;
  }

  export default parseUSDT