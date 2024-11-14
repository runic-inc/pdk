import { importPatchworkConfig } from '../../helpers/config';
import { logger } from '../../helpers/logger';

export async function networkList(configPath: string) {
    const patchworkConfig = await importPatchworkConfig(configPath);
    if (!patchworkConfig) {
        logger.error('Error loading Patchwork config');
        return;
    }
    for (const networkName in patchworkConfig.networks) {
        logger.info(networkName + ':', patchworkConfig.networks[networkName]);
    }
}
