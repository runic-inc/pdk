import { confirm } from '@inquirer/prompts';
import { ProjectConfig } from '@patchworkdev/common/types';
import path from 'path';
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import { importPatchworkConfig } from '../../common/helpers/config';
import { DeployConfig, DeploymentAddresses } from '../types';
import { PatchworkProtocol } from './PatchworkProtocol.abi';

export class FeeService {
    private publicClient: PublicClient;
    private walletClient: WalletClient;
    private patchworkAddress: `0x${string}`;
    private account: ReturnType<typeof privateKeyToAccount>;
    private configPath: string;
    private projectConfig: ProjectConfig;

    constructor(configPath: string, deployConfig: DeployConfig) {
        this.configPath = configPath;
        this.account = privateKeyToAccount(deployConfig.privateKey as `0x${string}`);

        this.publicClient = createPublicClient({
            chain: foundry, //TODO: Don't hard code this
            transport: http(deployConfig.rpcUrl),
        });

        this.walletClient = createWalletClient({
            account: this.account,
            chain: foundry, //TODO: Don't hard code this
            transport: http(deployConfig.rpcUrl),
        });

        this.patchworkAddress = deployConfig.patchworkProtocol as `0x${string}`;

        this.projectConfig = {
            name: 'temp',
            scopes: [],
            contracts: {},
        };
    }

    private async loadConfig(): Promise<void> {
        const fullConfigPath = path.isAbsolute(this.configPath) ? this.configPath : path.resolve(process.cwd(), this.configPath);
        this.projectConfig = await importPatchworkConfig(fullConfigPath);
    }

    private async checkMintConfig(contractAddress: `0x${string}`): Promise<{ flatFee: bigint; active: boolean } | null> {
        try {
            const result = await this.publicClient.readContract({
                address: this.patchworkAddress,
                abi: PatchworkProtocol,
                functionName: 'getMintConfiguration',
                args: [contractAddress],
            });
            return result as { flatFee: bigint; active: boolean };
        } catch (error) {
            console.error('Error checking mint configuration:', error);
            return null;
        }
    }

    private async checkAssignFee(contractAddress: `0x${string}`): Promise<bigint | null> {
        try {
            const result = await this.publicClient.readContract({
                address: this.patchworkAddress,
                abi: PatchworkProtocol,
                functionName: 'getAssignFee',
                args: [contractAddress],
            });
            return result as bigint;
        } catch (error) {
            console.error('Error checking assign fee:', error);
            return null;
        }
    }

    private async checkPatchFee(contractAddress: `0x${string}`): Promise<bigint | null> {
        try {
            const result = await this.publicClient.readContract({
                address: this.patchworkAddress,
                abi: PatchworkProtocol,
                functionName: 'getPatchFee',
                args: [contractAddress],
            });
            return result as bigint;
        } catch (error) {
            console.error('Error checking patch fee:', error);
            return null;
        }
    }

    async configureFeesForDeployment(deployedContracts: DeploymentAddresses, isLocal: boolean): Promise<void> {
        await this.loadConfig();

        for (const [contractName, deployment] of Object.entries(deployedContracts)) {
            const contractConfig = this.projectConfig.contracts[contractName];

            // Skip if it's a string (reference to another contract) or doesn't have fees configured
            if (typeof contractConfig === 'string' || !contractConfig?.fees) {
                continue;
            }
            await this.configureFees(deployment.deployedAddress as `0x${string}`, contractConfig.fees, isLocal);
        }
    }

    private async configureFees(
        contractAddress: `0x${string}`,
        fees: {
            mintFee?: number;
            assignFee?: number;
            patchFee?: number;
        },
        isLocal: boolean,
    ): Promise<void> {
        const mintConfig = await this.checkMintConfig(contractAddress);
        const assignFee = await this.checkAssignFee(contractAddress);
        const patchFee = await this.checkPatchFee(contractAddress);

        if (!isLocal) {
            const shouldConfigure = await confirm({
                message: 'Fee configuration not found. Would you like to configure fees now?',
                default: true,
            });

            if (!shouldConfigure) {
                console.info('Skipping fee configuration...');
                return;
            }
        }

        // Configure fees that are specified and not already set
        if (fees.mintFee !== undefined) {
            let shouldSetMintConfig = isLocal;
            let shouldActivate = isLocal;

            if (!isLocal && (!mintConfig || mintConfig.flatFee === 0n)) {
                shouldSetMintConfig = await confirm({
                    message: 'Would you like to configure the mint fee?',
                    default: true,
                });
            }

            if (!isLocal && mintConfig && !mintConfig.active) {
                shouldActivate = await confirm({
                    message: 'Minting is currently not active for this contract. Would you like to enable minting?',
                    default: true,
                });
            }

            if (shouldSetMintConfig || shouldActivate) {
                const feeInWei = BigInt(Math.floor(fees.mintFee * 1e18));
                const { request } = await this.publicClient.simulateContract({
                    account: this.account,
                    address: this.patchworkAddress,
                    abi: PatchworkProtocol,
                    functionName: 'setMintConfiguration',
                    args: [
                        contractAddress,
                        {
                            flatFee: shouldSetMintConfig ? feeInWei : mintConfig?.flatFee || 0n,
                            active: true,
                        },
                    ],
                });

                const hash = await this.walletClient.writeContract(request);
                console.info(`Set mint config for ${contractAddress} to ${fees.mintFee} ETH, minting active: true (tx: ${hash})`);
            }
        }

        if (fees.assignFee !== undefined && (!assignFee || assignFee === 0n)) {
            const feeInWei = BigInt(Math.floor(fees.assignFee * 1e18));
            const { request } = await this.publicClient.simulateContract({
                account: this.account,
                address: this.patchworkAddress,
                abi: PatchworkProtocol,
                functionName: 'setAssignFee',
                args: [contractAddress, feeInWei],
            });

            const hash = await this.walletClient.writeContract(request);
            console.info(`Set assign fee for ${contractAddress} to ${fees.assignFee} ETH (tx: ${hash})`);
        }

        if (fees.patchFee !== undefined && (!patchFee || patchFee === 0n)) {
            const feeInWei = BigInt(Math.floor(fees.patchFee * 1e18));
            const { request } = await this.publicClient.simulateContract({
                account: this.account,
                address: this.patchworkAddress,
                abi: PatchworkProtocol,
                functionName: 'setPatchFee',
                args: [contractAddress, feeInWei],
            });

            const hash = await this.walletClient.writeContract(request);
            console.info(`Set patch fee for ${contractAddress} to ${fees.patchFee} ETH (tx: ${hash})`);
        }
    }
}
