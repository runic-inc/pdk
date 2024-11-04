import fs from 'fs/promises';
import path from 'path';
import { importPatchworkConfig } from '../helpers/config';
import { ErrorCode, PDKError } from '../helpers/error';
import { generateSchemaFile } from './schema';

export async function generateSchema(configPath: string) {
    const configDir = path.dirname(configPath);
    const abiDir = path.join(configDir, 'ponder', 'abis');
    const ponderSchema = path.join(configDir, 'ponder', 'ponder.schema.ts');

    // Check if ABI directory exists
    try {
        await fs.access(abiDir);
    } catch (error) {
        console.error(`Error: Unable to access ABI directory at ${abiDir}`);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Unable to access ABI directory at ${abiDir}`);
    }

    const projectConfig = await importPatchworkConfig(configPath);

    await generateSchemaFile(projectConfig, ponderSchema);

    console.log(`Ponder schema generated successfully at ${ponderSchema}`);
}
