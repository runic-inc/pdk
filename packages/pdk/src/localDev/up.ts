import fs from 'fs/promises';
import _ from 'lodash';
import path from 'path';
import { Address } from 'viem';
import { generatePonderEnv } from '../generatePonderEnv';
import { generateWWWEnv } from '../generateWWWEnv';
import { getDeploymentBlockNumber } from './blocknumber';
import { calculateBytecode } from './bytecode';
import { DeployConfig, deployContracts, DeploymentAddresses } from './deployment';
import { GeneratorManager } from './generators';
import LockFileManager from './lockFile';

interface BytecodeComparison {
    needsDeployment: boolean;
    changes: Array<{
        contract: string;
        oldHash?: string;
        newHash: string;
    }>;
}

function getDockerContainerName(projectName: string, serviceName: string, instanceNumber: number = 1): string {
    const sanitizedName = _.chain(projectName)
        .kebabCase()
        .thru((name) => (/^[a-z]/.test(name) ? name : `project-${name}`))
        .value();

    return `${sanitizedName}-${serviceName}-${instanceNumber}`;
}

function getPonderContainerName(projectName: string, instanceNumber: number = 1): string {
    return getDockerContainerName(projectName, 'ponder', instanceNumber);
}

async function getProjectNameFromConfig(configPath: string): Promise<string> {
    const content = await fs.readFile(configPath, 'utf8');

    try {
        if (configPath.endsWith('.json')) {
            const config = JSON.parse(content);
            return config.name;
        } else {
            // For TypeScript files, extract name using regex
            const match = content.match(/name:\s*["'](.+?)["']/);
            if (match && match[1]) {
                return match[1];
            }
        }
        throw new Error('Project name not found in config file');
    } catch (error) {
        console.error(`Error reading project name from config: ${error}`);
        throw error;
    }
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

export async function localDevUp(configPath: string, config: DeployConfig = {}): Promise<DeploymentAddresses> {
    console.info('Running local development environment...');
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
        console.info('Starting Docker services...');
        await execa('docker', ['compose', 'up', '-d'], {
            cwd: targetDir,
        });

        // Wait a moment for services to be ready
        console.info('Waiting for services to be ready...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const lockFileManager = new LockFileManager(configPath);
        const dependencyManager = new GeneratorManager(configPath, lockFileManager);
        const network = lockFileManager.getCurrentNetwork();

        // Run all generators in sequence
        await dependencyManager.processGenerators();

        // Calculate bytecode after running generators
        const bytecodeInfo = await calculateBytecode(configPath, deployConfig);

        // Compare bytecode with previous deployment
        const comparison = await compareWithPreviousDeployment(lockFileManager, network, bytecodeInfo);

        // Log changes if any were found
        if (comparison.changes.length > 0) {
            console.info('\nBytecode Changes Detected:');
            console.info('═══════════════════════════════════════════════════════════');
            comparison.changes.forEach((change) => {
                if (network === 'local') {
                    console.info(`${change.contract}: Local network - will redeploy`);
                } else if (!change.oldHash) {
                    console.info(`${change.contract}: New contract - needs deployment`);
                } else {
                    console.info(`${change.contract}: Bytecode changed`);
                    console.info(`  Previous: ${change.oldHash}`);
                    console.info(`  Current:  ${change.newHash}`);
                }
            });
            console.info('═══════════════════════════════════════════════════════════\n');
        }

        let deployedContracts: DeploymentAddresses;

        if (comparison.needsDeployment) {
            console.info(`Deploying contracts to ${network}...`);
            deployedContracts = await deployContracts(deployConfig, scriptDir);
            const blockNumber = await getDeploymentBlockNumber(deployConfig.rpcUrl);
            // Update lock file with new deployments
            for (const contractName in deployedContracts) {
                const deploymentInfo = deployedContracts[contractName];
                lockFileManager.logDeployment(
                    contractName,
                    deploymentInfo.bytecodeHash,
                    deploymentInfo.deployedAddress as Address,
                    network,
                    new Date().toISOString(),
                    Number(blockNumber),
                );
            }
        } else {
            console.info('No bytecode changes detected. Skipping deployment.');
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

        // Get project configuration to determine container name
        const projectName = await getProjectNameFromConfig(configPath);
        const ponderContainer = getPonderContainerName(projectName);
        console.log(`Restarting Ponder container: ${ponderContainer}`);
        await execa('docker', ['container', 'restart', ponderContainer], {
            cwd: targetDir,
        });

        generateWWWEnv(configPath);

        const { stdout } = await execa('docker', ['container', 'ls', '--format', '{{.ID}}\t{{.Names}}\t{{.Ports}}', '-a'], {
            cwd: targetDir,
        });

        console.info('Docker containers and network ports:');
        console.info(stdout);

        return deployedContracts;
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}
