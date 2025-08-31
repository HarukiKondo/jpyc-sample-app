import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygonAmoy, avalancheFuji } from 'wagmi/chains';
import { Chain } from 'viem';

// Anvil用のカスタムlocalhostチェーンを定義
const anvilLocal: Chain = {
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        // 環境変数を最優先、Codespace環境ではポート転送URLまたはプロキシを使用
        '/api/anvil-proxy',
      ],
    },
    public: {
      http: [
        '/api/anvil-proxy',
      ],
    },
  },
  blockExplorers: undefined,
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'JPYC Sample App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id-for-development',
  chains: [sepolia, polygonAmoy, avalancheFuji, anvilLocal],
  ssr: true,
}); 