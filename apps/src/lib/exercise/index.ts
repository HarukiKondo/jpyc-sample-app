// ===== SDK学習用 エクササイズバージョン =====
// 実装はあなた自身で行ってください！

// Force TypeScript module resolution

// インスタンス
export * from './instance';

// Balance機能
export { getJPYCBalance } from './balance/getJPYCBalance';
export { getJPYCTotalSupply } from './balance/getJPYCTotalSupply';

// Transfer機能
export { executeTransfer } from './transfer/executeTransfer';

// Approve機能
export { getJPYCAllowance } from './approve/getJPYCAllowance';
export { executeApprove } from './approve/executeApprove';

// Permit機能
export { getPermitNonce } from './permit/getPermitNonce';
export { getDomainSeparator } from './permit/getDomainSeparator';
export { createPermitSignature } from './permit/createPermitSignature';
export { executeBroadcastPermit } from './permit/executeBroadcastPermit';

// Authorization機能 (EIP-3009)
export { 
  executeTransferWithAuthorization, 
  createTransferWithAuthorizationSignature, 
  generateNonce, 
  generateValidityWindow 
} from './authorization/transferWithAuthorization';
export { 
  executeReceiveWithAuthorization, 
  createReceiveWithAuthorizationSignature 
} from './authorization/receiveWithAuthorization';
export { 
  executeCancelAuthorization, 
  createCancelAuthorizationSignature 
} from './authorization/cancelAuthorization';
