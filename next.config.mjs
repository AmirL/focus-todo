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
        enforce: 'pre',
        include: /src\//,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: [
              'babel-plugin-istanbul',
              '@babel/plugin-transform-runtime',
            ],
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
