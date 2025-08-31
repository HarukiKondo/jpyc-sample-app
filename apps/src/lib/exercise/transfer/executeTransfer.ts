// ===== 練習課題: JPYC転送実行 =====
// TODO: 以下の関数を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC転送を実行
 * 
 * @param to - 転送先アドレス
 * @param value - 転送額（wei単位）
 * @returns string - トランザクションハッシュ
 * 
 * ヒント:
 * 1. getWalletClientInstance() を使ってwalletClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. walletClient.writeContract() を使って transfer 関数を呼び出し
 */
export async function executeTransfer(to: `0x${string}`, value: bigint): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("executeTransfer は未実装です。実装してください！");
}
