import { cliProcessor } from '../common/cliProcessor';
import { logger } from '../common/helpers/logger';
import { generateContractDeployScripts, generateContracts, generateServices } from './';

export async function generateAll(configPath: string) {
    logger.info('Starting full generation process...');

    // First generate the contracts
    logger.info('Generating contracts...');
    await generateContracts([configPath], process.cwd());

    // Generate deploy scripts
    logger.info('Generating deploy scripts...');
    await generateContractDeployScripts([configPath], undefined, process.cwd());

    // Build the contracts using cliProcessor
    logger.info('Building contracts...');
    await cliProcessor.buildContracts(process.cwd());

    // Generate all services
    logger.info('Generating services...');
    await generateServices(configPath);

    logger.info('All components generated successfully!');
}
