'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { 
  useApprove, 
  useAllowance,
  useTransferWithAuthorization
} from '@jpyc/sdk-react';
import { 
  getJPYCAddress, 
  getGatewayAddress, 
  generateOrderId,
  generateMetaHash,
  executePayment,
  executePermitAndPay,
  createPermitSignature,
  orderIdToBytes32,
  executePaymentWithTransferAuth,
  createTransferWithAuthorizationSignature,
  generateNonce,
  generateValidityWindow
} from '@/lib/jpycClient';
import { getMerchantAddress } from '@/lib/core/config';

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
  | 'transferAuthSignatureReady'
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

  // React SDKフックを使用
  const { 
    approve, 
    isReady: isApproveReady, 
    isLoading: isApproveLoading, 
    isSuccess: isApproveSuccess, 
    error: approveError, 
    hash: approveHash, 
    reset: resetApprove 
  } = useApprove();

  const { 
    transferWithAuthorization, 
    isReady: isTransferAuthReady, 
    isLoading: isTransferAuthLoading, 
    isSuccess: isTransferAuthSuccess, 
    error: transferAuthError, 
    hash: transferAuthHash, 
    reset: resetTransferAuth 
  } = useTransferWithAuthorization();

  // アドレス取得
  const gatewayAddress = getGatewayAddress();

  // Allowance取得（React SDKフック）
  const { 
    data: currentAllowanceStr, 
    isPending: loadingAllowance, 
    error: allowanceError 
  } = useAllowance({
    owner: (address || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    spender: gatewayAddress as `0x${string}`,
    skip: !address || !isConnected
  });

  const currentAllowance = parseFloat(currentAllowanceStr || '0');
  const error = approveError?.message || transferAuthError?.message || allowanceError?.message || '';
  
  // Authorization関連
  const [authSignature, setAuthSignature] = useState<{
    v: number;
    r: `0x${string}`;
    s: `0x${string}`;
    nonce: `0x${string}`;
    validAfter: bigint;
    validBefore: bigint;
  } | null>(null);

  // React SDKでは自動でAllowanceが更新されるため、fetchAllowance関数は不要

  // React SDKの状態変化を監視
  useEffect(() => {
    // Approve成功後、自動でPay実行
    if (isApproveSuccess && state === 'approvePending' && currentOrder) {
      const executePayAfterApprove = async () => {
        try {
          setState('payPending');
          const { parseJPYC } = await import('@/lib/jpycClient');
          const amountWei = parseJPYC(currentOrder.total.toString());
          const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);
          
          const payHash = await executePayment(currentOrder.orderId, amountWei, metaHash);
          
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
          console.error('Pay実行エラー:', error);
          setState('failed');
        }
      };
      
      executePayAfterApprove();
    }
  }, [isApproveSuccess, state, currentOrder]);

  // Transfer Auth状態の詳細監視
  useEffect(() => {
    console.log('🔄 Transfer Auth状態変化:', {
      isTransferAuthLoading,
      isTransferAuthSuccess,
      transferAuthError: transferAuthError?.message,
      transferAuthHash,
      state
    });
  }, [isTransferAuthLoading, isTransferAuthSuccess, transferAuthError, transferAuthHash, state]);

  // Transfer Auth成功の監視
  useEffect(() => {
    if (isTransferAuthSuccess && state === 'transferAuthPending' && currentOrder) {
      console.log('✅ Transfer Auth成功検出:', transferAuthHash);
      const hash = transferAuthHash;
      setCurrentOrder(prev => prev ? { ...prev, txHash: hash || 'pending' } : null);
      setState('success');
      
      // ローカルストレージに保存
      const savedOrders = JSON.parse(localStorage.getItem('jpyc-orders') || '[]');
      const orderWithHash = {
        ...currentOrder,
        orderIdHash: orderIdToBytes32(currentOrder.orderId),
        txHash: hash || 'pending',
        status: 'completed',
        paymentMethod: 'transferWithAuthorization-react-sdk'
      };
      savedOrders.push(orderWithHash);
      localStorage.setItem('jpyc-orders', JSON.stringify(savedOrders));
    }
  }, [isTransferAuthSuccess, state, currentOrder, transferAuthHash]);

  // Transfer Authエラーの監視
  useEffect(() => {
    if (transferAuthError && state === 'transferAuthPending') {
      console.error('❌ Transfer Authエラー検出:', transferAuthError);
      setState('failed');
    }
  }, [transferAuthError, state]);

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

  // Approve + Pay フロー（React SDKフック版）
  const handleApproveAndPay = async () => {
    if (!currentOrder || !address || !approve) return;

    try {
      const amountNum = currentOrder.total; // React SDKは数値をそのまま使用

      // Step 1: Allowanceチェック（React SDKは自動更新）
      if (currentAllowance < amountNum) {
        // Approve が必要
        setState('approvePending');
        
        await approve({
          spender: gatewayAddress as `0x${string}`,
          value: amountNum // React SDKは数値をそのまま渡す
        });
        
        // useEffectがApprove成功を監視してPay実行する
        console.log('React SDK Approve実行中... useEffectが完了を監視します');
      } else {
        // 既に十分なAllowanceがある場合、直接Pay実行
        setState('payPending');
        const { parseJPYC } = await import('@/lib/jpycClient');
        const amountWei = parseJPYC(amountNum.toString());
        const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);
        
        const payHash = await executePayment(currentOrder.orderId, amountWei, metaHash);
        
      setCurrentOrder(prev => prev ? { ...prev, txHash: payHash } : null);
      setState('success');
      }

    } catch (error: any) {
      console.error('Approve + Pay エラー:', error);
      setState('failed');
    }
  };

  // Permit + Pay フロー（React SDK対応）
  const handlePermitAndPay = async () => {
    if (!currentOrder || !address) return;

    try {
      setState('permitPending');
      
      const amountNum = currentOrder.total; // React SDKは数値をそのまま使用
      const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10); // 10分後

      // Step 1: Permit署名作成（wei単位変換が必要）
      const { parseJPYC } = await import('@/lib/jpycClient');
      const amountWei = parseJPYC(amountNum.toString());
      
      const permitData = await createPermitSignature(
        address,
        gatewayAddress,
        amountWei, // createPermitSignatureはwei単位を期待
        deadline
      );

      // Step 2: PermitAndPay実行（wei単位を使用）
      setState('permitAndPayPending');
      const hash = await executePermitAndPay(
        currentOrder.orderId,
        amountWei, // executePermitAndPayはwei単位を期待
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
      console.error('Permit + Pay エラー:', error);
      setState('failed');
    }
  };

  // Transfer Authorization署名作成（Step 1）
  const handleCreateTransferAuthSignature = async () => {
    if (!address || !currentOrder) return;
    
    try {
      const amountNum = currentOrder.total;
      const nonce = generateNonce();
      const { validAfter, validBefore } = generateValidityWindow(600); // 10分有効

      // transferWithAuthorization署名作成（merchant宛）
      const merchantAddress = getMerchantAddress();
      const { parseJPYC } = await import('@/lib/jpycClient');
      const amountWei = parseJPYC(amountNum.toString());

      const signature = await createTransferWithAuthorizationSignature(
        address,
        merchantAddress as `0x${string}`,
        amountWei, // 署名作成はwei単位を期待
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

      // 署名作成完了、実行待機状態に
      setState('transferAuthSignatureReady');

    } catch (error: any) {
      console.error('Transfer Authorization署名作成エラー:', error);
      setState('failed');
    }
  };

  // Transfer Authorization実行（Step 2）
  const handleExecuteTransferAuth = async () => {
    console.log('🚀 handleExecuteTransferAuth開始');
    console.log('isTransferAuthReady:', isTransferAuthReady);
    console.log('transferWithAuthorization:', !!transferWithAuthorization);
    console.log('authSignature:', !!authSignature);
    
    if (!address || !currentOrder || !transferWithAuthorization || !authSignature) {
      console.error('❌ 必要な条件が不足:', {
        address: !!address,
        currentOrder: !!currentOrder,
        transferWithAuthorization: !!transferWithAuthorization,
        authSignature: !!authSignature
      });
      alert('実行条件が不足しています');
      return;
    }
    
    try {
      const amountNum = currentOrder.total;
      const merchantAddress = getMerchantAddress();

      console.log('📊 実行パラメータ:', {
        from: address,
        to: merchantAddress,
        value: amountNum,
        validAfter: authSignature.validAfter,
        validBefore: authSignature.validBefore,
        nonce: authSignature.nonce
      });

      setState('transferAuthPending');
      
      console.log('🔄 従来のPaymentGateway経由で実行します...');
      
      // React SDKフックではなく、従来のPaymentGateway経由で実行
      const { parseJPYC } = await import('@/lib/jpycClient');
      const amountWei = parseJPYC(amountNum.toString());
      const metaHash = generateMetaHash(currentOrder.orderId, currentOrder.items);
      
      const hash = await executePaymentWithTransferAuth(
        currentOrder.orderId,
        amountWei,
        metaHash,
        address,
        authSignature.validAfter,
        authSignature.validBefore,
        authSignature.nonce,
        {
          v: authSignature.v,
          r: authSignature.r,
          s: authSignature.s
        }
      );

      console.log('✅ PaymentGateway経由のTransfer Auth完了:', hash);

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
        paymentMethod: 'transferWithAuthorization-paymentgateway'
      };
      savedOrders.push(orderWithHash);
      localStorage.setItem('jpyc-orders', JSON.stringify(savedOrders));

    } catch (error: any) {
      console.error('❌ Transfer Authorization実行エラー:', error);
      setState('failed');
    }
  };



  // リセット
  const resetPurchase = () => {
    setState('cartReview');
    setCart([]);
    setCurrentOrder(null);
    setAuthSignature(null);
    // React SDKの状態もリセット
    resetApprove();
    resetTransferAuth();
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
                  onClick={handleCreateTransferAuthSignature}
                  className="p-6 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📤</div>
                  <h5 className="font-bold text-purple-900">Transfer Auth</h5>
                  <p className="text-sm text-purple-700 mt-1">
                    EIP-3009による事前承認送信<br/>
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

      case 'transferAuthSignatureReady':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-purple-900 mb-4">✅ Transfer Auth署名完了</h3>
              <p className="text-purple-800 mb-4">
                署名が正常に作成されました。React SDKフックで決済を実行してください。
              </p>
              <button
                onClick={handleExecuteTransferAuth}
                disabled={!isTransferAuthReady}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                🚀 Transfer Auth決済を実行
              </button>
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
        <h2 className="text-3xl font-bold text-gray-900">💳 Purchase (React SDK)</h2>
        <p className="text-gray-600 mt-2 text-lg">React SDKフックによる商品購入 - State Machine決済フロー</p>
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
            Current Allowance: <span className="font-bold">{currentAllowance.toLocaleString()} JPYC</span>
          </div>
        </div>
      </div>

      {/* React SDK状態デバッグパネル */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">🔍 React SDK状態デバッグ</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Approve</h5>
            <div className="space-y-1">
              <div>isReady: <span className={isApproveReady ? "text-green-600" : "text-red-600"}>{isApproveReady ? "✓" : "✗"}</span></div>
              <div>isLoading: <span className={isApproveLoading ? "text-orange-600" : "text-gray-600"}>{isApproveLoading ? "✓" : "✗"}</span></div>
              <div>isSuccess: <span className={isApproveSuccess ? "text-green-600" : "text-gray-600"}>{isApproveSuccess ? "✓" : "✗"}</span></div>
              <div>error: <span className={approveError ? "text-red-600" : "text-gray-600"}>{approveError ? "✓" : "✗"}</span></div>
            </div>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Transfer Auth</h5>
            <div className="space-y-1">
              <div>isReady: <span className={isTransferAuthReady ? "text-green-600" : "text-red-600"}>{isTransferAuthReady ? "✓" : "✗"}</span></div>
              <div>isLoading: <span className={isTransferAuthLoading ? "text-orange-600" : "text-gray-600"}>{isTransferAuthLoading ? "✓" : "✗"}</span></div>
              <div>isSuccess: <span className={isTransferAuthSuccess ? "text-green-600" : "text-gray-600"}>{isTransferAuthSuccess ? "✓" : "✗"}</span></div>
              <div>error: <span className={transferAuthError ? "text-red-600" : "text-gray-600"}>{transferAuthError ? "✓" : "✗"}</span></div>
              <div>hash: <span className="font-mono text-xs">{transferAuthHash || "なし"}</span></div>
            </div>
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