import { getPublicClientInstance } from '../instance';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC残高を取得
 * 
 * @param address - 残高を取得するアドレス
 * @returns bigint - JPYC残高（wei単位）
 */
export async function getJPYCBalance(address: `0x${string}`): Promise<bigint> {
  const publicClient = getPublicClientInstance();
  
  const balance = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "balanceOf",
    args: [address],
  }) as bigint;
  
  return balance;
} 