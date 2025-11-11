# ネットワーク・トークン自動追加機能

このプロジェクトに、EIP-3085、EIP-3326、EIP-747に準拠したネットワークとトークンの自動追加機能を実装しました。

## 📋 実装した機能

### 1. ネットワーク管理機能

#### EIP-3085: `wallet_addEthereumChain`
ウォレットに新しいネットワークを追加する機能です。

```typescript
await addNetworkToWallet('sepolia');
await addNetworkToWallet('polygonAmoy');
await addNetworkToWallet('avalancheFuji');
```

#### EIP-3326: `wallet_switchEthereumChain`
ネットワークを切り替える機能です。未登録の場合は自動的に追加します。

```typescript
await switchNetwork('sepolia');
```

### 2. トークン管理機能

#### EIP-747: `wallet_watchAsset`
JPYCトークンをウォレットに追加する機能です。

```typescript
await addTokenToWallet('sepolia');
```

## 🌐 サポートしているネットワーク

| ネットワーク | Chain ID | JPYC アドレス |
|------------|----------|--------------|
| **Sepolia** | 11155111 (0xaa36a7) | 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB |
| **Polygon Amoy** | 80002 (0x13882) | 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB |
| **Avalanche Fuji** | 43113 (0xa869) | 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB |
| **Localhost** | 31337 (0x7a69) | 0x5FbDB2315678afecb367f032d93F642f64180aa3 |

## 🎨 UI コンポーネント

### NetworkManagement コンポーネント

メインページに統合されたUIコンポーネントで、以下の機能を提供します：

- **ネットワーク追加ボタン**: 各ネットワークをウォレットに追加
- **ネットワーク切替ボタン**: 指定したネットワークに切り替え
- **トークン追加ボタン**: 現在のネットワークのJPYCトークンを追加
- **ステータス表示**: 成功・エラーメッセージの表示
- **現在のネットワーク表示**: 接続中のネットワークをハイライト

## 📁 変更されたファイル

### 1. `apps/src/lib/core/config.ts`
- `NETWORK_CONFIGS`: ネットワーク設定の定義
- `JPYC_TOKEN_CONFIGS`: トークン設定の定義
- `addNetworkToWallet()`: ネットワーク追加関数
- `switchNetwork()`: ネットワーク切替関数
- `addTokenToWallet()`: トークン追加関数
- `getNetworkKeyFromChainId()`: Chain IDからネットワークキーを取得
- `getNetworkKeyFromChainName()`: チェーン名からネットワークキーを取得

### 2. `apps/src/components/NetworkManagement.tsx`
新しく作成されたUIコンポーネント。ネットワークとトークンの管理機能を提供します。

### 3. `apps/src/types/ethereum.d.ts`
Ethereum Provider の型定義を拡張：
- `chainId` プロパティを追加
- `request` メソッドのパラメータ型を改善

### 4. `apps/src/app/page.tsx`
メインページに `NetworkManagement` コンポーネントを追加しました。

## 🚀 使い方

1. **アプリケーションを起動**
   ```bash
   cd apps
   npm run dev
   ```

2. **ウォレットを接続**
   - ページ上部の「ウォレットを接続」ボタンをクリック
   - MetaMaskなどのウォレットで接続を承認

3. **ネットワークを追加**
   - 「ネットワーク管理」セクションで追加したいネットワークの「追加」ボタンをクリック
   - ウォレットのポップアップで承認

4. **ネットワークを切り替え**
   - 「切替」ボタンをクリックして、指定したネットワークに切り替え
   - 未登録の場合は自動的に追加されます

5. **トークンを追加**
   - 目的のネットワークに接続した状態で「ウォレットにトークンを追加」ボタンをクリック
   - ウォレットのポップアップで承認

## 🔒 エラーハンドリング

実装では以下のエラーを適切に処理しています：

- **4001**: ユーザーがリクエストを拒否
- **4902**: ネットワークが未登録（自動的に追加を試みる）
- **-32602**: 無効なパラメータ
- **-32603**: ネットワークが既に追加済み

## 📚 参考資料

- [EIP-3085: wallet_addEthereumChain](https://eips.ethereum.org/EIPS/eip-3085)
- [EIP-3326: wallet_switchEthereumChain](https://eips.ethereum.org/EIPS/eip-3326)
- [EIP-747: wallet_watchAsset](https://eips.ethereum.org/EIPS/eip-747)
- [MetaMask Documentation](https://docs.metamask.io/)

## 🎯 今後の改善案

- [ ] ネットワーク設定のカスタマイズ機能
- [ ] 他のトークン（ERC20）の追加サポート
- [ ] ネットワーク切り替え時の自動リロード
- [ ] モバイルウォレット対応の強化
- [ ] ネットワーク接続状態のリアルタイム監視

---

**実装日**: 2025年11月11日  
**ブランチ**: `feature/add-network-token-management`  
**コミット**: `5bc53e4`

