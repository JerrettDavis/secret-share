import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'SecretShare',
    favicon: './src/public/favicon.ico',
    appIcon: {
      name: 'SecretShare',
      icons: [{ src: './src/public/apple-touch-icon.png', size: 180 }],
    },
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
    // Keep this map in lockstep with `compilerOptions.paths` in tsconfig.json —
    // rsbuild resolves modules from here, tsc type-checks from there, and a
    // mismatch breaks silently in exactly one of the two tools.
    alias: {
      '@components': './src/components',
      '@features': './src/features',
      '@hooks': './src/hooks',
      '@lib': './src/lib',
      '@api': './src/api',
      '@theme': './src/theme.ts',
      '@pages': './src/pages',
      '@generated': './generated'
    }
  }
});
