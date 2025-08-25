// ===== アドレス設定 =====

// チェーンIDに応じてJPYCアドレスを取得
export function getJPYCAddress(): `0x${string}` {
  if (typeof window !== 'undefined') {
    const ethereum = (window as any).ethereum;
    const chainId = parseInt(ethereum?.chainId || '31337');
    
    if (chainId === 31337) {
      // Anvil Local
      return process.env.NEXT_PUBLIC_LOCAL_JPYC as `0x${string}` || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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
      return process.env.NEXT_PUBLIC_LOCAL_GATEWAY as `0x${string}` || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    } else {
      // テストネット
      return "0x602337022d05d2cF3c2A0Cd2a6d7720A49a84b6F";
    }
  }
  return "0x602337022d05d2cF3c2A0Cd2a6d7720A49a84b6F"; // デフォルトはテストネット
} 