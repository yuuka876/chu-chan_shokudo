/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  reactStrictMode: true,
  transpilePackages: []
};

module.exports = nextConfig;
