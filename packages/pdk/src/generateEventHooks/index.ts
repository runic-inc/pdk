import fs from "fs/promises";
import path from "path";
import {
    getFragmentRelationships,
    importABIFiles,
    importPatchworkConfig,
    loadPonderSchema,
} from "../helpers/config";
import { createPonderEventFile, generatePonderOnHandler } from "./factories";

export async function generateEventHooks(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath)
        ? configPath
        : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const abiDir = path.join(configDir, "ponder", "abis");
    const eventDir = path.join(configDir, "ponder", "src");
    const ponderSchemaPath = path.join(configDir, "ponder", "ponder.schema.ts");

    // Check if the necessary directories and files exist
    try {
        await fs.access(abiDir);
        await fs.access(eventDir);
        await fs.access(ponderSchemaPath);
    } catch (error) {
        console.error(`Error: Unable to access required directories or files.`);
        console.error(`Make sure the following paths exist:`);
        console.error(`- ABI directory: ${abiDir}`);
        console.error(`- Event directory: ${eventDir}`);
        console.error(`- Ponder schema: ${ponderSchemaPath}`);
        return;
    }

    const abis = await importABIFiles(abiDir);
    if (Object.keys(abis).length === 0) {
        console.error(`Error: No ABI files found in ${abiDir}`);
        return;
    }

    const projectConfig = await importPatchworkConfig(fullConfigPath);
    if (!projectConfig) {
        console.error("Error importing ProjectConfig");
        return;
    }

    // begin process config
    // ToDo
    // Currently only getting entity events. need to get some patchwork protocol events too
    const fragmentRelationships = getFragmentRelationships(projectConfig);
    const entityEvents = ["Frozen", "Locked", "Transfer", "Unlocked", "Thawed"];

    const ponderSchema = await loadPonderSchema(ponderSchemaPath);
    if (ponderSchema === undefined) {
        console.error("Error importing PonderSchema");
        return;
    }

    const ponderEventHandlers = Object.entries(projectConfig.contracts).flatMap(
        ([contractName, contractConfig]) => {
            const filteredEvents = abis[contractName]
                .filter((abiEvent) => abiEvent.type === "event")
                .filter((abiEvent) => entityEvents.includes(abiEvent.name));
            return filteredEvents
                .map((event) =>
                    generatePonderOnHandler(
                        contractName,
                        event,
                        projectConfig,
                        ponderSchema,
                        abis
                    )
                )
                .filter((event) => event !== undefined);
        }
    );

    createPonderEventFile(
        ponderEventHandlers,
        path.join(eventDir, "ponder.events.ts")
    );
}
