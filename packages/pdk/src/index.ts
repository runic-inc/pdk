import { Command } from '@commander-js/extra-typings';
import path from 'path';
import { localDevDown, localDevUp } from './commands/dev';
import { networkList, networkSwitch } from './commands/network';
import { status } from './commands/status';
import { findConfig, importPatchworkConfig } from './common/helpers/config';
import { ErrorCode, PDKError } from './common/helpers/error';
import { setLogLevel } from './common/helpers/logger';
import { GeneratorService } from './services/generator';
import LockFileManager from './services/lockFile';
import { PDKPluginCommand } from './types';
import { launchWizardApp } from './wizardServer';

async function getConfigPath(configFile?: string): Promise<string> {
    const configPath = configFile || (await findConfig());
    if (!configPath) {
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `No config file found:`);
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

(async () => {
    const configPath = await getConfigPath();
    const projectConfig = await importPatchworkConfig(configPath);
    const lockFileManager = new LockFileManager(configPath);
    const ctx = lockFileManager.getCtx();
    ctx.config = projectConfig;
    ctx.rootDir = path.dirname(configPath);
    if (!ctx.artifacts) ctx.artifacts = {};
    lockFileManager.updateAndSaveCtx(ctx);
    const generatorService = new GeneratorService(lockFileManager);
    PDKPluginCommand.setLockFileManager(lockFileManager);

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
        .description('Generate patchwork contracts')
        .action(async (options) => {
            await generatorService.runGenerator('contracts');
        });

    generate
        .command('deployScripts')
        .description('Generate deploy scripts')
        .action(async (options) => {
            await generatorService.runGenerator('deploy');
        });

    generate
        .command('all')
        // .argument('[configFile]', 'Path to the config file')
        .description('Generate all contracts and services')
        .action(async () => {
            //await generateCore(ctx.config);
            await generatorService.runAllGenerators();
        });

    generate
        .command('core')
        // .argument('[configFile]', 'Path to the config file')
        .description('Generate contracts and deploy scripts, and build artifacts')
        .action(async () => {
            //await generateCore(ctx.config);
            await generatorService.runAllCoreGenerators();
        });

    generate
        .command('plugins')
        // .argument('[configFile]', 'Path to the config file')
        .description('Run all plugin generators')
        .action(async () => {
            await generatorService.runAllPluginGenerators();
        });

    // generate
    //     .command('contractBuild')
    //     // .argument('[configFile]', 'Path to the config file')
    //     .description('Build contracts using Forge')
    //     .action(async () => {
    //         await cliProcessor.buildContracts(ctx.rootDir);
    //     });

    for (const plugin of ctx.config.plugins) {
        if (plugin.generate) {
            generate
                .command(plugin.name.toLowerCase())
                .description(`Run ${plugin.name} plugin generators`)
                .action(async () => {
                    await generatorService.runGenerator(plugin.name.toLowerCase());
                });
        }
        if (plugin.commands) {
            for (const command of plugin.commands()) {
                program.addCommand(command.getCommand());
            }
        }
    }

    const dev = program.command('dev').description('local dev commands');

    dev.command('up')
        .description('Run docker compose up for local dev')
        .action(async () => {
            console.info('Setting up docker compose for local dev');
            const configPath = await getConfigPath();
            await localDevUp(configPath, {}, generatorService);
        });

    dev.command('down')
        .description('Run docker compose down for local dev')
        .action(async () => {
            console.info('Tearing down docker compose for local dev');
            const configPath = await getConfigPath();
            await localDevDown(configPath);
        });

    const network = program.command('network').description('network commands');

    network
        .command('list')
        .description('list configured networks')
        .action(async () => {
            const configPath = await getConfigPath();
            await networkList(configPath);
        });

    network
        .command('switch')
        .argument('<network>', 'Network to switch to')
        .description('switch selected network')
        .action(async (network) => {
            const configPath = await getConfigPath();
            await networkSwitch(configPath, network);
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
