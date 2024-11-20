import fs from 'fs/promises';
import path from 'path';
import { generateABIs } from '../generateABIs';
import { generateAPI } from '../generateApi';
import { generateEventHooks } from '../generateEventHooks';
import { generatePonderConfig } from '../generatePonderConfig';
import { generateReactHooks } from '../generateReactHooks';
import { generateSchema } from '../generateSchema';
import { logger } from '../helpers/logger';

export async function generateAll(configPath: string) {
    logger.info('Generating all components...');
    logger.info('Using config file:', configPath);

    // Generate TypeScript ABIs
    logger.info('Generating TypeScript ABIs...');
    await generateABIs(configPath);

    // Generate Ponder Schema
    logger.info('Generating Ponder schema...');
    await generateSchema(configPath);

    // Generate Event Hooks
    logger.info('Generating Ponder events...');
    await generateEventHooks(configPath);

    // Generate Ponder Config
    logger.info('Generating Ponder Config...');
    await generatePonderConfig(configPath);

    // Generate API
    logger.info('Generating API...');
    const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
    const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
    try {
        await fs.access(apiOutputDir);
    } catch (error) {
        logger.info(`API output directory does not exist. Creating ${apiOutputDir}`);
        await fs.mkdir(apiOutputDir, { recursive: true });
    }
    await generateAPI(schemaPath, apiOutputDir);

    // Generate React Hooks
    logger.info('Generating React hooks...');
    await generateReactHooks(configPath);

    // Generate React Components
    // console.log('Generating React Components...');
    // await generateReactComponents(configPath);

    // Generate Demo Page
    // console.log('Generating Demo Page...');
    // await generateDemoPage(configPath);

    logger.info('All components generated successfully!');
}
