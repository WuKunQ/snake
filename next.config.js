/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 禁用App Router，只使用Pages Router
  experimental: {
    appDir: false
  }
};

module.exports = nextConfig;