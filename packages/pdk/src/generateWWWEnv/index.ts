import fs from 'fs/promises';
import _ from 'lodash';
import path from 'path';
import { importPatchworkConfig } from '../helpers/config';
import { ErrorCode, PDKError } from '../helpers/error';
import { logger } from '../helpers/logger';
import LockFileManager from '../localDev/lockFile';

export async function generateWWWEnv(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const wwwEnvPath = path.join(configDir, 'www', '.env.local');

    const projectConfig = await importPatchworkConfig(fullConfigPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at  ${fullConfigPath}`);
    }

    const output: string[] = ['API_URL=http://localhost:42069'];

    Object.entries(projectConfig.networks).map(([networkName, network]) => {
        output.push(`${_.upperCase(networkName)}_RPC=${network.rpc}`);
    });

    const lockFileManager = new LockFileManager(configPath);
    const selectedNetwork = lockFileManager.getCurrentNetwork();
    for (const contractName in projectConfig.contracts) {
        const deploymentInfo = lockFileManager.getLatestDeploymentForContract(contractName, selectedNetwork);
        if (!deploymentInfo) {
            logger.error(`No deployment found for ${contractName}`);
            throw new PDKError(ErrorCode.DEPLOYMENT_NOT_FOUND, `No deployment found for  ${contractName}`);
        }
        output.push(`${_.upperCase(contractName)}_BLOCK=${deploymentInfo.block}`);
        output.push(`${_.upperCase(contractName)}_ADDRESS=${deploymentInfo.address}`);
    }

    try {
        await fs.writeFile(wwwEnvPath, output.join('\n'), 'utf-8');
    } catch (error) {
        throw new PDKError(ErrorCode.FILE_SAVE_ERROR, `Error saving env file ${wwwEnvPath}`);
    }
    logger.info(`WWW env generated successfully: ${wwwEnvPath}`);
}
