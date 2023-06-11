# Paytanium Smart Contract
Paytanium is a smart contract built on the Ethereum blockchain using the Solidity programming language. It allows vendors to receive and manage various tokens including Ether (ETH), Dogecoin (DOGE), USD Tether (USDT), USD Coin (USDC), and Hedera Hashgraph (HBAR).

## Getting Started
These instructions will help you get a copy of the Paytanium smart contract up and running on your local machine for development and testing purposes.

### Prerequisites
To interact with the Paytanium smart contract, you will need the following:

Node.js (>=12.0.0)
npm or Yarn
Hardhat (>=2.6.0)
Installation
Follow these steps to install the required dependencies and set up the project:

Clone the repository to your local machine:
```shell
git clone <repository-url>
```
Change to the project directory:

```shell
cd <project-directory>
```

Install the necessary dependencies:

```shell
npm install
# or
yarn install
```

### Configuration
Before you can deploy and test the Paytanium smart contract, you may need to configure some settings. The configuration file is located at hardhat.config.js. Review the file and update the network settings according to your needs.

By default, the contract will be deployed on the Ethereum network. You can modify the networks section in the configuration file to specify different networks or use local test networks.

Deploying the Smart Contract
To deploy the Paytanium smart contract, run the following command:

```shell
npx hardhat run scripts/deploy.js --network <network-name>
```

Replace <network-name> with the desired network where you want to deploy the contract. This command will compile the contract, deploy it to the specified network, and provide you with the contract's address upon successful deployment.

### Running Tests
Paytanium includes a set of tests to ensure its functionality. To run the tests, execute the following command:

```shell

npx hardhat test
``` 

This command will compile the contracts, deploy them to a local test network, and run the test suite. It will output the test results, including any passing or failing tests.

## Contract Details
The Paytanium smart contract consists of the following features:

### Supported Tokens
Dogecoin (DOGE)
USD Tether (USDT)
USD Coin (USDC)
Hedera Hashgraph (HBAR)
Vendor Management
The contract allows vendors to register and manage their balances for different tokens. Vendors can be added to the contract's address book, and each vendor is assigned a unique ID.

### Token Receival
Vendors can receive tokens from customers by calling the respective functions for each token:

`receiveEther()`: Allows vendors to receive Ether (ETH) directly to their balances.
`receiveMatic()`: Allows vendors to receive Matic (MATIC) tokens directly to their balances.
`receiveUSDT(uint256 amount)`: Allows vendors to receive USD Tether (USDT) tokens by transferring them from the customer's wallet to the contract.
`receiveUSDC(uint256 amount)`: Allows vendors to receive USD Coin (USDC) tokens by transferring them from the customer's wallet to the contract.
`receiveDOGE(uint256 amount)`: Allows vendors to receive Dogecoin (DOGE) tokens by transferring them from the customer's wallet to the contract.
`receiveHBAR(uint256 amount)`: Allows vendors to receive Hedera Hashgraph (HBAR) tokens by transferring them from the customer's wallet to the contract.

### Balance Tracking
The contract tracks the balances of vendors for each supported token. Vendors can retrieve their balances by calling the respective balance functions:

`vendorEtherBalances(address vendor)`: Retrieves the Ether balance of a vendor.
`vendorMaticBalances(address vendor)`: Retrieves the Matic balance of a vendor.
`vendorUSDTBalances(address vendor)`: Retrieves the USD Tether balance of a vendor.
`vendorUSDCBalances(address vendor)`: Retrieves the USD Coin balance of a vendor.
`vendorDogeBalances(address vendor)`: Retrieves the Dogecoin balance of a vendor.
`vendorHBARBalances(address vendor)`: Retrieves the Hedera Hashgraph balance of a vendor.

### Vendor Address Book
The contract maintains an address book to map vendor addresses to their unique IDs. Vendors can retrieve their ID by calling the fetchVendorId(address _address) function.

### Contributing
Contributions to the Paytanium project are welcome and encouraged. If you have any suggestions, bug reports, or feature requests, please open an issue on the project's GitHub repository.

Before making any contributions, please read the contributing guidelines for more information.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

#### Acknowledgments
The Paytanium smart contract was developed using the Hardhat framework.
The Solidity programming language was used to write the smart contract.
This project was inspired by the need to provide vendors with a simple and secure way to manage multiple token balances, on top of the Hedera network.