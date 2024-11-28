import { importPatchworkConfig } from '../helpers/config';

export async function networkList(configPath: string) {
    const patchworkConfig = await importPatchworkConfig(configPath);
    if (!patchworkConfig) {
        console.error('Error loading Patchwork config');
        return;
    }
    for (const networkName in patchworkConfig.networks) {
        console.log(networkName + ':', patchworkConfig.networks[networkName as keyof typeof patchworkConfig.networks]);
    }
}
