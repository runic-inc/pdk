import fs from 'fs/promises';
import _ from 'lodash';
import path from 'path';
import { importPatchworkConfig } from '../helpers/config';
import LockFileManager from '../lockFile';

export async function generatePonderEnv(configPath: string) {
    try {
        // Resolve the full path of the config file
        const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
        const configDir = path.dirname(fullConfigPath);

        // Define paths relative to the config file
        const ponderEnvPath = path.join(configDir, 'ponder', '.env.local');

        const projectConfig = await importPatchworkConfig(fullConfigPath);
        if (!projectConfig) {
            console.error('Error importing ProjectConfig');
            return;
        }

        if (!projectConfig.networks) {
            console.error(`No networks found in the project config. Cannot build network configuration.`);
            return;
        }

        const output: string[] = [];

        Object.entries(projectConfig.networks).map(([networkName, network]) => {
            output.push(`${_.upperCase(networkName)}_RPC=${network.rpc}`);
        });

        const lockFileManager = new LockFileManager(configPath);
        const selectedNetwork = lockFileManager.getCurrentNetwork();
        for (const contractName in projectConfig.contracts) {
            const deploymentInfo = lockFileManager.getLatestDeploymentForContract(contractName, selectedNetwork);
            if (!deploymentInfo) {
                console.error(`No deployment found for ${contractName}`);
                return;
            }
            output.push(`${_.upperCase(contractName)}_BLOCK=${deploymentInfo.block}`);
            output.push(`${_.upperCase(contractName)}_ADDRESS=${deploymentInfo.address}`);
        }

        await fs.writeFile(ponderEnvPath, output.join('\n'), 'utf-8');
        console.log(`Ponder env generated successfully: ${ponderEnvPath}`);
    } catch (error) {
        console.error('Error generating Ponder env:', error);
    }
}
