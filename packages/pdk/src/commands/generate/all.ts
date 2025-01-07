import path from 'path';
import { cliProcessor } from '../../common/cliProcessor';
import { logger } from '../../common/helpers/logger';
import { PatchworkProject } from '../../types';
import { generateContractDeployScripts } from './contractDeployScripts';
import { generateContracts } from './contracts';

export async function generateAll(config: PatchworkProject) {
    logger.info('Starting full generation process...');

    logger.info('Getting forge configuration...');
    const { execa } = await import('execa');
    const forgeConfig = JSON.parse((await execa('forge', ['config', '--json'])).stdout);
    const srcDir = forgeConfig.src || path.join(process.cwd(), 'contracts', 'src');
    const scriptDir = path.join(process.cwd(), 'contracts', 'script');

    //logger.info('Generating contracts...');
    await generateContracts(config, srcDir);

    // Generate deploy scripts
    //logger.info('Generating deploy scripts...');
    await generateContractDeployScripts(config, '../src', scriptDir);

    // Build the contracts using cliProcessor
    //logger.info('Building contracts...');
    await cliProcessor.buildContracts(process.cwd());
}
