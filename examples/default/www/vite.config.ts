import { ValidateEnv } from "@julr/vite-plugin-validate-env";
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { z } from 'zod';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ValidateEnv({
        validator: 'zod',
        schema: {
            VITE_PUBLIC_WALLETCONNECT_PROJECTID: z.string().regex(/^[a-zA-Z0-9]{32}$/),
            VITE_PUBLIC_PONDER_URL: z.string().url(),
            VITE_NETWORK: z.enum(['local', 'mainnet', 'testnet']),
        }
    }),
    react(),
  ],
})
