import { getWalletClientInstance } from '../instance';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC送金を実行
 * 
 * @param to - 送金先アドレス
 * @param value - 送金金額（wei単位）
 * @returns Promise<Hash> - トランザクションハッシュ
 */
export async function executeTransfer(
  to: `0x${string}`,
  value: bigint
): Promise<`0x${string}`> {
  const walletClient = await getWalletClientInstance();

  const hash = await walletClient.writeContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "transfer",
    args: [to, value],
  });

  // return hash;
  return hash;
} 