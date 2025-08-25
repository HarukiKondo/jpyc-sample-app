import { parseUnits } from "viem";

// ===== 定数設定 =====
const DECIMALS = 18;

/**
 * JPYCをパース（計算用）
 * 
 * @param value - 人間が読みやすい形式の金額
 * @returns bigint - wei単位のJPYC金額
 */
export function parseJPYC(value: string): bigint {
  return parseUnits(value, DECIMALS);
} 