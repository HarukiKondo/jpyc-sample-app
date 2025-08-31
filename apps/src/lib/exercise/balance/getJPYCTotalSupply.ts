// ===== 練習課題: JPYC総供給量取得 =====
// TODO: 以下の関数を実装してください

// import { getPublicClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * JPYC総供給量を取得
 * 
 * @returns bigint - JPYC総供給量（wei単位）
 * 
 * ヒント:
 * 1. getPublicClientInstance() を使ってpublicClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. publicClient.readContract() を使って totalSupply 関数を呼び出し
 */
export async function getJPYCTotalSupply(): Promise<bigint> {
  // TODO: ここに実装を追加してください
  throw new Error("getJPYCTotalSupply は未実装です。実装してください！");
}
