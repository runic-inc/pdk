import { getChainForNetwork, TaskExecuteParams } from '@patchworkdev/pdk/utils';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import { Address, createPublicClient, createWalletClient, http, PrivateKeyAccount, PublicClient, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Enum for MintMode matching the contract
enum MintMode {
    OWNER = 0,
    OPEN = 1,
}

// ABI for the Canvas contract functions we need
const bubbleAbi = [
    {
        type: 'function',
        name: 'setMintMode',
        inputs: [{ type: 'uint8', name: 'mode' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

const patchworkAbi = [
    {
        type: 'function',
        name: 'getMintConfiguration',
        inputs: [
            {
                name: 'addr',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [
            {
                name: 'config',
                type: 'tuple',
                internalType: 'struct IPatchworkProtocol.MintConfig',
                components: [
                    {
                        name: 'flatFee',
                        type: 'uint256',
                        internalType: 'uint256',
                    },
                    {
                        name: 'active',
                        type: 'bool',
                        internalType: 'bool',
                    },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'setMintConfiguration',
        inputs: [
            {
                name: 'addr',
                type: 'address',
                internalType: 'address',
            },
            {
                name: 'config',
                type: 'tuple',
                internalType: 'struct IPatchworkProtocol.MintConfig',
                components: [
                    {
                        name: 'flatFee',
                        type: 'uint256',
                        internalType: 'uint256',
                    },
                    {
                        name: 'active',
                        type: 'bool',
                        internalType: 'bool',
                    },
                ],
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'addOperator',
        inputs: [
            {
                name: 'scopeName',
                type: 'string',
                internalType: 'string',
            },
            {
                name: 'op',
                type: 'address',
                internalType: 'address',
            },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

async function askQuestion(question: string): Promise<string> {
    const rl = readline.createInterface({ input, output });
    try {
        const answer = await rl.question(question);
        return answer;
    } finally {
        rl.close();
    }
}

export async function enableBubbleMintTask({ deployConfig, deployedContracts }: TaskExecuteParams): Promise<void> {
    const publicClient = createPublicClient({
        transport: http(deployConfig.rpcUrl),
    });

    const account = privateKeyToAccount(deployConfig.privateKey as `0x${string}`);

    const walletClient = createWalletClient({
        account,
        chain: getChainForNetwork(deployConfig.network),
        transport: http(deployConfig.rpcUrl),
    });

    const bubbleContractAddress = deployedContracts.Bubble.deployedAddress as `0x${string}`;

    console.log('Bubble Contract:', bubbleContractAddress);

    //check minting is enabled
    try {
        const mintConfig = await publicClient.readContract({
            address: deployConfig.patchworkProtocol as `0x${string}`,
            abi: patchworkAbi,
            functionName: 'getMintConfiguration',
            args: [bubbleContractAddress] as const,
        });
        if (mintConfig.active === false) {
            console.log('Minting is not enabled for this canvas. Attempting to enable it.');
            const shouldEnable = await askQuestion('\nDo you want to enable minting for bubbles? (y/n): ');

            if (shouldEnable.toLowerCase() === 'y') {
                enableMint(publicClient, deployConfig.patchworkProtocol as `0x${string}`, bubbleContractAddress, account, walletClient);
            }
        }
    } catch (error) {
        console.error('Error enabling mint:', error);
        throw error;
    }

    //add bubble as operator of scope
    try {
        addOperator(deployConfig.patchworkProtocol as `0x${string}`, 'canvas-demo', bubbleContractAddress, publicClient, account, walletClient);
    } catch (error) {
        console.error('Error adding bubble as operator of scope:', error);
        throw error;
    }
}

async function enableMint(publicClient: PublicClient, pp: Address, mintAddress: Address, account: PrivateKeyAccount, walletClient: WalletClient) {
    console.log('Minting is not enabled for this canvas. Attempting to enable it.');
    const { request } = await publicClient.simulateContract({
        address: pp as `0x${string}`,
        abi: patchworkAbi,
        functionName: 'setMintConfiguration',
        args: [mintAddress, { flatFee: 0n, active: true }] as const,
        account,
    });

    const mintConfigHash = await walletClient.writeContract(request);
    console.log('Transaction sent:', mintConfigHash);
    const mintConfigReceipt = await publicClient.waitForTransactionReceipt({ hash: mintConfigHash });
    console.log('Minting enabled! Block:', mintConfigReceipt.blockNumber);
}

async function addOperator(pp: Address, scope: string, opAddress: Address, publicClient: PublicClient, account: PrivateKeyAccount, walletClient: WalletClient) {
    console.log(`Add operator ${opAddress} to scope`);
    const { request } = await publicClient.simulateContract({
        address: pp as `0x${string}`,
        abi: patchworkAbi,
        functionName: 'addOperator',
        args: [scope, opAddress] as const,
        account,
    });

    const addOpHash = await walletClient.writeContract(request);
    console.log('Transaction sent:', addOpHash);
    const addOpReceipt = await publicClient.waitForTransactionReceipt({ hash: addOpHash });
    console.log('Add operator Block:', addOpReceipt.blockNumber);
}
