import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cpy from 'cpy';
import { defineConfig } from 'tsup';

import { dependencies } from './package.json';

export default defineConfig({
    name: 'create-patchwork',
    bundle: true,
    outDir: './dist',
    clean: true,
    entry: ['src/index.ts'],
    external: Object.keys(dependencies),
    format: ['esm'],
    platform: 'node',
    target: 'esnext',
    async onSuccess() {
        const __dirname = fileURLToPath(new URL('.', import.meta.url));
        const examplesPath = path.join(__dirname, '../..', 'examples');
        const targetPath = path.join(__dirname, 'dist/templates');
        console.log('Copying examples to templates path:', examplesPath, targetPath);

        if (!existsSync(targetPath)) {
            mkdirSync(targetPath);
        }
        // Copy examples contents into the templates path
        await cpy(
            [
                path.join(examplesPath, '**', '*'),
                '!**/node_modules/**',
                '!**/generated/**',
                '!**/.ponder/**',
                '!**/.next/**',
                '!**/next-env.d.ts',
            ],
            targetPath,
            {},
        );
    },
});
