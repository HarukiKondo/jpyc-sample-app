# JPYC 決済サンプルアプリケーション

JPYCを使った決済フローをハンズオンで実装・理解するためのサンプルアプリケーションです。

## 🎯 目的

- **JPYC基本操作**の体験: `balanceOf` / `transfer` / `approve` / `permit`
- **ゲートウェイ経由決済**の実装: 注文ID + metaHashをオンチェーン記録
- **2つの決済フロー**の比較: Approve+Pay（2TX） vs Permit+Pay（1TX）
- **技術スタック**: Next.js + viem + RainbowKit / Foundry
- **将来対応**: viem部分を **JPYC SDK** に差し替え可能な設計

## 🏗️ プロジェクト構造

```
jpyc-sample-app/
├── apps/                   # フロントエンドアプリケーション
│   ├── src/
│   │   ├── abi/           # スマートコントラクト ABI
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # React コンポーネント
│   │   │   ├── tabs/      # 各機能タブ
│   │   │   ├── Providers.tsx
│   │   │   └── WalletConnect.tsx
│   │   ├── lib/           # ユーティリティ・クライアント
│   │   │   ├── jpycClient.ts  # JPYC操作のメイン実装
│   │   │   └── wagmi.ts       # Wagmi設定
│   │   └── types/         # TypeScript型定義
│   ├── public/            # 静的ファイル
│   ├── package.json       # フロントエンド依存関係
│   └── .env.local         # 環境変数（要作成）
├── contracts/             # Foundryプロジェクト
│   ├── src/
│   │   └── PaymentGateway.sol  # メイン決済コントラクト
│   ├── script/
│   │   ├── Deploy.s.sol        # メインネット用デプロイ
│   │   └── DeployLocal.s.sol   # ローカル開発用デプロイ
│   ├── test/
│   │   └── PaymentGateway.t.sol
│   ├── foundry.toml       # Foundry設定
│   └── .env               # コントラクト用環境変数（要作成）
├── .gitignore             # Git除外設定
└── README.md              # このファイル
```

## 🚀 クイックスタート

### 📋 前提条件

- **Node.js** 18.0.0+
- **pnpm** (推奨) または npm
- **Foundry** ([インストール手順](https://book.getfoundry.sh/getting-started/installation))
- **MetaMask** またはウォレット拡張

### 🔧 1. リポジトリのクローン

```bash
git clone https://github.com/jcam1/jpyc-sample-app.git
cd jpyc-sample-app
```

### ⚙️ 2. フロントエンドのセットアップ

```bash
cd apps
pnpm install
```

**環境変数ファイルを作成:**
```bash
# apps/.env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

[WalletConnect](https://cloud.walletconnect.com/) でProject IDを取得してください。

### 🔗 3. ローカル開発（推奨）

Anvilローカルネットワークでの開発が最も簡単です：

#### Step 1: Anvilネットワークを起動

```bash
cd contracts
anvil
```

#### Step 2: コントラクトをデプロイ

```bash
# 新しいターミナルで
cd contracts
forge script script/DeployLocal.s.sol --fork-url http://localhost:8545 --broadcast
```

#### Step 3: MetaMaskにAnvilネットワークを追加

- **ネットワーク名**: Anvil Local
- **RPC URL**: `http://localhost:8545`
- **チェーンID**: `31337`
- **通貨記号**: `ETH`

#### Step 4: テストアカウントをインポート

Anvilの最初のアカウントをMetaMaskにインポート：
```
プライベートキー: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### Step 5: フロントエンドを起動

```bash
cd apps
pnpm dev
```

🎉 **http://localhost:3000** でアプリケーションにアクセス！

### 🌐 テストネット開発

Sepolia テストネットでの開発:

#### 環境変数設定

**contracts/.env:**
```env
JPYC=0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29
MERCHANT=your_merchant_address
PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

**apps/.env.local:**
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

#### コントラクトデプロイ

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

#### テストネットトークン取得

- **Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)
- **JPYC**: [JPYC Testnet Faucet](https://faucet.jpyc.jp/)

## 📱 アプリケーション機能

### 🔗 ウォレット接続
- **RainbowKit**による美しいウォレット接続UI
- MetaMask、WalletConnect対応
- ネットワーク自動切り替え

### 📊 Balance（残高確認）
- 接続ウォレットのJPYC残高を表示
- `ERC20.balanceOf()` の基本操作

### 💸 Transfer（送金）
- 指定アドレスへのJPYC送金
- `ERC20.transfer()` の体験
- 注文IDとは紐付けない単純送金

### ✅ Approve（承認設定）
- PaymentGatewayへのJPYC使用許可
- `ERC20.approve()` とallowanceの理解
- 現在の承認額表示

### ✍️ Permit（署名承認）
- **EIP-2612**による署名ベース承認
- **EIP-712**構造化データ署名の学習
- 署名パラメータ（v, r, s）の可視化

### 🛒 Purchase（商品購入）
- モック商品（コーヒー、サンドイッチ、ケーキ）
- 2つの決済方式:
  - **Approve+Pay**: 2トランザクション方式
  - **Permit+Pay**: 1トランザクション方式
- 注文ID自動生成・履歴保存

### 👨‍💼 Admin（管理画面）
- **Transfer イベント**: 基本的なERC20送金履歴
- **OrderPaid イベント**: ゲートウェイ経由決済履歴
- 注文詳細（商品名、数量）の表示
- ブロック時刻・トランザクションハッシュ

## 🔧 主要技術コンポーネント

### PaymentGateway.sol

```solidity
// Approve済みトークンでの決済
function pay(bytes32 orderId, uint256 amount, bytes32 metaHash) external;

// Permit + 決済を1トランザクションで実行
function permitAndPay(
    bytes32 orderId, uint256 amount, bytes32 metaHash,
    address owner, uint256 value, uint256 deadline,
    uint8 v, bytes32 r, bytes32 s
) external;
```

### jpycClient.ts

viem基盤のJPYC操作ライブラリ：

```typescript
// 残高・許可額取得
export async function getJPYCBalance(address: Address): Promise<bigint>
export async function getJPYCAllowance(owner: Address, spender: Address): Promise<bigint>

// ERC20操作
export async function executeApprove(amount: bigint): Promise<Hash>
export async function executePayment(orderId: string, amount: bigint): Promise<Hash>

// Permit操作
export async function createPermitSignature(value: bigint, deadline: bigint)
export async function executePermitAndPay(orderId: string, amount: bigint, permitData: any): Promise<Hash>

// ユーティリティ
export function generateOrderId(): string
export function orderIdToBytes32(orderId: string): Hash
```

## 🎓 学習推奨フロー

1. **Balance** → ウォレット接続とJPYC残高確認
2. **Transfer** → 基本的なERC20送金体験
3. **Approve** → ゲートウェイへの許可設定
4. **Purchase (Approve+Pay)** → 2TX決済フロー
5. **Permit** → EIP-712署名の仕組み理解
6. **Purchase (Permit+Pay)** → 1TX決済フロー
7. **Admin** → 決済履歴とイベントログ確認

## 🛠️ 開発・カスタマイズ

### 新商品の追加

```typescript
// apps/src/components/tabs/PurchaseTab.tsx
const PRODUCTS = [
  { id: 'coffee', name: 'コーヒー', price: 500, emoji: '☕' },
  { id: 'newitem', name: '新商品', price: 1000, emoji: '🆕' }, // 追加
];
```

### チェーン設定の変更

```typescript
// apps/src/lib/wagmi.ts
export const chains = [
  anvilLocal,    // ローカル開発
  sepolia,       // テストネット
  // mainnet,    // 本番環境
] as const;
```

### ローカルデプロイスクリプトの実行

```bash
cd contracts

# MockJPYC + PaymentGateway をデプロイ
forge script script/DeployLocal.s.sol --fork-url http://localhost:8545 --broadcast

# Account #0 に 1M JPYC mint
# Account #1 を Merchant に設定
```

## 🔒 セキュリティ考慮事項

- **ReentrancyGuard**: 再帰攻撃防止
- **注文ID重複防止**: `usedOrders` mapping
- **Permit期限チェック**: deadline validation
- **metaHash検証**: データ改ざん検出

## 🐛 トラブルシューティング

### MetaMask Chain ID エラー
```
Chain ID returned by the custom network does not match the submitted chain ID.
```

**解決策**: MetaMaskでAnvilネットワークを削除し、Chain ID `31337` で再作成

### フロントエンド起動エラー
```
ENOENT: no such file or directory, uv_cwd
```

**解決策**: 正しいディレクトリで実行
```bash
cd apps  # apps/web ではない
pnpm dev
```

### コントラクト関数エラー
```
The contract function "DOMAIN_SEPARATOR" reverted.
```

**解決策**: JPYC アドレスが正しくPermitに対応しているか確認

## 📚 参考資料

- [JPYC Documentation](https://docs.jpyc.jp/)
- [EIP-2612: Permit Extension](https://eips.ethereum.org/EIPS/eip-2612)
- [EIP-712: Structured Data Signing](https://eips.ethereum.org/EIPS/eip-712)
- [Foundry Book](https://book.getfoundry.sh/)
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

## 🤝 コントリビューション

このプロジェクトは**JPYC決済フローの学習・研修**を目的としています。

- 改善提案: GitHub Issues
- 機能追加: Pull Requests
- 質問・サポート: Discussions

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

---

**🚀 Happy Learning with JPYC!** 