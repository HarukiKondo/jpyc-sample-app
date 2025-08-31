import { formatUnits } from "viem";

// ===== 定数設定 =====
const DECIMALS = 18;

/**
 * JPYCをフォーマット（表示用）
 * 
 * @param value - JPYC残高（wei単位）
 * @returns string - 人間が読みやすい形式の残高
 */
export function formatJPYC(value: bigint): string {
  return formatUnits(value, DECIMALS);
} 