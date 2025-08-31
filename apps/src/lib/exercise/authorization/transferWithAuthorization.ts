// ===== 練習課題: Transfer with Authorization (EIP-3009) =====
// TODO: 以下の関数群を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";



/**
 * Transfer with Authorizationを実行
 * 
 * @param from - 送信者アドレス
 * @param to - 受信者アドレス
 * @param value - 転送額（wei単位）
 * @param validAfter - 有効開始時刻
 * @param validBefore - 有効終了時刻
 * @param nonce - 一意のnonce
 * @param signature - 署名データ
 * @returns string - トランザクションハッシュ
 * 
 * ヒント:
 * 1. walletClient.writeContract() で transferWithAuthorization 関数を呼び出し
 * 2. args は [from, to, value, validAfter, validBefore, nonce, v, r, s]
 */
export async function executeTransferWithAuthorization(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
  validAfter: bigint,
  validBefore: bigint,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("executeTransferWithAuthorization は未実装です。実装してください！");
}


