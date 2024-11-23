import { processContracts } from '@patchworkdev/pdk/utils';
import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import path from 'node:path';

export default defineConfig(async () => {
    const contracts = await processContracts(path.resolve(__dirname, 'contracts'));
    const out: {
        name: string;
        path: string;
        address: `0x${string}`;
    }[] = [];
    try {
        Object.entries(contracts).forEach(([baseName, details]) => {
            const jsonPath = path.join(`${baseName}.sol`, `${baseName}.json`);
            out.push({
                name: baseName,
                path: jsonPath,
                address: details.deployedAddress as `0x${string}`,
            });
        });
    } catch (err) {
        console.error('Error reading directories:', err);
        return [];
    }
    return [
        {
            out: 'www/src/generated/hooks/wagmi.ts',
            plugins: [
                foundry({
                    include: out.map(({ path }) => path),
                    deployments: Object.fromEntries(
                        out.map(({ name, address }) => {
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
    ];
});
