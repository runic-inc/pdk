import fs from 'fs/promises';
import path from 'path';
import { importPatchworkConfig } from '../../../common/helpers/config';
import { ErrorCode, PDKError } from '../../../common/helpers/error';
import { logger } from '../../../common/helpers/logger';
import { generateSchemaFile } from './schema';

export async function generateSchema(rootDir: string) {
    const configPath = path.join(rootDir, 'patchwork.config.ts');
    const abiDir = path.join(rootDir, 'ponder', 'abis');
    const ponderSchema = path.join(rootDir, 'ponder', 'ponder.schema.ts');

    logger.debug('Config directory:', rootDir);
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
        logger.info(`Ponder schema generated successfully at ${ponderSchema}`);
    } catch (error) {
        logger.error(`Failed to generate schema: ${error}`);
        throw error instanceof PDKError ? error : new PDKError(ErrorCode.UNKNOWN_ERROR, 'Failed to generate schema');
    }
}
