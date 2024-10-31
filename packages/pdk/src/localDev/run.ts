import path from 'path';
import { Address } from 'viem';
import { DeployConfig, deployContracts, DeploymentAddresses } from '../deployment';
import LockFileManager from '../lockFile';

export async function localDevRun(configPath: string, config: DeployConfig = {}): Promise<DeploymentAddresses> {
    console.log('Running local development environment...');
    const targetDir = path.dirname(configPath);
    const contractsDir = path.join(targetDir, 'contracts');
    const scriptDir = path.join(contractsDir, 'script');
    const deployConfig = {
        rpcUrl: config.rpcUrl || 'http://localhost:8545',
        privateKey: config.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        owner: config.owner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        patchworkProtocol: config.patchworkProtocol || '0x00000000001616E65bb9FdA42dFBb7155406549b',
    };
    try {
        const { execa } = await import('execa');
        // Start Docker services
        console.log('Starting Docker services...');
        await execa('docker', ['compose', 'up', '-d'], {
            cwd: targetDir,
        });
        const deployedContracts = await deployContracts(deployConfig, scriptDir);
        const lockFileManager = new LockFileManager(configPath);

        for (const contractName in deployedContracts) {
            const deploymentInfo = deployedContracts[contractName];
            lockFileManager.logDeployment(
                contractName,
                deploymentInfo.bytecodeHash,
                deploymentInfo.deployedAddress as Address,
                'local',
                new Date().toISOString(),
                1,
            );
        }
        return deployedContracts;
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}
