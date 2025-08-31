import { getPublicClientInstance } from '../instance';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYCの総供給量を取得
 * 
 * @returns bigint - JPYC総供給量（wei単位）
 */
export async function getJPYCTotalSupply(): Promise<bigint> {
  const publicClient = getPublicClientInstance();
  
  const totalSupply = await publicClient.readContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "totalSupply",
    args: [],
  }) as bigint;
  
  return totalSupply;
} 