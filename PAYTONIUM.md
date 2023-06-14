# Paytanium Smart Contract
Paytanium is a smart contract to be deployed on the Hedera network, using the Solidity programming language. It will be the smart contract that powers a payment gatweway that allows vendors to receive several ERC20 tokens as payment from customers. Vendors can withdraw their balances at any time.

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

By default, the contract will be deployed on the Hedera network. You can modify the networks section in the configuration file to specify different networks or use local test networks.

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
- Dogecoin (DOGE)
- USD Tether (USDT)
- USD Coin (USDC)
- Hedera Hashgraph (HBAR)
- Ethereum (ETH)

### Vendor Management
The contract allows vendors to register and manage their balances for different tokens. Vendors can be added to the contract's address book, and each vendor is assigned a unique ID.

### Contract Variables
- `owner`: The address of the contract owner
- `locked`: A boolean variable used as a reentrancy guard
dogeToken, usdtToken, usdcToken, hbarToken: Instances of the IERC20 interface representing different tokens
- `vendorCount`: A counter to keep track of the number of vendors
- `vendorERCAddressBook`: A mapping that associates each vendor address with a unique vendor ID
- `vendorBalances`: A mapping that stores the token balances for each vendor

### Events
Events are basically signboards that popup when a function has been run successfully, telling everyone what just happened
- `VendorAdded(address _address, uint256)`: Emitted when a new vendor is added to the address book
- `EtherReceived(address indexed vendor, uint256 amount)`: Emitted when a vendor receives Ether payment
- `MaticReceived(address indexed vendor, uint256 amount)`: Emitted when a vendor receives Matic payment
- `USDTReceived(address indexed vendor, uint256 amount)`: Emitted when a vendor receives USDT payment
- `USDCReceived(address indexed vendor, uint256 amount)`: Emitted when a vendor receives USDC payment
- `DogeReceived(address indexed vendor, uint256 amount)`: Emitted when a vendor receives DOGE payment
- `HBARReceived(address indexed vendor, uint256 amount)`: Emitted when a vendor receives HBAR payment

### Modifiers
Modifiers are validity checkers that make sure some conditions are met, else they revert
- `transferSuccessful(IERC20 token, uint256 amount)`: A modifier to ensure a successful token transfer before updating a vendor's balance
- `greaterThanZero(uint256 amount)`: A modifier to validate that an amount is greater than zero
- `onlyOwner()`: A modifier to restrict certain actions to the contract owner only

### Constructor
- `constructor(address _dogeToken, address _usdtToken, address _usdcToken, address _hbarToken)`: Initializes the contract by setting the owner address, vendor count to zero, and assigning instances of the token contracts.

### Vendor Management Functions
- `addVendorToAddressBook(address _address)`: Adds a vendor to the address book, assigns a unique vendor ID, and initializes token balances to zero.
- `fetchVendorId(address _address)`: Retrieves the vendor's ID based on their address.

### Token Receival From Customers
Vendors can receive tokens from customers by calling the respective functions for each token:

- `receive() external payable`: Receives Ether payments and updates the vendor's Ether balance.
- `payWithMatic() external payable`: Receives Matic payments and updates the vendor's Matic balance.
- `payWithUSDT(uint256 amount) external payable`: Receives USDT payments and updates the vendor's USDT balance.
- `payWithUSDC(uint256 amount) external payable`: Receives USDC payments and updates the vendor's USDC balance.
- `payWithDOGE(uint256 amount) external payable`: Receives DOGE payments and updates the vendor's DOGE balance.
- `payWithHBAR(uint256 amount) external payable`: Receives HBAR payments and updates the vendor's HBAR balance.

### Withdrawal Functions For Vendors
Vendors can withdraw whenever they want
- `withdrawEther() external`: Allows the vendor to withdraw their Ether balance.
- `withdrawMatic() external`: Allows the vendor to withdraw their Matic balance.
- `withdrawUSDT() external`: Allows the vendor to withdraw their USDT balance.
- `withdrawUSDC() external`: Allows the vendor to withdraw their USDC balance.
- `withdrawDOGE() external`: Allows the vendor to withdraw their DOGE balance.
- `withdrawHBAR() external`: Allows the vendor to withdraw their HBAR balance.

### Balance Tracking
The contract tracks the balances of vendors for each supported token. Vendors can retrieve their balances by calling the respective balance functions:

- `checkEtherBalance() external view returns (uint256)`: Retrieves the vendor's Ether balance.
- `checkMaticBalance() external view returns (uint256)`: Retrieves the vendor's Matic balance.
- `checkUSDTBalance() external view returns (uint256)`: Retrieves the vendor's USDT balance.
- `checkUSDCBalance() external view returns (uint256)`: Retrieves the vendor's USDC balance.
- `checkDOGEBalance() external view returns (uint256)`: Retrieves the vendor's DOGE balance.
- `checkHBARBalance() external view returns (uint256)`: Retrieves the vendor's HBAR balance.

### Contributing
Contributions to the Paytanium project are welcome and encouraged. If you have any suggestions, bug reports, or feature requests, please open an issue on the project's GitHub repository, or send an email to bashorun115@gmail.com.

Before making any contributions, please read the contributing guidelines for more information.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

#### Acknowledgments
The Paytanium smart contract was developed using the Hardhat framework.
The Solidity programming language was used to write the smart contract.
This project was inspired by the need to provide vendors with a simple and secure way to manage multiple token balances, on top of the Hedera network.