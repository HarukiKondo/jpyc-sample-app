#!/bin/bash

# GitHub Codespaces 開発環境起動ヘルパー

set -e

echo "🚀 JPYC Sample App 開発環境を起動中..."

# Foundryパスの設定
export PATH="$HOME/.foundry/bin:$PATH"

# 必要な環境変数をチェック
if [ ! -f apps/.env.local ]; then
    echo "❌ apps/.env.local ファイルが見つかりません"
    echo "セットアップスクリプトを実行してください: bash .devcontainer/setup.sh"
    exit 1
fi

# バックグラウンドでAnvilを起動
echo "🔗 Anvilローカルブロックチェーンを起動中..."
anvil --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

# Anvilの起動を待機
echo "⏳ Anvilの起動を待機中..."
sleep 5

# コントラクトをデプロイ
echo "🚀 コントラクトをデプロイ中..."
cd contracts
forge script script/DeployLocal.s.sol --fork-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
cd ..

# フロントエンドを起動
echo "🎨 フロントエンドを起動中..."
cd apps
pnpm dev &
FRONTEND_PID=$!
cd ..

echo "✅ 開発環境が起動しました！"
echo ""
echo "📝 接続情報:"
echo "  - フロントエンド: ポート転送されたURL (3000番ポート)"
echo "  - Anvil RPC: http://localhost:8545"
echo ""
echo "📱 MetaMask設定:"
echo "  - ネットワーク名: Anvil Local"
echo "  - RPC URL: ポート転送された8545番ポートのURL"
echo "  - チェーンID: 31337"
echo "  - 通貨記号: ETH"
echo ""
echo "🔑 テストアカウント:"
echo "  プライベートキー: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "⏹️ 停止するには Ctrl+C を押してください"

# シグナルハンドラでプロセスをクリーンアップ
trap 'echo ""; echo "🛑 開発環境を停止中..."; kill $ANVIL_PID $FRONTEND_PID 2>/dev/null; exit' INT TERM

# フォアグラウンドで待機
wait 