import { Deployment, Network } from '@patchworkdev/common';
import _ from 'lodash';
import path from 'path';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../helpers/config';
import { ErrorCode, PDKError } from '../helpers/error';
import { formatAndSaveFile } from '../helpers/file';
import { logger } from '../helpers/logger';

export async function generatePonderConfig(configPath: string) {
    // Resolve the full path of the config file
    const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
    const configDir = path.dirname(fullConfigPath);

    // Define paths relative to the config file
    const abiDir = path.join(configDir, 'ponder', 'abis');
    const ponderConfigPath = path.join(configDir, 'ponder', 'ponder.config.ts');

    const abis = await importABIFiles(abiDir);

    const projectConfig = await importPatchworkConfig(fullConfigPath);

    if (!projectConfig.networks) {
        logger.error(`No networks found in the project config. Cannot build network configuration.`);
        throw new PDKError(ErrorCode.PROJECT_CONFIG_MISSING_NETWORKS, `No networks found in the project config at  ${fullConfigPath}`);
    }

    const fragmentRelationships = getFragmentRelationships(projectConfig);

    const entityEvents = ['Frozen', 'Locked', 'Transfer', 'Unlocked', 'Thawed'];
    const imports: Set<string> = new Set();

    // ToDo
    // Need to add in the contract config for the Patchwork Protocol. Config needs to be added to the contracts array either before or after the entities
    const contracts = Object.entries(projectConfig.contracts)
        .map(([contractName, contractConfig]) => {
            imports.add(contractName);
            if (!projectConfig.deployments || !projectConfig.networks) {
                logger.error(`No deployments or networks found. Cannot build contract config for ${contractName}`);
                return '';
            }
            return contractTemplate(contractName, projectConfig.deployments, projectConfig.networks);
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
export function contractTemplate(name: string, deployments: Deployment<string>[], network: Record<string, Network>): string {
    return `${name}: {
            network: {
                ${Object.entries(network)
                    .map(([networkName, network]) => contractNetworkTemplate(name, networkName, deployments, network))
                    .filter((s) => s !== undefined)
                    .join(',')}
 
            },
            abi: mergeAbis([${name}]),
        }`;
}
function contractNetworkTemplate(name: string, networkName: string, deployments: Deployment<string>[], network: Network): string | undefined {
    const deployment = deployments.find((d) => d.network === networkName);
    if (!deployment) {
        logger.info(`No deployment found for ${name}`);
        return undefined;
    }
    return `${networkName}: {
                    startBlock: Number(process.env.${_.upperCase(name)}_BLOCK),
                    address: process.env.${_.upperCase(name)}_ADDRESS as Address,
                }`;
}
