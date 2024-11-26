import fs from 'fs/promises';
import path from 'node:path';
import { analyzeAPI } from '../../helpers/api';
import { ErrorCode, PDKError } from '../../helpers/error';
import { formatAndSaveFile } from '../../helpers/file';
import { logger } from '../../helpers/logger';
import { pascalCase } from '../../helpers/text';
import { Compute, PatchworkPlugin, RequiredBy } from '../types';

type ReactPluginOptions = Compute<
    RequiredBy<PatchworkPlugin, 'generate'> & {
        hooksPath: string;
    }
>;

function react({ hooksPath }: ReactPluginOptions): PatchworkPlugin {
    return {
        name: 'React',
        generate: async ({ config, contracts, rootDir, artifacts }) => {
            if (artifacts['trpcRouter']) {
                generateTrpcHooks(rootDir, hooksPath);
            }
        },
    };
}

export default react;

async function generateTrpcHooks(configPath: string, hooksDir: string) {
    const configDir = path.dirname(configPath);
    const trpcRouter = path.join(configDir, 'ponder', 'src', 'generated', 'api.ts');
    const trpcHooksFile = path.join(hooksDir, 'trpc.ts');
    //const wagmiHooksFile = path.join(hooksDir, 'wagmi.ts');

    // Check if tRPC router file exists
    try {
        await fs.access(trpcRouter);
    } catch (error) {
        logger.error(`Error: Unable to access tRPC router file at ${trpcRouter}`);
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Error: Unable to access tRPC router file at ${trpcRouter}`);
    }

    // Ensure hooks directory exists
    try {
        await fs.mkdir(hooksDir, { recursive: true });
    } catch (error) {
        logger.error(`Error creating hooks directory at ${hooksDir}:`, error);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Error creating hooks directory at  ${trpcRouter}`);
    }

    const apiStructure = analyzeAPI(trpcRouter);
    const hooksFileArray = [
        `import { trpc } from '../lib/trpc';
            `,
    ];

    for (let key in apiStructure) {
        hooksFileArray.push(`export const use${pascalCase(key)} = trpc.${key}.useQuery;
            `);
    }

    formatAndSaveFile(trpcHooksFile, hooksFileArray.join(''));
}
