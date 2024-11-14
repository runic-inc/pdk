import { importPatchworkConfig } from '../../helpers/config';
import { logger } from '../../helpers/logger';
import LockFileManager from '../../localDev/lockFile';

export async function networkSwitch(configPath: string, networkName: string) {
    const patchworkConfig = await importPatchworkConfig(configPath);
    if (!patchworkConfig) {
        logger.error('Error loading Patchwork config');
        return;
    }

    const lockFileManager = new LockFileManager(configPath);

    if (patchworkConfig.networks && patchworkConfig.networks[networkName]) {
        lockFileManager.updateNetwork(networkName);
    } else {
        logger.error(`Network ${networkName} not found in Patchwork config`);
    }
}
