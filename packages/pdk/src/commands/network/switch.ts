import { importPatchworkConfig } from '../../common/helpers/config';
import LockFileManager from '../../services/lockFile';

export async function networkSwitch(configPath: string, networkName: string) {
    const patchworkConfig = await importPatchworkConfig(configPath);
    if (!patchworkConfig) {
        console.error('Error loading Patchwork config');
        return;
    }

    const lockFileManager = new LockFileManager(configPath);

    if (patchworkConfig.networks && patchworkConfig.networks[networkName as keyof typeof patchworkConfig.networks]) {
        lockFileManager.updateNetwork(networkName);
    } else {
        console.error(`Network ${networkName} not found in Patchwork config`);
    }
}
