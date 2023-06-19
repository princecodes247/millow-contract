import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";
import { expect } from "chai";
import parseHBAR from '../utils/parseHBAR';

describe("Millow", function () {
    let millowContract: Contract;
    let owner: any;
    let buyer: any;
    let seller: any;
    let ownerAddress: string;
    let buyerAddress: string;
    let sellerAddress: string;
    let hbarToken: any

    beforeEach(async function () {
        [owner, buyer, seller] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        buyerAddress = await buyer.getAddress();
        sellerAddress = await seller.getAddress();

        const HbarToken = await ethers.getContractFactory("HbarToken");
        hbarToken = await HbarToken.deploy("HbarToken", "HTN", 6, parseHBAR("100000"));
        await hbarToken.deployed();
        
        const Millow = await ethers.getContractFactory("Millow");
        millowContract = await Millow.deploy("Millow", "MIL", hbarToken.address);
        await millowContract.deployed();

        await hbarToken.mint(buyer.address, parseHBAR("100000000000000000"))
        
    });

    describe("mintAndList", function () {
        it("should mint and list a new NFT", async function () {
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("0.1"),
                sellerAddress
            );
            const tokenId = Number(_tokenId.value)
            
            expect(await millowContract.ownerOf(tokenId)).to.equal(sellerAddress);

            const [ownerAddress, price, fileUrl] = await millowContract.getNFTListing(tokenId);
            expect(ownerAddress).to.equal(sellerAddress);
            expect(price).to.equal(parseHBAR("0.1"));
            expect(fileUrl).to.equal(`../metadata/data.json[${currentTokenId.toString()}]`);
        });
    });

    describe("buyNFT", function () {
        let tokenId: number;

        beforeEach(async function () {
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("0.1"),
                sellerAddress
            );
            tokenId = Number(_tokenId.value)
        });

        it("should buy an NFT and transfer ownership", async function () {
            const sellerInitialBalance = await seller.getBalance();
            const buyerInitialBalance = await buyer.getBalance();

            await hbarToken.connect(buyer).approve(buyer.address, parseHBAR("0.1"))
            await millowContract.connect(buyer).buyNFT(tokenId, parseHBAR("0.1"), buyer.address);

            const buyerLaterBalance = await buyer.getBalance();
            const sellerLaterBalance = await seller.getBalance();
            const newOwner = await millowContract.ownerOf(tokenId);

            expect(newOwner).to.equal(buyerAddress);
            expect(buyerLaterBalance).to.equal(buyerInitialBalance.sub(parseHBAR("0.1")));
            expect(sellerLaterBalance).to.equal(sellerInitialBalance.add(parseHBAR("0.095")));
        });
    });

    describe("resetNFTPrice", function () {
        let tokenId: number;

        beforeEach(async function () {
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("0.1"),
                sellerAddress
            );
            tokenId = Number(_tokenId.value)
        });

        it("should reset the price of an NFT", async function () {
            await millowContract.connect(seller).resetNFTPrice(tokenId, 0, parseHBAR("0.2"));

            const [, newPrice] = await millowContract.getNFTListing(tokenId);

            expect(newPrice).to.equal(parseHBAR("0.2"));
        });
    });

    describe("getTotalNumberOfListedTokens", function () {
        beforeEach(async function () {
            await millowContract.mintAndList(
                `../metadata/data.json[${await millowContract.getTotalNumberOfMintedTokens() - 1}]`,
                ethers.utils.parseEther("100"),
                sellerAddress
            );
            await millowContract.mintAndList(
                `../metadata/data.json[${await millowContract.getTotalNumberOfMintedTokens() - 1}]`,
                ethers.utils.parseEther("100"),
                sellerAddress
            );
        });

        it("should return the total number of listed tokens", async function () {
            const totalListedTokens = await millowContract.getTotalNumberOfMintedTokens();
            expect(totalListedTokens).to.equal(2);
        });
    });

    describe("getTokenURI", function () {
        let tokenId: number;

        beforeEach(async function () {
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                ethers.utils.parseEther("100"),
                sellerAddress
            );
            tokenId = Number(_tokenId.value)
        });

        it("should return the token URI", async function () {
            const tokenURI = await millowContract.tokenURI(tokenId);

            expect(tokenURI).to.equal(`../metadata/data.json[${tokenId.toString()}]`);
        });
    });

    describe("withdrawCommission", function () {
        it("should allow the contract owner to withdraw accumulated commission", async function () {
            // Mint and list a new NFT
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("0.1"),
                sellerAddress
            );
            const tokenId = Number(_tokenId.value)

            await hbarToken.connect(buyer).approve(buyer.address, parseHBAR("0.1") )
            await millowContract.connect(buyer).buyNFT(tokenId, parseHBAR("0.1"), buyer.address);

            // Withdraw the accumulated commission by the contract owner
            await millowContract.connect(owner).withdrawCommission();

            const ownerLaterBalance = await owner.getBalance();
            const commissionBalance = await millowContract.getCommissionBalance();

            expect(commissionBalance).to.equal(0);
            expect(ownerLaterBalance).to.equal(parseHBAR("0.005"));
        });

        it("should not allow non-owners to withdraw accumulated commission", async function () {
            // Mint and list a new NFT
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("0.1"),
                sellerAddress
            );
            const tokenId = Number(_tokenId.value)

            // await hbarToken.connect(buyer).approve(buyer.address, parseHBAR("0.1") )
            await millowContract.connect(buyer).buyNFT(tokenId, parseHBAR("0.1"), buyer.address);

            // Attempt to withdraw the accumulated commission by a non-owner account
            await expect(millowContract.connect(buyer).withdrawCommission()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });
    });

    describe("getCommissionBalance", function () {
        it("should return the commission balance for the contract owner", async function () {
            // Mint and list a new NFT
            const currentTokenId = await millowContract.getLastUpdatedTokenId();
            const _tokenId = await millowContract.mintAndList(
                `../metadata/data.json[${currentTokenId.toString()}]`,
                parseHBAR("0.1"),
                sellerAddress
            );
            const tokenId = Number(_tokenId.value)

            await hbarToken.connect(buyer).approve(buyer.address, parseHBAR("0.1") )
            await millowContract.connect(buyer).buyNFT(tokenId, parseHBAR("0.1"), buyer.address);

            // Check the commission balance for the contract owner
            const commissionBalance = await millowContract.connect(owner).getCommissionBalance();

            expect(commissionBalance).to.equal(parseHBAR("0.005")); // Assuming 10% commission rate
        });

        it("should return zero commission balance for a non-owner account", async function () {
            const commissionBalance = await millowContract.getCommissionBalance();

            expect(commissionBalance).to.equal(0);
        });
    });
});
