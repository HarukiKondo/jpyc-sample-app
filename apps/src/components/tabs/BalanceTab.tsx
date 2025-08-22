"use client";

import { useAccount, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import JPYC_ABI from "@/abi/JPYC.json";

// チェーンIDに応じてJPYCアドレスを取得
function getJPYCAddress(chainId: number): `0x${string}` {
  if (chainId === 31337) {
    // Anvil Local
    return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  } else {
    // テストネット（Sepolia, Polygon Amoy, Avalanche Fuji等）
    return "0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29";
  }
}

export default function BalanceTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const jpycAddress = getJPYCAddress(chainId);
  
  const { data: balance, isLoading, refetch, error } = useReadContract({
    address: jpycAddress,
    abi: JPYC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!jpycAddress,
    },
  });

  const formattedBalance = balance ? formatUnits(balance as bigint, 18) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">JPYC残高確認</h2>
          <p className="text-gray-600 mt-2 text-lg">ウォレットのJPYC残高をリアルタイムで表示します</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={!isConnected || isLoading}
          className="inline-flex items-center px-6 py-3 border border-blue-300 text-base font-medium rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? "更新中..." : "残高を更新"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン残高表示 */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">¥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">JPYC残高</h3>
                  <p className="text-base text-gray-600">現在の保有量</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isConnected 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {isConnected ? '接続済み' : '未接続'}
              </div>
            </div>

            <div className="text-center py-12">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4"></div>
                  <span className="text-gray-700 text-xl font-medium">読み込み中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-semibold text-lg">残高の取得に失敗しました</p>
                  <p className="text-gray-600 text-base mt-2">ネットワーク接続を確認してください</p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl font-bold text-gray-900 mb-3">
                    {Number(formattedBalance).toLocaleString('ja-JP', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6
                    })}
                  </div>
                  <div className="text-2xl text-gray-600 font-semibold">JPYC</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ウォレット情報 */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-6">ウォレット情報</h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  ウォレットアドレス
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
                  {address ? (
                    <div className="font-mono text-sm text-gray-900 break-all bg-white p-3 rounded-lg border">
                      {address}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-base text-center py-3">
                      ウォレットが接続されていません
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  ステータス
                </label>
                <div className={`flex items-center p-4 rounded-xl border-2 ${
                  isConnected 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-base font-semibold ${
                    isConnected ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {isConnected ? 'ウォレット接続済み' : 'ウォレット未接続'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 使用方法 */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 mt-1 border border-blue-200">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-blue-900 mb-2 text-lg">使用方法</h5>
                <p className="text-base text-blue-800 leading-relaxed">
                  ERC20の<code className="bg-blue-200 px-2 py-1 rounded text-sm font-mono border">balanceOf</code>関数を使用してJPYC残高を取得しています。
                  ウォレット接続後、リアルタイムで残高が表示されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-300">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">ウォレットを接続してください</h3>
          <p className="text-gray-600 text-lg">
            残高を確認するには、上部のウォレット接続ボタンからMetaMaskなどのウォレットを接続してください。
          </p>
        </div>
      )}
    </div>
  );
} 