import fs from 'fs/promises';
import path from 'path';
import { ErrorCode, PDKError } from '../common/helpers/error';
import { logger } from '../common/helpers/logger';

async function getAbiJsonFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                logger.debug('Scanning directory:', filePath);
                const subFiles = await getAbiJsonFiles(filePath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith('.abi.json')) {
                logger.debug('Found ABI file:', entry.name);
                files.push(filePath);
            }
        }
        return files;
    } catch (error) {
        logger.error(`Error scanning directory ${directory}:`, error);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Failed to scan directory ${directory}`);
    }
}

export async function generateABIs(configPath: string) {
    const buildOutDir = path.join(path.dirname(configPath), 'contracts', 'out');
    const abiDir = path.join(path.dirname(configPath), 'ponder', 'abis');

    logger.debug('Build output directory:', buildOutDir);
    logger.debug('ABI output directory:', abiDir);

    try {
        // Ensure ABI directory exists
        await fs.mkdir(abiDir, { recursive: true });

        // Get all ABI JSON files
        const files = await getAbiJsonFiles(buildOutDir);
        logger.debug('Found ABI files:', files.length);

        // Clean existing ABI directory
        const outFiles = await fs.readdir(abiDir);
        logger.debug('Cleaning existing ABI files:', outFiles.length);

        for (const file of outFiles) {
            const filePath = path.join(abiDir, file);
            await fs.unlink(filePath);
            logger.debug('Removed file:', file);
        }

        // Generate new ABI files
        let indexContent = '';
        for (const file of files) {
            const baseName = path.basename(file, '.abi.json');

            try {
                // Read the content of the .abi.json file
                const fileContent = await fs.readFile(file, { encoding: 'utf8' });

                // Generate the content for the .abi.ts file
                const tsContent = `export const ${baseName} = ${fileContent} as const;\n`;
                indexContent += `export * from './${baseName}.abi';\n`;

                // Write the .abi.ts file
                const outputPath = path.join(abiDir, `${baseName}.abi.ts`);
                await fs.writeFile(outputPath, tsContent);
                logger.debug(`Generated: ${baseName}.abi.ts`);
            } catch (error) {
                logger.error(`Failed to process ABI file ${baseName}:`, error);
                throw new PDKError(ErrorCode.PDK_ERROR, `Failed to process ABI file ${baseName}`);
            }
        }

        // Write the index file
        await fs.writeFile(path.join(abiDir, 'index.ts'), indexContent);
        logger.info('Successfully generated all TypeScript ABIs');
    } catch (error) {
        logger.error('Failed to generate TypeScript ABIs:', error);
        throw error instanceof PDKError ? error : new PDKError(ErrorCode.UNKNOWN_ERROR, 'Failed to generate TypeScript ABIs');
    }
}
