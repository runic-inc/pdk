import path from 'path';
import { importPatchworkConfig } from '../../common/helpers/config';
import { getEnvFile, writeEnvFile } from '../../common/helpers/env';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { logger } from '../../common/helpers/logger';
import { envVarCase } from '../../common/helpers/text';
import LockFileManager from '../../services/lockFile';

export async function generateEnv(rootDir: string) {
    // Resolve the full path of the config file
    // const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    // const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const wwwExamplePath = path.join(rootDir, 'www', '.env.example');
    const wwwEnvPath = path.join(rootDir, 'www', '.env.local');
    const configPath = path.join(rootDir, 'patchwork.config.ts');

    const projectConfig = await importPatchworkConfig(configPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at  ${configPath}`);
    }

    const env = await getEnvFile(wwwEnvPath, true, wwwExamplePath);
    env['VITE_PUBLIC_PONDER_URL'] = 'http://localhost:42069';

    Object.entries(projectConfig.networks).map(([networkName, network]) => {
        env[`${envVarCase(networkName)}_RPC`] = network.rpc;
    });

    const lockFileManager = new LockFileManager(configPath);
    const selectedNetwork = lockFileManager.getCurrentNetwork();
    env['VITE_NETWORK'] = selectedNetwork;
    /*
    * superfluous for now, commenting out
    *
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
    */
    writeEnvFile(env, wwwEnvPath);
    logger.info(`WWW env generated successfully: ${wwwEnvPath}`);
}
