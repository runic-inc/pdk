import LockFileManager from '../common/helpers/lockFile';
import { ContractProcessor } from './services/contract-processor';
import { DeploymentManager } from './services/deployment-manager';
import { DockerService } from './services/docker';
import { EnvGenerator } from './services/env';
import { GeneratorService } from './services/generator';
import { DeployConfig, DeploymentAddresses } from './types';

async function initializeConfig(configPath: string, config: DeployConfig = {}): Promise<DeployConfig> {
    return {
        rpcUrl: config.rpcUrl || 'http://localhost:8545',
        privateKey: config.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        owner: config.owner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        patchworkProtocol: config.patchworkProtocol || '0x00000000001616E65bb9FdA42dFBb7155406549b',
    };
}

async function deployIfNeeded(
    deploymentManager: DeploymentManager,
    contractProcessor: ContractProcessor,
    configPath: string,
    deployConfig: DeployConfig,
    network: string,
): Promise<DeploymentAddresses> {
    const bytecodeInfo = await contractProcessor.processContracts(configPath, deployConfig, false);
    const comparison = await deploymentManager.compareWithPreviousDeployment(network, bytecodeInfo);

    if (comparison.changes.length > 0) {
        deploymentManager.logBytecodeChanges(comparison, network);
    }

    if (comparison.needsDeployment) {
        if (!deployConfig.rpcUrl) {
            throw new Error('RPC URL is required for deployment');
        }
        console.info(`Deploying contracts to ${network}...`);
        const deployedContracts = await contractProcessor.processContracts(configPath, deployConfig, true);
        await deploymentManager.logDeployments(deployedContracts, network, deployConfig.rpcUrl);
        return deployedContracts;
    }
    return deploymentManager.getExistingDeployments(bytecodeInfo, network);
}

export async function localDevUp(configPath: string, config: DeployConfig = {}): Promise<DeploymentAddresses> {
    console.info('Running local development environment...');

    const deployConfig = await initializeConfig(configPath, config);
    const lockFileManager = new LockFileManager(configPath);
    const dockerService = new DockerService(configPath);
    const deploymentManager = new DeploymentManager(lockFileManager);
    const contractProcessor = new ContractProcessor();
    const envGenerator = new EnvGenerator(configPath);
    const generatorService = new GeneratorService(configPath, lockFileManager);

    await dockerService.startServices();
    await generatorService.processGenerators();

    const network = lockFileManager.getCurrentNetwork();
    const deployedContracts = await deployIfNeeded(deploymentManager, contractProcessor, configPath, deployConfig, network);

    await envGenerator.generateEnvironments();
    await dockerService.restartPonderContainer();
    const status = await dockerService.getContainerStatus();
    console.table(status);

    return deployedContracts;
}
