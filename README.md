# Billow Smart Contract

This is the smart contract for the Billow real estate platform, developed for the Hedera Hackathon by the Hedera Foundation. 
Billow allows users to mint and trade Real Estate In form of NFTs (Non-Fungible Tokens) on the Hedera network. The smart contract is built on the Ethereum Virtual Machine (EVM) using Solidity programming language and conforms to the ERC721 standard.

## Features

The Billow smart contract includes the following features:

- Minting and listing of NFTs
- Buying and selling NFTs
- Setting and updating listing prices
- Removing NFT listings
- Retrieving NFT listing details
- Fetching the total number of listed tokens
- Retrieving the URI of a token

## Installation and Deployment

To deploy the Billow smart contract on the Hedera network, follow these steps:

1. Set up an Ethereum development environment and install the necessary dependencies.

2. Import the OpenZeppelin ERC721 library by running the following command:

   ```
   npm install @openzeppelin/contracts
   ```

3. Compile the smart contract using Solidity compiler.

4. Deploy the compiled smart contract to the Hedera network using your preferred deployment tool or framework.


## Usage

### Minting and Listing NFTs

The `mintAndList` function allows users to mint a new NFT Property and list it for sale. Users need to provide the file URL associated with the NFT and the listing price. Only non-empty file URLs and positive prices are accepted.

### Buying and Selling NFTs

Users can purchase Property NFTs that are listed for sale using the `buyNFT` function. The function requires the `tokenId` of the NFT to be purchased and the correct amount of Ether sent to cover the listing price. The NFT ownership is transferred to the buyer, and the listing is removed after the purchase.

### Setting and Updating Listing Prices

The owner of an NFT Property can set or update the listing price using the `setNFTPrice` function. The function requires the `tokenId`, the index of the listing to be updated, and the new price. Only the owner of the NFT can update the price.

### Removing NFT Listings

The owner of an NFT can remove a specific listing using the `removeNFTListing` function. The function requires the `tokenId` and the index of the listing to be removed. Only the owner of the NFT can remove the listing.

### Retrieving Property Listing Details

The `getNFTListing` function allows users to retrieve the listing details of an NFT. Users need to provide the `tokenId` of the NFT, and the function returns the owner, price, and file URL associated with the listing.

### Fetching the Total Number of Listed Property

The `getTotalNumberOfListedTokens` function returns the total number of tokens that are currently listed for sale. This can be useful for implementing a marketplace that displays all the listed tokens.

### Retrieving the URI of a Token

The `getTokenURI` function retrieves the URI associated with a token. Users need to provide the `tokenId`, and the function returns the metadata URI associated with the token.

## Deployment

The Billow smart contract can be deployed on the Hedera network using tools such as Remix, Truffle, or Hardhat. Follow the deployment instructions provided by the chosen tool to deploy the contract on the Hedera network.

## License

This smart contract is released under the MIT License. Please refer to the [LICENSE](LICENSE) file for more information.

## Contact and Sidenotes
Please contact me at bashorun115@gmail.com for clarification
I have left the tests and smart contract for Paytanium intact, just in case.