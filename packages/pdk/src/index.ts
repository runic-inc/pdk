import { Command } from '@commander-js/extra-typings';
import path from 'path';
import { localDevDown, localDevUp } from './commands/dev';
import { generateAll, generateContractDeployScripts, generateContracts } from './commands/generate';
import { networkList, networkSwitch } from './commands/network';
import { status } from './commands/status';
import { cliProcessor } from './common/cliProcessor';
import { findConfig, importPatchworkConfig } from './common/helpers/config';
import { ErrorCode, PDKError } from './common/helpers/error';
import { setLogLevel } from './common/helpers/logger';
import { GeneratorService } from './services/generator';
import LockFileManager from './services/lockFile';
import { launchWizardApp } from './wizardServer';

async function getConfigPath(configFile?: string): Promise<string> {
    const configPath = configFile || (await findConfig());
    if (!configPath) {
        throw new PDKError(
            ErrorCode.FILE_NOT_FOUND,
            `No patchwork project config file found: ${configFile !== undefined ? configFile : 'patchwork.config.ts'}`,
        );
    }
    return configPath;
}

const program = new Command()
    .name('pdk')
    //.version('0.1.0')

    // options and hook have to be chained for types to properly resolve in preAction hook
    .option('-v, --verbose', 'Enable verbose logging')
    .hook('preAction', (thisCommand) => {
        const opts = thisCommand.opts();
        setLogLevel(opts.verbose ? 'debug' : 'info');
    });

async function createLockFileMgr(optionalConfigPath?: string): Promise<LockFileManager> {
    const configPath = await getConfigPath(optionalConfigPath);
    const projectConfig = await importPatchworkConfig(configPath);
    const lockFileManager = new LockFileManager(configPath);
    const ctx = lockFileManager.getCtx();
    ctx.configPath = configPath;
    ctx.config = projectConfig;
    ctx.rootDir = path.dirname(configPath);
    if (!ctx.artifacts) ctx.artifacts = {};
    lockFileManager.updateAndSaveCtx(ctx);
    return lockFileManager;
}

(async () => {
    program
        .command('status')
        .description('Show the status of the current project')
        .action(async () => {
            const configPath = await getConfigPath();
            await status(configPath);
        });

    program
        .command('wizard')
        .description('Launch the Patchwork Wizard')
        .action(async () => {
            launchWizardApp();
        });

    const generate = program.command('generate').description('generate commands');

    generate
        .command('contracts')
        .argument('[configFile]', 'Path to the patchwork project configuration file')
        .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
        .option('-c, --contract <name>', 'Name of the specific contract to generate')
        .description('Generate patchwork contracts')
        .action(async (configFile, options) => {
            const ctx = (await createLockFileMgr(configFile)).getCtx();
            await generateContracts(ctx.config, options.output, options.contract);
        });

    generate
        .command('deployScripts')
        .argument('[configFile]', 'Path to the patchwork project configuration file')
        .option('-c, --contractsDir <dir>', 'Directory containing the source Solidity files to deploy')
        .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
        .description('Generate deploy scripts')
        .action(async (configFile, options) => {
            const ctx = (await createLockFileMgr(configFile)).getCtx();
            await generateContractDeployScripts(ctx.config, options.contractsDir, options.output);
        });

    generate
        .command('all')
        .argument('[configFile]', 'Path to the patchwork project configuration file')
        .description('Generate all contracts and services')
        .action(async (configFile) => {
            const lockFileMgr = await createLockFileMgr(configFile);
            await generateAll(lockFileMgr.getCtx().config);
            const generatorService = new GeneratorService(lockFileMgr);
            await generatorService.runAllGenerators();
        });

    generate
        .command('services')
        .argument('[configFile]', 'Path to the patchwork project configuration file')
        .description('Generate all services')
        .action(async (configFile) => {
            const lockFileMgr = await createLockFileMgr(configFile);
            await new GeneratorService(lockFileMgr).runAllGenerators();
        });

    generate
        .command('contractBuild')
        .argument('[configFile]', 'Path to the patchwork project configuration file')
        .description('Build contracts using Forge')
        .action(async (configFile) => {
            const ctx = (await createLockFileMgr(configFile)).getCtx();
            await cliProcessor.buildContracts(ctx.rootDir);
        });

    // create a default ctx as plugins cannot take a special config file since they are discovered before CLI command configuration
    try {
        const lockFileMgr = await createLockFileMgr();
        for (const plugin of lockFileMgr.getCtx().config.plugins) {
            if (plugin.generate) {
                generate
                    .command(plugin.name.toLowerCase())
                    .description(`Run ${plugin.name} plugin generators`)
                    .action(async () => {
                        await new GeneratorService(lockFileMgr).runGenerator(plugin.name.toLowerCase());
                    });
            }
        }
    } catch (PDKError) {
        // No default config file found to configure plugin CLI commands so just omit.
    }

    // Local dev commands will only rely on a default patchwork.config.ts file as they are for a project generated using create-patchwork
    const dev = program.command('dev').description('local dev commands');

    dev.command('up')
        .description('Run docker compose up for local dev')
        .action(async () => {
            console.info('Setting up docker compose for local dev');
            const lockFileMgr = await createLockFileMgr();
            await localDevUp(lockFileMgr.getCtx().configPath, {}, new GeneratorService(lockFileMgr));
        });

    dev.command('down')
        .description('Run docker compose down for local dev')
        .action(async () => {
            console.info('Tearing down docker compose for local dev');
            const lockFileMgr = await createLockFileMgr();
            await localDevDown(lockFileMgr.getCtx().configPath);
        });

    const network = program.command('network').description('network commands');

    network
        .command('list')
        .description('list configured networks')
        .action(async () => {
            const lockFileMgr = await createLockFileMgr();
            await networkList(lockFileMgr.getCtx().configPath);
        });

    network
        .command('switch')
        .argument('<network>', 'Network to switch to')
        .description('switch selected network')
        .action(async (network) => {
            const lockFileMgr = await createLockFileMgr();
            await networkSwitch(lockFileMgr.getCtx().configPath, network);
        });

    try {
        await program.parseAsync();
    } catch (error) {
        if (error instanceof PDKError) {
            console.error(`${error.code}: `, error.message);
        } else {
            console.error('Unknown Error:', error);
        }
        process.exit(1);
    }
})();
