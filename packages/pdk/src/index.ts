import path from 'path';
import yargs, { ArgumentsCamelCase } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { CLIProcessor } from './cliProcessor';
import { generateABIs } from './generateABIs';
import { generateAll } from './generateAll';
import { generateAPI } from './generateApi';
import { generateDemoPage } from './generateDemoPage';
import { generateEventHooks } from './generateEventHooks';
import { generatePonderConfig } from './generatePonderConfig';
import { generateReactComponents } from './generateReactComponents';
import { generateReactHooks } from './generateReactHooks';
import { generateSchema } from './generateSchema';
import { findConfig } from './helpers/config';
import { localDevRun } from './localDev/run';
import { launchWizardApp } from './wizardServer';
type ValidateArgs = {
    configFiles?: string[];
};

type GenerateContractArgs = {
    configFiles?: string[];
    output?: string;
    contract?: string;
};

type GenerateDeployScriptArgs = {
    configFiles?: string[];
    output?: string;
    contractsDir?: string;
};

type ConfigFileArg = {
    configFile?: string;
};

const CONTRACT_SCHEMA = `${__dirname}/schemas/patchwork-contract-config.schema.json`;
const PROJECT_SCHEMA = `${__dirname}/schemas/patchwork-project-config.schema.json`;

const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

// Utility function to get and validate config path
async function getConfigPath(configFile?: string): Promise<string> {
    const configPath = configFile || (await findConfig());
    if (!configPath) {
        console.error('No config file found.');
        process.exit(1);
    }
    console.log('Using config file:', configPath);
    return configPath;
}

const argv = yargs(hideBin(process.argv))
    .command(
        'validate [configFiles..]',
        'Validate Patchwork contract or project configuration files',
        (yargs) => {
            yargs.positional('configFiles', {
                describe: 'Path to the JSON files',
                type: 'string',
            });
        },
        (argv: ArgumentsCamelCase<ValidateArgs>) => {
            for (const configFile of argv.configFiles || []) {
                if (!cliProcessor.validateConfig(configFile)) {
                    process.exit(1);
                }
            }
        },
    )
    .command(
        'generateContracts [configFiles..]',
        'Generate patchwork contracts',
        (yargs) => {
            yargs
                .positional('configFiles', {
                    describe: 'Path to the JSON or TS files',
                    type: 'string',
                })
                .option('output', {
                    alias: 'o',
                    type: 'string',
                    description: 'Output directory for the generated Solidity files',
                })
                .option('contract', {
                    alias: 'c',
                    type: 'string',
                    description: 'Name of the specific contract to generate (optional for project configs)',
                });
        },
        (argv: ArgumentsCamelCase<GenerateContractArgs>) => {
            try {
                cliProcessor.generateSolidity(argv.configFiles || [], argv.output, argv.contract);
            } catch (e) {
                process.exit(1);
            }
        },
    )
    .command(
        'generateDeployScripts [configFiles..]',
        'Generate deploy scripts',
        (yargs) => {
            yargs
                .positional('configFiles', {
                    describe: 'Path to the JSON or TS files',
                    type: 'string',
                })
                .option('contractsDir', {
                    alias: 'c',
                    type: 'string',
                    description: 'Directory containing the source Solidity files to deploy (relative to where deploy script will run)',
                })
                .option('output', {
                    alias: 'o',
                    type: 'string',
                    description: 'Output directory for the generated Solidity files',
                });
        },
        (argv: ArgumentsCamelCase<GenerateDeployScriptArgs>) => {
            try {
                cliProcessor.generateDeployScripts(argv.configFiles || [], argv.contractsDir, argv.output);
            } catch (e) {
                process.exit(1);
            }
        },
    )
    .command('wizard', 'Launch the Patchwork Wizard', {}, () => {
        launchWizardApp();
    })
    .command(
        'generateTsABIs [configFile]',
        'Generate TypeScript ABIs for ponder',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating TypeScript ABIs...');
            const configPath = await getConfigPath(argv.configFile);
            await generateABIs(configPath);
        },
    )
    .command(
        'generateSchema [configFile]',
        'Generate the ponder schema',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating Ponder Schema');
            const configPath = await getConfigPath(argv.configFile);
            await generateSchema(configPath);
        },
    )
    .command(
        'generateEventHooks [configFile]',
        'Generate the ponder event code',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating Ponder event code');
            const configPath = await getConfigPath(argv.configFile);
            await generateEventHooks(configPath);
        },
    )
    .command(
        'generatePonderConfig [configFile]',
        'Generate the ponder config code',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating Ponder config code');
            const configPath = await getConfigPath(argv.configFile);
            await generatePonderConfig(configPath);
        },
    )
    .command(
        'generateReactHooks [configFile]',
        'Generate the React hooks for app',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating React hooks for app');
            const configPath = await getConfigPath(argv.configFile);
            await generateReactHooks(configPath);
        },
    )
    .command(
        'generateReactComponents [configFile]',
        'Generate the React components for app',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating React components for app');
            const configPath = await getConfigPath(argv.configFile);
            await generateReactComponents(configPath);
        },
    )
    .command(
        'generateDemoPage [configFile]',
        'Generate the demo app page',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating the demo app page');
            const configPath = await getConfigPath(argv.configFile);
            await generateDemoPage(configPath);
        },
    )
    .command(
        'generateAPI [configFile]',
        'Generate the trpc api',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            console.log('Generating API');
            const configPath = await getConfigPath(argv.configFile);
            const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
            // const schemaPath = await findPonderSchema();
            if (!schemaPath) {
                console.error('No ponder schema file found.');
                process.exit(1);
            }
            const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
            await generateAPI(schemaPath, apiOutputDir);
        },
    )
    .command(
        'generateAll [configFile]',
        'Generate all components (TypeScript ABIs, Ponder Schema, Event Hooks, Ponder Config, API, React Hooks, React Components, and Demo Page)',
        (yargs) => {
            yargs.positional('configFile', {
                describe: 'Path to the config file',
                type: 'string',
            });
        },
        async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
            const configPath = await getConfigPath(argv.configFile);
            await generateAll(configPath);
        },
    )
    .command('localDev', 'local dev commands', (yargs) => {
        return yargs.command('run', 'Run docker compose for local dev', {}, async () => {
            console.log('Running docker compose for local dev');
            const configPath = await getConfigPath();
            await localDevRun(configPath);
        });
    })
    .demandCommand(1, 'You must provide a valid command')
    .help('h')
    .alias('h', 'help').argv;
