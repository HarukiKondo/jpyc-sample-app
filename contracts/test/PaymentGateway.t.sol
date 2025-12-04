// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PaymentGateway.sol";
import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * モック用のJPYCスマートコントラクト
 */
contract MockJPYC is ERC20, ERC20Permit {
    constructor() ERC20("JPY Coin", "JPYC") ERC20Permit("JPY Coin") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * PaymentGatewayコントラクト用のテストコード
 */
contract PaymentGatewayTest is Test {
    PaymentGateway public gateway;
    MockJPYC public jpyc;
    address public merchant = makeAddr("merchant");
    address public user = makeAddr("user");

    /**
     * テスト実行前のセットアップメソッド
　　 * JPYCコントラクトとPaymetnGatewayコントラクトのデプロイ及びJPYCの発行を行う。
     */
    function setUp() public {
        jpyc = new MockJPYC();
        gateway = new PaymentGateway(address(jpyc), merchant);
        
        // ユーザーにJPYCを付与
        jpyc.mint(user, 1000 * 10**jpyc.decimals());
    }

    /**
     * 通常のJPYC支払いテストコード
     */
    function testPay() public {
        // 支払いIDを作成
        bytes32 orderId = keccak256("order1");
        uint256 amount = 100 * 10**jpyc.decimals();
        bytes32 metaHash = keccak256("metadata");

        vm.startPrank(user);
        
        // approve
        jpyc.approve(address(gateway), amount);
        
        // pay
        vm.expectEmit(true, true, false, true);
        emit PaymentGateway.OrderPaid(orderId, user, amount, metaHash);
        // 支払い処理を実行
        gateway.pay(orderId, amount, metaHash);
        
        vm.stopPrank();

        // 残高確認
        assertEq(jpyc.balanceOf(merchant), amount);
        assertTrue(gateway.usedOrders(orderId));
    }

    function testPayWithoutApprove() public {
        bytes32 orderId = keccak256("order1");
        uint256 amount = 100 * 10**jpyc.decimals();
        bytes32 metaHash = keccak256("metadata");

        vm.startPrank(user);
        
        // approve なしで revert するはず
        vm.expectRevert();
        gateway.pay(orderId, amount, metaHash);
        
        vm.stopPrank();
    }

    function testOrderIdReuse() public {
        bytes32 orderId = keccak256("order1");
        uint256 amount = 100 * 10**jpyc.decimals();
        bytes32 metaHash = keccak256("metadata");

        vm.startPrank(user);
        
        // 1回目の支払い
        jpyc.approve(address(gateway), amount * 2);
        gateway.pay(orderId, amount, metaHash);
        
        // 同じorderIdで再度支払いしようとして revert
        vm.expectRevert("order used");
        gateway.pay(orderId, amount, metaHash);
        
        vm.stopPrank();
    }

    function testPermitAndPay() public {
        bytes32 orderId = keccak256("order1");
        uint256 amount = 100 * 10**jpyc.decimals();
        bytes32 metaHash = keccak256("metadata");
        uint256 deadline = block.timestamp + 1 hours;

        // permit署名を作成
        uint256 userPrivateKey = 0x123;
        address userAddress = vm.addr(userPrivateKey);
        jpyc.mint(userAddress, 1000 * 10**jpyc.decimals());

        uint256 nonce = jpyc.nonces(userAddress);
        
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                userAddress,
                address(gateway),
                amount,
                nonce,
                deadline
            )
        );

        bytes32 domainSeparator = jpyc.DOMAIN_SEPARATOR();
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivateKey, digest);

        vm.startPrank(userAddress);
        
        vm.expectEmit(true, true, false, true);
        emit PaymentGateway.OrderPaid(orderId, userAddress, amount, metaHash);
        gateway.permitAndPay(orderId, amount, metaHash, userAddress, amount, deadline, v, r, s);
        
        vm.stopPrank();

        assertEq(jpyc.balanceOf(merchant), amount);
        assertTrue(gateway.usedOrders(orderId));
    }

    function testPermitAndPayOwnerMismatch() public {
        bytes32 orderId = keccak256("order1");
        uint256 amount = 100 * 10**jpyc.decimals();
        bytes32 metaHash = keccak256("metadata");
        uint256 deadline = block.timestamp + 1 hours;

        vm.startPrank(user);
        
        // owner != msg.sender で revert
        vm.expectRevert("owner!=caller");
        gateway.permitAndPay(orderId, amount, metaHash, merchant, amount, deadline, 0, bytes32(0), bytes32(0));
        
        vm.stopPrank();
    }

    function testPermitAndPayInsufficientValue() public {
        bytes32 orderId = keccak256("order1");
        uint256 amount = 100 * 10**jpyc.decimals();
        uint256 insufficientValue = 50 * 10**jpyc.decimals();
        bytes32 metaHash = keccak256("metadata");
        uint256 deadline = block.timestamp + 1 hours;

        vm.startPrank(user);
        
        // value < amount で revert
        vm.expectRevert("value<amount");
        gateway.permitAndPay(orderId, amount, metaHash, user, insufficientValue, deadline, 0, bytes32(0), bytes32(0));
        
        vm.stopPrank();
    }
} 
