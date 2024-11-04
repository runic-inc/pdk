import fs from 'fs/promises';
import path from 'path';
import { analyzeAPI } from '../helpers/api';
import { ErrorCode, PDKError } from '../helpers/error';
import { formatAndSaveFile } from '../helpers/file';
import { pascalCase } from '../helpers/text';

export async function generateReactHooks(configPath: string) {
    const configDir = path.dirname(configPath);
    const trpcRouter = path.join(configDir, 'ponder', 'src', 'generated', 'api.ts');
    const hooksDir = path.join(configDir, 'www', 'generated', 'hooks');
    const hooksFile = path.join(hooksDir, 'index.ts');

    // Check if tRPC router file exists
    try {
        await fs.access(trpcRouter);
    } catch (error) {
        console.error(`Error: Unable to access tRPC router file at ${trpcRouter}`);
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Error: Unable to access tRPC router file at ${trpcRouter}`);
    }

    // Ensure hooks directory exists
    try {
        await fs.mkdir(hooksDir, { recursive: true });
    } catch (error) {
        console.error(`Error creating hooks directory at ${hooksDir}:`, error);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Error creating hooks directory at  ${trpcRouter}`);
    }

    const apiStructure = analyzeAPI(trpcRouter);
    const hooksFileArray = [
        `import { trpc } from '../utils/trpc';
            `,
    ];

    for (let key in apiStructure) {
        hooksFileArray.push(`export const use${pascalCase(key)} = trpc.${key}.useQuery;
            `);
    }

    formatAndSaveFile(hooksFile, hooksFileArray.join(''));
    console.log(`React hooks generated successfully at ${hooksFile}`);
}
