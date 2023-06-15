# Billow Real Estate Dapp Smart Contract

This smart contract is designed to power a real estate decentralized application (Dapp) on the Hedera network. Each non-fungible token (NFT) minted by this contract represents a unique piece of real estate.

## Prerequisites

- Solidity version: ^0.8.0
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) library
- Hedera Token Contract ABI (for HBAR token interaction)

## Contract Details

The smart contract `Billow` extends the ERC721 and Ownable contracts from the OpenZeppelin library. It manages the minting, listing, and trading of real estate NFTs. Here are the main features and functions of the contract:

### Structures

- `NFTListing`: Contains information about a real estate NFT listing, including the owner, price, and file URL.
- `NFTTransaction`: Represents a completed transaction, storing details of the buyer, seller, and commission.

### State Variables

- `_nftListings`: Maps token IDs to an array of NFT listings associated with each token.
- `_nftTransactions`: Maps token IDs to NFT transactions.
- `_tokenURIs`: Maps token IDs to their corresponding token URIs.
- `_tokenIdCounter`: Tracks the total number of minted tokens.
- `hbarToken`: An interface to the HBAR token contract.

### Events

- `NFTMinted`: Emitted when a new NFT is minted, providing the token ID, owner, file URL, and price.
- `NFTPriceSet`: Emitted when the price of an NFT is updated, providing the token ID, index, and new price.
- `NFTListingRemoved`: Emitted when an NFT listing is removed, providing the token ID and index.

### Functions

- `mintAndList`: Mints a new NFT and adds it to the listing, specifying the file URL and price.
- `getNFTListing`: Retrieves the details of the first listing associated with a token ID.
- `buyNFT`: Allows a user to purchase an NFT by transferring the payment from the buyer to the seller, while deducting a commission.
- `resetNFTPrice`: Updates the price of an NFT listing, provided the caller is the owner of the NFT.
- `removeNFTListing`: Removes an NFT listing, restricting access to the owner of the NFT.
- `getTotalNumberOfMintedTokens`: Returns the total number of minted tokens.
- `tokenURI`: Overrides the ERC721 `tokenURI` function to retrieve the token URI associated with a token ID.
- `getLastUpdatedTokenId`: Returns the token ID of the last minted token.

## Deployment

1. This contract is meant to be deployed on the Hedera network.
2. In case you are not me and you need to deploy, pass the required constructor parameters: `name`, `symbol`, and the address of the HBAR token contract.
3. Once deployed, the contract is ready to be used in your real estate Dapp.

## Notes

- Again, in case you are not me, ensure that the `Billow` contract is deployed on the Hedera network.
- I have created a mock Hedera (HBAR) token that simulates the behaviour of the real deal, for testing purposes.
- To integrate this smart contract with your Dapp frontend or other systems, consult the test files i wrote, for guidelines and tips you can copy, to call the contract functions.

For more information and usage examples, refer to the comments within the contract code.