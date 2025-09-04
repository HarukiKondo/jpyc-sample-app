#!/bin/bash

# GitHub Codespaces 初期セットアップスクリプト

set -e

echo "🚀 JPYC Sample App Codespaces環境をセットアップ中..."

# Gitサブモジュールの初期化と更新
echo "📁 Gitサブモジュールを初期化中..."
git submodule update --init --recursive

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

# JPYC React SDKをビルド
echo "⚛️ JPYC React SDKをビルド中..."
cd external/jpyc-sdks/packages/react
npm install
npm run build
cd ../../../..

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

# .env.exampleファイルを作成
cat > apps/.env.example << EOF
# WalletConnect Project ID (https://cloud.walletconnect.com/ で取得)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# 開発環境設定
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# モード設定（react-sdk | exercise）
NEXT_PUBLIC_MODE=react-sdk

# 学習モード設定（exercise使用時）
EXERCISE_MODE=all
EOF

# .env.localファイルを作成（存在しない場合のみ）
if [ ! -f apps/.env.local ]; then
    cat > apps/.env.local << EOF
# WalletConnect Project ID (https://cloud.walletconnect.com/ で取得)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Codespaces環境用設定
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# モード設定（react-sdk | exercise）
NEXT_PUBLIC_MODE=react-sdk

# 学習モード設定（exercise使用時）
EXERCISE_MODE=all
EOF
fi

# AnvilデータディレクトリF作成
mkdir -p .devcontainer/anvil-data

echo "✅ セットアップが完了しました！"
echo ""
echo "🎉 JPYC React SDK統合環境が準備されました"
echo ""
echo "📝 次のステップ:"
echo "1. apps/.env.local でWalletConnect Project IDを設定"
echo "2. ターミナルで 'pnpm anvil' を実行してローカルブロックチェーンを起動"
echo "3. 新しいターミナルで 'pnpm contracts:deploy' を実行してコントラクトをデプロイ"
echo "4. さらに新しいターミナルで 'pnpm dev' を実行（React SDK版）"
echo "   または 'pnpm dev:exercise' を実行（学習版）"
echo "5. ポート転送で公開されたURLからアプリにアクセス"
echo ""
echo "🔧 利用可能なコマンド:"
echo "  - pnpm dev          : React SDK完成版"
echo "  - pnpm dev:exercise : React SDK学習版"
echo "  - pnpm anvil        : ローカルブロックチェーン起動"
echo "  - pnpm contracts:deploy : コントラクトデプロイ" 