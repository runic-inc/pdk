import { Command } from '@commander-js/extra-typings';
import path from 'path';
import { CLIProcessor } from './cliProcessor';
import { generateABIs } from './generateABIs';
import { generateAll } from './generateAll';
import { generateAPI } from './generateApi';
import { generateDemoPage } from './generateDemoPage';
import { generateEventHooks } from './generateEventHooks';
import { generatePonderConfig } from './generatePonderConfig';
import { generatePonderEnv } from './generatePonderEnv';
import { generateReactComponents } from './generateReactComponents';
import { generateReactHooks } from './generateReactHooks';
import { generateSchema } from './generateSchema';
import { generateWWWEnv } from './generateWWWEnv';
import { findConfig } from './helpers/config';
import { localDevRun, localDevStop } from './localDev';
import { networkList, networkSwitch } from './localDev/network';
import { launchWizardApp } from './wizardServer';

const CONTRACT_SCHEMA = `${__dirname}/schemas/patchwork-contract-config.schema.json`;
const PROJECT_SCHEMA = `${__dirname}/schemas/patchwork-project-config.schema.json`;

const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

async function getConfigPath(configFile?: string): Promise<string> {
    const configPath = configFile || (await findConfig());
    if (!configPath) {
        console.error('No config file found.');
        process.exit(1);
    }
    return configPath;
}

const program = new Command();

program.name('pdk').version('1.0.0');

program
    .command('validate')
    .argument('[configFiles...]', 'Path to the JSON files')
    .description('Validate Patchwork contract or project configuration files')
    .action(async (configFiles) => {
        for (const configFile of configFiles || []) {
            if (!cliProcessor.validateConfig(configFile)) {
                process.exit(1);
            }
        }
    });

program
    .command('generateContracts')
    .argument('[configFiles...]', 'Path to the JSON or TS files')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .option('-c, --contract <name>', 'Name of the specific contract to generate')
    .description('Generate patchwork contracts')
    .action(async (configFiles, options) => {
        try {
            cliProcessor.generateSolidity(configFiles, options.output, options.contract);
        } catch (e) {
            process.exit(1);
        }
    });

program
    .command('generateDeployScripts')
    .argument('[configFiles...]', 'Path to the JSON or TS files')
    .option('-c, --contractsDir <dir>', 'Directory containing the source Solidity files to deploy')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .description('Generate deploy scripts')
    .action(async (configFiles, options) => {
        try {
            cliProcessor.generateDeployScripts(configFiles, options.contractsDir, options.output);
        } catch (e) {
            process.exit(1);
        }
    });

program
    .command('wizard')
    .description('Launch the Patchwork Wizard')
    .action(async () => {
        launchWizardApp();
    });

program
    .command('generateTsABIs')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate TypeScript ABIs for ponder')
    .action(async (configFile) => {
        console.log('Generating TypeScript ABIs...');
        const configPath = await getConfigPath(configFile);
        await generateABIs(configPath);
    });

program
    .command('generateSchema')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder schema')
    .action(async (configFile) => {
        console.log('Generating Ponder Schema');
        const configPath = await getConfigPath(configFile);
        await generateSchema(configPath);
    });

program
    .command('generateEventHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder event code')
    .action(async (configFile) => {
        console.log('Generating Ponder event code');
        const configPath = await getConfigPath(configFile);
        await generateEventHooks(configPath);
    });

program
    .command('generatePonderConfig')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder config code')
    .action(async (configFile) => {
        console.log('Generating Ponder config code');
        const configPath = await getConfigPath(configFile);
        await generatePonderConfig(configPath);
    });

program
    .command('generatePonderEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate ponder env file')
    .action(async (configFile) => {
        console.log('Generating Ponder env file');
        const configPath = await getConfigPath(configFile);
        await generatePonderEnv(configPath);
    });

program
    .command('generateWWWEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate www env file')
    .action(async (configFile) => {
        console.log('Generating WWW env file');
        const configPath = await getConfigPath(configFile);
        await generateWWWEnv(configPath);
    });

program
    .command('generateReactHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React hooks for app')
    .action(async (configFile) => {
        console.log('Generating React hooks for app');
        const configPath = await getConfigPath(configFile);
        await generateReactHooks(configPath);
    });

program
    .command('generateReactComponents')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React components for app')
    .action(async (configFile) => {
        console.log('Generating React components for app');
        const configPath = await getConfigPath(configFile);
        await generateReactComponents(configPath);
    });

program
    .command('generateDemoPage')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the demo app page')
    .action(async (configFile) => {
        console.log('Generating the demo app page');
        const configPath = await getConfigPath(configFile);
        await generateDemoPage(configPath);
    });

program
    .command('generateAPI')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the trpc api')
    .action(async (configFile) => {
        console.log('Generating API');
        const configPath = await getConfigPath(configFile);
        const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
        if (!schemaPath) {
            console.error('No ponder schema file found.');
            process.exit(1);
        }
        const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
        await generateAPI(schemaPath, apiOutputDir);
    });

program
    .command('generateAll')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate all components')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateAll(configPath);
    });

const localDev = program.command('localDev').description('local dev commands');

localDev
    .command('run')
    .description('Run docker compose for local dev')
    .action(async () => {
        console.log('Running docker compose for local dev');
        const configPath = await getConfigPath();
        await localDevRun(configPath);
    });

localDev
    .command('stop')
    .description('Stop docker compose for local dev')
    .action(async () => {
        console.log('Stopping docker compose for local dev');
        const configPath = await getConfigPath();
        await localDevStop(configPath);
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
        process.exit(1);
    }
})();
