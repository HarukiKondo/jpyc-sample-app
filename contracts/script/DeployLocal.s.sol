// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";

// MockJPYC - 実際のJPYCの主要な関数を模擬したERC20トークン
contract MockJPYC {
    string public name = "JPY Coin";
    string public symbol = "JPYC";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public nonces;
    
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant PERMIT_TYPEHASH = 
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        // 初期供給量 1,000,000 JPYC
        totalSupply = 1_000_000 * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        
        // EIP-712 Domain Separator
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
        
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    // EIP-2612 Permit機能
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(deadline >= block.timestamp, "PERMIT_DEADLINE_EXPIRED");
        
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline))
            )
        );
        
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, "INVALID_SIGNER");
        
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
    
    // テスト用：指定したアドレスにトークンをミント
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    // テスト用：複数のアドレスに一度にトークンをミント
    function batchMint(address[] calldata addresses, uint256 amount) external {
        for (uint i = 0; i < addresses.length; i++) {
            balanceOf[addresses[i]] += amount;
            totalSupply += amount;
            emit Transfer(address(0), addresses[i], amount);
        }
    }
}

contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // デフォルトのmerchantをAccount #1に設定
        address merchant = vm.envOr("NEXT_PUBLIC_MERCHANT", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. MockJPYCをデプロイ
        MockJPYC jpyc = new MockJPYC();
        console.log("MockJPYC deployed to:", address(jpyc));
        
        // 2. PaymentGatewayをデプロイ
        PaymentGateway gateway = new PaymentGateway(address(jpyc), merchant);
        console.log("PaymentGateway deployed to:", address(gateway));
        
        // 3. テスト用にいくつかのアドレスにJPYCをミント
        address[] memory testAddresses = new address[](5);
        testAddresses[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // anvil account #0
        testAddresses[1] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // anvil account #1 (merchant)
        testAddresses[2] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // anvil account #2
        testAddresses[3] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // anvil account #3
        testAddresses[4] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65; // anvil account #4
        
        jpyc.batchMint(testAddresses, 100_000 * 10**18); // 各アドレスに100,000 JPYC
        
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Add these to your .env.local:");
        console.log("NEXT_PUBLIC_JPYC=", address(jpyc));
        console.log("NEXT_PUBLIC_GATEWAY=", address(gateway));
        console.log("NEXT_PUBLIC_CHAIN_ID=31337");
        console.log("NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545");
        console.log("Merchant address:", merchant);
        
        vm.stopBroadcast();
    }
} 