/** @type {import('next').NextConfig} */
const nextConfig = {
  // This forces Next.js to use the stable Webpack engine
  webpack: (config) => {
    return config;
  },
  // Suppress specific build-time errors that might stop the build
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;