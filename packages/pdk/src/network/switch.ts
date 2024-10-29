import { importPatchworkConfig } from '../helpers/config';
import LockFileManager from '../lockFile';

export async function networkSwitch(configPath: string, networkName: string) {
    const patchworkConfig = await importPatchworkConfig(configPath);
    if (!patchworkConfig) {
        console.error('Error loading Patchwork config');
        return;
    }

    const lockFileManager = new LockFileManager(configPath);

    if (patchworkConfig.networks && patchworkConfig.networks[networkName]) {
        lockFileManager.updateNetwork(networkName);
    } else {
        console.error(`Network ${networkName} not found in Patchwork config`);
    }
}
