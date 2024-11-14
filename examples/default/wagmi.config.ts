import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';

export default defineConfig([
    {
        out: 'www/src/generated/wagmi.ts',
        plugins: [
            foundry({
                exclude: ['PatchworkProtocol.sol/**'],
                forge: {
                    build: false,
                },
            }),
            react(),
        ],
    },
]);
