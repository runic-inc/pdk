import fs from 'fs/promises';
import path from 'path';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { logger } from '../../common/helpers/logger';

async function getSchemaJsonFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                logger.debug('Scanning directory:', filePath);
                const subFiles = await getSchemaJsonFiles(filePath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith('-schema.json')) {
                logger.debug('Found contract schema file:', entry.name);
                files.push(filePath);
            }
        }
        return files;
    } catch (error) {
        logger.error(`Error scanning directory ${directory}:`, error);
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Failed to scan directory ${directory}`);
    }
}

export async function generateTypescriptSchemas(configPath: string) {
    const buildOutDir = path.join(path.dirname(configPath), 'contracts', 'src');
    const srcDir = path.join(path.dirname(configPath), 'ponder', 'schemas');

    logger.debug('Build output directory:', buildOutDir);
    logger.debug('Schema output directory:', srcDir);

    try {
        // Ensure ABI directory exists
        await fs.mkdir(srcDir, { recursive: true });

        // Get all ABI JSON files
        const files = await getSchemaJsonFiles(buildOutDir);
        logger.debug('Found schema files:', files.length);

        // Clean existing ABI directory
        const outFiles = await fs.readdir(srcDir);
        logger.debug('Cleaning existing schema files:', outFiles.length);

        for (const file of outFiles) {
            if (file === 'README') continue;
            const filePath = path.join(srcDir, file);
            await fs.unlink(filePath);
            logger.debug('Removed file:', file);
        }

        const indexList: string[] = [];

        // Generate new schema files
        for (const file of files) {
            const baseName = path.basename(file, '.json').replace('-schema', '');

            try {
                // Read the content of the .abi.json file
                const fileContent = await fs.readFile(file, { encoding: 'utf8' });

                // Generate the content for the .abi.ts file
                let tsContent = `import { ContractJSONSchema } from '@patchworkdev/pdk/utils';\n\n`;
                tsContent += `export const ${baseName}Schema = ${fileContent.trim()} as const satisfies ContractJSONSchema;\n`;

                indexList.push(baseName);

                // Write the .abi.ts file
                const outputPath = path.join(srcDir, `${baseName}.schema.ts`);
                await fs.writeFile(outputPath, tsContent);
                logger.debug(`Generated: ${baseName}.ts`);
            } catch (error) {
                logger.error(`Failed to process schema file ${baseName}:`, error);
                throw new PDKError(ErrorCode.PDK_ERROR, `Failed to process schema file ${baseName}`);
            }
        }
        let indexContent = indexList.map((c) => `import { ${c}Schema } from './${c}.schema';\n`).join('');
        indexContent += `export const ContractSchemas = {\n`;
        indexList.forEach((c) => (indexContent += `\t${c}: ${c}Schema,\n`));
        indexContent += `};\n`;
        indexContent += `export type ContractSchemasMap = typeof ContractSchemas;\n`;

        // Write the index file
        await fs.writeFile(path.join(srcDir, 'index.ts'), indexContent);
        logger.info('Successfully generated all TypeScript schemas');
    } catch (error) {
        logger.error('Failed to generate TypeScript schemas:', error);
        throw error instanceof PDKError ? error : new PDKError(ErrorCode.UNKNOWN_ERROR, 'Failed to generate TypeScript schemas');
    }
}
