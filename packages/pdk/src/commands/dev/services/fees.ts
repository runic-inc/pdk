import { confirm } from '@inquirer/prompts';
import { Feature, ProjectConfig } from '@patchworkdev/common/types';
import path from 'path';
import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { importPatchworkConfig } from '../../../common/helpers/config';
import { DeployConfig, DeploymentAddresses } from '../types';
import { PatchworkProtocol } from './abis/PatchworkProtocol.abi';
import { getChainForNetwork } from './helpers';

export class FeeService {
    private publicClient: PublicClient;
    private walletClient: WalletClient;
    private patchworkAddress: `0x${string}`;
    private account: ReturnType<typeof privateKeyToAccount>;
    private configPath: string;
    private projectConfig: ProjectConfig;
    private deployConfig: DeployConfig;

    constructor(configPath: string, deployConfig: DeployConfig) {
        this.configPath = configPath;
        this.deployConfig = deployConfig;
        this.account = privateKeyToAccount(deployConfig.privateKey as `0x${string}`);

        this.publicClient = createPublicClient({
            transport: http(deployConfig.rpcUrl),
        });

        this.walletClient = createWalletClient({
            account: this.account,
            chain: getChainForNetwork(deployConfig.network),
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

    private hasFeature(features: Feature[], ...requiredFeatures: Feature[]): boolean {
        return requiredFeatures.some((feature) => features.includes(feature));
    }

    async configureFeesForDeployment(deployedContracts: DeploymentAddresses): Promise<void> {
        await this.loadConfig();

        for (const [contractName, deployment] of Object.entries(deployedContracts)) {
            const contractConfig = this.projectConfig.contracts[contractName];

            // Skip if it's a string (reference to another contract) or doesn't have fees configured
            if (typeof contractConfig === 'string' || !contractConfig?.fees) {
                continue;
            }
            await this.configureFees(deployment.deployedAddress as `0x${string}`, contractConfig.fees, contractConfig.features);
        }
    }

    private async configureFees(
        contractAddress: `0x${string}`,
        fees: {
            mintFee?: number;
            assignFee?: number;
            patchFee?: number;
        },
        features: Feature[],
    ): Promise<void> {
        const mintConfig = await this.checkMintConfig(contractAddress);
        const assignFee = await this.checkAssignFee(contractAddress);
        const patchFee = await this.checkPatchFee(contractAddress);

        const isLocal = this.deployConfig.network === 'local';

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

        // Configure mint fee only if MINTABLE feature is present
        if (fees.mintFee !== undefined && this.hasFeature(features, Feature.MINTABLE)) {
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
        } else if (fees.mintFee !== undefined) {
            console.warn(`Skipping mint fee configuration for ${contractAddress} - MINTABLE feature not present`);
        }

        // Configure assign fee only if FRAGMENTMULTI or FRAGMENTSINGLE features are present
        if (fees.assignFee !== undefined && this.hasFeature(features, Feature.FRAGMENTMULTI, Feature.FRAGMENTSINGLE) && (!assignFee || assignFee === 0n)) {
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
        } else if (fees.assignFee !== undefined) {
            console.warn(`Skipping assign fee configuration for ${contractAddress} - FRAGMENTMULTI or FRAGMENTSINGLE features not present`);
        }

        // Configure patch fee only if PATCH, 1155PATCH, or ACCOUNTPATCH features are present
        if (
            fees.patchFee !== undefined &&
            this.hasFeature(features, Feature.PATCH, Feature['1155PATCH'], Feature.ACCOUNTPATCH) &&
            (!patchFee || patchFee === 0n)
        ) {
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
        } else if (fees.patchFee !== undefined) {
            console.warn(`Skipping patch fee configuration for ${contractAddress} - PATCH, 1155PATCH, or ACCOUNTPATCH features not present`);
        }
    }
}
