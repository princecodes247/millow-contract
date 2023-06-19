const { ethers, upgrades } = require("hardhat");
const fs = require('fs')

    const filePath = 'src/tokenAddress.js';
// function saveTokenAddress(content) {
//     const fileContent = `export default tokenAddress = ${content}`;

//     fs.writeFile(filePath, fileContent, (err) => {
//         if (err) {
//             console.error('Error creating the file:', err);
//             return;
//         }
//         console.log('File created successfully!');
//     });
// }


async function main() {
    let wallet = (await ethers.getSigners())[0];

    // Deploy the token contract
    const HbarToken = await ethers.getContractFactory("HbarToken", wallet);
    //   const hbarToken = await upgrades.deployProxy(HbarToken, ["HbarToken", "HBAR", 6, 10000000000]);
    const hbarToken = await HbarToken.deploy("HbarToken", "HBAR", 6, 10000000000);
    await hbarToken.waitForDeployment()
    // console.log(hbarToken)
    //   await hbarToken.deployed();
    // const contractAddress = (await hbarToken.deployTransaction().wait()).contractAddress;

    console.log("Token deployed to:", hbarToken.target);

    try {
        fs.writeFileSync(filePath, `module.exports ={tokenAddress: ${hbarToken.target}}`);
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
