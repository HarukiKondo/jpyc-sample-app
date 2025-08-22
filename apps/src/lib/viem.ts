import { createPublicClient, createWalletClient, http, custom } from "viem";
import { sepolia } from "viem/chains";

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

export const getWalletClient = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  
  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
}; 