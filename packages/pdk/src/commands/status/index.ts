import { importPatchworkConfig } from '../../common/helpers/config';
import { dockerProjectName, pascalCase } from '../../common/helpers/text';
import LockFileManager from '../../services/lockFile';
import { TableData } from '../../types';
import { DockerService } from '../dev/services/docker';

export async function status(configPath: string) {
    const patchworkConfig = await importPatchworkConfig(configPath);
    if (!patchworkConfig) {
        console.error('Error loading Patchwork config');
        return;
    }
    const lockFileManager = new LockFileManager(configPath);
    const dockerService = new DockerService(configPath);

    const networks: TableData = {};
    for (const [networkName, network] of Object.entries(patchworkConfig.networks ?? [])) {
        networks[networkName] = {
            name: network.chain.name,
            id: network.chain.id,
            rpc: network.rpc,
        };
    }

    const deployments: TableData = {};
    for (const [contractName, contract] of Object.entries(patchworkConfig.contracts ?? {})) {
        if (typeof contract !== 'string') {
            for (const [networkKey, network] of Object.entries(patchworkConfig.networks ?? [])) {
                const deployment = lockFileManager.getLatestDeploymentForContract(pascalCase(contract.name), networkKey);
                if (!deployments[networkKey]) {
                    deployments[networkKey] = {};
                }
                if (deployment) {
                    deployments[networkKey][contractName] = deployment.address;
                } else {
                    deployments[networkKey][contractName] = '-';
                }
            }
        }
    }

    const containers = await dockerService.getContainerStatus(dockerProjectName(patchworkConfig.name));

    const containerTable: TableData = {};
    containers.map((container) => {
        containerTable[container.id] = {
            name: container.name,
            privatePort: container.privatePort,
            publicPort: container.publicPort,
        };
    });

    console.log('***************networks****************');
    console.table(networks);
    console.log('***************deployments****************');
    console.table(deployments);
    console.log('***************containers****************');
    console.table(containerTable);
}
