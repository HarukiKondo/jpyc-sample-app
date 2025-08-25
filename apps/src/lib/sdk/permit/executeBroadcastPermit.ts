import { getWalletClientInstance } from '../instance';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

/**
 * Token.permit を直接実行（学習用）
 * 
 * @param owner - トークン所有者のアドレス
 * @param spender - 使用許可を受けるアドレス
 * @param value - 許可する金額（wei単位）
 * @param deadline - 署名の期限（UNIX timestamp）
 * @param signature - 署名データ
 * @returns Promise<Hash> - トランザクションハッシュ
 */
export async function executeBroadcastPermit(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  const walletClient = await getWalletClientInstance();

  const hash = await walletClient.writeContract({
    address: getJPYCAddress(),
    abi: JPYC_ABI, // permitが含まれているABI
    functionName: "permit",
    args: [owner, spender, value, deadline, signature.v, signature.r, signature.s],
  });

  return hash;
} 