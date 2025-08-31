import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    const exerciseMode = process.env.EXERCISE_MODE;
    
    if (exerciseMode && exerciseMode !== 'false') {
      // 練習用クライアントに切り替え
      const exerciseClientPath = path.resolve(__dirname, 'src/lib/jpycClientExercise.ts');
      const originalClientPath = path.resolve(__dirname, 'src/lib/jpycClient.ts');
      
      config.resolve.alias = {
        ...config.resolve.alias,
        [originalClientPath]: exerciseClientPath,
      };
      
      console.log(`🎯 Exercise Mode (webpack): ${exerciseMode}`);
      console.log(`📚 Alias: ${originalClientPath} → ${exerciseClientPath}`);
    }
    
    return config;
  },
};

export default nextConfig;
