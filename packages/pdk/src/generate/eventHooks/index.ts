import fs from 'fs/promises';
import path from 'path';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig, loadPonderSchema } from '../../common/helpers/config';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { logger } from '../../common/helpers/logger';
import { createPonderEventFile, GeneratedHandlers, generateEntityEventHandlers } from './eventHooks';

export async function generateEventHooks(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const abiDir = path.join(configDir, 'ponder', 'abis');
    const eventDir = path.join(configDir, 'ponder', 'src', 'generated');
    const ponderSchemaPath = path.join(configDir, 'ponder', 'ponder.schema.ts');

    logger.debug('Config path:', fullConfigPath);
    logger.debug('ABI directory:', abiDir);
    logger.debug('Event directory:', eventDir);
    logger.debug('Ponder schema path:', ponderSchemaPath);

    // Check if output directory exists
    try {
        await fs.access(eventDir);
        logger.debug('Event directory accessible');
    } catch (error) {
        logger.error(`Unable to access Event directory at ${eventDir}`);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Unable to access Event directory at ${eventDir}`);
    }

    try {
        // Import required files
        const abis = await importABIFiles(abiDir);
        const projectConfig = await importPatchworkConfig(fullConfigPath);
        logger.debug('Project config loaded');

        // Process configuration
        const fragmentRelationships = getFragmentRelationships(projectConfig);
        logger.debug(`Found ${Object.keys(fragmentRelationships).length} fragment relationships`);

        const entityEvents = ['Frozen', 'Locked', 'Transfer', 'Unlocked', 'Thawed'];
        const ponderSchema = await loadPonderSchema(ponderSchemaPath);

        // Generate handlers
        const handlers: GeneratedHandlers = { imports: new Set(), handlers: [] };

        const entityHandlers = generateEntityEventHandlers(projectConfig, ponderSchema, abis);
        entityHandlers.imports.forEach((item) => handlers.imports.add(item));
        handlers.handlers.push(...entityHandlers.handlers);
        logger.debug(`Generated ${handlers.handlers.length} event handlers`);

        // Create output file
        const outputPath = path.join(eventDir, 'events.ts');
        logger.debug('Creating event file:', outputPath);
        await createPonderEventFile(handlers, outputPath);

        logger.info(`Event hooks generated successfully at ${outputPath}`);
    } catch (error) {
        logger.error('Failed to generate event hooks:', error);
        throw error instanceof PDKError ? error : new PDKError(ErrorCode.UNKNOWN_ERROR, 'Failed to generate event hooks', { error });
    }
}
