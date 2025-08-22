import { getPublicClient, getWalletClient } from '@wagmi/core';
import { parseUnits, formatUnits, keccak256, encodePacked, toHex, hexToSignature } from "viem";
import JPYC_ABI from "@/abi/JPYC.json";
import PaymentGateway from "@/abi/PaymentGateway.json";
import { config } from './wagmi';

// ===== 定数設定 =====
const DECIMALS = 18;

// チェーンIDに応じてアドレスを取得
export function getJPYCAddress(): `0x${string}` {
  if (typeof window !== 'undefined') {
    const ethereum = (window as any).ethereum;
    const chainId = parseInt(ethereum?.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return process.env.NEXT_PUBLIC_LOCAL_JPYC as `0x${string}` || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    } else {
      // テストネット（Sepolia, Polygon Amoy, Avalanche Fuji等）
      return "0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29";
    }
  }
  return "0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29"; // デフォルトはテストネット
}

export function getGatewayAddress(): `0x${string}` {
  if (typeof window !== 'undefined') {
    const ethereum = (window as any).ethereum;
    const chainId = parseInt(ethereum?.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return process.env.NEXT_PUBLIC_LOCAL_GATEWAY as `0x${string}` || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    } else {
      // テストネット
      return "0x602337022d05d2cF3c2A0Cd2a6d7720A49a84b6F";
    }
  }
  return "0x602337022d05d2cF3c2A0Cd2a6d7720A49a84b6F"; // デフォルトはテストネット
}

// ===== ERC20基本操作 =====

// JPYC残高取得
export async function getJPYCBalance(address: `0x${string}`): Promise<bigint> {
  const publicClient = getPublicClient(config);
  if (!publicClient) throw new Error("Public client not found");
  
  const balance = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "balanceOf",
    args: [address],
  }) as bigint;
  
  return balance;
}

// JPYC許可額取得
export async function getJPYCAllowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
  const publicClient = getPublicClient(config);
  if (!publicClient) throw new Error("Public client not found");
  
  const allowance = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "allowance",
    args: [owner, spender],
  }) as bigint;
  
  return allowance;
}

// ===== Permit署名関連 =====

// nonceを取得
export async function getPermitNonce(address: `0x${string}`): Promise<bigint> {
  const publicClient = getPublicClient(config);
  if (!publicClient) throw new Error("Public client not found");
  
  const nonce = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "nonces",
    args: [address],
  }) as bigint;
  
  return nonce;
}

// DOMAIN_SEPARATORを取得
export async function getDomainSeparator(): Promise<`0x${string}`> {
  const publicClient = getPublicClient(config);
  if (!publicClient) throw new Error("Public client not found");
  
  const domainSeparator = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "DOMAIN_SEPARATOR",
    args: [],
  }) as `0x${string}`;
  
  return domainSeparator;
}

// EIP-712 Permit署名を作成
export async function createPermitSignature(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint
) {
  const walletClient = await getWalletClient(config, { 
    account: owner 
  });
  if (!walletClient) throw new Error("Wallet client not found");

  const nonce = await getPermitNonce(owner);
  // const domainSeparator = await getDomainSeparator();

  // EIP-712の型定義
  const domain = {
    name: 'JPY Coin',
    version: '1',
    chainId: walletClient.chain.id,
    verifyingContract: getJPYCAddress(),
  };

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  // 署名を生成
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: 'Permit',
    message,
  });

  // v, r, sに分解
  const { v, r, s } = hexToSignature(signature);

  return {
    signature,
    v,
    r,
    s,
    nonce,
    deadline,
    domain,
    types,
    message
  };
}

// ===== ユーティリティ関数 =====

// JPYCをフォーマット（表示用）
export function formatJPYC(value: bigint): string {
  return formatUnits(value, DECIMALS);
}

// JPYCをパース（計算用）
export function parseJPYC(value: string): bigint {
  return parseUnits(value, DECIMALS);
}

// OrderIDを生成（32バイト固定）
export function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 18);
  const orderId = `order_${timestamp}_${random}`;
  
  // 確実に32バイトにする
  const padded = orderId.padEnd(32, '0');
  return padded.substring(0, 32);
}

// OrderIDをbytes32形式に変換
export function orderIdToBytes32(orderId: string): `0x${string}` {
  // keccak256でハッシュ化してbytes32にする（より確実）
  return keccak256(encodePacked(['string'], [orderId]));
}

// MetaHashを生成
export function generateMetaHash(orderId: string, items: any[]): `0x${string}` {
  const data = JSON.stringify({ orderId, items, timestamp: Date.now() });
  return keccak256(encodePacked(['string'], [data]));
} 

// ===== Purchase決済関数 =====

// Payment Gateway経由で決済実行
export async function executePayment(
  orderId: string,
  amount: bigint,
  metaHash: `0x${string}`
) {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  console.log('🔍 executePayment - Original orderId:', orderId);
  const orderIdBytes32 = orderIdToBytes32(orderId);
  console.log('🔍 executePayment - Converted orderId:', orderIdBytes32);

  const hash = await walletClient.writeContract({
    address: getGatewayAddress(),
    abi: PaymentGateway,
    functionName: "pay",
    args: [orderIdBytes32, amount, metaHash],
  });

  return hash;
}

// Permit + Pay を1つのトランザクションで実行
export async function executePermitAndPay(
  orderId: string,
  amount: bigint,
  metaHash: `0x${string}`,
  owner: `0x${string}`,
  deadline: bigint,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
) {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  console.log('🔍 executePermitAndPay - Original orderId:', orderId);
  const orderIdBytes32 = orderIdToBytes32(orderId);
  console.log('🔍 executePermitAndPay - Converted orderId:', orderIdBytes32);

  const hash = await walletClient.writeContract({
    address: getGatewayAddress(),
    abi: PaymentGateway,
    functionName: "permitAndPay",
    args: [
      orderIdBytes32,
      amount,
      metaHash,
      owner,
      amount, // permitのvalue
      deadline,
      signature.v,
      signature.r,
      signature.s
    ],
  });

  return hash;
}

// Approve実行（単体）
export async function executeApprove(
  spender: `0x${string}`,
  amount: bigint
) {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  const hash = await walletClient.writeContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "approve",
    args: [spender, amount],
  });

  return hash;
}

// Token.permit を直接実行（学習用）
export async function executeBroadcastPermit(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
) {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  const hash = await walletClient.writeContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI, // permitが含まれているABI
    functionName: "permit",
    args: [owner, spender, value, deadline, signature.v, signature.r, signature.s],
  });

  return hash;
} 