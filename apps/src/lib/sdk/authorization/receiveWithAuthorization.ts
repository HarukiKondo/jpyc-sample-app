import { getWalletClient, getPublicClient } from '@wagmi/core';
import { config } from '../../wagmi';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

// EIP-3009: receiveWithAuthorization
export async function executeReceiveWithAuthorization(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
  validAfter: bigint,
  validBefore: bigint,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  const jpycAddress = getJPYCAddress();

  const hash = await walletClient.writeContract({
    address: jpycAddress,
    abi: JPYC_ABI,
    functionName: "receiveWithAuthorization",
    args: [
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      signature.v,
      signature.r,
      signature.s
    ],
  });

  // トランザクションの実行結果を待機して確認
  const publicClient = getPublicClient(config);
  if (publicClient) {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // revertした場合は例外を投げる
    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted: receiveWithAuthorization failed - Caller must be the payee');
    }
  }

  return hash;
}


