import { Deployment, Network } from '@patchworkdev/common';
import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../helpers/config';

export async function generatePonderConfig(configPath: string) {
    try {
        // Resolve the full path of the config file
        const fullConfigPath = path.isAbsolute(configPath) ? configPath : path.resolve(process.cwd(), configPath);
        const configDir = path.dirname(fullConfigPath);

        // Define paths relative to the config file
        const abiDir = path.join(configDir, 'ponder', 'abis');
        const ponderConfigPath = path.join(configDir, 'ponder', 'ponder.config.ts');

        // Check if the necessary directories exist
        try {
            await fs.access(abiDir);
        } catch (error) {
            console.error(`Error: Unable to access ABI directory: ${abiDir}`);
            console.error(`Make sure the ABI directory exists relative to the config file.`);
            return;
        }

        const abis = await importABIFiles(abiDir);
        if (Object.keys(abis).length === 0) {
            console.error(`Error: No ABI files found in ${abiDir}`);
            return;
        }

        const projectConfig = await importPatchworkConfig(fullConfigPath);
        if (!projectConfig) {
            console.error('Error importing ProjectConfig');
            return;
        }

        if (!projectConfig.networks) {
            console.error(`No networks found in the project config. Cannot build network configuration.`);
            return;
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
                    console.error(`No deployments or networks found. Cannot build contract config for ${contractName}`);
                    return '';
                }
                return contractTemplate(contractName, projectConfig.deployments, projectConfig.networks);
            })
            .filter(Boolean);

        const networks = Object.entries(projectConfig.networks).map(([networkName, network]) => {
            return networkTemplate(networkName, network);
        });

        const config = configTemplate(imports, networks.join(), contracts.join());

        await fs.writeFile(
            ponderConfigPath,
            await prettier.format(config, {
                parser: 'typescript',
                tabWidth: 4,
            }),
            'utf-8',
        );
        console.log(`Ponder config generated successfully: ${ponderConfigPath}`);
    } catch (error) {
        console.error('Error generating Ponder config:', error);
    }
}

function configTemplate(imports: Set<string>, networkConfig: string, contractConfig: string): string {
    return `
        import { createConfig, mergeAbis } from '@ponder/core';
        import { http } from 'viem';
        import { ${Array.from(imports).join(', ')} } from './abis/index';
            export default createConfig({
    database:{
        kind:"postgres",
        connectionString:"postgres://postgres:password@localhost:5432/ponder"
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
            chainId: ${network.chainId},
            transport: http("${network.rpc}"),
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
        console.log(`No deployment found for ${name}`);
        return undefined;
    }
    return `${networkName}: {
                    startBlock: ${deployment.contracts[name].block},
                    address: "${deployment.contracts[name].address}" as \`0x\${ string } \`,
                }`;
}
