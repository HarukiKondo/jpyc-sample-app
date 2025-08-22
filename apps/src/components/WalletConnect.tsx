"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, usePublicClient } from 'wagmi';

export default function WalletConnect() {
  const chainId = useChainId();
  const publicClient = usePublicClient();

  return (
    <div className="mb-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">ウォレット接続</h2>
            <p className="text-sm text-gray-600">決済を開始するにはウォレットを接続してください</p>
          </div>
          <div className="flex items-center space-x-3">
            <ConnectButton.Custom>
              {({
                account,
                chain: connectedChain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  connectedChain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button 
                            onClick={openConnectModal} 
                            type="button"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-medium hover:shadow-strong"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            ウォレットを接続
                          </button>
                        );
                      }

                      if (connectedChain.unsupported) {
                        return (
                          <button 
                            onClick={openChainModal} 
                            type="button"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-danger-600 hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500 transition-all duration-200 shadow-medium"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            ネットワークを切り替え
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center space-x-3">
                          {/* ネットワーク切り替えボタン */}
                          <button
                            onClick={openChainModal}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                          >
                            {connectedChain.hasIcon && (
                              <div
                                style={{
                                  background: connectedChain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 8,
                                }}
                              >
                                {connectedChain.iconUrl && (
                                  <img
                                    alt={connectedChain.name ?? 'Chain icon'}
                                    src={connectedChain.iconUrl}
                                    style={{ width: 16, height: 16 }}
                                  />
                                )}
                              </div>
                            )}
                            {connectedChain.name}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* アカウントボタン */}
                          <button
                            onClick={openAccountModal}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 mr-3 flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {account.displayName?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="hidden sm:block">{account.displayName}</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* 接続状態の詳細表示 */}
        <ConnectButton.Custom>
          {({ account, chain: connectedChain, mounted }) => {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className={`w-2 h-2 rounded-full mr-2 ${mounted && account ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">接続済みアドレス</span>
                  </div>
                  <div className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded-lg border break-all">
                    {mounted && account ? account.address : 'ウォレットが接続されていません'}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">ネットワーク</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {chainId ? `Chain ID: ${chainId}` : 'ネットワークが選択されていません'}
                    </span>
                  </div>
                  {chainId && (
                    <div className="mt-1 text-xs text-gray-500">
                      {chainId === 31337 ? 'Anvil Local' : 
                       chainId === 11155111 ? 'Sepolia' :
                       chainId === 80001 ? 'Polygon Amoy' :
                       chainId === 43113 ? 'Avalanche Fuji' : 
                       `Unknown Chain (${chainId})`}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
} 