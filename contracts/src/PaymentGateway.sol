// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

// JPYC EIP-3009インターフェース（決済用）
interface IJPYC3009 {
    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

contract PaymentGateway is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event OrderPaid(bytes32 indexed orderId, address indexed payer, uint256 amount, bytes32 metaHash);
    event AuthorizationPayment(bytes32 indexed orderId, address indexed payer, uint256 amount, bytes32 nonce, string authType);

    IERC20 public immutable jpyc;
    IERC20Permit public immutable jpycPermit; // same address, cast to interface
    IJPYC3009 public immutable jpycAuth; // same address, cast to EIP-3009 interface
    address public immutable merchant;

    mapping(bytes32 => bool) public usedOrders;

    constructor(address _jpyc, address _merchant) {
        require(_jpyc != address(0) && _merchant != address(0), "zero");
        jpyc = IERC20(_jpyc);
        jpycPermit = IERC20Permit(_jpyc);
        jpycAuth = IJPYC3009(_jpyc);
        merchant = _merchant;
    }

    /**
     * Approve + Transferのメソッド
     */
    function pay(bytes32 orderId, uint256 amount, bytes32 metaHash) external nonReentrant {
        _consumeOrder(orderId);
        jpyc.safeTransferFrom(msg.sender, merchant, amount);
        // イベント発火
        emit OrderPaid(orderId, msg.sender, amount, metaHash);
    }

    /**
     * EIP-2612: Permitでtransferするメソッド
     */
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

        // イベント発火
        emit OrderPaid(orderId, owner, amount, metaHash);
    }

    /**
     * EIP-3009: transferWithAuthorization 経由での決済
     */
    function payWithTransferAuthorization(
        bytes32 orderId,
        uint256 amount,
        bytes32 metaHash,
        address from,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v, bytes32 r, bytes32 s
    ) external nonReentrant {
        _consumeOrder(orderId);
        
        // EIP-3009 transferWithAuthorization を実行（merchant宛）
        jpycAuth.transferWithAuthorization(
            from,
            merchant, // 直接merchant宛（ガス効率が良い）
            amount,
            validAfter,
            validBefore,
            nonce,
            v, r, s
        );
        
        // イベント発火
        emit OrderPaid(orderId, from, amount, metaHash);
    }

    function _consumeOrder(bytes32 orderId) internal {
        require(orderId != bytes32(0), "empty id");
        require(!usedOrders[orderId], "order used");
        usedOrders[orderId] = true;
    }
} 