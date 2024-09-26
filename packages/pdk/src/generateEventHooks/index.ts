import path from 'path';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../helpers/config';
import { createPonderEventFile, generatePonderOnHandler } from './factories';
// import { createSchemaFile, createSchemaObject, createTable } from './factories';

// async function importABIFiles(abiDir: string) {
//     try {
//         // Read the directory
//         const abiFiles = (await fs.readdir(abiDir)).filter((file) => file.endsWith('.abi.ts'));

//         // Dynamically import all ABI files
//         const abiModules = await Promise.all(
//             abiFiles.map(async (file) => {
//                 const filePath = path.join(abiDir, file);

//                 // Import the TypeScript file
//                 const module = await import(filePath);
//                 const baseName = path.basename(file, '.abi.ts');
//                 // console.log(baseName);
//                 // console.log(module);

//                 // Return the exported constant
//                 return { name: baseName, abi: module[baseName] };
//             })
//         );

//         // Filter out any null results and return the ABI objects
//         return abiModules.filter((module): module is { name: string; abi: Abi } => module !== null);
//     } catch (error) {
//         console.error('Error importing ABI files:', error);
//         return [];
//     }
// }

export async function generateEventHooks(configPath: string) {

    const abiDir = path.join(path.dirname(configPath), "", "abis");
    const eventDir = path.join(path.dirname(configPath), "src");

    const abis = await importABIFiles(abiDir);
    const projectConfig = await importPatchworkConfig(configPath);
    if (!projectConfig) {
        console.error('Error importing ProjectConfig');
        return;
    }

    // begin process config
    const fragmentRelationships = getFragmentRelationships(projectConfig);
    const entityEvents = ["Frozen", "Locked", "Transfer", "Unlocked", "Thawed"];

    const ponderEventHandlers = Object.entries(projectConfig.contracts).flatMap(([contractName, contractConfig]) => {
        const filteredEvents = abis[contractName].filter((abiEvent) => abiEvent.type === 'event').filter((abiEvent) => entityEvents.includes(abiEvent.name));
        return filteredEvents.map((event) => { return generatePonderOnHandler(contractName, event.name, {}) }).filter((event) => event !== undefined);
    });
    createPonderEventFile(ponderEventHandlers, path.join(eventDir, "ponder.events.ts"));
    // const abiObjects = await importABIFiles(abiDir);

    // const tables: ts.PropertyAssignment[] = [];
    // for (const abiObject of abiObjects) {
    //     abiObject.abi.forEach((abiItem) => {
    //         if (abiItem.type === 'event') {
    //             tables.push(createTable(abiObject.name, abiItem));
    //         }
    //     });
    // }
    // const file = await createSchemaFile(tables, ponderSchema);
}