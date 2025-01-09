import { cliProcessor } from '../../common/cliProcessor';
import { getForgePaths } from '../../common/helpers/getForgePaths';
import { PatchworkProject } from '../../types';
import { generateContractDeployScripts } from './contractDeployScripts';
import { generateContracts } from './contracts';

export async function generateCore(config: PatchworkProject) {
    //logger.info('Starting full generation process...');

    //logger.info('Getting forge configuration...');
    const { src, script, out } = await getForgePaths();

    //logger.info('Generating contracts...');
    await generateContracts(config, src);

    // Generate deploy scripts
    //logger.info('Generating deploy scripts...');
    await generateContractDeployScripts(config, '../src', script);

    // Build the contracts using cliProcessor
    //logger.info('Building contracts...');
    await cliProcessor.buildContracts(process.cwd());
}
