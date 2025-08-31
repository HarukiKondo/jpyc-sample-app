'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { 
  getJPYCAddress, 
  getGatewayAddress, 
  getJPYCAllowance, 
  formatJPYC, 
  parseJPYC,
  generateOrderId,
  generateMetaHash,
  executeApprove,
  executePayment,
  executePermitAndPay,
  createPermitSignature,
  orderIdToBytes32,
  executePaymentWithTransferAuth,
  createTransferWithAuthorizationSignature,
  generateNonce,
  generateValidityWindow
} from '@/lib/jpycClient';

// 商品定義
const PRODUCTS = [
  { id: 'coffee', name: 'コーヒー', price: 500, emoji: '☕' },
  { id: 'sandwich', name: 'サンドイッチ', price: 800, emoji: '🥪' },
  { id: 'cake', name: 'ケーキ', price: 1200, emoji: '🍰' },
];

// State Machine の状態
type PurchaseState = 
  | 'cartReview'
  | 'orderGenerated' 
  | 'approvePending'
  | 'payPending'
  | 'permitPending'
  | 'permitAndPayPending'
  | 'transferAuthPending'
  | 'success'
  | 'failed';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

interface Order {
  orderId: string;
  items: CartItem[];
  total: number;
  txHash?: string;
  createdAt: number;
}

export default function PurchaseTab() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // State Machine
  const [state, setState] = useState<PurchaseState>('cartReview');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(BigInt(0));
  
  // Authorization関連
  const [authSignature, setAuthSignature] = useState<{
    v: number;
    r: `0x${string}`;
    s: `0x${string}`;
    nonce: `0x${string}`;
    validAfter: bigint;
    validBefore: bigint;
  } | null>(null);

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

  // カートに追加
  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // カートから削除
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // カート合計
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 注文生成
  const generateOrder = () => {
    if (cart.length === 0) return;

    const orderId = generateOrderId();
    const order: Order = {
      orderId,
      items: [...cart],
      total: cartTotal,
      createdAt: Date.now(),
    };

    setCurrentOrder(order);
    setState('orderGenerated');
  };

  // Approve + Pay フロー
  const handleApproveAndPay = async () => {
    if (!currentOrder || !address) return;

    try {
      setError('');
      const amount = parseJPYC(currentOrder.total.toString());
      const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);

      // Step 1: Allowanceチェック
      await fetchAllowance();
      
      if (currentAllowance < amount) {
        // Approve が必要
        setState('approvePending');
        
        const approveHash = await executeApprove(gatewayAddress, amount);
        console.log('Approve TX:', approveHash);
        
        // Approve完了を待つ（簡易実装）
        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchAllowance();
      }

      // Step 2: Pay実行
      setState('payPending');
      const payHash = await executePayment(currentOrder.orderId, amount, metaHash);
      
      // 成功
      setCurrentOrder(prev => prev ? { ...prev, txHash: payHash } : null);
      setState('success');
      
      // ローカルストレージに保存
      const savedOrders = JSON.parse(localStorage.getItem('jpyc-orders') || '[]');
      const orderWithHash = {
        ...currentOrder,
        orderIdHash: orderIdToBytes32(currentOrder.orderId),
        txHash: payHash,
        status: 'completed'
      };
      savedOrders.push(orderWithHash);
      localStorage.setItem('jpyc-orders', JSON.stringify(savedOrders));

    } catch (error: any) {
      setError(error.message || 'Approve + Pay に失敗しました');
      setState('failed');
    }
  };

  // Permit + Pay フロー
  const handlePermitAndPay = async () => {
    if (!currentOrder || !address) return;

    try {
      setError('');
      setState('permitPending');
      
      const amount = parseJPYC(currentOrder.total.toString());
      const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10); // 10分後

      // Step 1: Permit署名作成
      const permitData = await createPermitSignature(
        address,
        gatewayAddress,
        amount,
        deadline
      );

      // Step 2: PermitAndPay実行
      setState('permitAndPayPending');
      const hash = await executePermitAndPay(
        currentOrder.orderId,
        amount,
        metaHash,
        address,
        deadline,
        {
          v: Number(permitData.v),
          r: permitData.r,
          s: permitData.s
        }
      );

      // 成功
      setCurrentOrder(prev => prev ? { ...prev, txHash: hash } : null);
      setState('success');

      // ローカルストレージに保存
      const savedOrders = JSON.parse(localStorage.getItem('jpyc-orders') || '[]');
      const orderWithHash = {
        ...currentOrder,
        orderIdHash: orderIdToBytes32(currentOrder.orderId),
        txHash: hash,
        status: 'completed'
      };
      savedOrders.push(orderWithHash);
      localStorage.setItem('jpyc-orders', JSON.stringify(savedOrders));

    } catch (error: any) {
      setError(error.message || 'Permit + Pay に失敗しました');
      setState('failed');
    }
  };

  // Transfer Authorization決済
  const handleTransferAuthPayment = async () => {
    if (!address || !currentOrder) return;
    
    try {
      setError('');
      
      const amount = parseJPYC(currentOrder.total.toString());
      const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);
      const nonce = generateNonce();
      const { validAfter, validBefore } = generateValidityWindow(600); // 10分有効

      // Step 1: transferWithAuthorization署名作成（merchant宛）
      const merchantAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1
      const signature = await createTransferWithAuthorizationSignature(
        address,
        merchantAddress as `0x${string}`,
        amount,
        validAfter,
        validBefore,
        nonce
      );

      setAuthSignature({
        v: signature.v,
        r: signature.r,
        s: signature.s,
        nonce,
        validAfter,
        validBefore
      });

      // Step 2: PaymentGateway経由で決済実行
      setState('transferAuthPending');
      const hash = await executePaymentWithTransferAuth(
        currentOrder.orderId,
        amount,
        metaHash,
        address,
        validAfter,
        validBefore,
        nonce,
        {
          v: signature.v,
          r: signature.r,
          s: signature.s
        }
      );

      // 成功
      setCurrentOrder(prev => prev ? { ...prev, txHash: hash } : null);
      setState('success');

      // ローカルストレージに保存
      const savedOrders = JSON.parse(localStorage.getItem('jpyc-orders') || '[]');
      const orderWithHash = {
        ...currentOrder,
        orderIdHash: orderIdToBytes32(currentOrder.orderId),
        txHash: hash,
        status: 'completed',
        paymentMethod: 'transferWithAuthorization'
      };
      savedOrders.push(orderWithHash);
      localStorage.setItem('jpyc-orders', JSON.stringify(savedOrders));

    } catch (error: any) {
      setError(error.message || 'Transfer Authorization決済に失敗しました');
      setState('failed');
    }
  };



  // リセット
  const resetPurchase = () => {
    setState('cartReview');
    setCart([]);
    setCurrentOrder(null);
    setError('');
    setAuthSignature(null);
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
        <p className="text-gray-600">決済機能を利用するには、ウォレットを接続してください。</p>
      </div>
    );
  }

  // State別のレンダリング
  const renderStateContent = () => {
    switch (state) {
      case 'cartReview':
        return (
          <div className="space-y-6">
            {/* 商品選択 */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">商品を選択</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PRODUCTS.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{product.emoji}</div>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-lg font-bold text-blue-600">{product.price} JPYC</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        カートに追加
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* カート */}
            {cart.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">🛒 カート</h4>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{item.emoji}</span>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.price} JPYC × {item.quantity}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-blue-600">{item.price * item.quantity} JPYC</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">合計</span>
                    <span className="text-xl font-bold text-blue-600">{cartTotal} JPYC</span>
                  </div>
                  <button
                    onClick={generateOrder}
                    className="w-full mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    注文を確定
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'orderGenerated':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">📋 注文確認</h3>
              <div className="space-y-3">
                <div className="font-mono text-sm text-blue-800 bg-blue-100 p-3 rounded-lg">
                  <strong>Order ID:</strong> {currentOrder?.orderId}
                </div>
                <div className="space-y-2">
                  {currentOrder?.items.map(item => (
                    <div key={item.id} className="flex justify-between text-blue-900">
                      <span>{item.emoji} {item.name} × {item.quantity}</span>
                      <span className="font-semibold">{item.price * item.quantity} JPYC</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-blue-900">合計</span>
                  <span className="text-xl font-bold text-blue-600">{currentOrder?.total} JPYC</span>
                </div>
              </div>
            </div>

            {/* 決済方法選択 */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900">決済方法を選択</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleApproveAndPay}
                  className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">🔓</div>
                  <h5 className="font-bold text-yellow-900">Approve + Pay</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    2回のトランザクション<br/>
                    (1) Approve → (2) Pay
                  </p>
                  <div className="mt-3 text-xs text-yellow-600">
                    💡 MetaMaskが2回立ち上がります
                  </div>
                </button>

                <button
                  onClick={handlePermitAndPay}
                  className="p-6 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">✍️</div>
                  <h5 className="font-bold text-green-900">Permit + Pay</h5>
                  <p className="text-sm text-green-700 mt-1">
                    1回のトランザクション<br/>
                    署名 + 決済を同時実行
                  </p>
                  <div className="mt-3 text-xs text-green-600">
                    💡 MetaMaskが1回だけ立ち上がります
                  </div>
                </button>

                <button
                  onClick={handleTransferAuthPayment}
                  className="p-6 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📤</div>
                  <h5 className="font-bold text-purple-900">Transfer Auth</h5>
                  <p className="text-sm text-purple-700 mt-1">
                    EIP-3009による事前承認送金<br/>
                    署名 → 決済実行
                  </p>
                  <div className="mt-3 text-xs text-purple-600">
                    💡 transferWithAuthorization使用
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'approvePending':
      case 'payPending':
      case 'permitPending':
      case 'permitAndPayPending':
      case 'transferAuthPending':
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {state === 'approvePending' && '🔓 Approve処理中...'}
              {state === 'payPending' && '💳 決済処理中...'}
              {state === 'permitPending' && '✍️ 署名作成中...'}
              {state === 'permitAndPayPending' && '🚀 Permit + Pay実行中...'}
              {state === 'transferAuthPending' && '📤 Transfer Auth決済中...'}
            </h3>
            <p className="text-gray-600">
              MetaMaskで署名してください
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-4">🎉 決済完了！</h3>
            <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="space-y-3 text-left">
                <div>
                  <span className="font-semibold text-green-900">Order ID:</span>
                  <div className="font-mono text-sm text-green-800 bg-green-100 p-2 rounded mt-1 break-all">
                    {currentOrder?.orderId ? orderIdToBytes32(currentOrder.orderId) : ''}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-green-900">Transaction:</span>
                  <div className="font-mono text-sm text-green-800 bg-green-100 p-2 rounded mt-1 break-all">
                    {currentOrder?.txHash}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-green-900">合計:</span>
                  <span className="text-xl font-bold text-green-600 ml-2">{currentOrder?.total} JPYC</span>
                </div>
              </div>
            </div>
            <button
              onClick={resetPurchase}
              className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              新しい注文
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-red-900 mb-4">❌ 決済失敗</h3>
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={resetPurchase}
              className="mt-6 px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              最初からやり直し
            </button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">💳 Purchase</h2>
        <p className="text-gray-600 mt-2 text-lg">商品購入 - State Machine決済フロー</p>
      </div>

      {/* State表示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-blue-800">現在の状態:</span>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold">
              {state}
            </span>
          </div>
          <div className="text-sm text-blue-600">
            Current Allowance: <span className="font-bold">{formatJPYC(currentAllowance)} JPYC</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        {renderStateContent()}
      </div>
    </div>
  );
} 