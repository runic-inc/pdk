import fs from 'fs/promises';
import path from 'path';

export type DeployConfig = {
    rpcUrl?: string;
    privateKey?: string;
    owner?: string;
    patchworkProtocol?: string;
};

export type DeploymentInfo = {
    deployedAddress: string;
    bytecodeHash: string;
};

export type DeploymentAddresses = {
    [contractName: string]: DeploymentInfo;
};

async function parseDeploymentOutput(output: string, contractNames: string[]): Promise<DeploymentAddresses> {
    const deployedContracts: DeploymentAddresses = {};
    const lines = output.split('\n');

    // Find the return value line
    const returnLine = lines.find((line) => line.includes('DeploymentAddresses({'));
    if (!returnLine) {
        console.error('Deployment output:', output);
        throw new Error('Could not find deployment addresses in output');
    }

    // Parse each contract's deployment info
    for (const contractName of contractNames) {
        const regex = new RegExp(
            `${contractName}:\\s*DeploymentInfo\\({\\s*deployedAddress:\\s*(0x[a-fA-F0-9]{40}),\\s*bytecodeHash:\\s*(0x[a-fA-F0-9]{64})\\s*}`,
        );
        const match = returnLine.match(regex);

        if (match) {
            deployedContracts[contractName] = {
                deployedAddress: match[1],
                bytecodeHash: match[2],
            };
        }
    }

    // Verify we found all expected contracts
    const missingContracts = contractNames.filter((name) => !deployedContracts[name]);
    if (missingContracts.length > 0) {
        console.error('Deployment output:', output);
        throw new Error(`Missing addresses for contracts: ${missingContracts.join(', ')}`);
    }

    return deployedContracts;
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
        .filter((line) => line.startsWith('DeploymentInfo'))
        .map((line) => line.split(/\s+/)[1].replace(';', ''));

    return contractNames;
}

export async function deployContracts(deployConfig: DeployConfig, scriptDir: string) {
    if (
        deployConfig.rpcUrl === undefined ||
        deployConfig.privateKey === undefined ||
        deployConfig.owner === undefined ||
        deployConfig.patchworkProtocol === undefined
    ) {
        throw new Error('Missing required deploy configuration');
    }
    const { execa } = await import('execa');
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
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('Contract Name'.padEnd(20), '│', 'Address'.padEnd(42), '│', 'Bytecode Hash');
    console.log('─'.repeat(20), '┼', '─'.repeat(42), '┼', '─'.repeat(66));
    Object.entries(deployedContracts).forEach(([contract, info]) => {
        console.log(contract.padEnd(20), '│', info.deployedAddress.padEnd(42), '│', info.bytecodeHash);
    });
    console.log('═══════════════════════════════════════════════════════════════════════════');
    return deployedContracts;
}
