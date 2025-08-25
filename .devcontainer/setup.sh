#!/bin/bash

# GitHub Codespaces 初期セットアップスクリプト

set -e

echo "🚀 JPYC Sample App Codespaces環境をセットアップ中..."

# pnpmのインストール
echo "📦 pnpmをインストール中..."
npm install -g pnpm

# Foundryのインストール
echo "🔨 Foundryをインストール中..."
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
export PATH="$HOME/.foundry/bin:$PATH"
foundryup

# Foundryのパスを永続化
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bashrc

# ルートディレクトリの依存関係をインストール
echo "📋 ルート依存関係をインストール中..."
pnpm install

# フロントエンドの依存関係をインストール
echo "📋 フロントエンド依存関係をインストール中..."
cd apps
pnpm install
cd ..

# Foundryの依存関係をインストール
echo "🔧 Foundry依存関係をインストール中..."
cd contracts
forge install --no-commit
cd ..

# 環境変数ファイルのテンプレートを作成
echo "⚙️ 環境変数ファイルを作成中..."
if [ ! -f apps/.env.local ]; then
    cat > apps/.env.local << EOF
# WalletConnect Project ID (https://cloud.walletconnect.com/ で取得)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Codespaces環境用設定
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
EOF
fi

# AnvilデータディレクトリF作成
mkdir -p .devcontainer/anvil-data

echo "✅ セットアップが完了しました！"
echo ""
echo "📝 次のステップ:"
echo "1. apps/.env.local でWalletConnect Project IDを設定"
echo "2. ターミナルで 'anvil' を実行してローカルブロックチェーンを起動"
echo "3. 新しいターミナルで 'cd contracts && forge script script/DeployLocal.s.sol --fork-url http://localhost:8545 --broadcast' を実行"
echo "4. さらに新しいターミナルで 'cd apps && pnpm dev' を実行"
echo "5. ポート転送で公開されたURLからアプリにアクセス" 