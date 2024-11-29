import { Command } from '@commander-js/extra-typings';
import path from 'path';
import { cliProcessor } from './common/cliProcessor';
import { findConfig } from './common/helpers/config';
import { ErrorCode, PDKError } from './common/helpers/error';
import { setLogLevel } from './common/helpers/logger';
import { convertToJSON, convertToTS } from './convert';
import { localDevDown, localDevUp } from './dev';
import {
    generateABIs,
    generateAll,
    generateAPI,
    generateContractDeployScripts,
    generateContracts,
    generateDemoPage,
    generateEventHooks,
    generatePonderConfig,
    generatePonderEnv,
    generateReactComponents,
    generateReactHooks,
    generateSchema,
    generateServices,
    generateWWWEnv,
} from './generate';
import { networkList, networkSwitch } from './network';
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

program
    .command('validate')
    .argument('[configFiles...]', 'Path to the JSON files')
    .description('Validate Patchwork contract or project configuration files')
    .action(async (configFiles) => {
        for (const configFile of configFiles || []) {
            if (!cliProcessor.validateConfig(configFile)) {
                throw new PDKError(ErrorCode.PDK_ERROR, `Error validating config ${configFile}`);
            }
        }
    });

const convert = program.command('convert').description('convert commands');
convert
    .command('toJSON')
    .argument('[configFiles...]', 'Path to TS files')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .description('Convert Typescript project configurations to JSON')
    .action(async (configFiles, options) => {
        await convertToJSON(configFiles, options.output);
    });

convert
    .command('toTS')
    .argument('[configFiles...]', 'Path to JSON files')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .description('Convert JSON project configurations to Typescript')
    .action(async (configFiles, options) => {
        await convertToTS(configFiles, options.output);
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
    .argument('[configFiles...]', 'Path to the JSON or TS files')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .option('-c, --contract <name>', 'Name of the specific contract to generate')
    .description('Generate patchwork contracts')
    .action(async (configFiles, options) => {
        await generateContracts(configFiles, options.output, options.contract);
    });

generate
    .command('deployScripts')
    .argument('[configFiles...]', 'Path to the JSON or TS files')
    .option('-c, --contractsDir <dir>', 'Directory containing the source Solidity files to deploy')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .description('Generate deploy scripts')
    .action(async (configFiles, options) => {
        await generateContractDeployScripts(configFiles, options.contractsDir, options.output);
    });

generate
    .command('ABIs')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate TypeScript ABIs for ponder')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateABIs(configPath);
    });

generate
    .command('schema')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder schema')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateSchema(configPath);
    });

generate
    .command('eventHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder event code')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateEventHooks(configPath);
    });

generate
    .command('ponderConfig')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder config code')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generatePonderConfig(configPath);
    });

generate
    .command('ponderEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate ponder env file')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generatePonderEnv(configPath);
    });

generate
    .command('wwwEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate www env file')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateWWWEnv(configPath);
    });

generate
    .command('reactHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React hooks for app')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateReactHooks(configPath);
    });
generate
    .command('reactComponents')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React components for app')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateReactComponents(configPath);
    });

generate
    .command('demoPage')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the demo app page')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateDemoPage(configPath);
    });

generate
    .command('api')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the trpc api')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
        const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
        await generateAPI(schemaPath, apiOutputDir);
    });

generate
    .command('all')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate all contracts and services')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateAll(configPath);
    });

generate
    .command('services')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate all services')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateServices(configPath);
    });

const dev = program.command('dev').description('local dev commands');

dev.command('up')
    .description('Run docker compose up for local dev')
    .action(async () => {
        console.info('Setting up docker compose for local dev');
        const configPath = await getConfigPath();
        await localDevUp(configPath);
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

(async () => {
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
