// ===== 練習課題: Permit実行 =====
// TODO: 以下の関数を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * EIP-2612 Permitを実行（ブロードキャスト）
 * 
 * @param owner - 所有者アドレス
 * @param spender - 使用許可先アドレス
 * @param value - 許可額（wei単位）
 * @param deadline - 期限（UNIX timestamp）
 * @param signature - 署名データ { v, r, s }
 * @returns string - トランザクションハッシュ
 * 
 * ヒント:
 * 1. getWalletClientInstance() を使ってwalletClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. walletClient.writeContract() を使って permit 関数を呼び出し
 * 5. args は [owner, spender, value, deadline, v, r, s] の配列
 */
export async function executeBroadcastPermit(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("executeBroadcastPermit は未実装です。実装してください！");
}
