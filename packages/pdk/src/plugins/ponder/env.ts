import path from 'path';
import { ContractProcessor } from '../../commands/dev/services/contract-processor'; //info here needs to be written to the context during compile
import { importPatchworkConfig } from '../../common/helpers/config';
import { getEnvFile, writeEnvFile } from '../../common/helpers/env';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { TaskLogger } from '../../common/helpers/logger';
import { envVarCase } from '../../common/helpers/text';
import LockFileManager from '../../services/lockFile';

export async function generatePonderEnv(rootDir: string, logger: TaskLogger) {
    const configPath = path.join(rootDir, 'patchwork.config.ts');
    const ponderEnvPath = path.join(rootDir, 'ponder', '.env.local');
    const projectConfig = await importPatchworkConfig(configPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at ${configPath}`);
    }

    const env = await getEnvFile(ponderEnvPath);
    Object.entries(projectConfig.networks).map(([networkName, network]) => {
        env[`${envVarCase(networkName)}_RPC`] = network.rpc;
    });

    const lockFileManager = new LockFileManager(configPath);
    const selectedNetwork = lockFileManager.getCurrentNetwork();

    const contractProcessor = new ContractProcessor();
    const bytecodeInfo = await contractProcessor.processContracts(configPath, {}, false);

    for (const contractName in projectConfig.contracts) {
        const deploymentInfo = lockFileManager.getLatestDeploymentForContract(contractName, selectedNetwork);
        if (!deploymentInfo) {
            if (bytecodeInfo[contractName]) {
                env[`${envVarCase(contractName)}_BLOCK`] = '1';
                env[`${envVarCase(contractName)}_ADDRESS`] = bytecodeInfo[contractName].deployedAddress;
            } else {
                logger.error(`No deployment found for ${contractName}`);
                throw new PDKError(ErrorCode.DEPLOYMENT_NOT_FOUND, `No deployment found for ${contractName}`);
            }
        } else {
            env[`${envVarCase(contractName)}_BLOCK`] = deploymentInfo.block.toString();
            env[`${envVarCase(contractName)}_ADDRESS`] = deploymentInfo.address;
        }
    }

    writeEnvFile(env, ponderEnvPath);
}
