/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
  // Suppress warnings during build
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;