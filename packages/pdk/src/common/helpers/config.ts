// import * as fs from 'fs';
import { ProjectConfig } from '@patchworkdev/common';
import fs from 'fs/promises';
import * as path from 'path';
import { Abi } from 'viem';
import { ErrorCode, PDKError } from './error';
import { logger } from './logger';
import { SchemaModule } from './ponderSchemaMock';
import { Default, tsLoader } from './tsLoader';

async function findFileUpwards(directory: string, filename: string): Promise<string | null> {
    const filePath = path.join(directory, filename);
    try {
        await fs.access(filePath);
        return filePath;
    } catch {
        // File does not exist
    }
    const parentDirectory = path.dirname(directory);
    if (parentDirectory === directory) {
        return null;
    }
    return findFileUpwards(parentDirectory, filename);
}

export async function findConfig() {
    const configFileName = 'patchwork.config.ts';
    const currentDirectory = process.cwd();
    return findFileUpwards(currentDirectory, configFileName);
}

export async function findPonderSchema() {
    const schemaFileName = 'ponder.schema.ts';
    const currentDirectory = process.cwd();
    return findFileUpwards(currentDirectory, schemaFileName);
}

export async function loadPonderSchema(ponderSchema: string): Promise<SchemaModule> {
    const mock = path.resolve(__dirname, './ponderSchemaMock');

    try {
        return await tsLoader<SchemaModule>(ponderSchema, {
            compilerOptions: {
                strict: false,
                noImplicitAny: false,
            },
            moduleOverrides: {
                '@ponder/core': mock,
            },
        });
    } catch (error) {
        logger.error(error);
        if (error instanceof TypeError && error.message.includes('is not a function')) {
            logger.error('Error: It seems a method is missing from our mock implementation.');
            logger.error('Full error:', error);
            logger.error('Please add this method to the mockSchemaBuilder in ponderSchemaMocks.ts');
        }
        throw new PDKError(ErrorCode.MOCK_NOT_FOUND, `Missing mock implementation in ponderSchemaMocks.ts`);
    }
}

export async function importPatchworkConfig(config: string): Promise<ProjectConfig> {
    try {
        // Resolve the full path
        const fullPath = path.isAbsolute(config) ? config : path.resolve(process.cwd(), config);

        return (await tsLoader<Default<ProjectConfig>>(fullPath)).default;
    } catch (error) {
        if (error instanceof Error) {
            logger.error('Error importing ProjectConfig:', error.message);
        } else {
            logger.error('An unknown error occurred while importing ProjectConfig');
        }
        throw new PDKError(ErrorCode.PROJECT_CONFIG_ERROR, `Error importing ProjectConfig at ${config}`);
    }
}

export async function importABIFiles(abiDir: string) {
    try {
        await fs.access(abiDir);
    } catch (error) {
        logger.error(`- ABI directory not found: ${abiDir}`);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `ABI directory not found at ${abiDir}`);
    }

    const abiObjects: Record<string, Abi> = {};
    try {
        // Read the directory
        const abiFiles = (await fs.readdir(abiDir)).filter((file) => file.endsWith('.abi.ts'));

        // Dynamically import all ABI files
        // -- NOTE: Seems like we should prune this? There's a LOT of artifacts
        // -- NOTE: Should consider only importing ABIs for project's contracts + PatchworkProtocol
        await Promise.all(
            abiFiles.map(async (file) => {
                const filePath = path.join(abiDir, file);

                const module = await tsLoader<{ [key: string]: Abi }>(filePath);
                const baseName = path.basename(file, '.abi.ts');
                abiObjects[baseName] = module[baseName];

                // Return the exported constant
                return { name: baseName, abi: module[baseName] };
            }),
        );
    } catch (error) {
        logger.error('Error importing ABI files:', error);
        throw new PDKError(ErrorCode.ABI_IMPORT_ERROR, `Error importing ABIs at ${abiDir}`);
    }

    if (Object.keys(abiObjects).length === 0) {
        logger.error(`Error: No ABI files found in ${abiDir}`);
        throw new PDKError(ErrorCode.ABI_IMPORT_ERROR, `Error: No ABI files found in  ${abiDir}`);
    }
    return abiObjects;
}

export function getFragmentRelationships(projectConfig: ProjectConfig): Record<string, string[]> {
    const fragmentRelationships: Record<string, string[]> = {} as Record<string, string[]>;

    Object.entries(projectConfig.contracts).forEach(([contractName, contractConfig]) => {
        if (typeof contractConfig !== 'string') {
            contractConfig.fragments?.forEach((fragment) => {
                if (!fragmentRelationships[fragment]) {
                    fragmentRelationships[fragment] = [];
                }
                fragmentRelationships[fragment].push(contractName);
            });
        }
    });

    return fragmentRelationships;
}
