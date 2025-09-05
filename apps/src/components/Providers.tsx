"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { useState } from 'react';

// React SDKのContextを常に使用
// 📝 レビュー改善: JpycSdkProviderを直接利用しない理由
// RainbowKitProviderでもwagmiConfigが作られるため、競合を避けるために
// SdkContext.Providerのみを使用し、wagmiConfigは統一している
let SdkContext: React.ComponentType<any> | null = null;

try {
  const { SdkContext: Context } = require('@jpyc/sdk-react');
  SdkContext = Context;
  console.log("✅ React SDK Context loaded successfully");
} catch (error) {
  console.error("❌ Failed to load React SDK Context:", error);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // React SDKのContextでラップ
  const content = SdkContext ? (
    <SdkContext.Provider value={{ 
      env: 'prod', 
      contractType: 'jpycPrepaid', 
      localContractAddress: undefined 
    }}>
      {children}
    </SdkContext.Provider>
  ) : children;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {content}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 