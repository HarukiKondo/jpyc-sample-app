// ===== ネットワーク設定 =====

// サポートするネットワークの設定
export const NETWORK_CONFIGS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia test network',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  polygonAmoy: {
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'POL',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
  avalancheFuji: {
    chainId: '0xa869', // 43113 in hex
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  },
} as const;

// JPYCトークン設定
export const JPYC_TOKEN_CONFIGS = {
  sepolia: {
    address: '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB',
    symbol: 'JPYC Prepaid',
    decimals: 18,
    image: '/JPYC_Prepaid_symbol.svg',
  },
  polygonAmoy: {
    address: '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB',
    symbol: 'JPYC Prepaid',
    decimals: 18,
    image: '/JPYC_Prepaid_symbol.svg',
  },
  avalancheFuji: {
    address: '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB',
    symbol: 'JPYC Prepaid',
    decimals: 18,
    image: '/JPYC_Prepaid_symbol.svg',
  },
  localhost: {
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    symbol: 'JPYC Prepaid',
    decimals: 18,
    image: '/JPYC_Prepaid_symbol.svg',
  },
} as const;

// ===== アドレス設定 =====

// チェーンIDに応じてJPYCアドレスを取得
export function getJPYCAddress(): `0x${string}` {
  if (typeof window !== 'undefined' && window.ethereum) {
    const chainId = parseInt(window.ethereum.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    } else {
      // テストネット - JPYC v2
      return "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB";
    }
  }
  return "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB"; // デフォルト（JPYC v2）
}

// チェーンIDに応じてPaymentGatewayアドレスを取得
export function getGatewayAddress(): `0x${string}` {
  if (typeof window !== 'undefined' && window.ethereum) {
    const chainId = parseInt(window.ethereum.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    } else {
      // Sepolia Testnet（JPYC v2対応）
      return "0x39bA2Fc02fE35a5655eb8200A659d5c7067e6D78";
    }
  }
  return "0x39bA2Fc02fE35a5655eb8200A659d5c7067e6D78"; // デフォルト（JPYC v2対応）
}

// チェーンIDに応じてMerchantアドレスを取得
export function getMerchantAddress(): `0x${string}` {
  if (typeof window !== 'undefined' && window.ethereum) {
    const chainId = parseInt(window.ethereum.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local - Account #1
      return "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    } else {
      // Sepolia Testnet
      return "0x47e98DA2D8FA38ea76bBDbD1d3E2725732cb3A88";
    }
  }
  return "0x47e98DA2D8FA38ea76bBDbD1d3E2725732cb3A88"; // デフォルト（Sepolia）
}

// ===== ウォレット管理関数 =====

/**
 * MetaMaskにネットワークを追加する
 */
export const addNetworkToWallet = async (networkKey: keyof typeof NETWORK_CONFIGS) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMaskが見つかりません');
  }

  const networkConfig = NETWORK_CONFIGS[networkKey];
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
    return { success: true, message: `${networkConfig.chainName}を追加しました` };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) {
      throw new Error('ユーザーがリクエストを拒否しました');
    } else if (err.code === -32602) {
      if (err.message?.includes('nativeCurrency.symbol does not match')) {
        throw new Error('このネットワークは既に追加済みです（通貨シンボルが異なります）');
      } else if (err.message?.includes('Expected 1-6 character string')) {
        throw new Error('通貨シンボルは1-6文字である必要があります');
      }
      throw new Error('無効なパラメータです');
    } else if (err.code === -32603) {
      throw new Error('このネットワークは既に追加済みです');
    } else {
      throw new Error(`ネットワークの追加に失敗しました: ${err.message || 'Unknown error'}`);
    }
  }
};

/**
 * MetaMaskでネットワークを切り替える
 */
export const switchNetwork = async (networkKey: keyof typeof NETWORK_CONFIGS) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMaskが見つかりません');
  }

  const networkConfig = NETWORK_CONFIGS[networkKey];
  const chainId = networkConfig.chainId;

  try {
    // ネットワークの切り替えを試みる
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }],
    });
    return { success: true, message: `${networkConfig.chainName}に切り替えました` };
  } catch (switchError: unknown) {
    const err = switchError as { code?: number; message?: string };
    // ユーザーがネットワークを持っていなかった場合 (code 4902)
    if (err.code === 4902) {
      console.log('ネットワークが未登録のため、追加処理を開始します。');
      try {
        // ネットワークの追加を試みる
        return await addNetworkToWallet(networkKey);
      } catch (addError) {
        console.error('ネットワークの追加に失敗しました:', addError);
        throw new Error('ネットワークの追加に失敗しました');
      }
    } else if (err.code === 4001) {
      throw new Error('ユーザーがネットワークの切り替えを拒否しました');
    } else {
      console.error('ネットワークの切り替えに失敗しました:', err);
      throw new Error(`ネットワークの切り替えに失敗しました: ${err.message || 'Unknown error'}`);
    }
  }
};

/**
 * MetaMaskにトークンを追加する
 */
export const addTokenToWallet = async (
  networkKey: keyof typeof JPYC_TOKEN_CONFIGS,
  chainId?: string
) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMaskが見つかりません');
  }

  const tokenConfig = JPYC_TOKEN_CONFIGS[networkKey];
  
  try {
    // 現在のチェーンIDを確認
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // 指定されたチェーンと異なる場合は警告
    if (chainId && currentChainId !== chainId) {
      throw new Error('正しいネットワークに切り替えてからトークンを追加してください');
    }

    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: tokenConfig.address,
          symbol: tokenConfig.symbol,
          decimals: tokenConfig.decimals,
          image: tokenConfig.image,
        },
      } as unknown as unknown[],
    });

    if (wasAdded) {
      return { success: true, message: 'JPYC Prepaidトークンを追加しました' };
    } else {
      throw new Error('トークンの追加がキャンセルされました');
    }
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4001) {
      throw new Error('ユーザーがリクエストを拒否しました');
    } else {
      throw new Error(`トークンの追加に失敗しました: ${err.message || 'Unknown error'}`);
    }
  }
};

/**
 * チェーンIDからネットワークキーを取得
 */
export const getNetworkKeyFromChainId = (chainId: number): keyof typeof NETWORK_CONFIGS | 'localhost' | null => {
  switch (chainId) {
    case 11155111:
      return 'sepolia';
    case 80002:
      return 'polygonAmoy';
    case 43113:
      return 'avalancheFuji';
    case 31337:
      return 'localhost';
    default:
      return null;
  }
};

/**
 * チェーン名からネットワークキーを取得
 */
export const getNetworkKeyFromChainName = (chainName?: string): keyof typeof NETWORK_CONFIGS | 'localhost' => {
  switch (chainName) {
    case 'Sepolia':
    case 'Sepolia test network':
      return 'sepolia';
    case 'Polygon Amoy':
    case 'Polygon Amoy Testnet':
      return 'polygonAmoy';
    case 'Avalanche Fuji':
    case 'Avalanche Fuji Testnet':
      return 'avalancheFuji';
    case 'Localhost':
    case 'Anvil Local':
      return 'localhost';
    default:
      return 'sepolia';
  }
}; 