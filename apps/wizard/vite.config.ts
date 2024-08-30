import path from 'path';
import { type UserConfig } from 'vite';

export default {
    root: 'app',
    build: {
        outDir: path.resolve(__dirname, 'dist/wizard'),
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            // '@wizard': path.resolve(__dirname, './app'),
            '@patchworkdev/common': path.resolve(__dirname, '../../packages/common/src'),
            // "@patchworkdev/common/*": "../../packages/common/src/*"
        },
    },
} satisfies UserConfig;
