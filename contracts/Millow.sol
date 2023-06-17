// SPDX-License-Identifier: GPL-3.0
// pragma solidity ^0.8.0;
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

// Compile with remix for remote imports to work - otherwise keep precompiles locally
// import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaTokenService.sol";
import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/contracts/hts-precompile/HederaTokenService.sol";
// import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaResponseCodes.sol";
import "https://github.com/hashgraph/hedera-smart-contracts/blob/main/contracts/hts-precompile/HederaResponseCodes.sol";

contract Millow is ERC721, Ownable {
    struct NFTListing {
        address owner;
        uint256 price;
        string fileUrl;
    }

    struct NFTTransaction {
        address buyer;
        address seller;
        uint256 commission;
        // Add other relevant details here
    }

    mapping(uint256 => NFTListing[]) private _nftListings;
    mapping(uint256 => NFTTransaction) private _nftTransactions;
    mapping(uint256 => string) private _tokenURIs;

    uint256 private _tokenIdCounter;
    mapping(address => uint256) private _commissionBalances;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string fileUrl,
        uint256 price
    );
    event NFTPriceSet(
        uint256 indexed tokenId,
        uint256 indexed index,
        uint256 newPrice
    );
    event NFTListingRemoved(uint256 indexed tokenId, uint256 indexed index);
    event CommissionWithdrawn(address indexed owner, uint256 amount);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _tokenIdCounter = 0;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    function mintAndList(
        string memory fileUrl,
        uint256 price,
        address seller
    ) public payable returns (uint256) {
        require(bytes(fileUrl).length > 0, "Invalid file URL");
        require(price > 0, "Invalid price");

        uint256 tokenId = _tokenIdCounter;
        _safeMint(seller, tokenId);

        setTokenURI(tokenId, fileUrl);

        _nftListings[tokenId].push(
            NFTListing({owner: seller, price: price, fileUrl: fileUrl})
        );

        _tokenIdCounter++;
        emit NFTMinted(tokenId, seller, fileUrl, price);
        return tokenId;
    }

    function getNFTListing(uint256 tokenId)
        public
        view
        returns (
            address owner,
            uint256 price,
            string memory fileUrl
        )
    {
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > 0, "Invalid listing index");

        NFTListing storage listing = _nftListings[tokenId][0];
        return (listing.owner, listing.price, listing.fileUrl);
    }

    function buyNFT(
        uint256 tokenId,
        uint256 amount,
        address _buyer
    ) public payable {
        // Check if the token exists
        require(_exists(tokenId), "Token does not exist");

        // Check if there is at least one listing for the token
        require(_nftListings[tokenId].length > 0, "Invalid listing index");

        // Get the first listing for the token
        NFTListing storage listing = _nftListings[tokenId][0];
        require(amount >= listing.price, "Insufficient payment");

        // Check if the NFT is listed for sale
        require(listing.price > 0, "NFT is not listed for sale");

        // Check if the payment amount is sufficient
        require(amount >= listing.price, "Insufficient payment");

        // Convert the listing owner address to payable
        address payable seller = payable(listing.owner);

        // Calculate the commission to be deducted from the payment
        uint256 commission = (listing.price * 5) / 100;

        // Calculate the remaining payment after deducting the commission
        uint256 remainingPayment = listing.price - commission;

        //takes HBAR from buyer
        receiveHbar(payable(_buyer), amount);

        // Transfer the remaining payment to the seller
        // seller.transfer(remainingPayment);

        //using HBAR now - transferring remaining payment to the seller
        transferHbar(seller, remainingPayment);

        // Add the commission to the commission balances
        _commissionBalances[owner()] += commission;

        // Transfer the NFT ownership from the seller to the buyer
        _transfer(seller, _buyer, tokenId);

        // Store the transaction details
        _nftTransactions[tokenId] = NFTTransaction(_buyer, seller, commission);

        // Remove the listing from the nftListings array
        if (_nftListings[tokenId].length == 1) {
            delete _nftListings[tokenId];
        } else {
            _nftListings[tokenId][0] = _nftListings[tokenId][
                _nftListings[tokenId].length - 1
            ];
            _nftListings[tokenId].pop();
        }
    }

    function resetNFTPrice(
        uint256 tokenId,
        uint256 index,
        uint256 newPrice
    ) public {
        NFTListing storage listing = _nftListings[tokenId][0];
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > index, "Invalid listing index");
        require(
            _nftListings[tokenId][index].owner == msg.sender,
            "You are not the owner of the NFT"
        );
        require(
            newPrice >= listing.price,
            "New price must be greater than or equal to current price"
        );
        require(newPrice > 0, "Invalid price");

        _nftListings[tokenId][index].price = newPrice;
        emit NFTPriceSet(tokenId, index, newPrice);
    }

    function removeNFTListing(uint256 tokenId) public {
        require(_exists(tokenId), "Token does not exist");
        require(_nftListings[tokenId].length > 0, "Invalid listing index");
        require(
            _nftListings[tokenId][0].owner == msg.sender,
            "You are not the owner of the NFT"
        );
        require(
            _nftListings[tokenId].length > 1,
            "Can't remove the only listing for a token"
        );

        if (_nftListings[tokenId].length == 1) {
            delete _nftListings[tokenId];
        } else {
            for (uint256 i = 0; i < _nftListings[tokenId].length - 1; i++) {
                _nftListings[tokenId][i] = _nftListings[tokenId][i + 1];
            }
            _nftListings[tokenId].pop();
        }

        emit NFTListingRemoved(tokenId, 0);
    }

    function getTotalNumberOfMintedTokens() public view returns (uint256) {
        uint256 totalMintedTokens = 0;
        for (uint256 tokenId = 0; tokenId <= _tokenIdCounter; tokenId++) {
            if (_nftListings[tokenId].length > 0) {
                totalMintedTokens++;
            }
        }
        return totalMintedTokens;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return _tokenURIs[tokenId];
    }

    function getLastUpdatedTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function withdrawCommission() public onlyOwner {
        uint256 commissionAmount = _commissionBalances[msg.sender];
        require(commissionAmount > 0, "No commission available for withdrawal");
        require(
            _commissionBalances[msg.sender] > 0,
            "No commission available for withdrawal"
        );

        _commissionBalances[msg.sender] = 0;
        // payable(msg.sender).transfer(commissionAmount);
        //doing this with HBAR now
        transferHbar(payable(msg.sender), commissionAmount);

        emit CommissionWithdrawn(msg.sender, commissionAmount);
    }

    function getCommissionBalance(address owner) public view returns (uint256) {
        // return _commissionBalances[owner];
        uint256 commissionBalance = getBalance(owner);
        return commissionBalance;
    }

    //============================================
    // GETTING HBAR TO THE CONTRACT
    //============================================
    receive() external payable {}

    fallback() external payable {}

    function transferHbar(address payable _receiverAddress, uint256 _amount)
        public
    {
        // Check that the recipient is not the contract itself.
        require(_receiverAddress != address(this));

        uint256 balance = getBalance(_receiverAddress);

        // Check that the sender has enough HBAR to send.
        require(balance >= _amount);
        _receiverAddress.transfer(_amount);
    }

    function getBalance(address person) public view returns (uint256) {
        return person.balance;
    }

    function receiveHbar(address payable sender, uint256 amount)
        public
        payable
    {
        // Check that the sender is not the contract itself.
        require(sender != address(this));

        uint256 balance = getBalance(sender);

        // Add the HBAR to the contract's balance.
        balance += amount;

        // Notify the sender that the HBAR has been received.
        sender.transfer(0);
    }
}
