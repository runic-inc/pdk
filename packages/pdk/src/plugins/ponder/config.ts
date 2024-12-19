import { Network } from '@patchworkdev/common';
import _ from 'lodash';
import path from 'path';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../../common/helpers/config';
import { ErrorCode, PDKError } from '../../common/helpers/error';
import { formatAndSaveFile } from '../../common/helpers/file';
import { logger } from '../../common/helpers/logger';
import { envVarCase } from '../../common/helpers/text';
import LockFileManager from '../../services/lockFile';

export async function generateConfig(rootDir: string) {
    // Define paths relative to the root dir
    const configPath = path.join(rootDir, 'patchwork.config.ts');
    const abiDir = path.join(rootDir, 'ponder', 'abis');
    const ponderConfigPath = path.join(rootDir, 'ponder', 'ponder.config.ts');

    const abis = await importABIFiles(abiDir);

    const projectConfig = await importPatchworkConfig(configPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at  ${configPath}`);
    }

    const lockFileManager = new LockFileManager(configPath);
    const fragmentRelationships = getFragmentRelationships(projectConfig);

    const entityEvents = ['Frozen', 'Locked', 'Transfer', 'Unlocked', 'Thawed'];
    const imports: Set<string> = new Set();

    // ToDo
    // Need to add in the contract config for the Patchwork Protocol. Config needs to be added to the contracts array either before or after the entities
    const contracts = Object.entries(projectConfig.contracts)
        .map(([contractName, contractConfig]) => {
            imports.add(contractName);
            if (!projectConfig.networks) {
                logger.warn(`No networks found. Cannot build contract config for ${contractName}`);
                return '';
            }
            return contractTemplate(lockFileManager, contractName, projectConfig.networks);
        })
        .filter(Boolean);

    const networks = Object.entries(projectConfig.networks).map(([networkName, network]) => {
        return networkTemplate(networkName, network);
    });

    const config = configTemplate(imports, networks.join(), contracts.join());

    await formatAndSaveFile(ponderConfigPath, config);
    logger.info(`Ponder config generated successfully: ${ponderConfigPath}`);
}

function configTemplate(imports: Set<string>, networkConfig: string, contractConfig: string): string {
    return `
        import { createConfig, mergeAbis } from '@ponder/core';
        import { Address, http } from 'viem';
        import { ${Array.from(imports).join(', ')} } from './abis/index';
            export default createConfig({
    database:{
        kind:"postgres",
        connectionString:"postgres://postgres:password@postgres:5432/ponder"
    },
    networks: {
        ${networkConfig}
        },
    contracts: {
        ${contractConfig}
    },       
    });
        
        `;
}

// ToDo
// currently we don't allow for setting values as process.env.SOMETHING
// need to work out a way to do this as some runtime config for deployments
//      should not be committed or be known ahead of time
export function networkTemplate(name: string, network: Network): string {
    return ` ${name}: {
            chainId: ${network.chain.id},
            transport: http(process.env.${_.upperCase(name)}_RPC),
        }`;
}
export function contractTemplate(lockFileManager: LockFileManager, name: string, network: Record<string, Network>): string {
    return `${name}: {
            network: {
                ${Object.entries(network)
                    .map(([networkName, network]) => contractNetworkTemplate(lockFileManager, name, networkName, network))
                    .filter((s) => s !== undefined)
                    .join(',')}
 
            },
            abi: mergeAbis([${name}]),
        }`;
}
function contractNetworkTemplate(lockFileManager: LockFileManager, name: string, networkName: string, network: Network): string | undefined {
    const deployment = lockFileManager.getLatestDeploymentForContract(name, networkName);
    if (!deployment) {
        logger.info(`No deployment found for ${name} on ${networkName} network`);
        return undefined;
    }
    return `${networkName}: {
                    startBlock: Number(process.env.${envVarCase(name)}_BLOCK),
                    address: process.env.${envVarCase(name)}_ADDRESS as Address,
                }`;
}
