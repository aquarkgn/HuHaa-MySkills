import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  // macOS ARM64 上使用 Webpack 而非 Turbopack
  webpack: (config) => {
    return config
  },
}

export default nextConfig
