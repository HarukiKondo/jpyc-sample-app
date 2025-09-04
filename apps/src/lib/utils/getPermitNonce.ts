import { getPublicClient } from '@wagmi/core';
import { config } from '../wagmi';
import { getJPYCAddress } from '../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * Permit用のnonceを取得
 * 
 * @param address - ユーザーアドレス
 * @returns Promise<bigint> - 現在のnonce値
 */
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