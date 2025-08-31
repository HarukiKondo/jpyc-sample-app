import { getPublicClientInstance } from '../instance';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC許可額を取得
 * 
 * @param owner - トークン所有者のアドレス
 * @param spender - 使用許可を受けるアドレス
 * @returns Promise<bigint> - 許可額（wei単位）
 */
export async function getJPYCAllowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
  const publicClient = getPublicClientInstance();
  
  const allowance = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "allowance",
    args: [owner, spender],
  }) as bigint;
  
  return allowance;
} 