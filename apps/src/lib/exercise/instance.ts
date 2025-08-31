import { getPublicClient, getWalletClient } from '@wagmi/core';
import { config } from '../wagmi';

// ===== viem基盤のSDKインスタンス =====

// 現在はviemクライアントを直接エクスポート
// 将来的にJPYC React SDKに置き換える予定

export function getPublicClientInstance() {
  const client = getPublicClient(config);
  if (!client) throw new Error("Public client not found");
  return client;
}

export async function getWalletClientInstance() {
  const client = await getWalletClient(config);
  if (!client) throw new Error("Wallet client not found");
  return client;
}

// TODO: 将来的にJPYC React SDKのインスタンスに置き換え
// export const jpyc: IJPYC = new JPYC({ client });

// TypeScript module resolution force
export {};
