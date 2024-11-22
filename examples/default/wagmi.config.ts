import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

export default defineConfig([
    {
        out: 'www/src/generated/hooks/wagmi.ts',
        plugins: [
            foundry({
                include: getContracts().map(({ path }) => path),
                deployments: Object.fromEntries(
                    getContracts().map(({ name, address }) => {
                        return [name, address];
                    }),
                ),
                forge: {
                    build: false,
                },
            }),
            react(),
        ],
    },
]);

function getDeploymentAddressForContract(contractName: string): `0x${string}` {
    return '0x0000000000000000000000000000000000000000';
}

type C = {
    name: string;
    path: string;
    address: `0x${string}`;
};
function getContracts(): C[] {
    const srcDir = path.resolve(__dirname, './contracts/src');
    const outDir = path.resolve(__dirname, './contracts/out');
    try {
        const solFiles = readdirSync(srcDir);
        const solBaseNames = solFiles.filter((file) => file.endsWith('.sol') && !file.toLowerCase().includes('generated')).map((file) => path.parse(file).name);

        const contracts: C[] = [];
        for (const baseName of solBaseNames) {
            const jsonPath = path.join(`${baseName}.sol`, `${baseName}.json`);
            const fullPath = path.join(outDir, jsonPath);
            if (existsSync(fullPath)) {
                contracts.push({
                    name: baseName,
                    path: jsonPath,
                    address: '0x0000000000000000000000000000000000000000',
                });
            }
        }
        return contracts;
    } catch (err) {
        console.error('Error reading directories:', err);
        return [];
    }
}
