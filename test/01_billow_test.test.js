import { ethers } from "hardhat";
import { expect } from "chai";

describe("Billow", function () {
  let billow;
  let owner;
  let buyer;
  const tokenURI = "https://example.com/token/1";

  before(async function () {
    const Billow = await ethers.getContractFactory("Billow");
    [owner, buyer] = await ethers.getSigners();

    billow = await Billow.deploy("Billow", "BIL");
    await billow.deployed();
  });

  it("should mint and list an NFT", async function () {
    await billow.mintAndList(tokenURI, ethers.utils.parseEther("1"));

    const listing = await billow.getNFTListing(1);
    expect(listing.owner).to.equal(owner.address);
    expect(listing.price).to.equal(ethers.utils.parseEther("1"));
    expect(listing.fileUrl).to.equal(tokenURI);
  });

  it("should allow a user to buy an NFT", async function () {
    const initialOwnerBalance = await owner.getBalance();

    await buyer.sendTransaction({
      to: billow.address,
      value: ethers.utils.parseEther("1"),
    });
    await billow.connect(buyer).buyNFT(1);

    const listing = await billow.getNFTListing(1);
    expect(listing.owner).to.equal(buyer.address);

    const buyerBalance = await buyer.getBalance();
    const expectedBalance = initialOwnerBalance.add(ethers.utils.parseEther("1"));
    expect(buyerBalance).to.equal(expectedBalance);
  });

  it("should set the listing price of an NFT", async function () {
    await billow.setNFTPrice(1, 0, ethers.utils.parseEther("2"));

    const listing = await billow.getNFTListing(1);
    expect(listing.price).to.equal(ethers.utils.parseEther("2"));
  });

  it("should remove an NFT listing", async function () {
    await billow.removeNFTListing(1, 0);

    expect(() => billow.getNFTListing(1)).to.throw("Invalid listing index");
  });

  it("should get the total number of listed tokens", async function () {
    await billow.mintAndList(tokenURI, ethers.utils.parseEther("1"));

    const totalListedTokens = await billow.getTotalNumberOfListedTokens();
    expect(totalListedTokens).to.equal(1);
  });

  it("should get the token URI", async function () {
    const uri = await billow.getTokenURI(1);
    expect(uri).to.equal(tokenURI);
  });
});
