import _ from 'lodash';
import path from 'path';
import { importPatchworkConfig } from '../helpers/config';
import { getEnvFile, writeEnvFile } from '../helpers/env';
import { ErrorCode, PDKError } from '../helpers/error';
import { logger } from '../helpers/logger';
import { processContracts } from '../localDev/deployment';
import LockFileManager from '../localDev/lockFile';

export async function generateWWWEnv(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const wwwExamplePath = path.join(configDir, 'www', '.env.example');
    const wwwEnvPath = path.join(configDir, 'www', '.env.local');

    const projectConfig = await importPatchworkConfig(fullConfigPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at  ${fullConfigPath}`);
    }

    const env = await getEnvFile(wwwEnvPath, true, wwwExamplePath);
    env['VITE_PUBLIC_PONDER_URL'] = 'http://localhost:42069';

    Object.entries(projectConfig.networks).map(([networkName, network]) => {
        env[`${_.upperCase(networkName)}_RPC`] = network.rpc;
    });

    const lockFileManager = new LockFileManager(configPath);
    const selectedNetwork = lockFileManager.getCurrentNetwork();
    env['VITE_NETWORK'] = selectedNetwork;
    const bytecodeInfo = await processContracts(configPath, {}, false);
    for (const contractName in projectConfig.contracts) {
        const deploymentInfo = lockFileManager.getLatestDeploymentForContract(contractName, selectedNetwork);
        if (!deploymentInfo) {
            if (bytecodeInfo[contractName]) {
                env[`${_.upperCase(contractName)}_BLOCK`] = '1';
                env[`${_.upperCase(contractName)}_ADDRESS`] = bytecodeInfo[contractName].deployedAddress;
            } else {
                logger.error(`No deployment found for ${contractName}`);
                throw new PDKError(ErrorCode.DEPLOYMENT_NOT_FOUND, `No deployment found for  ${contractName}`);
            }
        } else {
            env[`${_.upperCase(contractName)}_BLOCK`] = deploymentInfo.block.toString();
            env[`${_.upperCase(contractName)}_ADDRESS`] = deploymentInfo.address;
        }
    }

    writeEnvFile(env, wwwEnvPath);
    logger.info(`WWW env generated successfully: ${wwwEnvPath}`);
}
