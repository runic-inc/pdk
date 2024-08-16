import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'src/wizard',
  build: {
    outDir: path.resolve(__dirname, 'dist/wizard'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, 'src/wizard/client.ts'),
      },
      output: {
        entryFileNames: 'client.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'client.css') return 'style.css';
          return `assets/${assetInfo.name}`;
        },
      },
      external: ['hono', '@hono/node-server'],
    },
  },
  resolve: {
    alias: {
      'hono/jsx': path.resolve(__dirname, 'node_modules/hono/dist/jsx'),
    },
  },
});