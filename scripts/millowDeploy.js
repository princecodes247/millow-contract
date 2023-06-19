const { ethers } = require("hardhat");
const fs = require('fs');
const {tokenAddress} = require('../src/tokenAddress.js')


const filePath = 'src/millowAddress.js';
function saveTokenAddress(content) {
    const fileContent = `module.exports = {millowAddress: ${content}}`;

    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.error('Error creating the file:', err);
            return;
        }
        console.log('File created successfully!');
    });
}


async function main() {
    const hbarTokenAddress = tokenAddress
    let wallet = (await ethers.getSigners())[0];
    const Millow = await ethers.getContractFactory("Millow", wallet);
    const millow = await Millow.deploy("Millow", "MIL", hbarTokenAddress, { gasLimit: "1072264", networkTimeout: "120000000", minGasPrice: "180000000000" });
    await millow.waitForDeployment();

    // console.log(millow)

      console.log("Millow contract deployed to:", millow.target);
      try {
        fs.writeFileSync(filePath, `module.exports ={millowAddress: "${millow.target}"}`);
        console.log('File created successfully!');
      } catch (err) {
        console.error('Error creating the file:', err);
      }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
