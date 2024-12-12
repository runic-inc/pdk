import { getChainForNetwork, TaskExecuteParams } from '@patchworkdev/pdk/utils';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import { createPublicClient, createWalletClient, http, parseAbiItem } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { traits, TraitType, type Trait } from '../assets/tratis';

const characterTraitsAbi = [
    parseAbiItem('event Register(uint16 indexed traitId, uint8 indexed traitType, string name)'),
    parseAbiItem('function registerTraits(uint16[] calldata ids, string[] calldata names, uint8[] calldata traitTypes) external'),
    parseAbiItem('function isTraitRegistered(uint16 traitId) public view returns (bool)'),
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

export async function registerTraitsTask({ deployConfig, deployedContracts }: TaskExecuteParams): Promise<void> {
    const publicClient = createPublicClient({
        transport: http(deployConfig.rpcUrl),
    });

    const account = privateKeyToAccount(deployConfig.privateKey as `0x${string}`);

    const walletClient = createWalletClient({
        account,
        chain: getChainForNetwork(deployConfig.network),
        transport: http(deployConfig.rpcUrl),
    });

    const traitContractAddress = deployedContracts.Trait.deployedAddress as `0x${string}`;
    const deploymentBlock = BigInt(deployedContracts.Trait.deploymentBlock);

    console.log('Contract:', traitContractAddress);
    console.log('Deployment Block:', deploymentBlock.toString());

    // Get registered traits from events starting from deployment block
    console.log('Fetching registered traits...');
    const registeredTraits = new Set<number>();

    const logs = await publicClient.getLogs({
        address: traitContractAddress,
        event: characterTraitsAbi[0],
        fromBlock: deploymentBlock,
    });

    for (const log of logs) {
        const traitId = Number(log.args.traitId);
        registeredTraits.add(traitId);
    }

    // Find unregistered traits
    const unregisteredTraits = Object.values(traits).filter((trait) => !registeredTraits.has(trait.id));

    if (unregisteredTraits.length === 0) {
        console.log('All traits are registered!');
        return;
    }

    // Display unregistered traits
    console.log('\nUnregistered traits:');
    unregisteredTraits.forEach((trait) => {
        console.log(`ID: ${trait.id}, Type: ${TraitType[trait.type]}, Name: ${trait.name}`);
    });

    try {
        // Ask which traits to register
        const answer = await askQuestion('\nEnter trait IDs to register (space/comma separated) or "all": ');

        // Parse input
        let traitsToRegister = unregisteredTraits;
        if (answer.toLowerCase() !== 'all') {
            const selectedIds = answer.split(/[,\s]+/).map(Number);
            traitsToRegister = unregisteredTraits.filter((t) => selectedIds.includes(t.id));
        }

        if (traitsToRegister.length === 0) {
            console.log('No valid traits selected');
            return;
        }

        // Split into chunks of 20
        const chunks: Trait[][] = [];
        for (let i = 0; i < traitsToRegister.length; i += 20) {
            chunks.push(traitsToRegister.slice(i, i + 20));
        }

        // Process chunks
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const ids = chunk.map((t) => t.id);
            const names = chunk.map((t) => t.name);
            const types = chunk.map((t) => t.type);

            console.log(`\nTransaction ${i + 1}/${chunks.length}:`);
            console.log('Contract:', traitContractAddress);
            console.log('Function: registerTraits');
            console.log('Parameters:');
            console.log('  ids:', ids);
            console.log('  names:', names);
            console.log('  types:', types);

            const shouldSend = await askQuestion('Send this transaction? (y/n): ').then((answer) => answer.toLowerCase() === 'y');

            if (shouldSend) {
                try {
                    console.log('Sending transaction...');

                    const { request } = await publicClient.simulateContract({
                        address: traitContractAddress,
                        abi: characterTraitsAbi,
                        functionName: 'registerTraits',
                        args: [ids, names, types] as const,
                        account,
                    });

                    const hash = await walletClient.writeContract(request);

                    console.log('Transaction sent:', hash);

                    const receipt = await publicClient.waitForTransactionReceipt({ hash });

                    console.log('Transaction confirmed! Block:', receipt.blockNumber);
                } catch (error) {
                    console.error('Error sending transaction:', error);
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error('Error during trait registration:', error);
        throw error;
    }
}
