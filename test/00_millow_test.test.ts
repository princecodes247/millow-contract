

import { ethers } from "hardhat";
import { Signer, utils, Contract } from "ethers";
import { expect } from "chai";
import parseHBAR from '../utils/parseHBAR'

// describe('Millow - Minting', function () {
//     let millow: Contract;
//     let hbarToken: Contract;
//     let owner: any;
//     let seller: any;
//     let buyer: any;

//     before(async function () {
//         [owner, seller, buyer] = await ethers.getSigners();

//         const HBARToken = await ethers.getContractFactory('HBARSimulator');
//         hbarToken = await HBARToken.deploy(buyer.address);

//         const Millow = await ethers.getContractFactory('Millow');
//         millow = await Millow.deploy(hbarToken.address);
//     });

//     it('should mint tokens with partitions', async function () {
//         // Mint tokens with partitions
//         const tokenCount = await millow.getTokenCount()
//         const tokenId = Number(tokenCount) - 1; //minus to make up for indexing from 0
//         await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

//         // Check the partition details
//         const uri = await millow.getPartitionURI(tokenId);
//         const price = await millow.getPartitionPrice(tokenId);
//         const remainingPartitions = await millow.getUnboughtPartitionCount(tokenId);

//         expect(uri).to.equal(`../metadata/data.json[${tokenId.toString()}]`);
//         expect(price).to.equal(parseHBAR("100"));
//         expect(Number(remainingPartitions)).to.equal(5);
//     });

//     it('should reduce unbought token count on buy', async function () {
//         // Mint tokens with partitions
//         const tokenCount = await millow.getTokenCount()
//         const tokenId = Number(tokenCount) - 1; //minus to make up for indexing from 0
//         await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

//         //approve contract to spend buyer tokens, and buy
//         await hbarToken.connect(buyer).approve(millow.address, parseHBAR("100"));
//         await millow.connect(buyer).buyPart(tokenId, 1, seller.address, buyer.address, { value: parseHBAR("100") });

//         // Check the partition details
//         const remainingPartitions = await millow.getUnboughtPartitionCount(tokenId);

//         expect(Number(remainingPartitions)).to.equal(4);
//     });

//     it('should revert when minting with invalid number of partitions', async function () {
//         await expect(
//             millow.connect(seller).mintTokenWithParts(0, "../metadata/data.json", parseHBAR("100"), seller.address)
//         ).to.be.revertedWith('Invalid number of partitions');
//     });

//     it('should revert when minting with non-minter caller', async function () {
//         await expect(
//             millow.connect(buyer).mintTokenWithParts(5, "../metadata/data.json", parseHBAR("100"), seller.address)
//         ).to.be.revertedWith('Only minters can call function');
//     });
// });

// describe('Millow - Auction', function () {
//     let millow: Contract;
//     let hbarToken: Contract;
//     let owner: any;
//     let seller: any;
//     let buyer: any;

//     before(async function () {
//         [owner, seller, buyer] = await ethers.getSigners();

//         const HBARToken = await ethers.getContractFactory('HBARSimulator');
//         hbarToken = await HBARToken.deploy(buyer.address);

//         const Millow = await ethers.getContractFactory('Millow');
//         millow = await Millow.deploy(hbarToken.address);
//     });

//     it('should start an auction for a partition', async function () {
//         // Mint tokens with partitions
//         await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${0}]`, parseHBAR("100"), seller.address);

//         //approve contract to spend buyer tokens, and buy
//         await hbarToken.connect(buyer).approve(millow.address, parseHBAR("100"));
//         await millow.connect(buyer).buyPart(0, 1, seller.address, buyer.address, { value: parseHBAR("100") });

//         const partitionIdArray = await millow.connect(buyer).getTokenPartitions(0);

//         const partitionOwner = await millow.connect(buyer).getPartitionOwner(Number(partitionIdArray[0]));

//         // Start an auction
//         await millow.connect(buyer).auctionPart(Number(partitionIdArray[0]), parseHBAR("200"), buyer.address);

//         expect(partitionOwner).to.equal(buyer.address);
//     });

//     it('should revert when starting an auction with invalid partition ID', async function () {
//         await expect(
//             millow.connect(buyer).auctionPart(999, parseHBAR("200"), buyer.address)
//         ).to.be.revertedWith('Invalid partition ID');
//     });

//     it('should revert when starting an auction as non-owner', async function () {
//         // Mint tokens with partitions
//         const tokenCount = await millow.getTokenCount();
//         const tokenId = Number(tokenCount) - 1;
//         await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

//         await expect(
//             millow.connect(buyer).auctionPart(tokenId, parseHBAR("200"), seller.address)
//         ).to.be.revertedWith('Only the owner can start the auction');
//     });

// });

describe('Millow - Buying', function () {
    let millow: Contract;
    let hbarToken: Contract;
    let owner: any;
    let seller: any;
    let buyer: any;

    before(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        const HBARToken = await ethers.getContractFactory('HBARSimulator');
        hbarToken = await HBARToken.deploy(buyer.address);

        const Millow = await ethers.getContractFactory('Millow');
        millow = await Millow.deploy(hbarToken.address);
    });

    it('should revert when buying with insufficient payment', async function () {
        // Mint tokens with partitions
        const tokenCount = await millow.getTokenCount();
        const tokenId = Number(tokenCount) - 1;
        await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

        await expect(
            millow.connect(buyer).buyPart(tokenId, 1, seller.address, buyer.address, { value: parseHBAR("50") })
        ).to.be.revertedWith('Invalid payment amount');
    });

    // it('should revert when buying with insufficient supply', async function () {
    //     // Mint tokens with partitions
    //     const tokenCount = await millow.getTokenCount();
    //     const tokenId = Number(tokenCount) - 1;
    //     // Mint tokens with partitions
    //     await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

    //     //approve contract to spend buyer tokens, and buy
    //     await hbarToken.connect(buyer).approve(millow.address, parseHBAR("100"));
    //     const buyTransaction = await millow.connect(buyer).buyPart(tokenId, 6, seller.address, buyer.address, { value: parseHBAR("600") });


    //     await expect(
    //         buyTransaction
    //     ).to.be.revertedWith('Insufficient supply');
    // });

    // Add more test cases for buying as needed
});

describe('Millow - Burning', function () {
    let millow: Contract;
    let hbarToken: Contract;
    let owner: any;
    let seller: any;
    let buyer: any;

    before(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        const HBARToken = await ethers.getContractFactory('HBARSimulator');
        hbarToken = await HBARToken.deploy(buyer.address);

        const Millow = await ethers.getContractFactory('Millow');
        millow = await Millow.deploy(hbarToken.address);
    });

    it('should burn partitions', async function () {
        // Mint tokens with partitions
        const tokenCount = await millow.getTokenCount();
        const tokenId = Number(tokenCount) - 1; //minus to make up for indexing from 0
        await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

        // Burn partitions
        await millow.connect(buyer).burnPartitions(2, 0);

        // Check the remaining partitions
        const remainingPartitions = await millow.getRemainingPartitions(0);
        expect(remainingPartitions).to.equal(4);
    });

    it('should revert when burning with invalid amount', async function () {
        // Mint tokens with partitions
        const tokenCount = await millow.getTokenCount();
        const tokenId = Number(tokenCount) - 1;
        await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

        await expect(
            millow.connect(buyer).burnPartitions(0, tokenId)
        ).to.be.revertedWith('Invalid amount to burn');
    });

    it('should revert when burning with insufficient partitions', async function () {
        // Mint tokens with partitions
        const tokenCount = await millow.getTokenCount();
        const tokenId = Number(tokenCount) - 1;
        await millow.connect(seller).mintTokenWithParts(5, `../metadata/data.json[${tokenId}]`, parseHBAR("100"), seller.address);

        await expect(
            millow.connect(buyer).burnPartitions(6, tokenId)
        ).to.be.revertedWith('Insufficient partitions to burn');
    });

});

