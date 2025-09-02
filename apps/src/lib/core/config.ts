// ===== アドレス設定 =====

// チェーンIDに応じてJPYCアドレスを取得
export function getJPYCAddress(): `0x${string}` {
  if (typeof window !== 'undefined') {
    const ethereum = (window as any).ethereum;
    const chainId = parseInt(ethereum?.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    } else {
      // テストネット（Sepolia, Polygon Amoy, Avalanche Fuji等）
      return "0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29";
    }
  }
  return "0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29"; // デフォルトはテストネット
}

// チェーンIDに応じてPaymentGatewayアドレスを取得
export function getGatewayAddress(): `0x${string}` {
  if (typeof window !== 'undefined') {
    const ethereum = (window as any).ethereum;
    const chainId = parseInt(ethereum?.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    } else {
      // Sepolia Testnet
      return "0xf2Ef1A3a1093605a2f48CCD1F127EeFfb959683E";
    }
  }
  return "0xf2Ef1A3a1093605a2f48CCD1F127EeFfb959683E"; // デフォルト
}

// チェーンIDに応じてMerchantアドレスを取得
export function getMerchantAddress(): `0x${string}` {
  if (typeof window !== 'undefined') {
    const ethereum = (window as any).ethereum;
    const chainId = parseInt(ethereum?.chainId || '31337');
    
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