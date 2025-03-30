/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'canvas', 'jsdom'];
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/metrics',
        destination: '/api/metrics',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
