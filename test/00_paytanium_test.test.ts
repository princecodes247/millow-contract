// Import the required libraries
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import parseUSDT from "../utils/parseUSDT"
import parseUSDC from "../utils/parseUSDC"
import parseDOGE from "../utils/parseDOGE"
import parseHBAR from "../utils/parseHBAR";
import parseMATIC from "../utils/parseMATIC"


// Use a describe block to group the tests
describe("Paytanium", function () {

    let paytanium: Contract;
    let dogeToken: any;
    let usdtToken: any;
    let usdcToken: any;
    let hbarToken: any;
    let maticToken: any;
    let owner: any;
    let vendor: any;
    let customer: any;

    // Use a beforeEach hook to deploy the contract before each test
    beforeEach(async function () {

        const MockERC20 = await ethers.getContractFactory("MockERC20Token");

        // Setting the owner and a vendor address for testing
        [owner, vendor, customer] = await ethers.getSigners();

        // Deploy the mock ERC20 tokens for testing
        dogeToken = await MockERC20.deploy("Doge Token", "DOGE", customer.address, "1000", "8");
        await dogeToken.deployed();

        maticToken = await MockERC20.deploy("Matic Token", "MATIC", customer.address, "1000", "18");
        await dogeToken.deployed();

        usdtToken = await MockERC20.deploy("USDT Token", "USDT", customer.address, "1000", "6");
        await usdtToken.deployed();

        usdcToken = await MockERC20.deploy("USDC Token", "USDC", customer.address, "1000", "6");
        await usdcToken.deployed();

        hbarToken = await MockERC20.deploy("HBAR Token", "HBAR", customer.address, "1000", "8");
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
        await paytanium.deployed();;


    });

    it("should add a vendor to the address book", async function () {
        const addToAddressBook = await paytanium.addVendorToAddressBook(vendor.address);
        const vendorId = await paytanium.fetchVendorId(vendor.address);

        // Assert that the vendor is added successfully
        expect(vendorId).to.equal(1);
        await expect(addToAddressBook)
            .to.emit(paytanium, 'VendorAdded')
            .withArgs(vendor.address, 1); 
    });

    it('should allow only the owner to add a vendor to the address book', async () => {
        await expect(paytanium.connect(customer).addVendorToAddressBook(vendor.address)).to.be.revertedWith(
            'Only owner can perform this action'
        );
    });


    it("should receive Ether and update vendor's balance", async function () {

        const value = parseEther("0.001")
        // Send Ether to the contract
        await paytanium.connect(customer).payWithEther(vendor.address, { value:  value})

        // Check the vendor's Ether balance
        const balance = await paytanium.checkEtherBalance(vendor.address);
        expect(balance).to.equal(value);
    });

    it('should allow a customer to pay with Matic', async () => {
        const amount = parseMATIC("10")
        await maticToken.connect(customer).approve(paytanium.address, amount);

        await expect(paytanium.connect(customer).payWithMatic(vendor.address, { value: amount }))
            .to.emit(paytanium, 'MaticReceived')
            .withArgs(vendor.address, customer.address, amount);

        const maticBalance = await paytanium.checkMaticBalance(vendor.address);
        expect(maticBalance).to.equal(amount);
    });

    it('should allow a customer to pay with USDT', async () => {

        // Approve Paytanium to spend USDT on behalf of the customer
        await usdtToken.connect(customer).approve(paytanium.address, parseUSDT("10"));

        await expect(paytanium.connect(customer).payWithUSDT(vendor.address, { value: parseUSDT("10") }))
            .to.emit(paytanium, 'USDTReceived')
            .withArgs(vendor.address, customer.address, parseUSDT("10"));

        const usdtBalance = await paytanium.checkUSDTBalance(vendor.address);
        expect(usdtBalance).to.equal(parseUSDT("10"));
    });

    it('should allow a customer to pay with USDC', async () => {


        // Approve Paytanium to spend USDC on behalf of the customer
        await usdcToken.connect(customer).approve(paytanium.address, parseUSDC("10"));

        await expect(paytanium.connect(customer).payWithUSDC(vendor.address, { value: parseUSDC("10") }))
            .to.emit(paytanium, 'USDCReceived')
            .withArgs(vendor.address, customer.address, parseUSDT("10"));

        const usdcBalance = await paytanium.checkUSDCBalance(vendor.address);
        expect(usdcBalance).to.equal(parseUSDT("10"));
    });

    it('should allow a customer to pay with DOGE', async () => {


        // Approve Paytanium to spend DOGE on behalf of the customer
        await dogeToken.connect(customer).approve(paytanium.address, parseDOGE("10"));

        await expect(paytanium.connect(customer).payWithDOGE(vendor.address, { value: parseDOGE("10") }))
            .to.emit(paytanium, 'DogeReceived')
            .withArgs(vendor.address, customer.address, parseDOGE("10"));

        const dogeBalance = await paytanium.checkDOGEBalance(vendor.address);
        expect(dogeBalance).to.equal(parseDOGE("10"));
    });

    it('should allow a customer to pay with HBAR', async () => {

        // Approve Paytanium to spend HBAR on behalf of the customer
        await hbarToken.connect(customer).approve(paytanium.address, parseHBAR("10"));

        await expect(paytanium.connect(customer).payWithHBAR(vendor.address, { value: parseHBAR("10") }))
            .to.emit(paytanium, 'HBARReceived')
            .withArgs(vendor.address, customer.address, parseHBAR("10"));

        const hbarBalance = await paytanium.checkHBARBalance(vendor.address);
        expect(hbarBalance).to.equal(parseHBAR("10"));
    });

    it('should allow a vendor to withdraw their Ether balance', async () => {
        await paytanium.addVendorToAddressBook(vendor.address);
        await paytanium.connect(customer).payWithEther(vendor.address, { value: parseEther("10") })
        await paytanium.connect(vendor).withdrawEther(vendor.address)
        const newEtherBalance = await paytanium.checkEtherBalance(vendor.address);
        expect(newEtherBalance).to.equal(0);
    });

    it('should allow a vendor to withdraw their Matic balance', async () => {
        await paytanium.addVendorToAddressBook(vendor.address);
        await paytanium.connect(customer).payWithMatic(vendor.address, { value: parseMATIC("10") })
        
        await paytanium.connect(vendor).withdrawMatic(vendor.address)
        const newMaticBalance = await paytanium.checkMaticBalance(vendor.address);
        expect(newMaticBalance).to.equal(0);
    });

    it('should allow a vendor to withdraw their USDT balance', async () => {
        await paytanium.addVendorToAddressBook(vendor.address);
        await usdtToken.connect(customer).approve(paytanium.address, parseUSDT("10"));
        await paytanium.connect(customer).payWithUSDT(vendor.address, { value: parseUSDT("10") })

        await paytanium.connect(vendor).withdrawUSDT(vendor.address)
        const newUSDTBalance = await paytanium.checkUSDTBalance(vendor.address);
        expect(newUSDTBalance).to.equal(0);
    });

    it('should allow a vendor to withdraw their USDC balance', async () => {
        await paytanium.addVendorToAddressBook(vendor.address);
        await usdcToken.connect(customer).approve(paytanium.address, parseUSDC("10"));
        await paytanium.connect(customer).payWithUSDC(vendor.address, { value: parseUSDC("10") })

        await paytanium.connect(vendor).withdrawUSDC(vendor.address)
        const newUSDCBalance = await paytanium.checkUSDCBalance(vendor.address);
        expect(newUSDCBalance).to.equal(0);
    });

    it('should allow a vendor to withdraw their DOGE balance', async () => {
        await paytanium.addVendorToAddressBook(vendor.address);
        await dogeToken.connect(customer).approve(paytanium.address, parseDOGE("10"));
        await paytanium.connect(customer).payWithDOGE(vendor.address, { value: parseDOGE("10") })

        await paytanium.connect(vendor).withdrawDOGE(vendor.address)
        const newDOGEBalance = await paytanium.connect(vendor).checkDOGEBalance(vendor.address);
        expect(newDOGEBalance).to.equal(0);
    });

    it('should allow a vendor to withdraw their HBAR balance', async () => {
        await paytanium.addVendorToAddressBook(vendor.address);
        await hbarToken.connect(customer).approve(paytanium.address, parseHBAR("10"));
        await paytanium.connect(customer).payWithHBAR(vendor.address, { value: parseHBAR("10") })

        await paytanium.connect(vendor).withdrawHBAR(vendor.address)
        const newHBARBalance = await paytanium.checkHBARBalance(vendor.address);
        expect(newHBARBalance).to.equal(0);
    });

    it('should allow only vendors to perform vendor-only actions', async () => {
        await expect(paytanium.connect(customer).withdrawEther(vendor.address)).to.be.revertedWith(
            'Only vendors can perform this action'
        );

        await expect(paytanium.connect(customer).withdrawMatic(vendor.address)).to.be.revertedWith(
            'Only vendors can perform this action'
        );

        await expect(paytanium.connect(customer).withdrawUSDT(vendor.address)).to.be.revertedWith(
            'Only vendors can perform this action'
        );

        await expect(paytanium.connect(customer).withdrawUSDC(vendor.address)).to.be.revertedWith(
            'Only vendors can perform this action'
        );

        await expect(paytanium.connect(customer).withdrawDOGE(vendor.address)).to.be.revertedWith(
            'Only vendors can perform this action'
        );

        await expect(paytanium.connect(customer).withdrawHBAR(vendor.address)).to.be.revertedWith(
            'Only vendors can perform this action'
        );
    });

    it('should require an amount greater than zero', async () => {
        const zeroAmount = ethers.utils.parseEther('0');
        await expect(paytanium.payWithEther(vendor.address, { value: zeroAmount })).to.be.revertedWith(
            'Amount must be greater than zero'
        );

        await expect(paytanium.payWithMatic(vendor.address, { value: zeroAmount })).to.be.revertedWith(
            'Amount must be greater than zero'
        );

        await expect(paytanium.payWithUSDT(vendor.address, { value: zeroAmount })).to.be.revertedWith(
            'Amount must be greater than zero'
        );

        await expect(paytanium.payWithUSDC(vendor.address, { value: zeroAmount })).to.be.revertedWith(
            'Amount must be greater than zero'
        );

        await expect(paytanium.payWithDOGE(vendor.address, { value: zeroAmount })).to.be.revertedWith(
            'Amount must be greater than zero'
        );

        await expect(paytanium.payWithHBAR(vendor.address, { value: zeroAmount })).to.be.revertedWith(
            'Amount must be greater than zero'
        );
    });

    it('should not accept any amount less than zero', async () => {
        // Call a function that triggers reentrancy
        await expect(paytanium.payWithEther(vendor.address, { value: ethers.utils.parseEther('0') })).to.be.revertedWith(
            'Amount must be greater than zero'
        );
    });
});




