import { Command, OptionValues } from '@commander-js/extra-typings';
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
import { ErrorCode, PDKError } from './helpers/error';
import { setLogLevel } from './helpers/logger';
import { localDevDown, localDevUp } from './localDev';
import { networkList, networkSwitch } from './localDev/network';
import { launchWizardApp } from './wizardServer';

const CONTRACT_SCHEMA = `${__dirname}/schemas/patchwork-contract-config.schema.json`;
const PROJECT_SCHEMA = `${__dirname}/schemas/patchwork-project-config.schema.json`;

const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

async function getConfigPath(configFile?: string): Promise<string> {
    const configPath = configFile || (await findConfig());
    if (!configPath) {
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `No config file found:`);
    }
    return configPath;
}

interface GlobalOptions extends OptionValues {
    verbose?: boolean;
}

const program = new Command<[], GlobalOptions>();

program.name('pdk').version('1.0.0');

// Global error handler
program.on('error', (err) => {
    console.error('Global error:', err.message);
    process.exit(1);
});

program.option('-v, --verbose', 'Enable verbose logging');

program.hook('preAction', (thisCommand) => {
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
            throw new PDKError(ErrorCode.PDK_ERROR, `Error generating solidity`, { configFiles, options });
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
            throw new PDKError(ErrorCode.PDK_ERROR, `Error generating deploy scripts`, { configFiles, options });
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
        const configPath = await getConfigPath(configFile);
        await generateABIs(configPath);
    });

program
    .command('generateSchema')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder schema')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateSchema(configPath);
    });

program
    .command('generateEventHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder event code')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateEventHooks(configPath);
    });

program
    .command('generatePonderConfig')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder config code')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generatePonderConfig(configPath);
    });

program
    .command('generatePonderEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate ponder env file')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generatePonderEnv(configPath);
    });

program
    .command('generateWWWEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate www env file')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateWWWEnv(configPath);
    });

program
    .command('generateReactHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React hooks for app')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateReactHooks(configPath);
    });
program
    .command('generateReactComponents')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React components for app')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateReactComponents(configPath);
    });

program
    .command('generateDemoPage')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the demo app page')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        await generateDemoPage(configPath);
    });

program
    .command('generateAPI')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the trpc api')
    .action(async (configFile) => {
        const configPath = await getConfigPath(configFile);
        const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
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
    .command('up')
    .description('Run docker compose up for local dev')
    .action(async () => {
        console.info('Setting up docker compose for local dev');
        const configPath = await getConfigPath();
        await localDevUp(configPath);
    });

localDev
    .command('down')
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
