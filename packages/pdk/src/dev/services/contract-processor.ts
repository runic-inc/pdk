import fs from 'fs/promises';
import path from 'path';
import { BlockNumberService } from '../services/block-number';
import { DeployConfig, DeploymentAddresses } from '../types';

export class ContractProcessor {
    private blockNumberService: BlockNumberService;

    constructor() {
        this.blockNumberService = new BlockNumberService();
    }

    async processContracts(configPath: string, config: DeployConfig = {}, shouldDeploy = false): Promise<DeploymentAddresses> {
        const action = shouldDeploy ? 'Deploying' : 'Calculating addresses and bytecode for';
        console.info(`${action} contracts...`);

        const targetDir = path.dirname(configPath);
        const contractsDir = path.join(targetDir, 'contracts');
        const scriptDir = path.join(contractsDir, 'script');

        const deployConfig = {
            rpcUrl: shouldDeploy ? config.rpcUrl || 'http://localhost:1234' : undefined,
            privateKey: config.privateKey || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            owner: config.owner || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            patchworkProtocol: config.patchworkProtocol || '0x00000000001616E65bb9FdA42dFBb7155406549b',
        };

        if (shouldDeploy && !deployConfig.rpcUrl) {
            throw new Error('Missing required RPC URL for deployment');
        }

        try {
            const deployScript = await this.findDeployScript(scriptDir);
            const scriptPath = path.join(scriptDir, deployScript);
            const contractNames = await this.extractContractNamesFromScript(scriptPath);

            console.info(`\nFound contracts: ${contractNames.join(', ')}`);

            const forgeArgs = await this.buildForgeArgs(deployScript, shouldDeploy, deployConfig);
            const { stdout } = await this.runForgeCommand(forgeArgs, scriptDir, deployConfig);

            // Get deployment block if deploying
            const deploymentBlock = shouldDeploy && deployConfig.rpcUrl ? await this.blockNumberService.getDeploymentBlockNumber(deployConfig.rpcUrl) : 0n;

            const deployedContracts = await this.parseDeploymentOutput(stdout, contractNames, Number(deploymentBlock));

            this.displayResults(deployedContracts);
            return deployedContracts;
        } catch (error) {
            console.error(`${shouldDeploy ? 'Deployment' : 'Calculation'} failed:`, error);
            throw error;
        }
    }

    private async findDeployScript(scriptDir: string): Promise<string> {
        const files = await fs.readdir(scriptDir);
        const deployScripts = files.filter((file) => file.endsWith('-deploy.s.sol'));

        if (deployScripts.length === 0) {
            throw new Error(`No deploy script found in ${scriptDir}`);
        }
        if (deployScripts.length > 1) {
            throw new Error(`Multiple deploy scripts found in ${scriptDir}: ${deployScripts.join(', ')}`);
        }

        return deployScripts[0];
    }

    private async extractContractNamesFromScript(scriptPath: string): Promise<string[]> {
        const content = await fs.readFile(scriptPath, 'utf-8');
        const structMatch = content.match(/struct\s+DeploymentAddresses\s*{([^}]+)}/s);

        if (!structMatch) {
            throw new Error('Could not find DeploymentAddresses struct in script');
        }

        return structMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('DeploymentInfo'))
            .map((line) => line.split(/\s+/)[1].replace(';', ''));
    }

    private async buildForgeArgs(deployScript: string, shouldDeploy: boolean, deployConfig: DeployConfig): Promise<string[]> {
        const forgeArgs = ['script', '--optimize', '--optimizer-runs=200', '-vvv', deployScript];

        if (shouldDeploy && deployConfig.rpcUrl) {
            forgeArgs.push('--rpc-url', deployConfig.rpcUrl, '--private-key', deployConfig.privateKey!, '--broadcast');
        } else {
            forgeArgs.push('--offline');
        }

        return forgeArgs;
    }

    private async runForgeCommand(forgeArgs: string[], scriptDir: string, deployConfig: DeployConfig): Promise<{ stdout: string }> {
        const { execa } = await import('execa');
        return execa('forge', forgeArgs, {
            cwd: scriptDir,
            env: {
                ...process.env,
                OWNER: deployConfig.owner,
                PATCHWORK_PROTOCOL: deployConfig.patchworkProtocol,
                TRY_DEPLOY: deployConfig.rpcUrl ? 'true' : 'false',
            },
            stdio: ['inherit', 'pipe', 'inherit'],
        });
    }

    private async parseDeploymentOutput(output: string, contractNames: string[], deploymentBlock: number): Promise<DeploymentAddresses> {
        const deployedContracts: DeploymentAddresses = {};
        const lines = output.split('\n');
        const returnLine = lines.find((line) => line.includes('DeploymentAddresses({'));

        if (!returnLine) {
            console.error('Deployment output:', output);
            throw new Error('Could not find deployment addresses in output');
        }

        for (const contractName of contractNames) {
            const regex = new RegExp(
                `${contractName}:\\s*DeploymentInfo\\({\\s*deployedAddress:\\s*(0x[a-fA-F0-9]{40}),\\s*bytecodeHash:\\s*(0x[a-fA-F0-9]{64})\\s*}`,
            );
            const match = returnLine.match(regex);

            if (match) {
                deployedContracts[contractName] = {
                    deployedAddress: match[1],
                    bytecodeHash: match[2],
                    deploymentBlock,
                };
            }
        }

        const missingContracts = contractNames.filter((name) => !deployedContracts[name]);
        if (missingContracts.length > 0) {
            console.error('Deployment output:', output);
            throw new Error(`Missing addresses for contracts: ${missingContracts.join(', ')}`);
        }

        return deployedContracts;
    }

    private displayResults(deployedContracts: DeploymentAddresses): void {
        console.info('\nResults:');
        console.info('═════════════════════════════════════════════════════════════════════════════════════════');
        console.info('Contract Name'.padEnd(20), '│', 'Address'.padEnd(42), '│', 'Block'.padEnd(10), '│', 'Bytecode Hash');
        console.info('─'.repeat(20), '┼', '─'.repeat(42), '┼', '─'.repeat(10), '┼', '─'.repeat(66));
        Object.entries(deployedContracts).forEach(([contract, info]) => {
            console.info(contract.padEnd(20), '│', info.deployedAddress.padEnd(42), '│', info.deploymentBlock.toString().padEnd(10), '│', info.bytecodeHash);
        });
        console.info('═════════════════════════════════════════════════════════════════════════════════════════');
    }
}
