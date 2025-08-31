import { getWalletClient } from '@wagmi/core';
import { hexToSignature } from "viem";
import { config } from '../wagmi';
import { getJPYCAddress } from '../core/config';
import { getPermitNonce } from './getPermitNonce';

/**
 * EIP-712 Permit署名を作成
 * 
 * @param owner - トークン所有者のアドレス
 * @param spender - 使用許可を受けるアドレス
 * @param value - 許可する金額（wei単位）
 * @param deadline - 署名の期限（UNIX timestamp）
 * @returns Promise<PermitSignature> - 署名データとメタデータ
 */
export async function createPermitSignature(
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint
) {
  const walletClient = await getWalletClient(config, { 
    account: owner 
  });
  if (!walletClient) throw new Error("Wallet client not found");

  const nonce = await getPermitNonce(owner);

  // EIP-712の型定義
  const domain = {
    name: 'JPY Coin',
    version: '1',
    chainId: walletClient.chain.id,
    verifyingContract: getJPYCAddress(),
  };

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  // 署名を生成
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: 'Permit',
    message,
  });

  // v, r, sに分解
  const { v, r, s } = hexToSignature(signature);

  return {
    signature,
    v,
    r,
    s,
    nonce,
    deadline,
    domain,
    types,
    message
  };
} 