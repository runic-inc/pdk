// import * as fs from 'fs';
import { ProjectConfig } from '@patchworkdev/common';
import fs from 'fs/promises';
import Module from 'module';
import * as path from 'path';
import { register } from 'ts-node';
import { Abi } from 'viem';
import { ErrorCode, PDKError } from './error';
import { SchemaModule } from './ponderSchemaMock';

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
    try {
        await fs.access(ponderSchema);
    } catch (error) {
        // console.error(`Error: Unable to access Ponder schema file at ${ponderSchema}`);
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Unable to access Ponder schema file at  ${ponderSchema}`);
    }
    let schemaModule: SchemaModule = {};
    // Set up ts-node
    register({
        transpileOnly: true,
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
        },
    });
    const originalRequire = Module.prototype.require;
    const newRequire = function (this: NodeModule, id: string) {
        if (id === '@ponder/core/db') {
            return require(path.resolve(__dirname, './ponderSchemaMock'));
        }
        return originalRequire.call(this, id);
    } as NodeRequire;
    Object.assign(newRequire, originalRequire);
    Module.prototype.require = newRequire;
    try {
        schemaModule = await require(ponderSchema);
        return schemaModule as SchemaModule;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('is not a function')) {
            console.error('Error: It seems a method is missing from our mock implementation.');
            console.error('Full error:', error);
            console.error('Please add this method to the mockSchemaBuilder in ponderSchemaMocks.ts');
        } else {
            throw new PDKError(ErrorCode.MOCK_NOT_FOUND, `Missing mock implementation in ponderSchemaMocks.ts`);
        }
    } finally {
        Module.prototype.require = originalRequire;
    }
    return schemaModule as SchemaModule;
}

export async function importPatchworkConfig(config: string): Promise<ProjectConfig> {
    // Register ts-node to handle TypeScript files
    register({
        transpileOnly: true,
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
        },
    });

    try {
        // Resolve the full path
        const fullPath = path.isAbsolute(config) ? config : path.resolve(process.cwd(), config);

        // Check if the file exists
        await fs.access(fullPath);

        // Import the config file
        // const module = await import(fullPath);
        const module = require(fullPath);
        return module.default as ProjectConfig;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error importing ProjectConfig:', error.message);
        } else {
            console.error('An unknown error occurred while importing ProjectConfig');
        }
        throw new PDKError(ErrorCode.PROJECT_CONFIG_ERROR, `Error importing ProjectConfig at ${config}`);
    }
}

export async function importABIFiles(abiDir: string) {
    try {
        await fs.access(abiDir);
    } catch (error) {
        console.error(`- ABI directory not found: ${abiDir}`);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `ABI directory not found at ${abiDir}`);
    }
    // Register ts-node to handle TypeScript files
    register({
        transpileOnly: true,
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
        },
    });

    const abiObjects: Record<string, Abi> = {};
    try {
        // Read the directory
        const abiFiles = (await fs.readdir(abiDir)).filter((file) => file.endsWith('.abi.ts'));

        // Dynamically import all ABI files
        const abiModules = await Promise.all(
            abiFiles.map(async (file) => {
                const filePath = path.join(abiDir, file);

                // Import the TypeScript file
                // const module = await import(filePath);
                const module = await require(filePath);
                const baseName = path.basename(file, '.abi.ts');
                abiObjects[baseName] = module[baseName];

                // Return the exported constant
                return { name: baseName, abi: module[baseName] };
            }),
        );

        // Filter out any null results and return the ABI objects
        // return abiModules.filter((module): module is { name: string; abi: Abi } => module !== null);
        // return abiObjects;
    } catch (error) {
        console.error('Error importing ABI files:', error);
        throw new PDKError(ErrorCode.ABI_IMPORT_ERROR, `Error importing ABIs at ${abiDir}`);
    }

    if (Object.keys(abiObjects).length === 0) {
        console.error(`Error: No ABI files found in ${abiDir}`);
        throw new PDKError(ErrorCode.ABI_IMPORT_ERROR, `Error: No ABI files found in  ${abiDir}`);
    }
    return abiObjects;
}

export function getFragmentRelationships(projectConfig: ProjectConfig): Record<string, string[]> {
    const fragmentRelationships: Record<string, string[]> = {} as Record<string, string[]>;
    Object.entries(projectConfig.contractRelations).forEach(([contractName, { fragments }]) => {
        fragments.forEach((fragment) => {
            if (!fragmentRelationships[fragment]) {
                fragmentRelationships[fragment] = [];
            }
            fragmentRelationships[fragment].push(contractName);
        });
    });

    return fragmentRelationships;
}
