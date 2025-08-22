'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { getJPYCAddress, getGatewayAddress, formatJPYC } from '@/lib/jpycClient';
import JPYC_ABI from '@/abi/JPYC.json';
import PaymentGateway from '@/abi/PaymentGateway.json';

interface TransactionLog {
  type: 'Transfer' | 'OrderPaid';
  blockNumber: bigint;
  transactionHash: string;
  from?: string;
  to?: string;
  amount: bigint;
  orderId?: string;
  timestamp?: number;
  blockTime?: string;
}

// Merchant Address - .env.localで NEXT_PUBLIC_MERCHANT_ADDRESS を設定可能
const MERCHANT_ADDRESS = (process.env.NEXT_PUBLIC_MERCHANT_ADDRESS as `0x${string}`) || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1
// const MERCHANT_ADDRESS = "0x92749945df31Dd49d105d9A35A1C65F6a4A4a44A";

export default function AdminTab() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [totalReceived, setTotalReceived] = useState<bigint>(0n);

  const jpycAddress = getJPYCAddress();
  const gatewayAddress = getGatewayAddress();

  const fetchMerchantLogs = async () => {
    try {
      setLoading(true);
      setError('');

      const publicClient = getPublicClient(config);
      if (!publicClient) throw new Error("Public client not available");

      console.log('🔍 AdminTab: ログ取得開始');
      console.log('JPYC Address:', jpycAddress);
      console.log('Gateway Address:', gatewayAddress);
      console.log('Merchant Address:', MERCHANT_ADDRESS);
      console.log('Chain ID:', chainId);

      // 最新のブロック番号を取得
      const latestBlock = await publicClient.getBlockNumber();
      
      // ローカル環境では全てのブロックを対象、テストネットでは最新10000ブロック
      let fromBlock: bigint;
      if (chainId === 31337) {
        // Anvilローカル環境では0番ブロックから
        fromBlock = BigInt(0);
      } else {
        // テストネットでは最新10000ブロック、または0番ブロックから
        const blockRange = BigInt(10000);
        fromBlock = latestBlock > blockRange ? latestBlock - blockRange : BigInt(0);
      }

      console.log('Latest Block:', latestBlock.toString());
      console.log('From Block:', fromBlock.toString());

      // Merchant宛のTransferイベントを取得
      const transferLogs = await publicClient.getContractEvents({
        address: jpycAddress,
        abi: JPYC_ABI,
        eventName: 'Transfer',
        args: {
          to: MERCHANT_ADDRESS, // Merchant宛のみ
        },
        fromBlock,
        toBlock: latestBlock,
      }).catch((err) => {
        console.error('Transferログ取得エラー:', err);
        return [];
      });

      console.log('Transfer Logs:', transferLogs.length);

      // OrderPaidイベントを取得（PaymentGateway経由の決済）
      const orderPaidLogs = await publicClient.getContractEvents({
        address: gatewayAddress,
        abi: PaymentGateway,
        eventName: 'OrderPaid',
        fromBlock,
        toBlock: latestBlock,
      }).catch((err) => {
        console.error('OrderPaidログ取得エラー:', err);
        return [];
      });

      console.log('OrderPaid Logs:', orderPaidLogs.length);

      // ログを統合（重複排除）
      const allLogs: TransactionLog[] = [];
      const processedTxHashes = new Set<string>();

      // OrderPaidログを優先して処理
      for (const log of orderPaidLogs) {
        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          const blockTime = new Date(Number(block.timestamp) * 1000).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          allLogs.push({
            type: 'OrderPaid' as const,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            from: (log as any).args?.payer,
            to: MERCHANT_ADDRESS,
            amount: (log as any).args?.amount,
            orderId: (log as any).args?.orderId,
            blockTime,
          });
          
          // このトランザクションハッシュを記録（重複防止）
          processedTxHashes.add(log.transactionHash);
        } catch (err) {
          console.error('OrderPaidブロック情報取得エラー:', err);
        }
      }

      // Transferログを処理（OrderPaidと重複しないもののみ）
      for (const log of transferLogs) {
        // 既にOrderPaidで処理済みの場合はスキップ
        // if (processedTxHashes.has(log.transactionHash)) {
        //   continue;
        // }

        try {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          const blockTime = new Date(Number(block.timestamp) * 1000).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });

          allLogs.push({
            type: 'Transfer' as const,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            from: (log as any).args?.from,
            to: (log as any).args?.to,
            amount: (log as any).args?.value,
            blockTime,
          });
        } catch (err) {
          console.error('Transferブロック情報取得エラー:', err);
        }
      }

      console.log('Total Logs:', allLogs.length);

      // ブロック番号でソート（新しい順）
      allLogs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

      // 合計金額を計算
      const total = allLogs.reduce((sum, log) => sum + log.amount, BigInt(0));
      setTotalReceived(total);

      setLogs(allLogs.slice(0, 50)); // 最新50件

    } catch (err: any) {
      console.error("ログ取得エラー:", err);
      setError(err.message || "ログの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchMerchantLogs();
    }
  }, [isConnected, chainId]);

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getOriginalOrderId = (orderIdHash: string) => {
    // ハッシュ値をそのまま返す（統一のため）
    return orderIdHash;
  };

  const getOrderItems = (orderId: string) => {
    // ローカルストレージから注文詳細を取得
    try {
      const savedOrders = JSON.parse(localStorage.getItem('jpyc-orders') || '[]');
      // orderIdHashで検索（オンチェーンのorderIdはハッシュ化されている）
      const order = savedOrders.find((o: any) => o.orderIdHash === orderId);
      return order?.items || [];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">👨‍💼 Admin Dashboard</h2>
          <p className="text-gray-600 mt-2 text-lg">Merchant宛JPYC受信履歴</p>
        </div>
        <button
          onClick={fetchMerchantLogs}
          disabled={loading || !isConnected}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              更新中...
            </div>
          ) : (
            '🔄 ログ更新'
          )}
        </button>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-100">総受信額</h3>
              <p className="text-3xl font-bold">{formatJPYC(totalReceived)}</p>
              <p className="text-sm text-green-100">JPYC</p>
            </div>
            <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-100">総取引数</h3>
              <p className="text-3xl font-bold">{logs.length}</p>
              <p className="text-sm text-blue-100">Transactions</p>
            </div>
            <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-100">決済回数</h3>
              <p className="text-3xl font-bold">{logs.filter(log => log.type === 'OrderPaid').length}</p>
              <p className="text-sm text-purple-100">Orders</p>
            </div>
            <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant情報 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900">監視対象Merchantアドレス</h4>
            <div className="font-mono text-sm text-yellow-800 bg-yellow-100 px-2 py-1 rounded mt-1">
              {MERCHANT_ADDRESS}
            </div>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-red-900">エラー</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* トランザクション履歴 */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📊 受信履歴</h3>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">ログを読み込み中...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">履歴がありません</h4>
            <p className="text-gray-600">
              {!isConnected ? "ウォレットを接続してログを表示してください" : "Merchant宛の取引履歴が見つかりませんでした"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={`${log.transactionHash}-${index}`}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* アイコン */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      log.type === 'Transfer' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {log.type === 'Transfer' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                      )}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.type === 'Transfer' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-sm text-gray-500">Block #{log.blockNumber.toString()}</span>
                      </div>

                      <div className="space-y-2">
                        {/* 時刻表示 */}
                        {log.blockTime && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">時刻:</span>
                            <span className="text-sm text-gray-800 font-medium">
                              {log.blockTime}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">From:</span>
                          <span className="font-mono text-sm bg-blue-50 border border-blue-200 px-3 py-1 rounded text-blue-800 font-semibold">
                            {formatAddress(log.from || '')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Amount:</span>
                          <span className={`text-lg font-bold ${
                            log.type === 'Transfer' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {formatJPYC(log.amount)} JPYC
                          </span>
                        </div>

                        {log.type === 'OrderPaid' && log.orderId && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">Order ID:</span>
                              <span className="font-mono text-xs bg-green-50 border border-green-200 px-3 py-1 rounded text-green-800 font-semibold break-all">
                                {getOriginalOrderId(log.orderId)}
                              </span>
                            </div>
                            
                            {/* 注文詳細 */}
                            {(() => {
                              const items = getOrderItems(log.orderId!);
                              return items.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <span className="text-sm font-medium text-green-800">注文内容:</span>
                                  <div className="mt-1 space-y-1">
                                    {items.map((item: any, i: number) => (
                                      <div key={i} className="text-sm text-green-700">
                                        {item.emoji} {item.name} × {item.quantity} = {item.price * item.quantity} JPYC
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TX Hash */}
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-mono">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${log.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors cursor-pointer bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded border hover:border-blue-200"
                        title="Etherscanで確認"
                      >
                        {formatAddress(log.transactionHash)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              管理画面を表示するには、まずウォレットを接続してください。
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 
