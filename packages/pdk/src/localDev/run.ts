import path from 'path';
import { Address } from 'viem';
import { generatePonderEnv } from '../generatePonderEnv';
import { generateWWWEnv } from '../generateWWWEnv';
import { calculateBytecode } from './bytecode';
import { DeployConfig, deployContracts, DeploymentAddresses } from './deployment';
import LockFileManager from './lockFile';

interface BytecodeComparison {
    needsDeployment: boolean;
    changes: Array<{
        contract: string;
        oldHash?: string;
        newHash: string;
    }>;
}

async function compareWithPreviousDeployment(lockFileManager: LockFileManager, network: string, newBytecode: DeploymentAddresses): Promise<BytecodeComparison> {
    const changes: Array<{ contract: string; oldHash?: string; newHash: string }> = [];
    let needsDeployment = false;

    // Always deploy on local network
    if (network === 'local') {
        needsDeployment = true;
        Object.entries(newBytecode).forEach(([contract, info]) => {
            changes.push({
                contract,
                newHash: info.bytecodeHash,
            });
        });
        return { needsDeployment, changes };
    }

    // Compare each contract's bytecode with its last deployment
    for (const [contract, info] of Object.entries(newBytecode)) {
        const lastDeployment = lockFileManager.getLatestDeploymentForContract(contract, network);
        const oldHash = lastDeployment?.hash;

        if (!lastDeployment || oldHash !== info.bytecodeHash) {
            needsDeployment = true;
            changes.push({
                contract,
                oldHash,
                newHash: info.bytecodeHash,
            });
        }
    }

    return { needsDeployment, changes };
}

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
        // Start Docker services first
        console.log('Starting Docker services...');
        await execa('docker', ['compose', 'up', '-d'], {
            cwd: targetDir,
        });

        // Wait a moment for services to be ready
        console.log('Waiting for services to be ready...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Calculate bytecode after Docker is running
        const bytecodeInfo = await calculateBytecode(configPath, deployConfig);

        // Initialize lock file manager
        const lockFileManager = new LockFileManager(configPath);
        const network = lockFileManager.getCurrentNetwork();

        // Compare bytecode with previous deployment
        const comparison = await compareWithPreviousDeployment(lockFileManager, network, bytecodeInfo);

        // Log changes if any were found
        if (comparison.changes.length > 0) {
            console.log('\nBytecode Changes Detected:');
            console.log('═══════════════════════════════════════════════════════════');
            comparison.changes.forEach((change) => {
                if (network === 'local') {
                    console.log(`${change.contract}: Local network - will redeploy`);
                } else if (!change.oldHash) {
                    console.log(`${change.contract}: New contract - needs deployment`);
                } else {
                    console.log(`${change.contract}: Bytecode changed`);
                    console.log(`  Previous: ${change.oldHash}`);
                    console.log(`  Current:  ${change.newHash}`);
                }
            });
            console.log('═══════════════════════════════════════════════════════════\n');
        }

        let deployedContracts: DeploymentAddresses;

        if (comparison.needsDeployment) {
            console.log(`Deploying contracts to ${network}...`);
            deployedContracts = await deployContracts(deployConfig, scriptDir);

            // Update lock file with new deployments
            for (const contractName in deployedContracts) {
                const deploymentInfo = deployedContracts[contractName];
                lockFileManager.logDeployment(
                    contractName,
                    deploymentInfo.bytecodeHash,
                    deploymentInfo.deployedAddress as Address,
                    network,
                    new Date().toISOString(),
                    1, // You might want to get the actual block number here
                );
            }
        } else {
            console.log('No bytecode changes detected. Skipping deployment.');
            // Return the previous deployment addresses
            deployedContracts = Object.fromEntries(
                Object.keys(bytecodeInfo).map((contract) => {
                    const lastDeployment = lockFileManager.getLatestDeploymentForContract(contract, network)!;
                    return [
                        contract,
                        {
                            deployedAddress: lastDeployment.address,
                            bytecodeHash: lastDeployment.hash,
                        },
                    ];
                }),
            );
        }

        generatePonderEnv(configPath);
        // restart ponder to pick up new .env file
        await execa('docker', ['container', 'restart', 'canvas-ponder-1'], {
            cwd: targetDir,
        });
        generateWWWEnv(configPath);

        return deployedContracts;
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}
