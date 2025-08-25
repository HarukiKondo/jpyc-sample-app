'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, formatUnits, isAddress } from 'viem';
import { getJPYCAddress, getGatewayAddress, getJPYCAllowance, formatJPYC, parseJPYC, executeApprove } from '@/lib/jpycClient';
import JPYC_ABI from '@/abi/JPYC.json';

export default function ApproveTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // State
  const [amount, setAmount] = useState<string>('');
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(BigInt(0));
  const [loadingAllowance, setLoadingAllowance] = useState(false);

  // アドレス取得
  const jpycAddress = getJPYCAddress();
  const gatewayAddress = getGatewayAddress();

  // Allowance取得
  const fetchAllowance = async () => {
    if (!address) return;
    
    try {
      setLoadingAllowance(true);
      const allowance = await getJPYCAllowance(address, gatewayAddress);
      setCurrentAllowance(allowance);
    } catch (error) {
      console.error('Allowance取得エラー:', error);
    } finally {
      setLoadingAllowance(false);
    }
  };

  // Approve実行
  const handleApprove = async () => {
    if (!amount || !isConnected) return;

    try {
      const value = parseJPYC(amount);
      
      const approveHash = await executeApprove(gatewayAddress, value);
      console.log('Approve TX:', approveHash);
      
    } catch (error) {
      console.error('Approve エラー:', error);
    }
  };

  // Purchaseタブに遷移
  const goToPurchase = () => {
    // タブ切り替えのイベントを発火
    const event = new CustomEvent('switchTab', { detail: 'Purchase' });
    window.dispatchEvent(event);
  };

  // 初期ロード時とトランザクション成功時にAllowance更新
  useEffect(() => {
    if (isConnected) {
      fetchAllowance();
    }
  }, [isConnected, chainId]);

  useEffect(() => {
    if (isSuccess) {
      fetchAllowance();
      setAmount('');
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">ウォレット未接続</h3>
        <p className="text-gray-600">ERC20 Approve機能を利用するには、ウォレットを接続してください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">ERC20 Approve</h2>
        <p className="text-gray-600 mt-2 text-lg">Payment Gatewayへの許可額設定</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインフォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            {/* 現在のAllowance表示 */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">現在の許可額</h4>
                  <p className="text-sm text-blue-700">Payment Gatewayが使用可能な金額</p>
                </div>
                <div className="text-right">
                  {loadingAllowance ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatJPYC(currentAllowance)}
                      </div>
                      <div className="text-sm text-blue-500">JPYC</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Approveフォーム */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  許可する金額 (JPYC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 font-semibold"
                    style={{ color: '#111827 !important' }}
                    disabled={isPending || isConfirming}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">JPYC</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Payment Gatewayが使用できる最大金額を設定</p>
              </div>

              {/* Approveボタン */}
              <button
                onClick={handleApprove}
                disabled={!amount || isPending || isConfirming}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isPending ? '署名待ち...' : '処理中...'}
                  </div>
                ) : (
                  'Approve実行'
                )}
              </button>

              {/* Purchaseタブへのボタン */}
              {currentAllowance > BigInt(0) && (
                <button
                  onClick={goToPurchase}
                  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  💳 Purchaseタブで商品を購入
                </button>
              )}
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-900">Approveエラー</h4>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 成功表示 */}
            {isSuccess && hash && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">Approve完了!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      許可額が正常に設定されました
                    </p>
                    <div className="font-mono text-xs text-green-800 bg-green-100 p-2 rounded-lg mt-2 break-all">
                      {hash}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 学習ガイド */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">💡 学習ポイント</h4>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-semibold text-blue-900 mb-2">ERC20 Approve</h5>
                <p className="text-sm text-blue-800">
                  スマートコントラクトがあなたのトークンを使用することを許可する機能です。
                  現代的なERC20実装では、単純な上書きで安全に動作します。
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h5 className="font-semibold text-green-900 mb-2">💡 ベストプラクティス</h5>
                <p className="text-sm text-green-800">
                  必要な分だけ許可することで、セキュリティリスクを最小化できます。
                  無制限許可（uint256.max）は便利ですが、慎重に判断しましょう。
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h5 className="font-semibold text-purple-900 mb-2">🚀 次の選択肢</h5>
                <p className="text-sm text-purple-800">
                  Approveの代替として、EIP-2612 Permitを使用することで、
                  ガスレスでの許可設定が可能です（Permitタブで学習可能）。
                </p>
              </div>
            </div>
          </div>

          {/* 次のステップ */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🚀 次のステップ</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                Approveを実行
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                Purchaseタブで商品購入
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                Permitタブで署名学習
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 