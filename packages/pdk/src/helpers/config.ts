// import * as fs from 'fs';
import { ProjectConfig } from '@patchworkdev/common';
import fs from 'fs/promises';
import Module from 'module';
import * as path from 'path';
import { register, } from 'ts-node';
import { Abi } from "viem";
import { Schema } from '../generateApi/ponderMocks';

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

export async function loadPonderSchema(ponderSchema: string) {
    try {
        // Set up ts-node
        register({
            transpileOnly: true,
            compilerOptions: {
                module: 'CommonJS',
                moduleResolution: 'node',
            }
        });
        const originalRequire = Module.prototype.require;
        const newRequire = function (this: NodeModule, id: string) {
            if (id === '@ponder/core') {
                return require(path.resolve(__dirname, '../generateApi/ponderMocks'));
            }
            return originalRequire.call(this, id);
        } as NodeRequire;
        Object.assign(newRequire, originalRequire);
        Module.prototype.require = newRequire;
        try {
            const schemaModule = await import(ponderSchema);
            const schema = schemaModule.default;
            return schema as Schema;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('is not a function')) {
                console.error("Error: It seems a method is missing from our mock implementation.");
                console.error("Full error:", error);
                console.error("Please add this method to the mockSchemaBuilder in ponderMocks.ts");
            } else {
                throw error;
            }
        } finally {
            Module.prototype.require = originalRequire;
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

export async function importPatchworkConfig(config: string): Promise<ProjectConfig | undefined> {

    // Register ts-node to handle TypeScript files
    register({
        transpileOnly: true,
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
        }
    });

    try {

        const module = await import(config);

        return module.config as ProjectConfig;
    } catch (error) {
        console.error('Error importing ProjectConfig', error);
        return undefined;
    }
}

export async function importABIFiles(abiDir: string) {

    // Register ts-node to handle TypeScript files
    register({
        transpileOnly: true,
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
        }
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
                const module = await import(filePath);
                const baseName = path.basename(file, '.abi.ts');
                abiObjects[baseName] = module[baseName];

                // Return the exported constant
                return { name: baseName, abi: module[baseName] };
            })
        );


        // Filter out any null results and return the ABI objects
        // return abiModules.filter((module): module is { name: string; abi: Abi } => module !== null);
        return abiObjects;
    } catch (error) {
        console.error('Error importing ABI files:', error);
        return abiObjects;
    }
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