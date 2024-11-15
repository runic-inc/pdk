import fs from 'fs/promises';
import path from 'path';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig, loadPonderSchema } from '../helpers/config';
import { ErrorCode, PDKError } from '../helpers/error';
import { createPonderEventFile, GeneratedHandlers, generateEntityEventHandlers } from './eventHooks';

export async function generateEventHooks(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const abiDir = path.join(configDir, 'ponder', 'abis');
    const eventDir = path.join(configDir, 'ponder', 'src', 'generated');
    const ponderSchemaPath = path.join(configDir, 'ponder', 'ponder.schema.ts');

    // Check if output directory exists
    try {
        await fs.access(eventDir);
    } catch (error) {
        console.error(`Error: Unable to access Event directory at ${eventDir}`);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Unable to access Event directory at ${eventDir}`);
    }

    const abis = await importABIFiles(abiDir);

    const projectConfig = await importPatchworkConfig(fullConfigPath);

    // begin process config
    // ToDo
    // Currently only getting entity events. need to get some patchwork protocol events too
    const fragmentRelationships = getFragmentRelationships(projectConfig);
    const entityEvents = ['Frozen', 'Locked', 'Transfer', 'Unlocked', 'Thawed'];

    const ponderSchema = await loadPonderSchema(ponderSchemaPath);
    const handlers: GeneratedHandlers = { imports: new Set(), handlers: [] };

    const entityHandlers = generateEntityEventHandlers(projectConfig, ponderSchema, abis);

    entityHandlers.imports.forEach((item) => handlers.imports.add(item));
    handlers.handlers.push(...entityHandlers.handlers);

    await createPonderEventFile(handlers, path.join(eventDir, 'events.ts'));
}
