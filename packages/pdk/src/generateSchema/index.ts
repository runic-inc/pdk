import fs from 'fs/promises';
import ts from 'typescript';
import path from 'path';
import { http, getAbiItem, Abi, AbiEvent } from "viem";
import { register } from 'ts-node';
import { createSchemaFile, createSchemaObject, createTable } from './factories';

async function importABIFiles(abiDir: string) {
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
                // console.log(baseName);
                // console.log(module);

                // Return the exported constant
                return { name: baseName, abi: module[baseName] };
            })
        );

        // Filter out any null results and return the ABI objects
        return abiModules.filter((module): module is { name: string; abi: Abi } => module !== null);
    } catch (error) {
        console.error('Error importing ABI files:', error);
        return [];
    }
}

export async function generateSchema(abiDir: string, ponderSchema: string) {
    // Register ts-node to handle TypeScript files
    register({
        transpileOnly: true,
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node',
        }
    });

    const abiObjects = await importABIFiles(abiDir);

    const tables: ts.PropertyAssignment[] = [];
    for (const abiObject of abiObjects) {
        abiObject.abi.forEach((abiItem) => {
            if (abiItem.type === 'event') {
                tables.push(createTable(abiObject.name, abiItem));
            }
        });
    }
    const file = await createSchemaFile(tables, ponderSchema);
}