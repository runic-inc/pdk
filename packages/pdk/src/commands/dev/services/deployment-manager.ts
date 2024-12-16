import { Address } from 'viem';
import LockFileManager from '../../../services/lockFile';
import { BlockNumberService } from '../services/block-number';
import { DeploymentAddresses } from '../types';

interface BytecodeComparison {
    needsDeployment: boolean;
    changes: Array<{
        contract: string;
        oldHash?: string;
        newHash: string;
    }>;
}

export class DeploymentManager {
    private lockFileManager: LockFileManager;

    constructor(lockFileManager: LockFileManager) {
        this.lockFileManager = lockFileManager;
    }

    async compareWithPreviousDeployment(network: string, newBytecode: DeploymentAddresses): Promise<BytecodeComparison> {
        const changes: Array<{ contract: string; oldHash?: string; newHash: string }> = [];
        let needsDeployment = false;

        if (network === 'local') {
            needsDeployment = true;
            Object.entries(newBytecode).forEach(([contract, info]) => {
                changes.push({ contract, newHash: info.bytecodeHash });
            });
            return { needsDeployment, changes };
        }

        for (const [contract, info] of Object.entries(newBytecode)) {
            const lastDeployment = this.lockFileManager.getLatestDeploymentForContract(contract, network);
            const oldHash = lastDeployment?.hash;

            if (!lastDeployment || oldHash !== info.bytecodeHash) {
                needsDeployment = true;
                changes.push({ contract, oldHash, newHash: info.bytecodeHash });
            }
        }

        return { needsDeployment, changes };
    }

    logBytecodeChanges(comparison: BytecodeComparison, network: string): void {
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

    async logDeployments(deployedContracts: DeploymentAddresses, network: string, rpcUrl: string): Promise<void> {
        const blockNumberService = new BlockNumberService();
        const blockNumber = await blockNumberService.getDeploymentBlockNumber(rpcUrl);

        for (const [contractName, deploymentInfo] of Object.entries(deployedContracts)) {
            this.lockFileManager.logDeployment(
                contractName,
                deploymentInfo.bytecodeHash,
                deploymentInfo.deployedAddress as Address,
                network,
                new Date().toISOString(),
                Number(blockNumber),
            );
        }
    }

    getExistingDeployments(bytecodeInfo: DeploymentAddresses, network: string): DeploymentAddresses {
        console.info('No bytecode changes detected. Skipping deployment.');
        return Object.fromEntries(
            Object.keys(bytecodeInfo).map((contract) => {
                const lastDeployment = this.lockFileManager.getLatestDeploymentForContract(contract, network)!;
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
}
