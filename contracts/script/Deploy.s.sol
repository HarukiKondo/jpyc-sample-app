// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PaymentGateway.sol";

contract Deploy is Script {
    function run() external {
        address JPYC = vm.envAddress("JPYC");
        address MERCHANT = vm.envAddress("MERCHANT");

        vm.startBroadcast();
        PaymentGateway g = new PaymentGateway(JPYC, MERCHANT);
        vm.stopBroadcast();

        console2.log("Gateway:", address(g));
    }
} 