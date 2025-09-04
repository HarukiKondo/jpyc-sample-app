// ===== 練習用クライアント（React SDKエクササイズバージョン） =====

console.log("🎓 EXERCISE MODE: jpycClientExercise.ts is being used!");

// React SDK機能（練習用 - TODOコメント付き）
// 注意: 実際のフックは@jpyc/sdk-reactから直接インポートしてください
export * from '@jpyc/sdk-react';

// コア機能（Payment Gateway等）
export * from './core/config';
export * from './core/payment';
export * from './core/utils';

// アプリ固有のユーティリティ機能
export * from './utils/formatJPYC';
export * from './utils/parseJPYC';
export * from './utils/getPermitNonce';
export * from './utils/getDomainSeparator';
export * from './utils/createPermitSignature';
export * from './utils/authorizationSignatures';