// ===== 練習課題: Domain Separator取得 =====
// TODO: 以下の関数を実装してください

// import { getPublicClientInstance } from '../instance';
// import { getJPYCAddress } from '../../core/config';
// import JPYC_ABI from "@/abi/JPYC.json";

/**
 * EIP-712 Domain Separatorを取得
 * 
 * @returns string - Domain Separator (0x...)
 * 
 * ヒント:
 * 1. getPublicClientInstance() を使ってpublicClientを取得
 * 2. getJPYCAddress() を使ってJPYCアドレスを取得
 * 3. JPYC_ABI を @/abi/JPYC.json から import
 * 4. publicClient.readContract() を使って DOMAIN_SEPARATOR 関数を呼び出し
 */
export async function getDomainSeparator(): Promise<`0x${string}`> {
  // TODO: ここに実装を追加してください
  throw new Error("getDomainSeparator は未実装です。実装してください！");
}

