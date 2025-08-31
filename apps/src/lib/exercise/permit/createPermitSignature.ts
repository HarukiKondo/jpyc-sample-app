// ===== 練習課題: Permit署名作成 =====
// TODO: 以下の関数を実装してください

// import { getWalletClientInstance } from '../instance';
// import { getPermitNonce, getDomainSeparator } from './';

/**
 * EIP-2612 Permit署名を作成
 * 
 * @param owner - 所有者アドレス
 * @param spender - 使用許可先アドレス
 * @param value - 許可額（wei単位）
 * @param deadline - 期限（UNIX timestamp）
 * @returns Promise<{ v: number; r: string; s: string; }> - 署名データ
 * 
 * ヒント:
 * 1. getWalletClientInstance() を使ってwalletClientを取得
 * 2. getPermitNonce() でnonce取得
 * 3. getDomainSeparator() でdomain separator取得
 * 4. EIP-712署名用のmessageを構築
 * 5. walletClient.signTypedData() で署名
 * 6. 署名をv, r, sに分解
 * 
 * EIP-712 Message構造:
 * - domain: { name, version, chainId, verifyingContract }
 * - types: { Permit: [...] }
 * - primaryType: "Permit"
 * - message: { owner, spender, value, nonce, deadline }
 */
export async function createPermitSignature(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint
): Promise<{ v: number; r: `0x${string}`; s: `0x${string}` }> {
  // TODO: ここに実装を追加してください
  throw new Error("createPermitSignature は未実装です。実装してください！");
}
