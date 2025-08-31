// ===== 統合クライアント（完成版） =====

console.log("✅ PRODUCTION MODE: jpycClient.ts is being used!");

// SDK機能（全機能）
export * from './sdk';

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