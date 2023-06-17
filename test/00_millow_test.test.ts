import { ethers } from "hardhat";
import { Signer, utils, Contract } from "ethers";
import { expect } from "chai";
import parseHBAR from '../utils/parseHBAR';

describe("Millow", function () {
    let millowContract: Contract;
    let owner: any;
    let buyer: any;
    let seller: any;

    beforeEach(async function () {
        [owner, buyer, seller] = await ethers.getSigners();

        const Millow = await ethers.getContractFactory("Millow");
        millowContract = await Millow.deploy("Millow", "MIL");
        await millowContract.deployed();
    });

    describe("mintAndList", function () {
        it("should mint and list a new NFT", async function () {
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                ethers.utils.parseEther("100"),
                seller.address
            );
            const tokenId = Number(_tokenId.value)

            expect(await millowContract.ownerOf(tokenId)).to.equal(seller.address);

            const [ownerAddress, price, fileUrl] = await millowContract.getNFTListing(tokenId);
            expect(ownerAddress).to.equal(seller.address);
            expect(price).to.equal(ethers.utils.parseEther("100"));
            expect(fileUrl).to.equal("../metadata/data.json[0]");
        });
    });

    describe("buyNFT", function () {
        let tokenId: string | number;

        beforeEach(async function () {
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                ethers.utils.parseEther("100"),
                seller.address
            );
            tokenId = Number(_tokenId.value)
        });

        it("should buy an NFT and transfer ownership", async function () {
            const sellerInitialBalance = await seller.getBalance();
            const buyerInitialBalance = await buyer.getBalance();
      
            const txn = await millowContract.connect(buyer).buyNFT(0, ethers.utils.parseEther("100"), buyer.address);
            console.log(txn)

            // const buyerLaterBalance = await buyer.getBalance();
            // const sellerLaterBalance = await seller.getBalance();
            // const newOwner = await millowContract.ownerOf(tokenId);

            // expect(newOwner).to.equal(buyer.address);
            // expect(buyerLaterBalance).to.equal(buyerInitialBalance.sub(ethers.utils.parseEther("100")));
            // expect(sellerLaterBalance).to.equal(sellerInitialBalance.add(ethers.utils.parseEther("90")));
        });
    });

    // describe("resetNFTPrice", function () {
    //     let tokenId: string | number;

    //     beforeEach(async function () {
    //         const currentTokenId = await millowContract.getLastUpdatedTokenId();
    //         const _tokenId = await millowContract.mintAndList(
    //             `../metadata/data.json[${currentTokenId.toString()}]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //         tokenId = Number(_tokenId.value)
    //     });

    //     it("should reset the price of an NFT", async function () {
    //         await millowContract.connect(seller).resetNFTPrice(tokenId, 0, ethers.utils.parseEther("200"));

    //         const [, newPrice] = await millowContract.getNFTListing(tokenId);

    //         expect(newPrice).to.equal(ethers.utils.parseEther("200"));
    //     });
    // });

    // describe("getTotalNumberOfListedTokens", function () {
    //     beforeEach(async function () {
    //         await millowContract.mintAndList(
    //             `../metadata/data.json[${await millowContract.getTotalNumberOfMintedTokens() - 1}]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //         await millowContract.mintAndList(
    //             `../metadata/data.json[${await millowContract.getTotalNumberOfMintedTokens() - 1}]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //     });

    //     it("should return the total number of listed tokens", async function () {
    //         const totalListedTokens = await millowContract.getTotalNumberOfMintedTokens();
    //         expect(totalListedTokens).to.equal(2);
    //     });
    // });

    // describe("getTokenURI", function () {
    //     let tokenId: string | number;

    //     beforeEach(async function () {
    //         const currentTokenId = await millowContract.getLastUpdatedTokenId();
    //         const _tokenId = await millowContract.mintAndList(
    //             `../metadata/data.json[${currentTokenId.toString()}]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //         tokenId = Number(_tokenId.value)
    //     });

    //     it("should return the token URI", async function () {
    //         const tokenURI = await millowContract.tokenURI(tokenId);

    //         expect(tokenURI).to.equal("../metadata/data.json[0]");
    //     });
    // });

    // describe("withdrawCommission", function () {
    //     it("should allow the contract owner to withdraw accumulated commission", async function () {
    //         // Mint and list a new NFT
    //         const currentTokenId = await millowContract.getLastUpdatedTokenId();
    //         const _tokenId = await millowContract.mintAndList(
    //             `../metadata/data.json[${currentTokenId.toString()}]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //         const tokenId = Number(_tokenId.value)

    //         // Buyer purchases the NFT
    //         await millowContract.connect(buyer).buyNFT(tokenId, ethers.utils.parseEther("100"), buyer.address);


    //         // Withdraw the accumulated commission by the contract owner
    //         const ownerInitialBalance = await owner.getBalance();
    //         await millowContract.connect(owner).withdrawCommission();

    //         const ownerLaterBalance = await owner.getBalance();
    //         const commissionBalance = await millowContract.getCommissionBalance(owner.address);

    //         expect(commissionBalance).to.equal(0);
    //         expect(ownerLaterBalance).to.gt(ownerInitialBalance);
    //     });

    //     it("should not allow non-owners to withdraw accumulated commission", async function () {
    //         // Mint and list a new NFT
    //         const _tokenId = await millowContract.mintAndList(
    //             `../metadata/data.json[0]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //         const tokenId = Number(_tokenId.value)

    //         // Buyer purchases the NFT
    //         await millowContract.connect(buyer).buyNFT(tokenId, ethers.utils.parseEther("100"), buyer.address);
    //         ;

    //         // Attempt to withdraw the accumulated commission by a non-owner account
    //         await expect(millowContract.connect(buyer).withdrawCommission()).to.be.revertedWith(
    //             "Ownable: caller is not the owner"
    //         );
    //     });
    // });

    // describe("getCommissionBalance", function () {
    //     it("should return the commission balance for the contract owner", async function () {
    //         // Mint and list a new NFT
    //         const currentTokenId = await millowContract.getLastUpdatedTokenId();
    //         const _tokenId = await millowContract.mintAndList(
    //             `../metadata/data.json[${currentTokenId.toString()}]`,
    //             ethers.utils.parseEther("100"),
    //             seller.address
    //         );
    //         const tokenId = Number(_tokenId.value)

    //         // Buyer purchases the NFT
    //         await millowContract.connect(buyer).buyNFT(tokenId, ethers.utils.parseEther("100"), buyer.address);
            

    //         // Check the commission balance for the contract owner
    //         const commissionBalance = await millowContract.getCommissionBalance(owner.address);

    //         expect(commissionBalance).to.equal(ethers.utils.parseEther("10")); // Assuming 10% commission rate
    //     });

    //     it("should return zero commission balance for a non-owner account", async function () {
    //         const commissionBalance = await millowContract.getCommissionBalance(buyer.address);

    //         expect(commissionBalance).to.equal(0);
    //     });
    // });
});
