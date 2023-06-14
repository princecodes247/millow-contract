import { ethers } from "hardhat";

function parseMATIC(value: string | number) {
    const decimals = 18; // Matic Network has 18 decimal places
    const parsedValue = ethers.utils.parseUnits(value.toString(), decimals);
    return parsedValue;
  }

  export default parseMATIC