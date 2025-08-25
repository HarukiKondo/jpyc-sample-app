import { getWalletClientInstance } from '../instance';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC Approve を実行
 * 
 * @param spender - 使用許可を与えるアドレス
 * @param amount - 許可する金額（wei単位）
 * @returns Promise<Hash> - トランザクションハッシュ
 */
export async function executeApprove(
  spender: `0x${string}`,
  amount: bigint
): Promise<`0x${string}`> {
  const walletClient = await getWalletClientInstance();

  const hash = await walletClient.writeContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI,
    functionName: "approve",
    args: [spender, amount],
  });

  return hash;
} 