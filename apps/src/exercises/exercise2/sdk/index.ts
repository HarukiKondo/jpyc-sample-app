// ===== Exercise 1 SDK: Balance機能学習 =====

// 学習対象機能（Exercise 1）
export { getJPYCBalance } from './balance/getJPYCBalance.exercise';
export { formatJPYC } from './utils/formatJPYC.exercise';

// 完成版機能（コア機能）
export * from '../../../lib/core/config';
export * from '../../../lib/core/payment';
export * from '../../../lib/core/utils';

// Exercise 1では学習対象外の機能を無効化
export async function executeTransfer(
  to: `0x${string}`,
  amount: bigint
): Promise<`0x${string}`> {
  throw new Error("🚫 Exercise 1では Transfer 機能は学習対象外です！\n\n📚 Exercise 2で Transfer 機能を学習しましょう。");
}

export function parseJPYC(value: string): bigint {
  throw new Error("🚫 Exercise 1では parseJPYC 機能は学習対象外です！\n\n📚 Exercise 2で parseJPYC 機能を学習しましょう。");
}

// Exercise 2以降の機能は未実装のため export しない
// Transfer機能、Approve機能、Permit機能は利用不可 