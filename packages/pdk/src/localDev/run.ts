import fs from 'fs/promises';
import path from 'path';

interface DeployConfig {
    rpcUrl?: string;
    privateKey?: string;
    owner?: string;
    patchworkProtocol?: string;
}

interface DeploymentAddresses {
    [contractName: string]: string;
}

async function writeEnvFile(targetDir: string, deployConfig: DeployConfig, deployedContracts: DeploymentAddresses) {
    // Build .env content
    const envContent =
        [
            `RPC_URL=${deployConfig.rpcUrl}`,
            'NETWORK=8453',
            `PATCHWORK_PROTOCOL=${deployConfig.patchworkProtocol}`,
            // Add CONTRACT_ADDRESS entries for each deployed contract
            ...Object.entries(deployedContracts).map(([contract, address]) => {
                // Capitalize contract name and add _CONTRACT_ADDRESS
                const envVarName = `${contract.toUpperCase()}_CONTRACT_ADDRESS`;
                return `${envVarName}=${address}`;
            }),
        ].join('\n') + '\n'; // Add final newline

    // Write the .env file
    const envPath = path.join(targetDir, '.env');
    await fs.writeFile(envPath, envContent);
    console.log('\nWrote environment variables to:', envPath);
}

async function extractContractNamesFromScript(scriptPath: string): Promise<string[]> {
    const content = await fs.readFile(scriptPath, 'utf-8');

    // Find the struct definition
    const structMatch = content.match(/struct\s+DeploymentAddresses\s*{([^}]+)}/s);
    if (!structMatch) {
        throw new Error('Could not find DeploymentAddresses struct in script');
    }

    // Extract contract names from the struct definition
    const structContent = structMatch[1];
    const contractNames = structContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('address'))
        .map((line) => line.split(/\s+/)[1].replace(';', ''));

    return contractNames;
}

async function parseDeploymentOutput(output: string, contractNames: string[]): Promise<DeploymentAddresses> {
    // Find the return value line which contains the struct
    const lines = output.split('\n');
    const returnLine = lines.find((line) => line.includes('DeploymentAddresses({') && line.includes('0x'));

    if (!returnLine) {
        // If we can't find the return line, log relevant output for debugging
        const relevantLines = lines.filter((line) => line.includes('Return') || line.includes('DeploymentAddresses') || line.includes('0x'));
        console.error('Could not find return value. Relevant output:', relevantLines);
        throw new Error('Could not find contract addresses in deployment output');
    }

    // Extract the struct content between curly braces
    const structMatch = returnLine.match(/DeploymentAddresses\({(.+?)}\)/);
    if (!structMatch) {
        throw new Error('Could not parse deployment addresses struct from output');
    }

    const structContent = structMatch[1];

    // Parse the comma-separated key-value pairs
    const pairs = structContent.split(',').map((pair) => pair.trim());
    const deployedContracts: DeploymentAddresses = {};

    pairs.forEach((pair) => {
        const [name, address] = pair.split(':').map((s) => s.trim());
        if (name && address) {
            deployedContracts[name] = address;
        }
    });

    // Verify we found all expected contracts
    const missingContracts = contractNames.filter((name) => !deployedContracts[name]);
    if (missingContracts.length > 0) {
        throw new Error(`Missing addresses for contracts: ${missingContracts.join(', ')}`);
    }

    return deployedContracts;
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

        // Start Docker services
        console.log('Starting Docker services...');
        await execa('docker', ['compose', 'up', '-d'], {
            cwd: targetDir,
        });

        // Find deploy script
        const files = await fs.readdir(scriptDir);
        const deployScripts = files.filter((file) => file.endsWith('-deploy.s.sol'));

        if (deployScripts.length === 0) {
            throw new Error(`No deploy script found in ${scriptDir}`);
        }
        if (deployScripts.length > 1) {
            throw new Error(`Multiple deploy scripts found in ${scriptDir}: ${deployScripts.join(', ')}`);
        }

        const deployScript = deployScripts[0];
        const scriptPath = path.join(scriptDir, deployScript);

        // Extract contract names and validate script
        const contractNames = await extractContractNamesFromScript(scriptPath);
        console.log('\nFound contracts to deploy:', contractNames.join(', '));

        // Run forge script
        console.log('\nRunning deployment script...');
        const { stdout } = await execa(
            'forge',
            [
                'script',
                '--optimize',
                '--optimizer-runs=200',
                '--broadcast',
                '-vvv',
                deployScript,
                '--rpc-url',
                deployConfig.rpcUrl,
                '--private-key',
                deployConfig.privateKey,
            ],
            {
                cwd: scriptDir,
                env: {
                    ...process.env,
                    OWNER: deployConfig.owner,
                    PATCHWORK_PROTOCOL: deployConfig.patchworkProtocol,
                },
                stdio: ['inherit', 'pipe', 'inherit'],
            },
        );

        // Parse deployment addresses
        const deployedContracts = await parseDeploymentOutput(stdout, contractNames);

        // Print results in a nicely formatted table
        console.log('\nDeployment Results:');
        console.log('═══════════════════════════════════════════════');
        console.log('Contract Name'.padEnd(20), '│', 'Address');
        console.log('─'.repeat(20), '┼', '─'.repeat(42));
        Object.entries(deployedContracts).forEach(([contract, address]) => {
            console.log(contract.padEnd(20), '│', address);
        });
        console.log('═══════════════════════════════════════════════');

        // Write .env file
        await writeEnvFile(targetDir, deployConfig, deployedContracts);

        return deployedContracts;
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}
