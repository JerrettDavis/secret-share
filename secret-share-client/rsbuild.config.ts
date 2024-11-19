import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'SecretShare',
    favicon: './src/public/favicon.ico',
    appIcon: './src/public/apple-touch-icon.png',
    meta: {
      description: 'A simple secrets sharing app'
    }
  },
  server: {
    port: 3000
  },
  dev: {
    watchFiles: {
      paths: ['src/**/*.{ts,tsx,css}', 'generated/**/*.{ts,tsx,css}'],
      options: {
        useFsEvents: true,
        usePolling: true
      }
    }
  },
  source: {
    alias: {
      '@components': './src/components',
      '@theme': './src/theme.ts',
      '@pages': './src/pages',
      '@generated': './generated'
    }
  }
});
