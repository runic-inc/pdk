import path from 'path';
import { importPatchworkConfig } from '../common/helpers/config';
import { getEnvFile, writeEnvFile } from '../common/helpers/env';
import { ErrorCode, PDKError } from '../common/helpers/error';
import { logger } from '../common/helpers/logger';
import { envVarCase } from '../common/helpers/text';
import { processContracts } from '../localDev/deployment';
import LockFileManager from '../localDev/lockFile';

export async function generatePonderEnv(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const ponderEnvPath = path.join(configDir, 'ponder', '.env.local');

    const projectConfig = await importPatchworkConfig(fullConfigPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at  ${fullConfigPath}`);
    }

    const env = await getEnvFile(ponderEnvPath);

    Object.entries(projectConfig.networks).map(([networkName, network]) => {
        env[`${envVarCase(networkName)}_RPC`] = network.rpc;
    });

    const lockFileManager = new LockFileManager(configPath);
    const selectedNetwork = lockFileManager.getCurrentNetwork();
    const bytecodeInfo = await processContracts(configPath, {}, false);
    for (const contractName in projectConfig.contracts) {
        const deploymentInfo = lockFileManager.getLatestDeploymentForContract(contractName, selectedNetwork);
        if (!deploymentInfo) {
            if (bytecodeInfo[contractName]) {
                env[`${envVarCase(contractName)}_BLOCK`] = '1';
                env[`${envVarCase(contractName)}_ADDRESS`] = bytecodeInfo[contractName].deployedAddress;
            } else {
                logger.error(`No deployment found for ${contractName}`);
                throw new PDKError(ErrorCode.DEPLOYMENT_NOT_FOUND, `No deployment found for  ${contractName}`);
            }
        } else {
            env[`${envVarCase(contractName)}_BLOCK`] = deploymentInfo.block.toString();
            env[`${envVarCase(contractName)}_ADDRESS`] = deploymentInfo.address;
        }
    }

    writeEnvFile(env, ponderEnvPath);
    logger.info(`Ponder env generated successfully: ${ponderEnvPath}`);
}
