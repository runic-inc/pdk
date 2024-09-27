import path from 'path';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../helpers/config';
import { createPonderEventFile, generatePonderOnHandler } from './factories';

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
    // ToDo 
    // Currently only getting entity events. need to get some patchwork protocol events too
    const fragmentRelationships = getFragmentRelationships(projectConfig);
    const entityEvents = ["Frozen", "Locked", "Transfer", "Unlocked", "Thawed"];

    const ponderEventHandlers = Object.entries(projectConfig.contracts).flatMap(([contractName, contractConfig]) => {
        const filteredEvents = abis[contractName].filter((abiEvent) => abiEvent.type === 'event').filter((abiEvent) => entityEvents.includes(abiEvent.name));
        return filteredEvents.map((event) => { return generatePonderOnHandler(contractName, event.name) }).filter((event) => event !== undefined);
    });
    createPonderEventFile(ponderEventHandlers, path.join(eventDir, "ponder.events.ts"));
}