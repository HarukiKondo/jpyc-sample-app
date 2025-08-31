import { getWalletClient } from '@wagmi/core';
import { config } from '../../wagmi';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

// EIP-3009: cancelAuthorization
export async function executeCancelAuthorization(
  authorizer: `0x${string}`,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  const jpycAddress = getJPYCAddress();

  const hash = await walletClient.writeContract({
    address: jpycAddress,
    abi: JPYC_ABI,
    functionName: "cancelAuthorization",
    args: [
      authorizer,
      nonce,
      signature.v,
      signature.r,
      signature.s
    ],
  });

  return hash;
}


