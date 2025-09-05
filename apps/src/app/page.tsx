"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import WalletConnect from "@/components/WalletConnect";

// 環境変数に基づいてコンポーネントを選択
const mode = process.env.NEXT_PUBLIC_MODE || 'react-sdk';

// ハンズオン対象タブ（exercise版あり）
const BalanceTab = dynamic(() => 
  mode === 'exercise' 
    ? import("@/components/tabs/exercise/BalanceTab")
    : import("@/components/tabs/react-sdk/BalanceTab")
);

const TransferTab = dynamic(() => 
  mode === 'exercise' 
    ? import("@/components/tabs/exercise/TransferTab")
    : import("@/components/tabs/react-sdk/TransferTab")
);

const ApproveTab = dynamic(() => 
  mode === 'exercise' 
    ? import("@/components/tabs/exercise/ApproveTab")
    : import("@/components/tabs/react-sdk/ApproveTab")
);

const PermitTab = dynamic(() => 
  mode === 'exercise' 
    ? import("@/components/tabs/exercise/PermitTab")
    : import("@/components/tabs/react-sdk/PermitTab")
);

const AuthorizationTab = dynamic(() => 
  mode === 'exercise' 
    ? import("@/components/tabs/exercise/AuthorizationTab")
    : import("@/components/tabs/react-sdk/AuthorizationTab")
);

// 完成版共通使用タブ（常にreact-sdk版）
const PurchaseTab = dynamic(() => import("@/components/tabs/react-sdk/PurchaseTab"));
const AdminTab = dynamic(() => import("@/components/tabs/react-sdk/AdminTab"));

const tabs = [
  {
    id: 'Balance',
    name: 'Balance',
    description: '残高確認',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'Transfer',
    name: 'Transfer',
    description: '送信',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  {
    id: 'Approve',
    name: 'Approve',
    description: '承認',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'Permit',
    name: 'Permit',
    description: 'EIP-2612',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 'Purchase',
    name: 'Purchase',
    description: '購入',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
      </svg>
    ),
  },
  {
    id: 'Authorization',
    name: 'Authorization',
    description: 'EIP-3009',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'Admin',
    name: 'Admin',
    description: '管理',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('Balance');

  // カスタムイベントでタブ切り替えを受信
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('switchTab', handleSwitchTab as EventListener);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab as EventListener);
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Balance':
        return <BalanceTab />;
      case 'Transfer':
        return <TransferTab />;
      case 'Approve':
        return <ApproveTab />;
      case 'Permit':
        return <PermitTab />;
      case 'Purchase':
        return <PurchaseTab />;
      case 'Authorization':
        return <AuthorizationTab />;
      case 'Admin':
        return <AdminTab />;
      default:
        return <BalanceTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  JPYC Sample App
                  <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${
                    mode === 'react-sdk' ? 'bg-blue-100 text-blue-800' :
                    mode === 'exercise' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mode === 'react-sdk' ? '⚛️ React SDK' :
                     mode === 'exercise' ? '🎓 Exercise' :
                     '🎯 Default'}
                  </span>
                </h1>
                <p className="text-sm text-gray-600">
                  {mode === 'react-sdk' ? 'React SDKフック版' :
                   mode === 'exercise' ? '学習用練習版' :
                   '完成版 (viem実装)'}
                </p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center text-center px-4 py-5 rounded-2xl border transition-all duration-200 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-white border-blue-300 shadow-lg ring-2 ring-blue-200'
                    : 'bg-white/50 border-gray-200/50 hover:border-blue-200 hover:bg-white/80'
                }`}
              >
                <div className={`w-8 h-8 mb-2 ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {tab.icon}
                </div>
                <div className={`font-semibold text-sm ${
                  activeTab === tab.id ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {tab.name}
                </div>
                <div className={`text-xs mt-1 ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {tab.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl p-8">
          {renderTabContent()}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              JPYC Sample Application - 学習用途での利用を想定したサンプルアプリケーションです
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-500">
              <span>🏗️ Foundry</span>
              <span>⚡ wagmi</span>
              <span>🌈 RainbowKit</span>
              <span>⚛️ Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
