import fs from 'fs/promises';
import path from 'path';
import { importPatchworkConfig } from '../helpers/config';
import { ErrorCode, PDKError } from '../helpers/error';
import { logger } from '../helpers/logger';
import { generateSchemaFile } from './schema';

export async function generateSchema(configPath: string) {
    const configDir = path.dirname(configPath);
    const abiDir = path.join(configDir, 'ponder', 'abis');
    const ponderSchema = path.join(configDir, 'ponder', 'ponder.schema.ts');

    logger.info('Generating Ponder schema...');
    logger.debug('Config directory:', configDir);
    logger.debug('ABI directory:', abiDir);
    logger.debug('Schema output path:', ponderSchema);

    // Check if ABI directory exists
    try {
        await fs.access(abiDir);
        logger.debug('ABI directory accessible');
    } catch (error) {
        logger.error(`Unable to access ABI directory at ${abiDir}`);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Unable to access ABI directory at ${abiDir}`);
    }

    try {
        const projectConfig = await importPatchworkConfig(configPath);
        logger.debug('Project config loaded successfully');

        await generateSchemaFile(projectConfig, ponderSchema);
        logger.success(`Ponder schema generated successfully at ${ponderSchema}`);
    } catch (error) {
        logger.error('Failed to generate schema:', error);
        throw error instanceof PDKError ? error : new PDKError(ErrorCode.UNKNOWN_ERROR, 'Failed to generate schema');
    }
}
