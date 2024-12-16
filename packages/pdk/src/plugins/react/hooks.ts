import fs from 'fs/promises';
import path from 'path';
import { analyzeAPI } from '../../common/helpers/api';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { formatAndSaveFile } from '../../common/helpers/file';
import { logger } from '../../common/helpers/logger';
import { pascalCase } from '../../common/helpers/text';

export async function generateHooks(rootDir: string) {
    logger.info(`  ∟ Generating Wagmi hooks...`);
    await generateWagmiHooks(rootDir);
    logger.info(`  ∟ Generating tRPC API hooks...`);
    await generateTrpcHooks(rootDir);
    logger.info(`React hooks generated successfully`);
}

export async function generateWagmiHooks(rootDir: string) {
    const wagmiConfig = path.join(rootDir, 'wagmi.config.ts');

    try {
        await fs.access(wagmiConfig);
    } catch (error) {
        console.error(`Error: Unable to access Wagmi config file at ${wagmiConfig}`);
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Error: Unable to access Wagmi config file at ${wagmiConfig}`);
    }

    const { execa } = await import('execa');
    execa('pnpm', ['wagmi', 'generate'], {
        cwd: rootDir,
    });
}

export async function generateTrpcHooks(rootDir: string) {
    const trpcRouter = path.join(rootDir, 'ponder', 'src', 'generated', 'api.ts');
    const hooksDir = path.join(rootDir, 'www', 'src', 'generated', 'hooks');
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
