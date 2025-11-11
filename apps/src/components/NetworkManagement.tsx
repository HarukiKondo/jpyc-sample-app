"use client";

import { useState } from 'react';
import { useChainId } from 'wagmi';
import {
  NETWORK_CONFIGS,
  JPYC_TOKEN_CONFIGS,
  addNetworkToWallet,
  switchNetwork,
  addTokenToWallet,
  getNetworkKeyFromChainId,
} from '@/lib/core/config';

export default function NetworkManagement() {
  const chainId = useChainId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddNetwork = async (networkKey: keyof typeof NETWORK_CONFIGS) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await addNetworkToWallet(networkKey);
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchNetwork = async (networkKey: keyof typeof NETWORK_CONFIGS) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await switchNetwork(networkKey);
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToken = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const networkKey = getNetworkKeyFromChainId(chainId);
      if (!networkKey || networkKey === 'localhost') {
        setMessage({ type: 'error', text: '現在のネットワークではトークンを追加できません' });
        return;
      }
      
      const result = await addTokenToWallet(networkKey as keyof typeof JPYC_TOKEN_CONFIGS);
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setIsProcessing(false);
    }
  };

  const networkConfigs = Object.entries(NETWORK_CONFIGS).map(([key, config]) => ({
    key: key as keyof typeof NETWORK_CONFIGS,
    ...config,
  }));

  const getCurrentNetworkKey = () => getNetworkKeyFromChainId(chainId);
  const currentNetworkKey = getCurrentNetworkKey();

  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ネットワーク管理</h2>
          <p className="text-sm text-gray-600">
            ウォレットにネットワークやトークンをワンクリックで追加できます
          </p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-success-50 border border-success-200 text-success-800'
                : 'bg-danger-50 border border-danger-200 text-danger-800'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* ネットワーク追加セクション */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">ネットワークを追加</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {networkConfigs.map((network) => {
              const isCurrentNetwork = currentNetworkKey === network.key;
              return (
                <div
                  key={network.key}
                  className={`border rounded-xl p-4 ${
                    isCurrentNetwork
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{network.chainName}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Chain ID: {parseInt(network.chainId, 16)}
                      </p>
                    </div>
                    {isCurrentNetwork && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        接続中
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddNetwork(network.key)}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      追加
                    </button>
                    <button
                      onClick={() => handleSwitchNetwork(network.key)}
                      disabled={isProcessing || isCurrentNetwork}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      切替
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* トークン追加セクション */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">JPYC Prepaidトークンを追加</h3>
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <img
                  src="/JPYC_Prepaid_symbol.svg"
                  alt="JPYC Prepaid Logo"
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">JPYC Prepaid トークン</h4>
                <p className="text-sm text-gray-600 mb-3">
                  現在のネットワークにJPYC Prepaidトークンを追加します
                  {currentNetworkKey && currentNetworkKey !== 'localhost' && (
                    <span className="block text-xs font-mono mt-1 text-gray-500">
                      {JPYC_TOKEN_CONFIGS[currentNetworkKey as keyof typeof JPYC_TOKEN_CONFIGS]?.address}
                    </span>
                  )}
                </p>
                <button
                  onClick={handleAddToken}
                  disabled={isProcessing || !currentNetworkKey || currentNetworkKey === 'localhost'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  ウォレットにトークンを追加
                </button>
                {(!currentNetworkKey || currentNetworkKey === 'localhost') && (
                  <p className="text-xs text-danger-600 mt-2">
                    ※ サポートされているテストネットに接続してください
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">使い方</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>追加</strong>: ネットワークをウォレットに追加します（既に追加済みの場合はエラーになります）
                    </li>
                    <li>
                      <strong>切替</strong>: 指定したネットワークに切り替えます（未追加の場合は自動的に追加します）
                    </li>
                    <li>
                      <strong>トークン追加</strong>: 現在接続中のネットワークのJPYC Prepaidトークンをウォレットに追加します
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

