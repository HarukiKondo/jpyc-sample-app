// ===== Exercise 1: ユーティリティ関数 =====
// 🎯 学習目標: bigintからstring変換を理解する

import { formatUnits } from "viem";

/**
 * 【Exercise 1】JPYC残高を人間が読みやすい形式にフォーマット
 * 
 * 🔍 学習ポイント:
 * 1. ERC20のdecimals概念を理解
 * 2. wei単位からether単位への変換
 * 3. viem の formatUnits 使用方法
 * 
 * 📚 実装手順:
 * 1. JPYCのdecimalsは18
 * 2. viemのformatUnits関数を使用
 * 3. wei単位のbigintを文字列に変換
 * 
 * @param value - wei単位のJPYC残高
 * @returns string - 人間が読める形式（例: "1000.0"）
 */
export function formatJPYC(value: bigint): string {
  // Exercise 1では残高表示のため完成版を提供
  const DECIMALS = 18;  // JPYCのdecimals
  return formatUnits(value, DECIMALS);
} 