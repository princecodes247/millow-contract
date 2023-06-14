import { ethers } from "hardhat";

function parseDOGE(value: string | number) {
    const decimals = 8; // Dogecoin has 8 decimal places
    const parsedValue = ethers.utils.parseUnits(value.toString(), decimals);
    return parsedValue;
  }

  export default parseDOGE