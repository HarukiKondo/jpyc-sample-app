// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract PaymentGateway is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event OrderPaid(bytes32 indexed orderId, address indexed payer, uint256 amount, bytes32 metaHash);

    IERC20 public immutable jpyc;
    IERC20Permit public immutable jpycPermit; // same address, cast to interface
    address public immutable merchant;

    mapping(bytes32 => bool) public usedOrders;

    constructor(address _jpyc, address _merchant) {
        require(_jpyc != address(0) && _merchant != address(0), "zero");
        jpyc = IERC20(_jpyc);
        jpycPermit = IERC20Permit(_jpyc);
        merchant = _merchant;
    }

    function pay(bytes32 orderId, uint256 amount, bytes32 metaHash) external nonReentrant {
        _consumeOrder(orderId);
        jpyc.safeTransferFrom(msg.sender, merchant, amount);
        emit OrderPaid(orderId, msg.sender, amount, metaHash);
    }

    function permitAndPay(
        bytes32 orderId,
        uint256 amount,
        bytes32 metaHash,
        address owner,
        uint256 value,         // allowance to set via permit
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external nonReentrant {
        _consumeOrder(orderId);
        require(owner == msg.sender, "owner!=caller");
        require(value >= amount, "value<amount");

        // 1) off-chain signature based approval
        jpycPermit.permit(owner, address(this), value, deadline, v, r, s);

        // 2) pull funds
        jpyc.safeTransferFrom(owner, merchant, amount);

        emit OrderPaid(orderId, owner, amount, metaHash);
    }

    function _consumeOrder(bytes32 orderId) internal {
        require(orderId != bytes32(0), "empty id");
        require(!usedOrders[orderId], "order used");
        usedOrders[orderId] = true;
    }
} 