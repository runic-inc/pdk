// bytecode/index.ts

import fs from 'fs/promises';
import path from 'path';
import { DeployConfig, DeploymentAddresses } from '../deployment';

export async function calculateBytecode(configPath: string, config: DeployConfig = {}): Promise<DeploymentAddresses> {
    console.log('Calculating contract bytecode...');
    const targetDir = path.dirname(configPath);
    const contractsDir = path.join(targetDir, 'contracts');
    const scriptDir = path.join(contractsDir, 'script');

    // Use same default values as localDevRun for consistency
    const deployConfig = {
        rpcUrl: config.rpcUrl || 'http://localhost:8545',
        privateKey: config.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        owner: config.owner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        patchworkProtocol: config.patchworkProtocol || '0x00000000001616E65bb9FdA42dFBb7155406549b',
    };

    try {
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

        // Extract contract names from script
        const content = await fs.readFile(path.join(scriptDir, deployScript), 'utf-8');
        const structMatch = content.match(/struct\s+DeploymentAddresses\s*{([^}]+)}/s);
        if (!structMatch) {
            throw new Error('Could not find DeploymentAddresses struct in script');
        }

        const contractNames = structMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('DeploymentInfo'))
            .map((line) => line.split(/\s+/)[1].replace(';', ''));

        console.log('\nCalculating bytecode for contracts:', contractNames.join(', '));

        // Run forge script in bytecode-only mode
        const { execa } = await import('execa');
        console.log('\nRunning bytecode calculation...');
        const { stdout } = await execa(
            'forge',
            ['script', '--optimize', '--optimizer-runs=200', '-vvv', deployScript, '--rpc-url', deployConfig.rpcUrl, '--private-key', deployConfig.privateKey],
            {
                cwd: scriptDir,
                env: {
                    ...process.env,
                    OWNER: deployConfig.owner,
                    PATCHWORK_PROTOCOL: deployConfig.patchworkProtocol,
                    BYTECODE_ONLY: 'true',
                },
                stdio: ['inherit', 'pipe', 'inherit'],
            },
        );

        // Parse output for bytecode info
        const deployedContracts: DeploymentAddresses = {};
        const lines = stdout.split('\n');
        const returnLine = lines.find((line) => line.includes('DeploymentAddresses({'));

        if (!returnLine) {
            console.error('Script output:', stdout);
            throw new Error('Could not find deployment addresses in output');
        }

        // Parse bytecode for each contract
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

        // Print results
        console.log('\nBytecode Calculation Results:');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('Contract Name'.padEnd(20), '│', 'Bytecode Hash');
        console.log('─'.repeat(20), '┼', '─'.repeat(66));
        Object.entries(deployedContracts).forEach(([contract, info]) => {
            console.log(contract.padEnd(20), '│', info.bytecodeHash);
        });
        console.log('═══════════════════════════════════════════════════════════');

        return deployedContracts;
    } catch (error) {
        console.error('Bytecode calculation failed:', error);
        throw error;
    }
}
