/** @type {import('next').NextConfig} */

import 'reflect-metadata';
import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';
const isCypressCoverage = process.env.CYPRESS_COVERAGE === 'true';

const nextConfig = {
  webpack(config) {
    if (isCypressCoverage) {
      config.module.rules.push({
        test: /\.(js|ts|tsx)$/,
        enforce: 'post',
        include: /src\//,
        exclude: [/node_modules/, /middleware\.ts/],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['babel-plugin-istanbul'],
          },
        },
      });
    }
    return config;
  },
};

export default withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
})(nextConfig);
