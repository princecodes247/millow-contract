import { ethers } from "hardhat";

function parseHBAR(value: string | number) {
    const decimals = 8; // HBAR has 8 decimal places
    const parsedValue = ethers.utils.parseUnits(value.toString(), decimals);
    return parsedValue;
  }

  export default parseHBAR