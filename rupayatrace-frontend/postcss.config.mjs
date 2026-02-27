/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🟢 REMOVED: Unsupported eslint and typescript keys to prevent warnings
  
  // Keep empty webpack config to satisfy dependencies if needed, 
  // but the --webpack flag in Step 1 does the heavy lifting.
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;