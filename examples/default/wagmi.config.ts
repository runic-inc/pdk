import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export default defineConfig([
    {
        out: 'www/src/generated/hooks/wagmi.ts',
        plugins: [
            foundry({
                include: getContracts(),
                forge: {
                    build: false,
                },
            }),
            react(),
        ],
    },
]);

function getContracts() {
    const srcDir = path.resolve(__dirname, './contracts/src');
    const outDir = path.resolve(__dirname, './contracts/out');
    try {
        const solFiles = readdirSync(srcDir);
        const solBaseNames = solFiles.filter((file) => file.endsWith('.sol') && !file.toLowerCase().includes('generated')).map((file) => path.parse(file).name);

        const matchingJsonFiles: string[] = [];
        for (const baseName of solBaseNames) {
            const jsonPath = path.join(`${baseName}.sol`, `${baseName}.json`);
            const fullPath = path.join(outDir, jsonPath);
            if (existsSync(fullPath)) {
                matchingJsonFiles.push(jsonPath);
            }
        }

        return matchingJsonFiles;
    } catch (err) {
        console.error('Error reading directories:', err);
        return [];
    }
}
