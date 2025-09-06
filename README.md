# JPYC ハンズオン - サンプルアプリケーション

JPYCを使った決済フローをハンズオンで実装・理解するためのサンプルアプリケーションです。

## 🎯 ハンズオンの目的

- **JPYC基本操作**の体験: `balanceOf` / `transfer` / `approve` / `permit` / `authorization`
- **ゲートウェイ経由決済**の理解: 注文IDをオンチェーン記録
- **3つの決済フロー**の比較: Approve+Pay（2TX） vs Permit+Pay（1TX） vs Transfer Auth（1TX）
- **技術スタック**: Next.js + viem + RainbowKit / Foundry

## 🚀 クイックスタート（GitHub Codespaces使用）

### ☁️ 1. Codespacesでの起動

1. **GitHubリポジトリページ** で緑色の「**Code**」ボタンをクリック
2. **「Codespaces」タブ** を選択
3. **「Create codespace on main」** をクリック

### ⚙️ 2. 自動セットアップの確認

Codespacesが起動したら、**自動セットアップが実行される**はずです：
※ 結構な時間がかかるので辛抱してください。

```bash
# セットアップ内容（自動実行）:
# - Gitサブモジュール初期化（JPYC React SDK）
# - pnpm インストール
# - Foundry インストール  
# - JPYC React SDKビルド
# - プロジェクト依存関係インストール
# - .env.local テンプレート作成
```

もしセットアップが実行されていない場合、手動で実行：

```bash
bash .devcontainer/setup.sh
```

### 🔧 3. 開発環境起動
- **Sepolia ネットワーク想定（ハンズオンではこちらを使用します）**

ルートディレクトリで下記のコマンドを実行すると即座に挙動を確認できる

### 🎓 React SDK学習版（ハンズオン）
```bash
pnpm dev
```
React SDKの部分が未実装の`apps/src/components/tabs/exercise`が立ち上がります。

### ⚛️ React SDK 完成版
```bash
pnpm dev:complete
```
React SDKの部分が実装済みの`apps/src/components/tabs/react-sdk`が立ち上がります。全ての機能を体験できます。


## 📱 アプリケーション機能

### 🔗 ウォレット接続
- **RainbowKit**によるウォレット接続
- MetaMask、WalletConnect対応
- ネットワーク自動切り替え

### 📊 Balance（残高確認）
- 接続ウォレットのJPYC残高を表示
- `ERC20.balanceOf()` の基本操作

### 💸 Transfer（送信）
- 指定アドレスへのJPYC送信
- `ERC20.transfer()` の体験
- 注文IDとは紐付けない単純送信

### ✅ Approve（承認設定）
- PaymentGatewayへのJPYC使用許可
- `ERC20.approve()` とallowanceの理解
- 現在の承認額表示

### ✍️ Permit（署名承認）
- **EIP-2612**による署名ベース承認
- **EIP-712**構造化データ署名の学習
- 署名パラメータ（v, r, s）の可視化

### 🔐 Authorization（EIP-3009）
- **transferWithAuthorization**: 送信者が署名、誰でも実行可能
- **receiveWithAuthorization**: 送信者が署名、受取者のみ実行可能
- **cancelAuthorization**: 認証者が署名、誰でも実行可能

### 🛒 Purchase（商品購入）
- モック商品（コーヒー、サンドイッチ、ケーキ）
- 3つの決済方式:
  - **Approve+Pay**: 2トランザクション方式
  - **Permit+Pay**: 1トランザクション方式
  - **Transfer Auth**: 1トランザクション方式（EIP-3009）
- 注文ID自動生成・履歴保存

### 👨‍💼 Admin（管理画面）
- **Transfer イベント**: 基本的なERC20送信履歴
- **OrderPaid イベント**: ゲートウェイ経由決済履歴
- **Approval イベント**: PaymentGateway宛の承認履歴
- **AuthorizationUsed イベント**: EIP-3009使用履歴
- 注文詳細（商品名、数量）の表示
- ブロック時刻・トランザクションハッシュ

## 🏗️ プロジェクト構造

```
jpyc-sample-app/
├── apps/                          # フロントエンドアプリケーション
│   ├── src/
│   │   ├── abi/                  # スマートコントラクト ABI
│   │   │   ├── JPYC.json
│   │   │   └── PaymentGateway.json
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── api/
│   │   │   │   └── anvil-proxy/  # Codespaces用プロキシ
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/           # React コンポーネント
│   │   │   ├── tabs/            # 各機能タブ
│   │   │   │   ├── react-sdk/   # React SDK完成版
│   │   │   │   │   ├── AdminTab.tsx      # 管理画面
│   │   │   │   │   ├── ApproveTab.tsx    # Approve機能
│   │   │   │   │   ├── AuthorizationTab.tsx # EIP-3009機能
│   │   │   │   │   ├── BalanceTab.tsx    # 残高確認
│   │   │   │   │   ├── PermitTab.tsx     # Permit機能
│   │   │   │   │   ├── PurchaseTab.tsx   # 商品購入
│   │   │   │   │   └── TransferTab.tsx   # 送信機能
│   │   │   │   └── exercise/    # 学習版（要実装）
│   │   │   │       ├── ApproveTab.tsx    # Approve学習
│   │   │   │       ├── AuthorizationTab.tsx # EIP-3009学習
│   │   │   │       ├── BalanceTab.tsx    # 残高確認学習
│   │   │   │       ├── PermitTab.tsx     # Permit学習
│   │   │   │       └── TransferTab.tsx   # 送信学習
│   │   │   ├── Providers.tsx    # React SDK + RainbowKit設定
│   │   │   └── WalletConnect.tsx
│   │   ├── lib/                 # ライブラリ・ユーティリティ
│   │   │   ├── core/           # コア機能
│   │   │   │   ├── config.ts        # アドレス設定
│   │   │   │   ├── payment.ts       # 決済ロジック
│   │   │   │   └── utils.ts         # ユーティリティ
│   │   │   ├── utils/          # 署名・フォーマット関数
│   │   │   ├── jpycClient.ts   # React SDK + コア機能
│   │   │   ├── wagmi.ts        # Wagmi設定
│   │   │   └── viem.ts         # Viem設定
│   │   └── types/              # TypeScript型定義
│   ├── package.json
│   └── tailwind.config.ts
├── external/                      # Git Submodule
│   └── jpyc-sdks/               # JPYC React SDK
│       └── packages/react/      # React SDK本体
├── contracts/                     # Foundryプロジェクト
│   ├── src/
│   │   └── PaymentGateway.sol    # メイン決済コントラクト
│   ├── script/
│   │   ├── Deploy.s.sol          # 本番用デプロイ
│   │   ├── DeployLocal.s.sol     # ローカル開発用
│   │   └── DeploySepolia.s.sol   # Sepolia用デプロイ
│   ├── test/
│   │   └── PaymentGateway.t.sol  # テストファイル
│   ├── lib/                      # 外部ライブラリ
│   │   ├── forge-std/
│   │   └── openzeppelin-contracts/
│   └── foundry.toml              # Foundry設定
├── docker/                        # Docker設定
│   ├── anvil/Dockerfile          # Anvilコンテナ
│   └── development/Dockerfile    # 開発環境コンテナ
├── .devcontainer/                 # GitHub Codespaces設定
│   ├── devcontainer.json
│   ├── setup.sh                  # 初期セットアップ
│   └── start-dev.sh             # 開発環境起動
├── compose.yaml                   # Docker Compose設定
└── README.md                      # このファイル
```

## 🌐 GitHub Codespaces + Anvil ローカル開発

### 🔧 Anvil起動（ローカルブロックチェーン）

**ターミナル1（Anvil起動）**:
```bash
cd contracts
anvil --host 0.0.0.0 --port 8545 --gas-limit 30000000 --gas-price 0 --base-fee 0
```

**ターミナル2（コントラクトデプロイ）**:
```bash
cd contracts
forge script script/DeployLocal.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**ターミナル3（フロントエンド起動）**:
```bash
pnpm dev
```

### 🌐 アクセス確認

- **フロントエンド**: `https://xxxxx-3000.app.github.dev` (ポート転送URL)
- **Anvil**: `https://xxxxx-8545.app.github.dev` (内部プロキシ経由)

VS Codeの**PORTS**タブで転送URLを確認できます。

### 📱 MetaMask設定（Codespaces + Anvil）

**重要**: Codespaces環境では**ポート転送URL**を使用：

1. **PORTS**タブで8545番ポートの転送URLをコピー
2. MetaMaskのネットワーク設定:
   - **ネットワーク名**: `Anvil Codespaces`
   - **RPC URL**: `https://xxxxx-8545.app.github.dev` (実際のポート転送URL)
   - **チェーンID**: `31337`
   - **通貨記号**: `ETH`

### 🔑 テストアカウントのインポート

```
プライベートキー: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
アドレス: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 💡 Codespaces環境の特徴

- **VSCode拡張機能**: Solidity・TypeScript・Tailwind CSS拡張が自動インストール
- **ポート自動転送**: 3000番（フロントエンド）と8545番（Anvil）が自動で公開
- **APIプロキシ**: CORS問題を回避するため`/api/anvil-proxy`経由でAnvilに接続
- **永続化**: Codespacesは設定やインストール済みパッケージを保持
- **無料枠**: 月120コアアワーまで無料利用可能

## 🐳 Docker開発環境

Docker環境を使用することで、Node.js・Foundry・Anvilの複雑なセットアップを自動化できます。

### 🚀 環境構築

```bash
# 1. イメージビルド・起動
docker compose build
docker compose up -d

# 2. コンテナへログイン
docker compose exec application bash

# 3. Foundry セットアップ
cd /application/contracts
forge install

# 4. 依存関係インストール
cd /application && pnpm install
cd /application/apps && pnpm install

# 5. コントラクトデプロイ
cd /application/contracts
forge script script/DeployLocal.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 6. フロントエンド起動
cd /application/apps
pnpm dev
```

### 📱 Docker環境でのMetaMask設定

- **ネットワーク名**: `Anvil Local (Docker)`
- **RPC URL**: `http://localhost:8545`
- **チェーンID**: `31337`
- **通貨記号**: `ETH`

### 📱 MetaMask設定（ローカル）

- **ネットワーク名**: `Anvil Local`
- **RPC URL**: `http://localhost:8545`
- **チェーンID**: `31337`
- **通貨記号**: `ETH`

## 🌐 Sepoliaテストネット開発

### 📋 前提条件

- **Sepolia ETH**: [Sepolia Faucet](https://sepoliafaucet.com/)
- **JPYC**: [JPYC Testnet Faucet](https://faucet.jpyc.jp/)
- **Etherscan API Key**: [Etherscan](https://etherscan.io/apis)

### 🚀 Sepoliaデプロイ

```bash
cd contracts

# PaymentGatewayをSepoliaにデプロイ
forge script script/DeploySepolia.s.sol:DeploySepolia \
  --rpc-url https://rpc.sepolia.org \
  --broadcast \
  --verify \
  --etherscan-api-key YOUR_ETHERSCAN_API_KEY \
  --private-key YOUR_PRIVATE_KEY
```

### ⚙️ 設定済みアドレス（Sepolia）

- **JPYC**: `0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29`
- **PaymentGateway**: デプロイ後に`apps/src/lib/core/config.ts`で更新
- **Merchant**: `0x47e98DA2D8FA38ea76bBDbD1d3E2725732cb3A88`


### 🔧 主要技術コンポーネント

#### PaymentGateway.sol

```solidity
// Approve済みトークンでの決済
function pay(bytes32 orderId, uint256 amount, bytes32 metaHash) external;

// Permit + 決済を1トランザクションで実行
function permitAndPay(
    bytes32 orderId, uint256 amount, bytes32 metaHash,
    address owner, uint256 value, uint256 deadline,
    uint8 v, bytes32 r, bytes32 s
) external;

// EIP-3009 transferWithAuthorization経由での決済
function payWithTransferAuthorization(
    bytes32 orderId, uint256 amount, bytes32 metaHash,
    address from, uint256 validAfter, uint256 validBefore, bytes32 nonce,
    uint8 v, bytes32 r, bytes32 s
) external;
```

### 🌐 一般的な問題

#### MetaMask Chain ID エラー
```
Chain ID returned by the custom network does not match the submitted chain ID.
```
**解決策**: MetaMaskでAnvilネットワークを削除し、Chain ID `31337` で再作成

#### コントラクト関数エラー
```
The contract function "DOMAIN_SEPARATOR" reverted.
```
**解決策**: JPYC アドレスが正しくPermitに対応しているか確認

#### EIP-3009署名エラー
```
EIP3009: invalid signature
```
**解決策**: 署名作成時のmerchantアドレスとPaymentGatewayのmerchantアドレスが一致しているか確認

## 🔒 セキュリティ考慮事項

- **ReentrancyGuard**: 再帰攻撃防止
- **注文ID重複防止**: `usedOrders` mapping
- **Permit期限チェック**: deadline validation
- **Authorization期限チェック**: validAfter/validBefore validation
- **metaHash検証**: データ改ざん検出
- **nonce管理**: リプレイ攻撃防止

## 📚 参考資料

- [JPYC Documentation](https://docs.jpyc.jp/)
- [EIP-2612: Permit Extension](https://eips.ethereum.org/EIPS/eip-2612)
- [EIP-3009: Transfer With Authorization](https://eips.ethereum.org/EIPS/eip-3009)
- [EIP-712: Structured Data Signing](https://eips.ethereum.org/EIPS/eip-712)
- [Foundry Book](https://book.getfoundry.sh/)
- [wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

---

**🚀 Happy Learning with JPYC!** 