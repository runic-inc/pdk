import { getChainForNetwork, TaskExecuteParams } from '@patchworkdev/pdk/utils';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Enum for MintMode matching the contract
enum MintMode {
    OWNER = 0,
    OPEN = 1
}

// ABI for the Canvas contract functions we need
const canvasAbi = [
    {
        type: 'function',
        name: 'ownerOf',
        inputs: [{ type: 'uint256', name: 'tokenId' }],
        outputs: [{ type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'setMintMode',
        inputs: [{ type: 'uint8', name: 'mode' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'mint',
        inputs: [
            { type: 'address', name: 'to' },
            { type: 'bytes', name: 'data' }
        ],
        outputs: [{ type: 'uint256' }],
        stateMutability: 'payable',
    }
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

export async function mintCanvasTask({ deployConfig, deployedContracts }: TaskExecuteParams): Promise<void> {
    const publicClient = createPublicClient({
        transport: http(deployConfig.rpcUrl),
    });

    const account = privateKeyToAccount(deployConfig.privateKey as `0x${string}`);

    const walletClient = createWalletClient({
        account,
        chain: getChainForNetwork(deployConfig.network),
        transport: http(deployConfig.rpcUrl),
    });

    const canvasContractAddress = deployedContracts.Canvas.deployedAddress as `0x${string}`;

    console.log('Canvas Contract:', canvasContractAddress);

    // Check if any canvas has been minted by checking ownership of token ID 0
    try {
        try {
            const owner = await publicClient.readContract({
                address: canvasContractAddress,
                abi: canvasAbi,
                functionName: 'ownerOf',
                args: [0n],
            });
            
            console.log('Canvas has already been minted. Owner of first canvas:', owner);
            return;
        } catch (error) {
            // If ownerOf reverts, it means token 0 doesn't exist, so no canvas has been minted
            console.log('No canvas has been minted yet.');
        }

        // Ask if user wants to mint their first canvas
        const shouldMint = await askQuestion('\nNo canvas has been minted yet. Would you like to mint the first canvas? (y/n): ');

        if (shouldMint.toLowerCase() === 'y') {
            try {
                console.log('Minting canvas...');

                const { request } = await publicClient.simulateContract({
                    address: canvasContractAddress,
                    abi: canvasAbi,
                    functionName: 'mint',
                    args: [account.address, '0x'] as const,
                    account,
                });

                const hash = await walletClient.writeContract(request);

                console.log('Transaction sent:', hash);

                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                console.log('Canvas minted! Block:', receipt.blockNumber);

                // Ask if they want to enable open minting
                const shouldOpenMinting = await askQuestion('\nWould you like to enable open minting for everyone? (y/n): ');

                if (shouldOpenMinting.toLowerCase() === 'y') {
                    try {
                        console.log('Setting mint mode to OPEN...');

                        const { request } = await publicClient.simulateContract({
                            address: canvasContractAddress,
                            abi: canvasAbi,
                            functionName: 'setMintMode',
                            args: [MintMode.OPEN],
                            account,
                        });

                        const mintModeHash = await walletClient.writeContract(request);

                        console.log('Transaction sent:', mintModeHash);

                        const mintModeReceipt = await publicClient.waitForTransactionReceipt({ hash: mintModeHash });

                        console.log('Mint mode set to OPEN! Block:', mintModeReceipt.blockNumber);
                    } catch (error) {
                        console.error('Error setting mint mode:', error);
                        throw error;
                    }
                } else {
                    console.log('Keeping mint mode as OWNER only.');
                }
            } catch (error) {
                console.error('Error minting canvas:', error);
                throw error;
            }
        } else {
            console.log('Skipping canvas minting.');
        }
    } catch (error) {
        console.error('Error checking canvas state:', error);
        throw error;
    }
}