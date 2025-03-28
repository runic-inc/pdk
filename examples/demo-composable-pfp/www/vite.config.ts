import { ValidateEnv } from '@julr/vite-plugin-validate-env';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { z } from 'zod';
import { DynamicPublicDirectory } from 'vite-multiple-assets';

// https://vite.dev/config/
export default defineConfig({
	server: {
		port: 3000,
		strictPort: true,
		host: true,
		hmr: {
			port: 3010,
		},
		watch: {
			usePolling: true,
			interval: 200,
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'#': path.resolve(__dirname, './..'),
		},
	},
	assetsInclude: ['../assets/**/*.svg'],
	plugins: [
		ValidateEnv({
			validator: 'zod',
			schema: {
				VITE_PUBLIC_WALLETCONNECT_PROJECTID: z.string(),
				VITE_PUBLIC_PONDER_URL: z.string().url(),
				VITE_NETWORK: z.enum(['local', 'mainnet', 'testnet']),
			},
		}),
		DynamicPublicDirectory([
			{
				input: '../assets/**',
				output: '/assets',
				flatten: false,
			},
		]),
		react(),
	],
});
