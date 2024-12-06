import { createPublicClient, createWalletClient, http, parseAbiItem } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains'; // replace with your chain
import { TraitContract, traits, TraitType, type Trait } from '../assets/tratis'
import readline from 'readline';
import chalk from 'chalk';

// ABI for the events and functions we need
const characterTraitsAbi = [
    // Event
    parseAbiItem('event Register(uint16 indexed traitId, uint8 indexed traitType, string name)'),
    // Functions
    parseAbiItem('function registerTraits(uint16[] calldata ids, string[] calldata names, uint8[] calldata traitTypes) external'),
    parseAbiItem('function isTraitRegistered(uint16 traitId) public view returns (bool)')
  ] as const;
  
  async function main() {
    // Set up clients
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(process.env.RPC_URL)
    });
  
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: mainnet,
      transport: http(process.env.RPC_URL)
    });
  
    // Get registered traits from events
    console.log(chalk.blue('Fetching registered traits...'));
    const registeredTraits = new Set<number>();
    
    const logs = await publicClient.getLogs({
      address: TraitContract.default,
      event: characterTraitsAbi[0],
      fromBlock: 0n
    });
    
    for (const log of logs) {
      const traitId = Number(log.args.traitId);
      registeredTraits.add(traitId);
    }
  
    // Find unregistered traits
    const unregisteredTraits = Object.values(traits).filter(
      trait => !registeredTraits.has(trait.id)
    );
  
    if (unregisteredTraits.length === 0) {
      console.log(chalk.green('All traits are registered!'));
      return;
    }
  
    // Display unregistered traits
    console.log(chalk.yellow('\nUnregistered traits:'));
    unregisteredTraits.forEach(trait => {
      console.log(chalk.white(`ID: ${trait.id}, Type: ${TraitType[trait.type]}, Name: ${trait.name}`));
    });
  
    // Create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    // Ask which traits to register
    const answer = await new Promise<string>(resolve => {
      rl.question(
        chalk.yellow('\nEnter trait IDs to register (space/comma separated) or "all": '),
        resolve
      );
    });
  
    rl.close();
  
    // Parse input
    let traitsToRegister = unregisteredTraits;
    if (answer.toLowerCase() !== 'all') {
      const selectedIds = answer.split(/[,\s]+/).map(Number);
      traitsToRegister = unregisteredTraits.filter(t => selectedIds.includes(t.id));
    }
  
    if (traitsToRegister.length === 0) {
      console.log(chalk.red('No valid traits selected'));
      return;
    }
  
    // Split into chunks of 20
    const chunks: Trait[][] = [];
    for (let i = 0; i < traitsToRegister.length; i += 20) {
      chunks.push(traitsToRegister.slice(i, i + 20));
    }
  
    // Generate transactions
    console.log(chalk.blue('\nGenerated transactions:'));
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const ids = chunk.map(t => t.id);
      const names = chunk.map(t => t.name);
      const types = chunk.map(t => t.type);
  
      console.log(chalk.green(`\nTransaction ${i + 1}/${chunks.length}:`));
      console.log('Contract:', TraitContract.default);
      console.log('Function: registerTraits');
      console.log('Parameters:');
      console.log('  ids:', ids);
      console.log('  names:', names);
      console.log('  types:', types);
  
      const shouldSend = await new Promise<boolean>(resolve => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question(chalk.yellow('Send this transaction? (y/n): '), answer => {
          rl.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });
  
      if (shouldSend) {
        try {
          console.log(chalk.blue('Sending transaction...'));
          
          // Prepare and send transaction
          const { request } = await publicClient.simulateContract({
            address: TraitContract.default,
            abi: characterTraitsAbi,
            functionName: 'registerTraits',
            args: [ids, names, types] as const,
            account
          });
  
          const hash = await walletClient.writeContract(request);
          
          console.log(chalk.green('Transaction sent:', hash));
          
          const receipt = await publicClient.waitForTransactionReceipt({ 
            hash 
          });
          
          console.log(chalk.green('Transaction confirmed! Block:', receipt.blockNumber));
        } catch (error) {
          console.error(chalk.red('Error sending transaction:'), error);
        }
      }
    }
  }
  
  // Environment validation
  if (!process.env.RPC_URL) {
    console.error(chalk.red('Please set RPC_URL environment variable'));
    process.exit(1);
  }
  
  if (!process.env.PRIVATE_KEY) {
    console.error(chalk.red('Please set PRIVATE_KEY environment variable'));
    process.exit(1);
  }
  
  // Run the script
  main().catch(console.error);