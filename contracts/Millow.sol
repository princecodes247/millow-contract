// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Millow is ERC1155, Ownable {
    using Strings for uint256;

    using SafeMath for uint256;

    // Events
    event PartitionMinted(uint256 partitionId, string uri, uint256 price);

    event PartitionsBought(uint256[] partitionIds, address buyer);

    event PartitionAuctionStarted(uint256 partitionId, uint256 startingPrice);

    event PartitionBurned(uint256 partitionId, address owner);

    // Storage
    mapping(uint256 => mapping(uint256 => uint256)) private _tokenPartitions; // Mapping to track the partitions of each token
    mapping(uint256 => string) private _partitionURIs; // Mapping to store the URI for each partition
    mapping(uint256 => uint256) public _partitionPrices; // Mapping to store the price for each partition
    mapping(uint256 => string) private _partitionMetadata; // Mapping to store metadata for each partition
    mapping(uint256 => uint256) private _partitionsAvailableForSale; // Mapping to store metadata for each partition
    mapping(uint256 => address) private _partitionOwners; // Mapping to store the owner of each partition

    uint256 private _tokenIdCounter; // Counter to track the token ID

    IERC20 public hbarToken;

    constructor(address _hbarToken) ERC1155("") {
        _tokenIdCounter = 0;
        hbarToken = IERC20(_hbarToken);
    }

    function mintTokenWithParts(
        uint256 numPartitions,
        string memory uri,
        uint256 _pricePerPart,
        address minter
    ) public {
        require(numPartitions > 0, "Invalid number of partitions");
        require(minter == msg.sender, "Only minters can call function");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        for (uint256 i = 0; i < numPartitions; i++) {
            uint256 partitionId = tokenId * numPartitions + i;

            require(
                _tokenPartitions[tokenId][partitionId] == 0,
                "Partition ID already exists"
            );

            _tokenPartitions[tokenId][partitionId] = 1;

            _mint(minter, partitionId, 1, "");

            emit PartitionMinted(partitionId, uri, _pricePerPart);
        }
        _partitionURIs[tokenId] = uri; //all the partitions have the same url
        _partitionPrices[tokenId] = _pricePerPart; //all the partitions have the same price
        // pricePerPart[tokenId] = _pricePerPart;
        _partitionsAvailableForSale[tokenId] = numPartitions;
    }

    // Function to buy partitions
    function buyPart(
        uint256 tokenId,
        uint256 amount,
        address _seller,
        address _buyer
    ) public payable {
        // require(_tokenPartitions[tokenId][tokenId] == 1, "Invalid token ID");
        require(amount > 0, "Invalid amount");

        uint256 partitionId = SafeMath.add(SafeMath.add(tokenId.mul(_tokenIdCounter), _tokenPartitions[tokenId][tokenId]), _tokenIdCounter).sub(amount);


        uint256 availableSupply = _partitionsAvailableForSale[tokenId];
        require(availableSupply >= amount, "Insufficient supply");

        uint256 totalCost = amount * _partitionPrices[tokenId];
        require(msg.value == totalCost, "Invalid payment amount");

        uint256 commission = (getPartitionPrice(tokenId) * 5) / 100;
        require(
            hbarToken.transferFrom(
                _buyer,
                address(this),
                getPartitionPrice(tokenId)
            ),
            "Payment transfer failed"
        );

        uint256 remainingPayment = getPartitionPrice(tokenId) - commission;

        require(
            hbarToken.transfer(_seller, remainingPayment),
            "Paying seller failed"
        );

        // _tokenPartitions[tokenId][partitionId] -= amount;

        uint256[] memory partitionIds = new uint256[](amount);
        uint256[] memory amounts = new uint256[](amount);

        for (uint256 i = 0; i < amount; i++) {
            partitionIds[i] = partitionId + i;
            amounts[i] = 1;
        }

        _mintBatch(_buyer, partitionIds, amounts, "");
        uint256 remainingPartitions = _partitionsAvailableForSale[tokenId] -
            amount;
        _partitionsAvailableForSale[tokenId] = remainingPartitions;
        _partitionOwners[partitionId] = _buyer;

        emit PartitionsBought(partitionIds, _buyer);
    }

    // Function to get the URI of a partition
    function getPartitionURI(
        uint256 tokenId
    ) public view returns (string memory) {
        return _partitionURIs[tokenId]; //since all partitions have the same url
    }

    // Function to get the remaining partitions of a token
    function getRemainingPartitions(
        uint256 tokenId
    ) public view returns (uint256) {
        uint256 totalPartitions = _tokenIdCounter * 1; // Total partitions for all tokens
        uint256 remainingPartitions = 0;

        for (
            uint256 partitionId = tokenId * 1;
            partitionId < totalPartitions;
            partitionId++
        ) {
            remainingPartitions += _tokenPartitions[tokenId][partitionId];
        }

        return remainingPartitions;
    }

    //returns an array of the partitions a token has
    function getTokenPartitions(
        uint256 tokenId
    ) public view returns (uint256[] memory) {
        uint256[] memory partitions;
        uint256 count = 0;

        for (
            uint256 partitionId = tokenId * _tokenIdCounter;
            partitionId < (tokenId + 1) * _tokenIdCounter;
            partitionId++
        ) {
            if (_tokenPartitions[tokenId][partitionId] == 1) {
                count++;
            }
        }

        partitions = new uint256[](count);
        count = 0;

        for (
            uint256 partitionId = tokenId * _tokenIdCounter;
            partitionId < (tokenId + 1) * _tokenIdCounter;
            partitionId++
        ) {
            if (_tokenPartitions[tokenId][partitionId] == 1) {
                partitions[count] = partitionId;
                count++;
            }
        }

        return partitions;
    }

    //returns the number of unbought partitions in a token
    function getUnboughtPartitionCount(
        uint256 tokenId
    ) public view returns (uint256) {
        // uint256 unboughtPartitions = 0;

        // for (
        //     uint256 partitionId = tokenId * 1;
        //     partitionId < (tokenId + 1) * 1;
        //     partitionId++
        // ) {
        //     if (_tokenPartitions[tokenId][partitionId] == 1) {
        //         unboughtPartitions++;
        //     }
        // }
        // _tokenPartitionCount[tokenId]

        // return unboughtPartitions;
        return _partitionsAvailableForSale[tokenId];
    }

    // Function to get the price of a partition
    function getPartitionPrice(uint256 tokenId) public view returns (uint256) {
        return _partitionPrices[tokenId];
    }

    // Function to get the owner of a partition
    function getPartitionOwner(
        uint256 partitionId
    ) public view returns (address) {
        return _partitionOwners[partitionId];
    }

    // Function to start an auction for a partition
    function auctionPart(
        uint256 partitionId,
        uint256 startingPrice,
        address autioneer
    ) public {
        require(
            _tokenPartitions[partitionId / 100][partitionId] == 1,
            "Invalid partition ID"
        );

        require(
            autioneer == msg.sender,
            "Only the owner can start the auction"
        );

        // Additional auction logic can be implemented here
        // For simplicity, we emit an event with the details
        emit PartitionAuctionStarted(partitionId, startingPrice);
    }

    // Function to burn partitions
    function burnPartitions(uint256 amountToBurn, uint256 tokenId) public {
        uint256 partitionId = tokenId * 1; // Assuming each token has only one partition
        require(
            _tokenPartitions[tokenId][partitionId] == 1,
            "Invalid partition ID"
        );

        require(amountToBurn > 0, "Invalid amount to burn");

        uint256 remainingSupply = _partitionsAvailableForSale[tokenId];
        require(
            amountToBurn <= remainingSupply,
            "Insufficient partitions to burn"
        );

        _partitionsAvailableForSale[tokenId] -= amountToBurn;
        _burn(msg.sender, partitionId, amountToBurn);

        emit PartitionBurned(partitionId, msg.sender);
    }

    function getTokenCount() public view onlyOwner returns (uint256) {
        return _tokenIdCounter + 1;
    }
}
