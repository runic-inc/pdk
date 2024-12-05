import { existsSync } from 'fs';
import { resolve } from 'path';
import { PatchworkProject } from '../types';

/**
 * Dynamically loads the patchwork.config.ts file from the project root.
 * @param rootDir - The root directory of the project.
 * @returns The loaded configuration object.
 */
export async function loadPatchworkConfig(rootDir: string = process.cwd()): Promise<PatchworkProject> {
    const configPath = resolve(rootDir, 'patchwork.config.ts');

    if (!existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
    }

    try {
        // Dynamically import the TypeScript configuration file
        const config = await import(configPath);

        if (config.default) {
            return config.default;
        }

        throw new Error('Configuration file does not export a default object.');
    } catch (error) {
        throw new Error(`Failed to load configuration file at ${configPath}.`);
    }
}
