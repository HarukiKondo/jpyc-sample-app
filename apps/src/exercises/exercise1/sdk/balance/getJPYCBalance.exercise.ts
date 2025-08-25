// ===== Exercise 1: JPYC残高取得 =====
// 🎯 学習目標: ERC20.balanceOf関数を理解し、JPYC残高を取得する

import { getPublicClient } from '@wagmi/core';
import { config } from '../../../../lib/wagmi';
import JPYC_ABI from "@/abi/JPYC.json";
import { getPublicClientInstance } from '@/lib/sdk/instance';
import { getJPYCAddress } from '@/lib/core/config';

/**
 * 【Exercise 1】JPYC残高を取得する関数
 * 
 * 🔍 学習ポイント:
 * 1. ERC20の balanceOf 関数を理解
 * 2. viem の readContract 使用方法
 * 3. bigint 型の扱い方
 * 
 * 📚 実装手順:
 * 1. getPublicClient(config) でクライアントを取得
 * 2. publicClient.readContract() を使用
 * 3. JPYCコントラクトの balanceOf 関数を呼び出し
 * 4. 引数: address（残高を取得したいアドレス）
 * 
 * @param jpycAddress - JPYCコントラクトのアドレス
 * @param userAddress - 残高を取得するユーザーアドレス
 * @returns Promise<bigint> - JPYC残高（wei単位）
 */
export async function getJPYCBalance(
  jpycAddress: `0x${string}`,
  userAddress: `0x${string}`
): Promise<bigint> {
  // Exercise 1では残高表示のため完成版を提供
  const publicClient = getPublicClient(config);
  if (!publicClient) throw new Error("Public client not found");
  
  const balance = await publicClient.readContract({
    address: jpycAddress,
    abi: JPYC_ABI,
    functionName: "balanceOf",  // ERC20の残高取得関数
    args: [userAddress],        // 残高を取得したいアドレス
  }) as bigint;
  
  return balance;
} 