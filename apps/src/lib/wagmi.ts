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
      http: ['http://127.0.0.1:8545', 'http://0.0.0.0:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545', 'http://0.0.0.0:8545'],
    },
  },
  blockExplorers: undefined,
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'JPYC Sample App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia, polygonAmoy, avalancheFuji, anvilLocal],
  ssr: true,
}); 