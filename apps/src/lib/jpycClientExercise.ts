// ===== 練習用クライアント（エクササイズバージョン） =====

console.log("🎓 EXERCISE MODE: jpycClientExercise.ts is being used!");

// 練習用SDK機能（未実装）
export * from './exercise';

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