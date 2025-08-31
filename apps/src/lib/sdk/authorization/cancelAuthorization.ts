import { getWalletClient } from '@wagmi/core';
import { config } from '../../wagmi';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";

// EIP-3009: cancelAuthorization
export async function executeCancelAuthorization(
  authorizer: `0x${string}`,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  const jpycAddress = getJPYCAddress();

  const hash = await walletClient.writeContract({
    address: jpycAddress,
    abi: JPYC_ABI,
    functionName: "cancelAuthorization",
    args: [
      authorizer,
      nonce,
      signature.v,
      signature.r,
      signature.s
    ],
  });

  return hash;
}

// cancelAuthorizationの署名を作成
export async function createCancelAuthorizationSignature(
  authorizer: `0x${string}`,
  nonce: `0x${string}`
) {
  const walletClient = await getWalletClient(config);
  if (!walletClient || !walletClient.account) {
    throw new Error("Wallet not connected");
  }

  // EIP-712の型定義
  const domain = {
    name: 'JPY Coin',
    version: '1',
    chainId: walletClient.chain.id,
    verifyingContract: getJPYCAddress(),
  };

  const types = {
    CancelAuthorization: [
      { name: 'authorizer', type: 'address' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };

  const message = {
    authorizer,
    nonce,
  };

  // 署名を生成
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: 'CancelAuthorization',
    message,
  });

  // v, r, sに分解
  const r = signature.slice(0, 66) as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  const v = parseInt(signature.slice(130, 132), 16);

  return {
    v,
    r,
    s,
    signature,
    nonce,
    domain,
    types,
    message
  };
}

// JPYCではauthorizationStateが実装されていないため、
// noncesマッピングを使用してnonceの状態をチェックすることができない。
// 代わりに、キャンセル実行時にエラーが発生するかどうかで判断する。
