import fs from 'fs/promises';
import path from 'path';
import { importPatchworkConfig } from '../helpers/config';
import { generateSchemaFile } from './schema';

export async function generateSchema(configPath: string) {
    try {
        const configDir = path.dirname(configPath);
        const abiDir = path.join(configDir, 'ponder', 'abis');
        const ponderSchema = path.join(configDir, 'ponder', 'ponder.schema.ts');

        // Check if ABI directory exists
        try {
            await fs.access(abiDir);
        } catch (error) {
            console.error(`Error: Unable to access ABI directory at ${abiDir}`);
            return;
        }

        const projectConfig = await importPatchworkConfig(configPath);
        if (!projectConfig) {
            console.error('Error importing ProjectConfig');
            return;
        }

        generateSchemaFile(projectConfig, ponderSchema);

        console.log(`Ponder schema generated successfully at ${ponderSchema}`);
    } catch (error) {
        console.error('Error generating Ponder schema:', error);
    }
}
