// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PaymentGateway} from "../src/PaymentGateway.sol";

contract DeploySepolia is Script {
    function run() external {
        // Sepolia JPYC and Merchant addresses（JPYC v2）
        address jpycAddress = 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB;
        address merchantAddress = 0x47e98DA2D8FA38ea76bBDbD1d3E2725732cb3A88;
        
        console.log("=== SEPOLIA DEPLOYMENT ===");
        console.log("JPYC Address:", jpycAddress);
        console.log("Merchant Address:", merchantAddress);
        console.log("Chain ID: 11155111 (Sepolia)");
        
        vm.startBroadcast(); // --private-keyフラグから自動取得
        
        // Deploy PaymentGateway
        PaymentGateway gateway = new PaymentGateway(jpycAddress, merchantAddress);
        console.log("PaymentGateway deployed to:", address(gateway));
        
        // Verify deployment
        require(address(gateway.jpyc()) == jpycAddress, "JPYC address mismatch");
        require(gateway.merchant() == merchantAddress, "Merchant address mismatch");
        
        vm.stopBroadcast();
        
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Add these to your .env.local:");
        console.log("NEXT_PUBLIC_JPYC=0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB");
        console.log("NEXT_PUBLIC_GATEWAY=", address(gateway));
        console.log("NEXT_PUBLIC_MERCHANT_ADDRESS=0x47e98DA2D8FA38ea76bBDbD1d3E2725732cb3A88");
        console.log("NEXT_PUBLIC_CHAIN_ID=11155111");
        console.log("NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY");
        console.log("");
        console.log("=== VERIFICATION COMMAND ===");
        console.log("forge verify-contract", address(gateway), "src/PaymentGateway.sol:PaymentGateway");
        console.log("--chain-id 11155111");
        console.log("--constructor-args $(cast abi-encode \"constructor(address,address)\"", jpycAddress, merchantAddress, ")");
        console.log("--etherscan-api-key $ETHERSCAN_API_KEY");
    }
}
