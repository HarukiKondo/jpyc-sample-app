import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    const exerciseMode = process.env.EXERCISE_MODE;
    
    if (exerciseMode) {
      const aliasPath = path.resolve(__dirname, `src/exercises/${exerciseMode}/jpycClient.${exerciseMode}.ts`);
      
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/jpycClient': aliasPath,
      };
      
      console.log(`🎯 Exercise Mode (webpack): ${exerciseMode}`);
      console.log(`📚 Using: ${aliasPath}`);
    }
    
    return config;
  },
};

export default nextConfig;
