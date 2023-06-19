# Millow - Real Estate NFT Marketplace

## Overview

Millow is a decentralized marketplace built on the Hedera blockchain that enables the buying and selling of real estate NFTs (Non-Fungible Tokens). It provides a secure and transparent platform for users to mint, list, and trade NFTs representing real estate properties. The platform utilizes the ERC721 standard for NFTs and integrates the HbarToken contract to simulate the behavior of HBAR tokens for transactions.

## Prerequisites

- Solidity version: ^0.8.0
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) library
- Hedera Token Contract ABI (for HBAR token interaction)

## Features

- Minting and Listing: Users can mint new real estate NFTs by providing a file URL, setting a price, and specifying the seller's address. Minting creates a unique token representing the property and adds it to the marketplace.
- Listing Details: Users can view the current owner, price, and file URL of a listed NFT.
- Buying NFTs: Buyers can purchase NFTs by providing the token ID and the payment amount. The transaction automatically transfers ownership of the NFT to the buyer, deducts the payment from the buyer's account, and transfers the payment to the seller.
- Setting and Resetting Prices: NFT owners can set or update the price of their listed NFTs.
- Commission and Withdrawal: The contract deducts a 5% commission from each successful transaction and stores it in the contract. The contract owner can withdraw accumulated commissions.

## Contracts

### Millow

The Millow contract represents the NFT marketplace for real estate properties. It extends the ERC721 contract for NFT functionality and the Ownable contract to manage ownership and access control.

Key Functions:

- `mintAndList`: Mints a new NFT for a real estate property, sets its token URI, and adds it to the marketplace as a listed item.
- `getNFTListing`: Retrieves the details of the first listing for a given NFT token ID.
- `buyNFT`: Allows a buyer to purchase a listed NFT, transferring ownership, handling payment, and deducting commissions.
- `resetNFTPrice`: Enables the NFT owner to update the price of a listed NFT.
- `removeNFTListing`: Allows the NFT owner to remove a listing from the marketplace.
- `getTotalNumberOfMintedTokens`: Returns the total number of minted NFTs currently listed in the marketplace.
- `getLastUpdatedTokenId`: Retrieves the ID of the last minted token.
- `withdrawCommission`: Allows the contract owner to withdraw accumulated commissions.
- `getCommissionBalance`: Returns the current commission balance held by the contract.

### HbarToken

The HbarToken contract represents a simulated token contract that behaves like HBAR tokens on the Hedera network. It enables token transfers, approvals, and balance management.

Key Functions:

- `transfer`: Transfers tokens from the sender's account to a specified recipient.
- `approve`: Approves a spender to spend a specific number of tokens from the sender's account.
- `transferFrom`: Transfers tokens on behalf of a sender to a specified recipient.
- `mint`: Mints new tokens and adds them to the recipient's account.
- `getBalance`: Retrieves the token balance of an account.

## Deployment

To deploy the Millow contract and integrate it with the HbarToken contract:

1. Deploy the HbarToken contract on the Hedera network and obtain its contract address.
2. Deploy the Millow contract, passing the desired name and symbol for the ERC721 token, along with the address of the HbarToken contract.
3. Interact with the Millow contract by calling its functions to mint NFTs, list them for sale, and perform transactions.

**Note:** Make sure to fund the contract with HBAR tokens to enable the purchase of NFTs.

## Getting Started

To get started with Millow and Hardhat, follow these steps:

1. Install the required dependencies:
   - Solidity compiler
   - Hardhat
   - Hedera JavaScript SDK

2. Clone the Millow repository from GitHub:
   ```
   git clone https://github.com/your-username/millow.git
   ```

3. Navigate to the project directory:
   ```
   cd millow
   ```

4. Install the project dependencies:
   ```
   npm install
   ```

5. Configure the project:
   - Update the `.env` file with your Hedera testnet account ID, private key, and the address of the deployed HbarToken contract.

6. Compile the smart contracts:
   ```
   npx hardhat compile
   ```

7. Deploy the smart contracts to your desired network (e.g., Hedera testnet):
   ```
   npx hardhat run scripts/deploy.js --network testnet
   ```

8. Run the tests to ensure everything is functioning correctly:
   ```
   npx hardhat test
   ```

9. Start the development server:
   ```
   npm run dev
   ```

10. Access the Millow web application by opening `http://localhost:3000` in your web browser.

## Usage

Once the Millow web application is running, you can perform the following actions:

- Mint a new real estate NFT by providing the necessary details and clicking on the "Mint" button.
- List a minted NFT for sale by setting the price and clicking on the "List" button.
- View the details of a listed NFT, including the current owner, price, and file URL.
- Purchase a listed NFT by entering the token ID and the payment amount, then clicking on the "Buy" button.
- Reset the price of a listed NFT you own by entering the token ID and the new price, then clicking on the "Reset Price" button.
- Remove a listing for an NFT you own by entering the token ID and clicking on the "Remove Listing" button.
- Withdraw accumulated commissions as the contract owner by clicking on the "Withdraw Commissions" button.

## Contributing

Contributions to Millow are welcome! If you want to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your forked repository.
5. Submit a pull request to the main repository.

Please ensure that your code adheres to the existing coding style and conventions.

## License

Millow is licensed under the [MIT License](https://github.com/your-username/millow/blob/main/LICENSE).

## Contact

If you have any questions or inquiries, please contact the development team at bashorun115@gmail.com, and @princeCodes247
