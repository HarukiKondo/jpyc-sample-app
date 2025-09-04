import { getPublicClient } from '@wagmi/core';
import { config } from '../wagmi';
import { getJPYCAddress } from '../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * DOMAIN_SEPARATORを取得
 * 
 * @returns Promise<`0x${string}`> - ドメインセパレータ
 */
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