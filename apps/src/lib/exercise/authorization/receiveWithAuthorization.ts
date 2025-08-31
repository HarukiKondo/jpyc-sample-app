// ===== 練習課題: Receive with Authorization (EIP-3009) =====
// TODO: 以下の関数群を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * EIP-3009 Receive with Authorization署名を作成
 * 
 * @param from - 送信者アドレス
 * @param to - 受信者アドレス（自分）
 * @param value - 転送額（wei単位）
 * @param validAfter - 有効開始時刻（UNIX timestamp）
 * @param validBefore - 有効終了時刻（UNIX timestamp）
 * @param nonce - 一意のnonce（32bytes）
 * @returns Promise<{ v: number; r: string; s: string; }> - 署名データ
 * 
 * ヒント:
 * 1. Transfer with Authorizationと同様だが、message構造が異なる
 * 2. types定義でReceiveWithAuthorizationを設定
 * 3. 送信者（from）が署名を作成する
 */
export async function createReceiveWithAuthorizationSignature(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
  validAfter: bigint,
  validBefore: bigint,
  nonce: `0x${string}`
): Promise<{ v: number; r: `0x${string}`; s: `0x${string}` }> {
  // TODO: ここに実装を追加してください
  throw new Error("createReceiveWithAuthorizationSignature は未実装です。実装してください！");
}

/**
 * Receive with Authorizationを実行
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
 * 1. walletClient.writeContract() で receiveWithAuthorization 関数を呼び出し
 * 2. args は [from, to, value, validAfter, validBefore, nonce, v, r, s]
 */
export async function executeReceiveWithAuthorization(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
  validAfter: bigint,
  validBefore: bigint,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("executeReceiveWithAuthorization は未実装です。実装してください！");
}
