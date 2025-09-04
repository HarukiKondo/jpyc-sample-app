"use client";

import { useAccount, useChainId } from 'wagmi';
// TODO: React SDKのフックをインポートしてください
// import { useBalanceOf, useTotalSupply } from '@jpyc/sdk-react';
import { getJPYCAddress } from '@/lib/jpycClient';

export default function BalanceTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // TODO: 🎯 JPYC SDK核心部分1: useBalanceOfフックを使用してください
  // const { 
  //   data: balance, 
  //   isPending: isBalanceLoading, 
  //   error: balanceError 
  // } = useBalanceOf({ 
  //   account: address as `0x${string}`,
  //   skip: !address || !isConnected
  // });

  // TODO: 🎯 JPYC SDK核心部分2: useTotalSupplyフックを使用してください
  // const { 
  //   data: totalSupply, 
  //   isPending: isTotalSupplyLoading, 
  //   error: totalSupplyError 
  // } = useTotalSupply({
  //   skip: !isConnected
  // });

  // 仮の状態（練習用）
  const balance = '0';
  const isBalanceLoading = false;
  const balanceError = null;
  const totalSupply = '0';
  const isTotalSupplyLoading = false;
  const totalSupplyError = null;

  // TODO: 状態を統合してください
  // const isLoading = isBalanceLoading || isTotalSupplyLoading;
  // const error = balanceError || totalSupplyError;
  const isLoading = false;
  const error = null;

  // TODO: React SDKは文字列で返し、decimal変換済みです
  // const formattedBalance = parseFloat(balance || '0');
  // const formattedTotalSupply = parseFloat(totalSupply || '0');
  const formattedBalance = 0;
  const formattedTotalSupply = 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">JPYC残高確認 (Exercise)</h2>
          <p className="text-gray-600 mt-2 text-lg">React SDKフックを実装して残高とTotal Supplyを表示してください</p>
        </div>
        <button
          onClick={fetchBalance}
          disabled={!isConnected || isLoading}
          className="inline-flex items-center px-6 py-3 border border-blue-300 text-base font-medium rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <svg className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? "更新中..." : "残高を更新"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* メイン残高表示 */}
        <div>
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

        {/* Total Supply表示 */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                  <span className="text-white font-bold text-xl">∑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Total Supply</h3>
                  <p className="text-base text-gray-600">総供給量</p>
                </div>
              </div>
            </div>

            <div className="text-center py-12">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mr-4"></div>
                  <span className="text-gray-700 text-xl font-medium">読み込み中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-semibold text-lg">Total Supplyの取得に失敗しました</p>
                  <p className="text-gray-600 text-base mt-2">ネットワーク接続を確認してください</p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl font-bold text-gray-900 mb-3">
                    {Number(formattedTotalSupply).toLocaleString('ja-JP', {
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
      </div>

      {/* ウォレット情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 mt-1 border border-blue-200">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-blue-900 mb-2 text-lg">残高確認</h5>
                <p className="text-base text-blue-800 leading-relaxed">
                  ERC20の<code className="bg-blue-200 px-2 py-1 rounded text-sm font-mono border">balanceOf</code>関数を使用してJPYC残高を取得しています。
                  ウォレット接続後、リアルタイムで残高が表示されます。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4 mt-1 border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-green-900 mb-2 text-lg">Total Supply</h5>
                <p className="text-base text-green-800 leading-relaxed">
                  ERC20の<code className="bg-green-200 px-2 py-1 rounded text-sm font-mono border">totalSupply</code>関数を使用してJPYCの総供給量を取得しています。
                  市場に流通しているJPYCの総量が表示されます。
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

      {/* 学習ガイドパネル */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-orange-900 mb-4">📚 実装ガイド</h4>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <span className="text-orange-600 font-bold text-sm">1</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">フックをインポート</h5>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono border">
                import &#123; useBalanceOf, useTotalSupply &#125; from '@jpyc/sdk-react';
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <span className="text-orange-600 font-bold text-sm">2</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">useBalanceOfを使用</h5>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono border">
                const &#123; data: balance, isPending, error &#125; = useBalanceOf(&#123;<br/>
                &nbsp;&nbsp;account: address as `0x$&#123;string&#125;`,<br/>
                &nbsp;&nbsp;skip: !address || !isConnected<br/>
                &#125;);
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <span className="text-orange-600 font-bold text-sm">3</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">useTotalSupplyを使用</h5>
              <div className="mt-2 p-2 bg-white rounded text-xs font-mono border">
                const &#123; data: totalSupply, isPending &#125; = useTotalSupply(&#123;<br/>
                &nbsp;&nbsp;skip: !isConnected<br/>
                &#125;);
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <span className="text-green-600 font-bold text-sm">💡</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-1">重要なポイント</h5>
              <p className="text-sm text-gray-600">
                React SDKは<strong>文字列</strong>でbalanceを返し、<strong>decimal変換済み</strong>です。<br/>
                <code className="bg-gray-100 px-1 rounded">parseFloat(balance || '0')</code>で数値に変換してください。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white border border-orange-200 rounded-lg">
          <h5 className="font-medium text-orange-900 mb-2">実装状況</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>useBalanceOfインポート:</span>
              <span className="text-red-600">未実装</span>
            </div>
            <div className="flex justify-between">
              <span>useTotalSupplyインポート:</span>
              <span className="text-red-600">未実装</span>
            </div>
            <div className="flex justify-between">
              <span>フック呼び出し:</span>
              <span className="text-red-600">未実装</span>
            </div>
            <div className="flex justify-between">
              <span>データ表示:</span>
              <span className="text-red-600">未実装</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 