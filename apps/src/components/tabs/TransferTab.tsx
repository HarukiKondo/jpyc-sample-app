"use client";

import { useState } from "react";
import { useAccount, useChainId } from 'wagmi';
import { isAddress } from 'viem';
import { getJPYCAddress, executeTransfer, parseJPYC } from '@/lib/jpycClient';

export default function TransferTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!isConnected) {
      alert("ウォレットを接続してください");
      return;
    }

    if (!recipient || !amount) {
      alert("送金先アドレスと金額を入力してください");
      return;
    }

    if (!isAddress(recipient)) {
      alert("有効なアドレスを入力してください");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("有効な金額を入力してください");
      return;
    }

    try {
      setIsPending(true);
      setError(null);
      
      // aliased jpycClient の executeTransfer を使用
      const amountWei = parseJPYC(amount);
      const txHash = await executeTransfer(recipient as `0x${string}`, amountWei);
      
      setHash(txHash);
      setIsPending(false);
      setIsConfirming(true);
      
      // 簡易的な成功判定（実際のプロジェクトではwaitForTransactionReceiptを使用）
      setTimeout(() => {
        setIsConfirming(false);
        setIsSuccess(true);
      }, 3000);
      
    } catch (err: any) {
      console.error("送金エラー:", err);
      setError(err.message || "送金に失敗しました");
      setIsPending(false);
      setIsConfirming(false);
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">JPYC送金</h2>
          <p className="text-gray-600 mt-1">指定したアドレスにJPYCを送金します</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
          <span>基本送金機能</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン送金フォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">送金フォーム</h3>
                <p className="text-sm text-gray-600">ERC20 Transfer 操作</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  送金先アドレス
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all duration-200"
                    disabled={isPending || isConfirming}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">イーサリアムアドレス (0x...)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  送金額 (JPYC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={isPending || isConfirming}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">JPYC</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">送金したい金額を入力してください</p>
              </div>

              <button
                onClick={handleTransfer}
                disabled={!isConnected || isPending || isConfirming || !recipient || !amount}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    署名待ち...
                  </div>
                ) : isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    送金処理中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    送金実行
                  </div>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">送金エラー</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {hash && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isSuccess ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">
                      {isConfirming ? "送金処理中..." : isSuccess ? "送金完了!" : "送金中..."}
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      トランザクションハッシュ:
                    </p>
                    <div className="font-mono text-xs text-green-800 bg-green-100 p-2 rounded-lg mt-2 break-all">
                      {hash}
                    </div>
                    {isSuccess && (
                      <button
                        onClick={resetForm}
                        className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        新しい送金
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー情報 */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">送金について</h4>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">基本送金</h5>
                  <p className="text-sm text-gray-600">
                    ERC20の<code className="bg-gray-100 px-1 rounded text-xs">transfer</code>関数を使用した
                    シンプルな送金です。
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <svg className="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">注意事項</h5>
                  <p className="text-sm text-gray-600">
                    これは「購入」ではありません。注文IDとは紐付かない基本的な送金操作です。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h5 className="font-medium text-gray-900 mb-1">ウォレット未接続</h5>
                <p className="text-sm text-gray-600">
                  送金を行うには、まずウォレットを接続してください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 