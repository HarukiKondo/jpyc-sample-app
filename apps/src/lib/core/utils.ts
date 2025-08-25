import { keccak256, encodePacked } from "viem";

// ===== ユーティリティ関数 =====

// OrderIDを生成（32バイト固定）
export function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 18);
  const orderId = `order_${timestamp}_${random}`;
  
  // 確実に32バイトにする
  const padded = orderId.padEnd(32, '0');
  return padded.substring(0, 32);
}

// OrderIDをbytes32形式に変換
export function orderIdToBytes32(orderId: string): `0x${string}` {
  // keccak256でハッシュ化してbytes32にする（より確実）
  return keccak256(encodePacked(['string'], [orderId]));
}

// MetaHashを生成
export function generateMetaHash(orderId: string, items: any[]): `0x${string}` {
  const data = JSON.stringify({ orderId, items, timestamp: Date.now() });
  return keccak256(encodePacked(['string'], [data]));
} 