// ===== 練習課題: Cancel Authorization (EIP-3009) =====
// TODO: 以下の関数群を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * EIP-3009 Cancel Authorization署名を作成
 * 
 * @param authorizer - 承認者アドレス（署名作成者）
 * @param nonce - キャンセルしたいnonce（32bytes）
 * @returns Promise<{ v: number; r: string; s: string; }> - 署名データ
 * 
 * ヒント:
 * 1. EIP-712署名を使用
 * 2. message構造: { authorizer, nonce }
 * 3. types定義でCancelAuthorizationを設定
 */
export async function createCancelAuthorizationSignature(
  authorizer: `0x${string}`,
  nonce: `0x${string}`
): Promise<{ v: number; r: `0x${string}`; s: `0x${string}` }> {
  // TODO: ここに実装を追加してください
  throw new Error("createCancelAuthorizationSignature は未実装です。実装してください！");
}

/**
 * Cancel Authorizationを実行
 * 
 * @param authorizer - 承認者アドレス
 * @param nonce - キャンセルしたいnonce
 * @param signature - 署名データ
 * @returns string - トランザクションハッシュ
 * 
 * ヒント:
 * 1. walletClient.writeContract() で cancelAuthorization 関数を呼び出し
 * 2. args は [authorizer, nonce, v, r, s]
 */
export async function executeCancelAuthorization(
  authorizer: `0x${string}`,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("executeCancelAuthorization は未実装です。実装してください！");
}
