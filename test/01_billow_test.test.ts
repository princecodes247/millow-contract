import { ethers } from "hardhat";
import { Signer, utils, Contract } from "ethers";
import { expect } from "chai";
import parseHBAR from '../utils/parseHBAR'

describe("Billow", function () {
    let billowContract: Contract;
    let hbarToken: Contract;
    let owner: any;
    let buyer: any;
    let seller: any;

    beforeEach(async function () {
        [owner, buyer, seller] = await ethers.getSigners();

        const _hbarToken = await ethers.getContractFactory("HBARSimulator");
        hbarToken = await _hbarToken.deploy(buyer.address);
        await hbarToken.deployed();

        const Billow = await ethers.getContractFactory("Billow");
        billowContract = await Billow.deploy("Billow", "BIL", hbarToken.address);
        await billowContract.deployed();

        // console.log("Billow Contract deployed to:", billowContract.address);
        // console.log("HBAR Token deployed to:", hbarToken.address);


    });

    describe("mintAndList", function () {
        it("should mint and list a new NFT", async function () {
            const currentTokenId = await billowContract.getLastUpdatedTokenId()
            const _tokenId = await billowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("100"),
                seller.address
            );

            const tokenId = _tokenId.value.toString()

            expect(await billowContract.ownerOf(tokenId)).to.equal(seller.address);

            const [ownerAddress, price, fileUrl] = await billowContract.getNFTListing(tokenId);
            expect(ownerAddress).to.equal(seller.address);
            expect(price).to.equal(parseHBAR("100"));
            expect(fileUrl).to.equal("../metadata/data.json[0]");
        });
    });

    describe("buyNFT", function () {
        let tokenId: string | number;

        beforeEach(async function () {
            const currentTokenId = await billowContract._tokenIdCounter
            const _tokenId = await billowContract.mintAndList(
                `../metadata/data.json[${currentTokenId}]`,
                parseHBAR("100"),
                seller.address
            );

            tokenId = _tokenId.value.toString()

        });

        it("should buy an NFT and transfer ownership", async function () {
            await hbarToken.connect(buyer).approve(billowContract.address, parseHBAR("100"));

            const sellerInitialBalance = await hbarToken.balanceOf(seller.address);
            const buyerInitialBalance = await hbarToken.balanceOf(buyer.address);
            const contractInitialBalance = await hbarToken.balanceOf(billowContract.address)

            await billowContract.connect(buyer).buyNFT(tokenId, parseHBAR("100"));

            const buyerLaterBalance = await hbarToken.balanceOf(buyer.address);
            const contractFinalBalance = await hbarToken.balanceOf(billowContract.address)
            const sellerLaterBalance = await hbarToken.balanceOf(seller.address);
            const newOwner = await billowContract.ownerOf(tokenId);

            expect(newOwner).to.equal(buyer.address);
            expect(Number(buyerLaterBalance)).to.equal(Number(buyerInitialBalance) - Number(parseHBAR("100")));
            expect(Number(contractFinalBalance)).to.equal(parseHBAR(`${100 * 0.05}`))
            expect(Number(sellerLaterBalance)).to.equal(Number(parseHBAR("95")));
        });
    });

    describe("resetNFTPrice", function () {
        let tokenId: string | number;

        beforeEach(async function () {
            const currentTokenId = await billowContract._tokenIdCounter
            const _tokenId = await billowContract.mintAndList(
                `../metadata/data.json[${currentTokenId}]`,
                parseHBAR("100"),
                seller.address
            );
            tokenId = _tokenId.value.toString()
        });

        it("should reset the price of an NFT", async function () {
            await billowContract.connect(seller).resetNFTPrice(tokenId, 0, parseHBAR("200"));

            const [, newPrice] = await billowContract.getNFTListing(tokenId);

            expect(newPrice).to.equal(parseHBAR("200"));
        });
    });

    // describe("removeNFTListing", function () {
    //     let tokenId: string | number;

    //     beforeEach(async function () {
    //         const currentTokenId = await billowContract._tokenIdCounter
    //         const _tokenId = await billowContract.mintAndList(
    //             `../metadata/data.json[${currentTokenId}]`,
    //             parseHBAR("100"),
    //             seller.address
    //         );
    //         tokenId = _tokenId.value.toString()
    //     });

    //     it("should remove the listing of an NFT", async function () {
    //         await billowContract.connect(seller).removeNFTListing(tokenId);

    //         // const [, price, fileUrl] = await billowContract.getNFTListing(tokenId);

    //         // expect(price).to.equal(0);
    //         // expect(fileUrl).to.equal("");
    //     });
    // });

    describe("getTotalNumberOfListedTokens", function () {
        beforeEach(async function () {
            await billowContract.mintAndList(
                `../metadata/data.json[${await billowContract._tokenIdCounter}]`,
                parseHBAR("100"),
                seller.address
            );
            await billowContract.mintAndList(
                `../metadata/data.json[${await billowContract._tokenIdCounter}]`,
                parseHBAR("100"),
                seller.address
            );
        });

        it("should return the total number of listed tokens", async function () {
            const totalListedTokens = await billowContract.getTotalNumberOfMintedTokens()
            expect(totalListedTokens).to.equal(2);
        });
    });

    describe("getTokenURI", function () {
        let tokenId: string | number;
        let currentTokenId: any

        beforeEach(async function () {
            const currentTokenId = await billowContract.getLastUpdatedTokenId()
            const _tokenId = await billowContract.mintAndList(
                `../metadata/data.json[${currentTokenId}]`,
                parseHBAR("100"),
                seller.address
            );
            tokenId = _tokenId.value.toString()
        });
        
        it("should return the token URI", async function () {
            const tokenURI = await billowContract.tokenURI(tokenId);

            expect(tokenURI).to.equal("../metadata/data.json[0]");
        });
    });
})
