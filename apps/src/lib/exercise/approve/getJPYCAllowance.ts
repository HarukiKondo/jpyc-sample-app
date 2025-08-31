// ===== 練習課題: JPYC許可額取得 =====
// TODO: 以下の関数を実装してください

// import { getPublicClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC許可額を取得
 * 
 * @param owner - 所有者アドレス
 * @param spender - 使用許可を受けるアドレス
 * @returns bigint - 許可額（wei単位）
 * 
 * ヒント:
 * 1. getPublicClientInstance() を使ってpublicClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. publicClient.readContract() を使って allowance 関数を呼び出し
 * 5. args は [owner, spender] の配列
 */
export async function getJPYCAllowance(owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> {
  // TODO: ここに実装を追加してください
  throw new Error("getJPYCAllowance は未実装です。実装してください！");
}

// TypeScript module resolution force
export {};
