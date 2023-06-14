// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Billow is ERC721 {
    struct NFTListing {
        address owner;
        uint256 price;
        string fileUrl;
    }

    mapping(uint256 => NFTListing[]) private _nftListings;

    //keeps track of minted tokens
    uint256 private _tokenIdCounter;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    /**
     * @dev Mint an NFT and list it for sale.
     * @param fileUrl The file URL associated with the NFT.
     * @param price The listing price of the NFT.
     */
    function mintAndList(string memory fileUrl, uint256 price) public {
        require(bytes(fileUrl).length > 0, "Invalid file URL"); //makes sure user is sending a string as URL
        require(price > 0, "Invalid price");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);

        //adds the newly minted NFT into a uint256 mapping for easy tracking
        _nftListings[tokenId].push(
            NFTListing({owner: msg.sender, price: price, fileUrl: fileUrl})
        );
    }

    //gets an NFT's listing
    function getNFTListing(
        uint256 tokenId
    )
        public
        view
        returns (address owner, uint256 price, string memory fileUrl)
    {
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > 0, "Invalid listing index");

        NFTListing storage listing = _nftListings[tokenId][0];
        return (listing.owner, listing.price, listing.fileUrl);
    }

    //allows a user to buy an NFt listed for sale
    function buyNFT(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > 0, "Invalid listing index");

        NFTListing storage listing = _nftListings[tokenId][0];

        require(listing.price > 0, "NFT is not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        address payable seller = payable(listing.owner);
        seller.transfer(listing.price);

        _transfer(seller, msg.sender, tokenId);

        // Remove the listing after buying
        if (_nftListings[tokenId].length == 1) {
            delete _nftListings[tokenId];
        } else {
            // Shift the array elements to remove the purchased listing
            for (uint256 i = 0; i < _nftListings[tokenId].length - 1; i++) {
                _nftListings[tokenId][i] = _nftListings[tokenId][i + 1];
            }
            _nftListings[tokenId].pop();
        }
    }

    //Allows the owner to set the listing price of an NFT.
    function setNFTPrice(
        uint256 tokenId,
        uint256 index,
        uint256 newPrice
    ) public {
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > index, "Invalid listing index");
        require(
            _nftListings[tokenId][index].owner == msg.sender,
            "You are not the owner of the NFT"
        );
        require(newPrice > 0, "Invalid price");

        _nftListings[tokenId][index].price = newPrice;
    }

    //Remove a specific listing of an NFT.
    function removeNFTListing(uint256 tokenId, uint256 index) public {
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > index, "Invalid listing index");
        require(
            _nftListings[tokenId][index].owner == msg.sender,
            "You are not the owner of the NFT"
        );

        // Remove the listing
        if (_nftListings[tokenId].length == 1) {
            delete _nftListings[tokenId];
        } else {
            // Shift the array elements to remove the listing
            for (uint256 i = index; i < _nftListings[tokenId].length - 1; i++) {
                _nftListings[tokenId][i] = _nftListings[tokenId][i + 1];
            }
            _nftListings[tokenId].pop();
        }
    }

    //call this to get the total number of tokens in the frontend, so you can run a for loop that fetches all the listings to be displayed on marketplace.
    function getTotalNumberOfListedTokens() public view returns (uint256) {
        uint256 totalListedTokens = 0;
        for (uint256 tokenId = 1; tokenId <= _tokenIdCounter; tokenId++) {
            if (_nftListings[tokenId].length > 0) {
                totalListedTokens++;
            }
        }
        return totalListedTokens;
    }

    //each of these tokens has a URI that points to a JSON file. This JSON file has a field called "category", that you can use to write the sorting logic that puts an NFT in its place.
    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenURI(tokenId);
    }
}
