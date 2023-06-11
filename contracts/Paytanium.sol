//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract Paytanium {

    address public owner;

    // state variable to check reentrancy guard
    bool private locked;

    //token addresses
    IERC20 public dogeToken;
    IERC20 public usdtToken;
    IERC20 public usdcToken;
    IERC20 public hbarToken;

    //counts the number of vendors and assigns IDs
    uint256 public vendorCount;

    //vendor address book
    mapping(address => uint256) public vendorERCAddressBook;

    // struct containing specific coin balance fields
    struct TokenBalances {
        uint256 etherBalance;
        uint256 maticBalance;
        uint256 usdcBalance;
        uint256 usdtBalance;
        uint256 dogeBalance;
        uint256 hbarBalance;
    }

    // mapping that utilizes this struct
    mapping(address => TokenBalances) public vendorBalances;

    //events
    event VendorAdded(address _address, uint256);
    event EtherReceived(address indexed vendor, uint256 amount);
    event MaticReceived(address indexed vendor, uint256 amount);
    event USDTReceived(address indexed vendor, uint256 amount);
    event USDCReceived(address indexed vendor, uint256 amount);
    event DogeReceived(address indexed vendor, uint256 amount);
    event HBARReceived(address indexed vendor, uint256 amount);

    constructor(
        address _dogeToken,
        address _usdtToken,
        address _usdcToken,
        address _hbarToken
    ) {
        owner = msg.sender;
        vendorCount = 0;
        dogeToken = IERC20(_dogeToken);
        usdtToken = IERC20(_usdtToken);
        usdcToken = IERC20(_usdcToken);
        hbarToken = IERC20(_hbarToken);
    }

    
    //modifier to make sure that a transfer is successful, before updating a vendor's balance
    modifier transferSuccessful(IERC20 token, uint256 amount) {
        require(!locked, "Reentrancy guard");
        locked = true;
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        locked = false;
        _;
    }

    modifier greaterThanZero(uint256 amount){
        require(amount > 0, "Amount must be greater than zero");
        _;
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // function that adds a vendor to the address book
    function addVendorToAddressBook(address _address) onlyOwner public {
        vendorERCAddressBook[_address] = vendorCount;
        emit VendorAdded(_address, vendorCount);
        vendorCount++;
    }

    //function that allows a vendor (or anyone) to see their ID
    function fetchVendorId(address _address) public view returns (uint256) {
        uint256 vendorId = vendorERCAddressBook[_address];
        return vendorId;
    }

    // function to receive ether
    receive() greaterThanZero(msg.value) external payable {
        vendorBalances[msg.sender].etherBalance += msg.value;
        emit EtherReceived(msg.sender, msg.value);
    }

    // function to receive matic
    function payWithMatic() greaterThanZero(msg.value) external payable {
        vendorBalances[msg.sender].maticBalance += msg.value;
        emit MaticReceived(msg.sender, msg.value);
    }

    // function to receive USDT
    function payWithUSDT(
        uint256 amount
    ) external payable transferSuccessful(usdtToken, amount) greaterThanZero(msg.value) {
        vendorBalances[msg.sender].etherBalance += msg.value;
        emit USDTReceived(msg.sender, amount);
    }

    // function to receive USDC
    function payWithUSDC(
        uint256 amount
    ) external payable transferSuccessful(usdcToken, amount) greaterThanZero(msg.value) {
        vendorBalances[msg.sender].etherBalance += msg.value;
        emit USDCReceived(msg.sender, amount);
    }

    // function to receive dogecoin
    function payWithDOGE(
        uint256 amount
    ) external payable transferSuccessful(dogeToken, amount) greaterThanZero(msg.value) {
        vendorBalances[msg.sender].etherBalance += msg.value;
        emit DogeReceived(msg.sender, amount);
    }

    // function to receive HBAR
    function payWithHBAR(
        uint256 amount
    ) external payable transferSuccessful(hbarToken, amount) greaterThanZero(msg.value) {
        vendorBalances[msg.sender].etherBalance += msg.value;
        emit HBARReceived(msg.sender, amount);
    }

    function withdrawEther() external {
        uint256 balance = vendorBalances[msg.sender].etherBalance;
        require(balance > 0, "No Ether balance to withdraw");

        vendorBalances[msg.sender].etherBalance = 0;
        payable(msg.sender).transfer(balance);
    }

    function withdrawMatic() external {
        uint256 balance = vendorBalances[msg.sender].maticBalance;
        require(balance > 0, "No Matic balance to withdraw");

        vendorBalances[msg.sender].maticBalance = 0;
        payable(msg.sender).transfer(balance);
    }

    function withdrawUSDT() external {
        uint256 balance = vendorBalances[msg.sender].usdtBalance;
        require(balance > 0, "No USDT balance to withdraw");

        vendorBalances[msg.sender].usdtBalance = 0;
        require(usdtToken.transfer(msg.sender, balance), "USDT transfer failed");
    }

    function withdrawUSDC() external {
        uint256 balance = vendorBalances[msg.sender].usdcBalance;
        require(balance > 0, "No USDC balance to withdraw");

        vendorBalances[msg.sender].usdcBalance = 0;
        require(usdcToken.transfer(msg.sender, balance), "USDC transfer failed");
    }

    function withdrawDOGE() external {
        uint256 balance = vendorBalances[msg.sender].dogeBalance;
        require(balance > 0, "No DOGE balance to withdraw");

        vendorBalances[msg.sender].dogeBalance = 0;
        require(dogeToken.transfer(msg.sender, balance), "DOGE transfer failed");
    }

    function withdrawHBAR() external {
        uint256 balance = vendorBalances[msg.sender].hbarBalance;
        require(balance > 0, "No HBAR balance to withdraw");

        vendorBalances[msg.sender].hbarBalance = 0;
        require(hbarToken.transfer(msg.sender, balance), "HBAR transfer failed");
    }

}
