//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract Paytanium {
    //token addresses
    IERC20 public dogeToken;
    IERC20 public usdtToken;
    IERC20 public usdcToken;
    IERC20 public hbarToken;

    //counts the number of vendors
    uint256 public vendorCount;

    mapping(address => uint256) public vendorERCAddressBook;

    mapping(address => uint256) public vendorEtherBalances;

    mapping(address => uint256) public vendorMaticBalances;

    mapping(address => uint256) public vendorUSDCBalances;

    mapping(address => uint256) public vendorUSDTBalances;

    mapping(address => uint256) public vendorDogeBalances;

    mapping(address => uint256) public vendorHBARBalances;

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
        vendorCount = 0;
        dogeToken = IERC20(_dogeToken);
        usdtToken = IERC20(_usdtToken);
        usdcToken = IERC20(_usdcToken);
        hbarToken = IERC20(_hbarToken);
    }

    modifier transferSuccessful(IERC20 token, uint256 amount) {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        _;
    }

    function addVendorToAddressBook(address _address) public {
        vendorERCAddressBook[_address] = vendorCount;
        emit VendorAdded(_address, vendorCount);
        vendorCount++;
    }

    function fetchVendorId(address _address) public view returns (uint256) {
        uint256 vendorId = vendorERCAddressBook[_address];
        return vendorId;
    }

    receive() external payable {
        vendorEtherBalances[msg.sender] += msg.value;
        emit EtherReceived(msg.sender, msg.value);
    }

    function receiveMatic() external payable {
        vendorMaticBalances[msg.sender] += msg.value;
        emit MaticReceived(msg.sender, msg.value);
    }

    function receiveUSDT(uint256 amount) transferSuccessful(usdtToken, amount) external {
        // require(
        //     usdtToken.transferFrom(msg.sender, address(this), amount),
        //     "Transfer failed"
        // );
        vendorUSDTBalances[msg.sender] += amount;
        emit USDTReceived(msg.sender, amount);
    }

    function receiveUSDC(uint256 amount) transferSuccessful(usdcToken, amount) external {
        // require(
        //     usdcToken.transferFrom(msg.sender, address(this), amount),
        //     "Transfer failed"
        // );
        vendorUSDCBalances[msg.sender] += amount;
        emit USDCReceived(msg.sender, amount);
    }

    function receiveDOGE(uint256 amount) transferSuccessful(dogeToken, amount) external {
        // require(
        //     dogeToken.transferFrom(msg.sender, address(this), amount),
        //     "Transfer failed"
        // );
        vendorDogeBalances[msg.sender] += amount;
        emit DogeReceived(msg.sender, amount);
    }

    function receiveHBAR(uint256 amount) transferSuccessful(hbarToken, amount) external {
        // require(
        //     hbarToken.transferFrom(msg.sender, address(this), amount),
        //     "Transfer failed"
        // );
        vendorHBARBalances[msg.sender] += amount;
        emit HBARReceived(msg.sender, amount);
    }
}
