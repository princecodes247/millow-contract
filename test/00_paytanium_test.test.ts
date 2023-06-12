// Import the required libraries
import { expect } from "chai";
import { Contract} from "ethers";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";


// Use a describe block to group the tests
describe("Paytanium", function () {

    let paytanium: Contract;
    let dogeToken;
    let usdtToken;
    let usdcToken;
    let hbarToken;
    let owner: any;
    let vendor: any;
    let customer: any;

    // Use a beforeEach hook to deploy the contract before each test
    beforeEach(async function () {

        const MockERC20 = await ethers.getContractFactory("MockERC20");

        // Setting the owner and a vendor address for testing
        [owner, vendor, customer] = await ethers.getSigners();

        // Deploy the mock ERC20 tokens for testing
        dogeToken = await MockERC20.deploy("Doge Token", "DOGE", customer);
        await dogeToken.deployed();

        usdtToken = await MockERC20.deploy("USDT Token", "USDT", customer);
        await usdtToken.deployed();

        usdcToken = await MockERC20.deploy("USDC Token", "USDC", customer);
        await usdcToken.deployed();

        hbarToken = await MockERC20.deploy("HBAR Token", "HBAR", customer);
        await hbarToken.deployed();

        //so you can see the contract addresses
        console.log("Mock ERC20 tokens deployed:");
        console.log("Doge Token:", dogeToken.address);
        console.log("USDT Token:", usdtToken.address);
        console.log("USDC Token:", usdcToken.address);
        console.log("HBAR Token:", hbarToken.address);

        // Deploy the Paytanium contract and add the mock token addresses as params
        const Paytanium = await ethers.getContractFactory("Paytanium");
        paytanium = await Paytanium.deploy(
            dogeToken.address,
            usdtToken.address,
            usdcToken.address,
            hbarToken.address
        );
        await paytanium.deployed();

        
    });

    it("should add a vendor to the address book", async function () {
        await paytanium.addVendorToAddressBook(vendor.address);
        const vendorId = await paytanium.fetchVendorId(vendor.address);

        // Assert that the vendor is added successfully
        expect(vendorId).to.equal(1);
    });

    it("should receive Ether and update vendor's balance", async function () {
        const value = ethers.utils.parseEther("1.0");

        // Send Ether to the contract
        paytanium.connect(customer).payWithEther(vendor.address, {value: parseEther("0.001")})

        // Check the vendor's Ether balance
        const balance = await paytanium.checkEtherBalance();
        expect(balance).to.equal(value);
    });

    //More test cases to be continued

});
