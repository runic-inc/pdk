import fs from 'fs/promises';
import path from 'path';

interface DeployConfig {
    rpcUrl?: string;
    privateKey?: string;
    owner?: string;
    patchworkProtocol?: string;
}

async function extractContractName(scriptPath: string): Promise<string> {
    const content = await fs.readFile(scriptPath, 'utf-8');
    // Look for "contract <name> is Script"
    const contractMatch = content.match(/contract\s+(\w+)\s+is\s+Script/);
    if (!contractMatch) {
        throw new Error('Could not find deploy contract in script file');
    }
    return contractMatch[1];
}

export async function localDevRun(configPath: string, config: DeployConfig = {}) {
    console.log('Running local development environment...');
    const targetDir = path.dirname(configPath);
    const contractsDir = path.join(targetDir, 'contracts');
    const scriptDir = path.join(contractsDir, 'script');

    // Default configuration
    const deployConfig = {
        rpcUrl: config.rpcUrl || 'http://localhost:8545',
        privateKey: config.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
        owner: config.owner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        patchworkProtocol: config.patchworkProtocol || '0x00000000001616E65bb9FdA42dFBb7155406549b',
    };

    try {
        // Dynamically import execa
        const { execa } = await import('execa');

        // Start Docker services
        console.log('Starting Docker services...');
        await execa('docker', ['compose', 'up', '-d'], {
            cwd: targetDir,
        });

        // Find the deploy script
        const files = await fs.readdir(scriptDir);
        const deployScripts = files.filter((file) => file.endsWith('-deploy.s.sol'));

        if (deployScripts.length === 0) {
            throw new Error('No deploy script found in ' + scriptDir);
        }
        if (deployScripts.length > 1) {
            throw new Error(`Multiple deploy scripts found in ${scriptDir}: ${deployScripts.join(', ')}`);
        }

        const deployScript = deployScripts[0];
        const scriptPath = path.join(scriptDir, deployScript);

        // Extract the actual contract name from the file
        const contractName = await extractContractName(scriptPath);
        console.log(`Found deploy contract: ${contractName}`);

        // Build forge command arguments
        const forgeArgs = [
            'script',
            '--optimize',
            '--optimizer-runs=200',
            '--broadcast',
            '-vvv',
            `${deployScript}:${contractName}`,
            '--rpc-url',
            deployConfig.rpcUrl,
            '--private-key',
            deployConfig.privateKey,
        ];

        // Set environment variables for the script
        const env = {
            ...process.env,
            OWNER: deployConfig.owner,
            PATCHWORK_PROTOCOL: deployConfig.patchworkProtocol,
        };

        // Log the command being executed (for debugging)
        console.log('Executing command:', 'forge', forgeArgs.join(' '));
        console.log('Working directory:', scriptDir);

        // Execute forge script
        console.log('Running deployment script...');
        await execa('forge', forgeArgs, {
            cwd: scriptDir,
            stdio: 'inherit',
            env,
        });

        console.log('Local development environment is ready!');
    } catch (error) {
        console.error('Error during startup:', error);
        throw error;
    }
}
