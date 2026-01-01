/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  productionBrowserSourceMaps: process.env.NEXT_DISABLE_SOURCEMAPS ? false : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
