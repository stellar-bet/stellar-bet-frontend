/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['stellarbeat.io', 'stellar.org'],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001/ws',
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet',
    NEXT_PUBLIC_CONTRACT_BETTING_POOL: process.env.NEXT_PUBLIC_CONTRACT_BETTING_POOL ?? '',
    NEXT_PUBLIC_CONTRACT_HOUSE_ESCROW: process.env.NEXT_PUBLIC_CONTRACT_HOUSE_ESCROW ?? '',
    NEXT_PUBLIC_CONTRACT_BET_TOKEN: process.env.NEXT_PUBLIC_CONTRACT_BET_TOKEN ?? '',
  },

  // Suppress sodium-native warnings from @stellar/stellar-sdk
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    // Ignore the sodium-native dynamic require warning
    config.ignoreWarnings = [
      { module: /sodium-native/ },
      { module: /require-addon/ },
    ];
    return config;
  },
};

export default nextConfig;
