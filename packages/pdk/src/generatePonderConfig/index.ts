import { Deployment, Network } from '@patchworkdev/common';
import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { getFragmentRelationships, importABIFiles, importPatchworkConfig } from '../helpers/config';

// config
// networks needs to be any network that we have deployed to
// contracts needs to be
//      any entities
//      patchwork
// questions
//      how do we handle test and mainnets. do we put all the networks in the
//      config or do we populate things via env vars like patchwork explorer
//      alternatively do we have an env var that switches between test and mainnets


export async function generatePonderConfig(configPath: string) {

    const abiDir = path.join(path.dirname(configPath), "", "abis");
    const abis = await importABIFiles(abiDir);
    const ponderConfig = path.join(path.dirname(configPath), "ponder.config.ts");

    // const abis = await importABIFiles(abiDir);
    const projectConfig = await importPatchworkConfig(configPath);
    if (!projectConfig) {
        console.error('Error importing ProjectConfig');
        return;
    }

    if (projectConfig.networks === undefined) {
        console.log(`No networks found so can't build network config`);
        return
    }

    const fragmentRelationships = getFragmentRelationships(projectConfig);

    const entityEvents = ["Frozen", "Locked", "Transfer", "Unlocked", "Thawed"];
    const imports: Set<string> = new Set();


    // ToDo
    // Need to add in the contract config for the Patchwork Protocol. Config needs to be added to the contracts array either before or after the entities
    const contracts = Object.entries(projectConfig.contracts).map(([contractName, contractConfig]) => {
        imports.add(contractName);
        if (projectConfig.deployments === undefined || projectConfig.networks === undefined) {
            console.log(`No deployments or networks found so can't build contract config for ${contractName}`);
            return "";
        }
        return contractTemplate(contractName, projectConfig.deployments, projectConfig.networks);
    });

    const networks = Object.entries(projectConfig.networks).map(([networkName, network]) => {
        return networkTemplate(networkName, network);
    });

    const config = configTemplate(imports, networks.join(), contracts.join());

    await fs.writeFile(ponderConfig, await prettier.format(config, { parser: "typescript", tabWidth: 4 }), 'utf-8');
}

function configTemplate(imports: Set<string>, networkConfig: string, contractConfig: string): string {
    return `
        import { createConfig, mergeAbis } from '@ponder/core';
        import { http } from 'viem';
        import { ${Array.from(imports).join(', ')} } from './abis/index';
            export default createConfig({
    networks: {
        ${networkConfig}
        },
    contracts: {
        ${contractConfig}
    },       
    });
        
        `
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
                ${Object.entries(network).map(([networkName, network]) => contractNetworkTemplate(name, networkName, deployments, network)).filter(s => s !== undefined).join(",")}
 
            },
            abi: mergeAbis([${name}]),
        }`
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
                }`
}
