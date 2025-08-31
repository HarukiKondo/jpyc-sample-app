// ===== 練習課題: JPYC承認実行 =====
// TODO: 以下の関数を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC承認を実行
 * 
 * @param spender - 使用許可を与えるアドレス
 * @param value - 許可額（wei単位）
 * @returns string - トランザクションハッシュ
 * 
 * ヒント:
 * 1. getWalletClientInstance() を使ってwalletClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. walletClient.writeContract() を使って approve 関数を呼び出し
 * 5. args は [spender, value] の配列
 */
export async function executeApprove(spender: `0x${string}`, value: bigint): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("executeApprove は未実装です。実装してください！");
}
