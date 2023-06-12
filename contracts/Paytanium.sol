// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

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
    event EtherReceived(address indexed vendor, address customer, uint256 amount);
    event MaticReceived(address indexed vendor, address customer, uint256 amount);
    event USDTReceived(address indexed vendor, address customer, uint256 amount);
    event USDCReceived(address indexed vendor, address customer, uint256 amount);
    event DogeReceived(address indexed vendor, address customer, uint256 amount);
    event HBARReceived(address indexed vendor, address customer, uint256 amount);

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
        _;
        locked = false;
    }

    modifier greaterThanZero(uint256 amount) {
        require(amount > 0, "Amount must be greater than zero");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyVendor() {
    require(vendorERCAddressBook[msg.sender] != 0, "Only vendors can perform this action");
    _;
}

    // function that adds a vendor to the address book
    function addVendorToAddressBook(address _address) public onlyOwner {
        vendorERCAddressBook[_address] = vendorCount;
        emit VendorAdded(_address, vendorCount);

        // Initialize token balances to zero for the newly added vendor
        vendorBalances[_address] = TokenBalances(0, 0, 0, 0, 0, 0);

        vendorCount++;
    }

    //function that allows a vendor (or anyone) to see their ID
    function fetchVendorId(address _address) public view returns (uint256) {
        uint256 vendorId = vendorERCAddressBook[_address];
        return vendorId;
    }

    // function to receive ether
    // receive() external payable greaterThanZero(msg.value) {
    //     vendorBalances[msg.sender].etherBalance += msg.value;
    //     emit EtherReceived(msg.sender, msg.value);
    // }

//function to receive ether
    function payWithEther(address vendorAddress) external payable greaterThanZero(msg.value){
        vendorBalances[vendorAddress].etherBalance += msg.value;
        emit EtherReceived(vendorAddress, msg.sender, msg.value);
    }

    // function to receive matic
    // function to receive matic
    function payWithMatic(address vendorAddress) external payable greaterThanZero(msg.value) {
        vendorBalances[vendorAddress].maticBalance += msg.value;
        emit MaticReceived(vendorAddress, msg.sender, msg.value);
    }

    // function to receive USDT
    function payWithUSDT(
        address vendorAddress
    )
        external
        payable
        transferSuccessful(usdtToken, msg.value)
        greaterThanZero(msg.value)
    {
        vendorBalances[vendorAddress].usdtBalance += msg.value;
        emit USDTReceived(vendorAddress, msg.sender, msg.value);
    }

    // function to receive USDC
    function payWithUSDC(
        address vendorAddress
    )
        external
        payable
        transferSuccessful(usdcToken, msg.value)
        greaterThanZero(msg.value)
    {
        vendorBalances[vendorAddress].usdcBalance += msg.value;
        emit USDCReceived(vendorAddress, msg.sender, msg.value);
    }

    // function to receive dogecoin
    function payWithDOGE(
        address vendorAddress
    )
        external
        payable
        transferSuccessful(dogeToken, msg.value)
        greaterThanZero(msg.value)
    {
        vendorBalances[vendorAddress].dogeBalance += msg.value;
        emit DogeReceived(vendorAddress, msg.sender, msg.value);
    }

    // function to receive HBAR
    function payWithHBAR(
        address vendorAddress
    )
        external
        payable
        transferSuccessful(hbarToken, msg.value)
        greaterThanZero(msg.value)
    {
        vendorBalances[msg.sender].hbarBalance += msg.value;
        emit HBARReceived(vendorAddress, msg.sender, msg.value);
    }

    //allows the vendor to withdraw their ether balance
    function withdrawEther() onlyVendor() external {
        uint256 balance = vendorBalances[msg.sender].etherBalance;
        require(balance > 0, "No Ether balance to withdraw");

        vendorBalances[msg.sender].etherBalance = 0;
        payable(msg.sender).transfer(balance);
    }

    //allows the vendor to withdraw their matic balance
    function withdrawMatic() onlyVendor() external {
        uint256 balance = vendorBalances[msg.sender].maticBalance;
        require(balance > 0, "No Matic balance to withdraw");

        vendorBalances[msg.sender].maticBalance = 0;
        payable(msg.sender).transfer(balance);
    }

    //allows the vendor to withdraw their USDT
    function withdrawUSDT() onlyVendor() external {
        uint256 balance = vendorBalances[msg.sender].usdtBalance;
        require(balance > 0, "No USDT balance to withdraw");

        vendorBalances[msg.sender].usdtBalance = 0;
        require(
            usdtToken.transfer(msg.sender, balance),
            "USDT transfer failed"
        );
    }

    //allows the vendor to withdraw their USDC
    function withdrawUSDC() onlyVendor() external {
        uint256 balance = vendorBalances[msg.sender].usdcBalance;
        require(balance > 0, "No USDC balance to withdraw");

        vendorBalances[msg.sender].usdcBalance = 0;
        require(
            usdcToken.transfer(msg.sender, balance),
            "USDC transfer failed"
        );
    }

    //allows the vendor to withdraw their ether balance
    function withdrawDOGE() onlyVendor() external {
        uint256 balance = vendorBalances[msg.sender].dogeBalance;
        require(balance > 0, "No DOGE balance to withdraw");

        vendorBalances[msg.sender].dogeBalance = 0;
        require(
            dogeToken.transfer(msg.sender, balance),
            "DOGE transfer failed"
        );
    }

    //allows the vendor to withdraw their HBAR
    function withdrawHBAR() onlyVendor() external {
        uint256 balance = vendorBalances[msg.sender].hbarBalance;
        require(balance > 0, "No HBAR balance to withdraw");

        vendorBalances[msg.sender].hbarBalance = 0;
        require(
            hbarToken.transfer(msg.sender, balance),
            "HBAR transfer failed"
        );
    }

    // function to check vendor's ether balance
    function checkEtherBalance() external view returns (uint256) {
        return vendorBalances[msg.sender].etherBalance;
    }

    // function to check vendor's matic balance
    function checkMaticBalance() external view returns (uint256) {
        return vendorBalances[msg.sender].maticBalance;
    }

    // function to check vendor's USDT balance
    function checkUSDTBalance() external view returns (uint256) {
        return vendorBalances[msg.sender].usdtBalance;
    }

    // function to check vendor's USDC balance
    function checkUSDCBalance() external view returns (uint256) {
        return vendorBalances[msg.sender].usdcBalance;
    }

    // function to check vendor's DOGE balance
    function checkDOGEBalance() external view returns (uint256) {
        return vendorBalances[msg.sender].dogeBalance;
    }

    // function to check vendor's HBAR balance
    function checkHBARBalance() external view returns (uint256) {
        return vendorBalances[msg.sender].hbarBalance;
    }
}
