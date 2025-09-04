// ===== React SDK統合クライアント =====

console.log("⚛️ REACT SDK MODE: jpycClientReactSdk.ts is being used!");

// React SDK機能（公式フック）
export * from '@jpyc/sdk-react';

// コア機能（Payment Gateway等）は完成版と同じ
export * from './core/config';
export * from './core/payment';
export * from './core/utils';

// アプリ固有のユーティリティ機能（完成版と同じ）
export * from './utils/formatJPYC';
export * from './utils/parseJPYC';
export * from './utils/getPermitNonce';
export * from './utils/getDomainSeparator';
export * from './utils/createPermitSignature';
export * from './utils/authorizationSignatures';
