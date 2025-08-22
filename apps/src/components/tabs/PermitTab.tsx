'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { 
  getJPYCAddress, 
  getGatewayAddress, 
  getJPYCAllowance,
  formatJPYC, 
  parseJPYC,
  createPermitSignature,
  executeBroadcastPermit
 } from '@/lib/jpycClient';

export default function PermitTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // State
  const [value, setValue] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [permitData, setPermitData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastTx, setBroadcastTx] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(BigInt(0));

  // アドレス取得
  const jpycAddress = getJPYCAddress();
  const gatewayAddress = getGatewayAddress();

  // Allowance取得
  const fetchAllowance = async () => {
    if (!address) return;
    try {
      const allowance = await getJPYCAllowance(address, gatewayAddress);
      setCurrentAllowance(allowance);
    } catch (error) {
      console.error('Allowance取得エラー:', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchAllowance();
    }
  }, [isConnected, chainId]);

  // デフォルト期限設定（10分後）
  const setDefaultDeadline = () => {
    const tenMinutesLater = Math.floor(Date.now() / 1000) + 60 * 10;
    setDeadline(tenMinutesLater.toString());
  };

  // Permit署名を作成
  const handleCreateSignature = async () => {
    if (!value || !deadline || !address) return;

    try {
      setLoading(true);
      setError('');
      setPermitData(null);

      const valueInWei = parseJPYC(value);
      const deadlineBigInt = BigInt(deadline);

      const signature = await createPermitSignature(
        address,
        gatewayAddress,
        valueInWei,
        deadlineBigInt
      );

      setPermitData(signature);
      
    } catch (err: any) {
      setError(err.message || 'Permit署名の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Token.permitをブロードキャスト
  const handleBroadcastPermit = async () => {
    if (!permitData || !address) return;

    try {
      setBroadcasting(true);
      setError('');

      const hash = await executeBroadcastPermit(
        address,
        gatewayAddress,
        parseJPYC(value),
        BigInt(deadline),
        permitData
      );

      setBroadcastTx(hash);
      
      // Allowance更新
      setTimeout(() => {
        fetchAllowance();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Permit実行に失敗しました');
    } finally {
      setBroadcasting(false);
    }
  };

  // リセット
  const resetForm = () => {
    setValue('');
    setDeadline('');
    setPermitData(null);
    setBroadcastTx('');
    setError('');
  };

  // Approveタブに移動
  const goToApprove = () => {
    const event = new CustomEvent('switchTab', { detail: 'Approve' });
    window.dispatchEvent(event);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">ウォレット未接続</h3>
        <p className="text-gray-600">EIP-2612 Permit機能を利用するには、ウォレットを接続してください。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">✍️ EIP-2612 Permit</h2>
        <p className="text-gray-600 mt-2 text-lg">ガスレス許可設定 - オフチェーン署名学習</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインフォーム */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            {/* 現在のAllowance表示 */}
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-purple-900">現在の許可額</h4>
                  <p className="text-sm text-purple-700">Payment Gatewayが使用可能な金額</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatJPYC(currentAllowance)}
                  </div>
                  <div className="text-sm text-purple-500">JPYC</div>
                </div>
              </div>
            </div>

            {/* Permitフォーム */}
            <div className="space-y-4">
              {/* Permit非対応警告 */}
              {/* Permit対応確認中 */}
              {/* Permit対応済み */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  許可する金額 (JPYC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="100"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 font-semibold"
                    disabled={loading || broadcasting}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm font-medium">JPYC</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  有効期限 (Unix Timestamp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="1640995200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 font-semibold font-mono text-sm"
                    disabled={loading || broadcasting}
                  />
                  <button
                    onClick={setDefaultDeadline}
                    className="absolute inset-y-0 right-0 px-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    10分後
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {deadline && `${new Date(parseInt(deadline) * 1000).toLocaleString('ja-JP')}`}
                </p>
              </div>

              {/* 署名作成ボタン */}
              <button
                onClick={handleCreateSignature}
                disabled={!value || !deadline || loading || broadcasting}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    署名作成中...
                  </div>
                ) : (
                  '✍️ Permit署名を作成'
                )}
              </button>
            </div>

            {/* 署名結果表示 */}
            {permitData && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-3">🎉 署名作成完了!</h4>
                  
                  {/* v, r, s 表示 */}
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="font-medium text-green-800">v:</span>
                        <div className="font-mono text-xs bg-white border border-green-300 p-1 rounded break-all text-gray-800">
                          {permitData.v}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-green-800">r:</span>
                        <div className="font-mono text-xs bg-white border border-green-300 p-1 rounded break-all text-gray-800">
                          {permitData.r}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">s:</span>
                      <div className="font-mono text-xs bg-white border border-green-300 p-1 rounded break-all text-gray-800">
                        {permitData.s}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EIP-712 Payload表示 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">📋 EIP-712 Payload</h5>
                  <div className="text-xs font-mono bg-white border border-blue-300 p-3 rounded overflow-auto max-h-40">
                    <pre className="text-gray-800">{JSON.stringify({
                      domain: permitData.domain,
                      types: permitData.types,
                      message: permitData.message
                    }, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2)}</pre>
                  </div>
                </div>

                {/* ブロードキャストボタン */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleBroadcastPermit}
                    disabled={broadcasting}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {broadcasting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        実行中...
                      </div>
                    ) : (
                      '📡 Token.permit実行'
                    )}
                  </button>

                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    🔄 リセット
                  </button>
                </div>
              </div>
            )}

            {/* ブロードキャスト成功表示 */}
            {broadcastTx && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">Permit実行完了!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Allowanceが更新されました。Approveタブで確認できます。
                    </p>
                    <div className="font-mono text-xs text-green-800 bg-green-100 p-2 rounded-lg mt-2 break-all">
                      {broadcastTx}
                    </div>
                    <button
                      onClick={goToApprove}
                      className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approveタブで確認
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    <h4 className="font-semibold text-red-900">エラー</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
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
            <h4 className="text-lg font-bold text-gray-900 mb-4">🎓 学習ポイント</h4>
            
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h5 className="font-semibold text-purple-900 mb-2">EIP-2612 Permit</h5>
                <p className="text-sm text-purple-800">
                  オフチェーン署名により、ガス不要でApprove許可を設定できる仕組みです。
                  MetaMaskでの署名はトランザクションではありません。
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-semibold text-blue-900 mb-2">🔐 署名の構造</h5>
                <p className="text-sm text-blue-800">
                  EIP-712に基づく構造化データ署名です。
                  v, r, s の3つの要素で構成され、楕円曲線署名の標準形式です。
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h5 className="font-semibold text-green-900 mb-2">⚡ ガス効率</h5>
                <p className="text-sm text-green-800">
                  通常のApprove（1 TX）と比較して、Permit単体では0 TX。
                  PermitAndPay で1 TXでApprove+決済が可能です。
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h5 className="font-semibold text-yellow-900 mb-2">⏰ 有効期限</h5>
                <p className="text-sm text-yellow-800">
                  署名には期限があり、期限切れ後は無効になります。
                  セキュリティ向上のため、適切な期限設定が重要です。
                </p>
              </div>
            </div>
          </div>

          {/* 実用例 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🔄 実用例</h4>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                <div>
                  <div className="font-semibold">MetaMask署名</div>
                  <div className="text-gray-600">v, r, s 値を取得</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                <div>
                  <div className="font-semibold">Token.permit実行</div>
                  <div className="text-gray-600">Allowance設定をブロードキャスト</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                <div>
                  <div className="font-semibold">Approveタブで確認</div>
                  <div className="text-gray-600">Allowanceが更新されていることを確認</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 