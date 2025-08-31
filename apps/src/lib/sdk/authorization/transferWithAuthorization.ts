import { getWalletClient, getPublicClient } from '@wagmi/core';
import { config } from '../../wagmi';
import { getJPYCAddress } from '../../core/config';
import JPYC_ABI from "@/abi/JPYC.json";
import { keccak256, encodePacked } from 'viem';

// EIP-3009: transferWithAuthorization
export async function executeTransferWithAuthorization(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
  validAfter: bigint,
  validBefore: bigint,
  nonce: `0x${string}`,
  signature: { v: number; r: `0x${string}`; s: `0x${string}` }
): Promise<`0x${string}`> {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error("Wallet client not found");

  const jpycAddress = getJPYCAddress();

  const hash = await walletClient.writeContract({
    address: jpycAddress,
    abi: JPYC_ABI,
    functionName: "transferWithAuthorization",
    args: [
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      signature.v,
      signature.r,
      signature.s
    ],
  });

  // トランザクションの実行結果を待機して確認
  const publicClient = getPublicClient(config);
  if (publicClient) {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // revertした場合は例外を投げる
    if (receipt.status === 'reverted') {
      throw new Error('Transaction reverted: transferWithAuthorization failed');
    }
  }

  return hash;
}

// transferWithAuthorizationの署名を作成
export async function createTransferWithAuthorizationSignature(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
  validAfter: bigint,
  validBefore: bigint,
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
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };

  const message = {
    from,
    to,
    value,
    validAfter,
    validBefore,
    nonce,
  };

  // 署名を生成
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
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
    validAfter,
    validBefore,
    domain,
    types,
    message
  };
}

// ランダムなnonceを生成
export function generateNonce(): `0x${string}` {
  return keccak256(encodePacked(['uint256'], [BigInt(Date.now())]));
}

// 現在の時刻から有効期限を生成
export function generateValidityWindow(durationInSeconds: number = 3600): { validAfter: bigint; validBefore: bigint } {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return {
    validAfter: now,
    validBefore: now + BigInt(durationInSeconds)
  };
}
