import "@nomicfoundation/hardhat-toolbox";
// require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config();
// require('@openzeppelin/hardhat-upgrades');





module.exports = {
  defaultNetwork: "localhost",
  // defaultNetwork: "testnet",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    testnet: {
      //HashIO testnet endpoint from the TESTNET_ENDPOINT variable in the project .env the file
      url: process.env.TESTNET_ENDPOINT,
      //the Hedera testnet account ECDSA private
      //the public address for the account is derived from the private key
      accounts: [
        process.env.TESTNET_OPERATOR_PRIVATE_KEY,
      ],
    },
    _testnet: {
      // url: "https://testnet.hedera.com:443",
      url: process.env.TESTNET_ENDPOINT,
      // chainId: 296,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      accounts: [process.env.TESTNET_OPERATOR_PRIVATE_KEY],
      timeout: 1200000,
      HttpNetworkConfig: {
        gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      timeout: 1200000,
      // minGasPrice: "180000000000"
      }
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.4.24",
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}




