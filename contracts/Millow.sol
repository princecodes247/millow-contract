// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface IHbarToken {
    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function getBalance(address account) external view returns (uint256);
}

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

    IHbarToken private hbarToken;

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

    constructor(
        string memory name,
        string memory symbol,
        address _hbarTokenAddress
    ) ERC721(name, symbol) {
        _tokenIdCounter = 0;
        hbarToken = IHbarToken(_hbarTokenAddress);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
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

        __transferFrom(_buyer, address(this), amount);

        //using HBAR now - transferring remaining payment to the seller
        __transfer(seller, remainingPayment);

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

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
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
        __transfer(msg.sender, commissionAmount);

        emit CommissionWithdrawn(msg.sender, commissionAmount);
    }

    function getCommissionBalance() public view onlyOwner returns (uint256) {
        // return _commissionBalances[owner];
        uint256 commissionBalance = _commissionBalances[owner()];
        return commissionBalance;
    }

    //============================================
    // GETTING HBAR TO THE CONTRACT
    //============================================
    receive() external payable {}

    fallback() external payable {}

    function __transfer(address to, uint256 value) internal returns (bool) {
        require(to != address(0), "Invalid address");
        // require(
        //     value <= hbarToken.getBalance(msg.sender),
        //     "Insufficient balance __transfer"
        // );

        hbarToken.transfer(to, value);

        // hbarToken.getBalance(msg.sender) -= value;
        // hbarToken.getBalance(to) += value;
        emit Transfer(msg.sender, to, value);

        return true;
    }

    function __transferFrom(
        address from,
        address to,
        uint256 value
    ) internal returns (bool) {
        require(from != address(0), "Invalid address");
        require(to != address(0), "Invalid address");
        require(value <= __getBalance(from), "Insufficient balance __transferFrom");
        // require(value <= allowance[from][msg.sender], "Insufficient allowance");

        // hbarToken.approve(from, value);
        hbarToken.transferFrom(from, to, value);

        // __getBalance(from) -= value;
        // __getBalance[to] += value;
        // allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);

        return true;
    }

    function __getBalance(address account) public view returns (uint256) {
        return hbarToken.getBalance(account);
    }
}
