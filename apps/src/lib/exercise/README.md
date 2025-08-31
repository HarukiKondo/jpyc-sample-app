# JPYC SDK 練習用エクササイズ

このディレクトリには、JPYC SDKの機能を学習するための練習用ファイルが含まれています。

## 🎯 目標

JPYC React SDKのGitHubリポジトリの実装を参考にして、以下の機能を実装してください。

## 📚 練習課題

### Level 1: 基本機能
1. **Balance機能**
   - `getJPYCBalance.ts` - JPYC残高取得
   - `getJPYCTotalSupply.ts` - 総供給量取得

### Level 2: 転送・承認
2. **Transfer機能**
   - `executeTransfer.ts` - JPYC転送実行

3. **Approve機能**
   - `getJPYCAllowance.ts` - 許可額取得
   - `executeApprove.ts` - 承認実行

### Level 3: Permit (EIP-2612)
4. **Permit機能**
   - `getPermitNonce.ts` - Nonce取得
   - `getDomainSeparator.ts` - Domain Separator取得
   - `createPermitSignature.ts` - Permit署名作成
   - `executeBroadcastPermit.ts` - Permit実行

### Level 4: Authorization (EIP-3009)
5. **Authorization機能**
   - `transferWithAuthorization.ts` - Transfer with Authorization
   - `receiveWithAuthorization.ts` - Receive with Authorization
   - `cancelAuthorization.ts` - Cancel Authorization

## 🚀 実行方法

### 練習モード開始
\`\`\`bash
pnpm dev:exercise
\`\`\`

### 完成版確認
\`\`\`bash
pnpm dev
\`\`\`

## 📖 参考リソース

1. **JPYC React SDK**: GitHubリポジトリの実装を参考にしてください
2. **viem Documentation**: https://viem.sh/
3. **EIP-2612 (Permit)**: https://eips.ethereum.org/EIPS/eip-2612
4. **EIP-3009 (Transfer with Authorization)**: https://eips.ethereum.org/EIPS/eip-3009

## ✅ 実装確認

各機能を実装後、ブラウザで動作確認してください：

- **Balance**: 残高表示タブで残高が表示される
- **Transfer**: 転送タブで送金ができる
- **Approve**: 承認タブでApproveができる
- **Permit**: Permitタブで署名・実行ができる
- **Authorization**: AuthorizationタブでEIP-3009機能が使える

**注意**: `formatJPYC` と `parseJPYC` は既に実装済みです（`/src/lib/utils/` に配置）。これらはSDKには含まれないアプリ固有のユーティリティ関数です。

## 🎓 学習のコツ

1. **完成版を参考**: `/src/lib/sdk/` の完成版実装を見て理解を深める
2. **段階的実装**: Level 1から順番に実装していく
3. **エラー確認**: ブラウザのDevToolsでエラーを確認しながら進める
4. **型安全性**: TypeScriptの型エラーを解決する

## 🔧 実装ヒント

- `getPublicClientInstance()` - 読み取り専用操作用
- `getWalletClientInstance()` - 書き込み操作用
- `getJPYCAddress()` - JPYCコントラクトアドレス取得
- `JPYC_ABI` - コントラクトABI（`@/abi/JPYC.json`）
- `formatJPYC()` / `parseJPYC()` - 既に利用可能なユーティリティ関数

頑張って実装してください！🚀
