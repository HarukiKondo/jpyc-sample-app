import { getWalletClient } from '@wagmi/core';
import PaymentGateway from "@/abi/PaymentGateway.json";
import { config } from '../wagmi';
import { getGatewayAddress } from './config';
import { orderIdToBytes32 } from './utils';

// ===== Purchase決済関数 =====

// Payment Gateway経由で決済実行
export async function executePayment(
  orderId: string,
  amount: bigint,
  metaHash: `0x${string}`
) {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  console.log('executePayment - Original orderId:', orderId);
  const orderIdBytes32 = orderIdToBytes32(orderId);
  console.log('executePayment - Converted orderId:', orderIdBytes32);

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

  console.log('executePermitAndPay - Original orderId:', orderId);
  const orderIdBytes32 = orderIdToBytes32(orderId);
  console.log('executePermitAndPay - Converted orderId:', orderIdBytes32);
  console.log('executePermitAndPay - Amount:', amount.toString());
  console.log('executePermitAndPay - MetaHash:', metaHash);
  console.log('executePermitAndPay - Owner:', owner);
  console.log('executePermitAndPay - Deadline:', deadline.toString());
  console.log('executePermitAndPay - Gateway:', getGatewayAddress());
  console.log('executePermitAndPay - Signature v:', signature.v);
  console.log('executePermitAndPay - Signature r:', signature.r);
  console.log('executePermitAndPay - Signature s:', signature.s);

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