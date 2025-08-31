// ===== 練習課題: Permit Nonce取得 =====
// TODO: 以下の関数を実装してください

// import { getPublicClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * Permit用のnonceを取得
 * 
 * @param owner - 所有者アドレス
 * @returns bigint - 現在のnonce値
 * 
 * ヒント:
 * 1. getPublicClientInstance() を使ってpublicClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. publicClient.readContract() を使って nonces 関数を呼び出し
 * 5. args は [owner] の配列
 */
export async function getPermitNonce(owner: `0x${string}`): Promise<bigint> {
  // TODO: ここに実装を追加してください
  throw new Error("getPermitNonce は未実装です。実装してください！");
}

