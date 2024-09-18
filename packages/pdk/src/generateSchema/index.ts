import fs from 'fs/promises';
import path from 'path';
import { http, getAbiItem, Abi, parseAbi } from "viem";

async function importABIFiles(abiDir: string) {
    try {
        // Read the directory
        const abiFiles = await fs.readdir(abiDir);

        // Dynamically import all ABI files
        const abiModules = await Promise.all(
            abiFiles.map(async (file) => {
                const filePath = path.join(abiDir, file);
                // Check if it's a TypeScript file
                if (path.extname(file).toLowerCase() === '.ts') {
                    // Import the TypeScript file
                    const module = await import(filePath);
                    const baseName = path.basename(file, '.ts');
                    // Return the exported constant
                    return { name: baseName, abi: module[baseName] };
                }
                return null;
            })
        );

        // Filter out any null results and return the ABI objects
        return abiModules.filter((module): module is { name: string; abi: any } => module !== null);
    } catch (error) {
        console.error('Error importing ABI files:', error);
        return [];
    }
}

export async function generateSchema(abiDir: string, ponderSchema: string) {
    // const abiFiles = await fs.readdir(abiDir);

    // console.log(abiFiles);
    // for (const file of abiFiles) {
    //     console.log(file);
    //     break;
    // }
    const abiObjects = await importABIFiles(abiDir);

    for (const abiObject of abiObjects) {
        console.log(abiObject);
        const temp = parseAbi(abiObject.abi);
        console.log(temp);

        break;
    }
}