import { Command } from 'commander';
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

type CommandAction = (...args: any[]) => Promise<void> | void;

// convenience method to allow us to catch errors in async functions
const wrapAction = (action: CommandAction): CommandAction => {
    return async (...args) => {
        try {
            await action(...args);
        } catch (error) {
            program.error(error instanceof Error ? error.message : String(error));
        }
    };
};

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
    .action(
        wrapAction(async (configFiles: string[]) => {
            for (const configFile of configFiles || []) {
                if (!cliProcessor.validateConfig(configFile)) {
                    process.exit(1);
                }
            }
        }),
    );

program
    .command('generateContracts')
    .argument('[configFiles...]', 'Path to the JSON or TS files')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .option('-c, --contract <name>', 'Name of the specific contract to generate')
    .description('Generate patchwork contracts')
    .action(
        wrapAction(async (configFiles: string[], options) => {
            try {
                cliProcessor.generateSolidity(configFiles, options.output, options.contract);
            } catch (e) {
                process.exit(1);
            }
        }),
    );

program
    .command('generateDeployScripts')
    .argument('[configFiles...]', 'Path to the JSON or TS files')
    .option('-c, --contractsDir <dir>', 'Directory containing the source Solidity files to deploy')
    .option('-o, --output <dir>', 'Output directory for the generated Solidity files')
    .description('Generate deploy scripts')
    .action(
        wrapAction(async (configFiles: string[], options) => {
            try {
                cliProcessor.generateDeployScripts(configFiles, options.contractsDir, options.output);
            } catch (e) {
                process.exit(1);
            }
        }),
    );

program
    .command('wizard')
    .description('Launch the Patchwork Wizard')
    .action(
        wrapAction(() => {
            launchWizardApp();
        }),
    );

program
    .command('generateTsABIs')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate TypeScript ABIs for ponder')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating TypeScript ABIs...');
            const configPath = await getConfigPath(configFile);
            await generateABIs(configPath);
        }),
    );

program
    .command('generateSchema')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder schema')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating Ponder Schema');
            const configPath = await getConfigPath(configFile);
            await generateSchema(configPath);
        }),
    );

program
    .command('generateEventHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder event code')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating Ponder event code');
            const configPath = await getConfigPath(configFile);
            await generateEventHooks(configPath);
        }),
    );

program
    .command('generatePonderConfig')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the ponder config code')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating Ponder config code');
            const configPath = await getConfigPath(configFile);
            await generatePonderConfig(configPath);
        }),
    );

program
    .command('generatePonderEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate ponder env file')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating Ponder env file');
            const configPath = await getConfigPath(configFile);
            await generatePonderEnv(configPath);
        }),
    );

program
    .command('generateWWWEnv')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate www env file')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating WWW env file');
            const configPath = await getConfigPath(configFile);
            await generateWWWEnv(configPath);
        }),
    );

program
    .command('generateReactHooks')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React hooks for app')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating React hooks for app');
            const configPath = await getConfigPath(configFile);
            await generateReactHooks(configPath);
        }),
    );

program
    .command('generateReactComponents')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the React components for app')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating React components for app');
            const configPath = await getConfigPath(configFile);
            await generateReactComponents(configPath);
        }),
    );

program
    .command('generateDemoPage')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the demo app page')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating the demo app page');
            const configPath = await getConfigPath(configFile);
            await generateDemoPage(configPath);
        }),
    );

program
    .command('generateAPI')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate the trpc api')
    .action(
        wrapAction(async (configFile) => {
            console.log('Generating API');
            const configPath = await getConfigPath(configFile);
            const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
            if (!schemaPath) {
                console.error('No ponder schema file found.');
                process.exit(1);
            }
            const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
            await generateAPI(schemaPath, apiOutputDir);
        }),
    );

program
    .command('generateAll')
    .argument('[configFile]', 'Path to the config file')
    .description('Generate all components')
    .action(
        wrapAction(async (configFile) => {
            const configPath = await getConfigPath(configFile);
            await generateAll(configPath);
        }),
    );

const localDev = program.command('localDev').description('local dev commands');

localDev
    .command('run')
    .description('Run docker compose for local dev')
    .action(
        wrapAction(async () => {
            console.log('Running docker compose for local dev');
            const configPath = await getConfigPath();
            await localDevRun(configPath);
        }),
    );

localDev
    .command('stop')
    .description('Stop docker compose for local dev')
    .action(
        wrapAction(async () => {
            console.log('Stopping docker compose for local dev');
            const configPath = await getConfigPath();
            await localDevStop(configPath);
        }),
    );

const network = program.command('network').description('network commands');

network
    .command('list')
    .description('list configured networks')
    .action(
        wrapAction(async () => {
            const configPath = await getConfigPath();
            await networkList(configPath);
        }),
    );

network
    .command('switch')
    .argument('<network>', 'Network to switch to')
    .description('switch selected network')
    .action(
        wrapAction(async (network) => {
            const configPath = await getConfigPath();
            await networkSwitch(configPath, network);
        }),
    );

program.exitOverride((err) => {
    if (err.code === 'commander.missingArgument') {
        console.log('Missing required argument');
        console.error('Error:', err.message);
        process.exit(1);
    }
    console.log('error code is:', err.code);
    console.log('Error before throw:', err.message);
    // throw err;
});

// Global error handler
program.on('error', (err) => {
    console.error('Global error:', err.message);
    process.exit(1);
});

program.parse(process.argv);

// import path from 'path';
// import yargs, { ArgumentsCamelCase } from 'yargs';
// import { hideBin } from 'yargs/helpers';
// import { CLIProcessor } from './cliProcessor';
// import { generateABIs } from './generateABIs';
// import { generateAll } from './generateAll';
// import { generateAPI } from './generateApi';
// import { generateDemoPage } from './generateDemoPage';
// import { generateEventHooks } from './generateEventHooks';
// import { generatePonderConfig } from './generatePonderConfig';
// import { generatePonderEnv } from './generatePonderEnv';
// import { generateReactComponents } from './generateReactComponents';
// import { generateReactHooks } from './generateReactHooks';
// import { generateSchema } from './generateSchema';
// import { generateWWWEnv } from './generateWWWEnv';
// import { findConfig } from './helpers/config';
// import { localDevRun, localDevStop } from './localDev';
// import { networkList, networkSwitch } from './network';
// import { launchWizardApp } from './wizardServer';
// type ValidateArgs = {
//     configFiles?: string[];
// };

// type GenerateContractArgs = {
//     configFiles?: string[];
//     output?: string;
//     contract?: string;
// };

// type GenerateDeployScriptArgs = {
//     configFiles?: string[];
//     output?: string;
//     contractsDir?: string;
// };

// type ConfigFileArg = {
//     configFile?: string;
// };

// const CONTRACT_SCHEMA = `${__dirname}/schemas/patchwork-contract-config.schema.json`;
// const PROJECT_SCHEMA = `${__dirname}/schemas/patchwork-project-config.schema.json`;

// let commandPath: string[] = [];

// const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

// // Utility function to get and validate config path
// async function getConfigPath(configFile?: string): Promise<string> {
//     const configPath = configFile || (await findConfig());
//     if (!configPath) {
//         console.error('No config file found.');
//         process.exit(1);
//     }
//     return configPath;
// }

// const argv = yargs(hideBin(process.argv))
//     .command(
//         'validate [configFiles..]',
//         'Validate Patchwork contract or project configuration files',
//         (yargs) => {
//             yargs.positional('configFiles', {
//                 describe: 'Path to the JSON files',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ValidateArgs>) => {
//             for (const configFile of argv.configFiles || []) {
//                 if (!cliProcessor.validateConfig(configFile)) {
//                     process.exit(1);
//                 }
//             }
//         },
//     )
//     .command(
//         'generateContracts [configFiles..]',
//         'Generate patchwork contracts',
//         (yargs) => {
//             yargs
//                 .positional('configFiles', {
//                     describe: 'Path to the JSON or TS files',
//                     type: 'string',
//                 })
//                 .option('output', {
//                     alias: 'o',
//                     type: 'string',
//                     description: 'Output directory for the generated Solidity files',
//                 })
//                 .option('contract', {
//                     alias: 'c',
//                     type: 'string',
//                     description: 'Name of the specific contract to generate (optional for project configs)',
//                 });
//         },
//         async (argv: ArgumentsCamelCase<GenerateContractArgs>) => {
//             try {
//                 cliProcessor.generateSolidity(argv.configFiles || [], argv.output, argv.contract);
//             } catch (e) {
//                 process.exit(1);
//             }
//         },
//     )
//     .command(
//         'generateDeployScripts [configFiles..]',
//         'Generate deploy scripts',
//         (yargs) => {
//             yargs
//                 .positional('configFiles', {
//                     describe: 'Path to the JSON or TS files',
//                     type: 'string',
//                 })
//                 .option('contractsDir', {
//                     alias: 'c',
//                     type: 'string',
//                     description: 'Directory containing the source Solidity files to deploy (relative to where deploy script will run)',
//                 })
//                 .option('output', {
//                     alias: 'o',
//                     type: 'string',
//                     description: 'Output directory for the generated Solidity files',
//                 });
//         },
//         async (argv: ArgumentsCamelCase<GenerateDeployScriptArgs>) => {
//             try {
//                 cliProcessor.generateDeployScripts(argv.configFiles || [], argv.contractsDir, argv.output);
//             } catch (e) {
//                 process.exit(1);
//             }
//         },
//     )
//     .command('wizard', 'Launch the Patchwork Wizard', {}, () => {
//         launchWizardApp();
//     })
//     .command(
//         'generateTsABIs [configFile]',
//         'Generate TypeScript ABIs for ponder',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating TypeScript ABIs...');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateABIs(configPath);
//         },
//     )
//     .command(
//         'generateSchema [configFile]',
//         'Generate the ponder schema',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating Ponder Schema');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateSchema(configPath);
//         },
//     )
//     .command(
//         'generateEventHooks [configFile]',
//         'Generate the ponder event code',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating Ponder event code');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateEventHooks(configPath);
//         },
//     )
//     .command(
//         'generatePonderConfig [configFile]',
//         'Generate the ponder config code',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating Ponder config code');
//             const configPath = await getConfigPath(argv.configFile);
//             await generatePonderConfig(configPath);
//         },
//     )
//     .command(
//         'generatePonderEnv [configFile]',
//         'Generate ponder env file',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating Ponder env file');
//             const configPath = await getConfigPath(argv.configFile);
//             await generatePonderEnv(configPath);
//         },
//     )
//     .command(
//         'generateWWWEnv [configFile]',
//         'Generate www env file',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating WWW env file');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateWWWEnv(configPath);
//         },
//     )
//     .command(
//         'generateReactHooks [configFile]',
//         'Generate the React hooks for app',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating React hooks for app');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateReactHooks(configPath);
//         },
//     )
//     .command(
//         'generateReactComponents [configFile]',
//         'Generate the React components for app',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating React components for app');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateReactComponents(configPath);
//         },
//     )
//     .command(
//         'generateDemoPage [configFile]',
//         'Generate the demo app page',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating the demo app page');
//             const configPath = await getConfigPath(argv.configFile);
//             await generateDemoPage(configPath);
//         },
//     )
//     .command(
//         'generateAPI [configFile]',
//         'Generate the trpc api',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             console.log('Generating API');
//             const configPath = await getConfigPath(argv.configFile);
//             const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
//             // const schemaPath = await findPonderSchema();
//             if (!schemaPath) {
//                 console.error('No ponder schema file found.');
//                 process.exit(1);
//             }
//             const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
//             await generateAPI(schemaPath, apiOutputDir);
//         },
//     )
//     .command(
//         'generateAll [configFile]',
//         'Generate all components (TypeScript ABIs, Ponder Schema, Event Hooks, Ponder Config, API, React Hooks, React Components, and Demo Page)',
//         (yargs) => {
//             yargs.positional('configFile', {
//                 describe: 'Path to the config file',
//                 type: 'string',
//             });
//         },
//         async (argv: ArgumentsCamelCase<ConfigFileArg>) => {
//             const configPath = await getConfigPath(argv.configFile);
//             await generateAll(configPath);
//         },
//     )
//     .command('localDev', 'local dev commands', async (yargs) => {
//         return yargs
//             .command('run', 'Run docker compose for local dev', {}, async () => {
//                 console.log('Running docker compose for local dev');
//                 const configPath = await getConfigPath();
//                 await localDevRun(configPath);
//             })
//             .command('stop', 'Stop docker compose for local dev', {}, async () => {
//                 console.log('Stopping docker compose for local dev');
//                 const configPath = await getConfigPath();
//                 await localDevStop(configPath);
//             })
//             .demandCommand(1, 'You must provide a valid command')
//             .strict()
//             .help('h')
//             .alias('h', 'help').argv;
//     })
//     .command('network', 'network commands', async (yargs) => {
//         return yargs
//             .command('list', 'list configured networks', {}, async () => {
//                 const configPath = await getConfigPath();
//                 await networkList(configPath);
//             })
//             .command(
//                 'switch <network>',
//                 'switch selected network',
//                 {
//                     network: {
//                         description: 'Network to switch to',
//                         type: 'string',
//                         demandOption: true,
//                     },
//                 },
//                 async (argv) => {
//                     const configPath = await getConfigPath();
//                     await networkSwitch(configPath, argv.network);
//                 },
//             )
//             .demandCommand(1, 'You must provide a valid command')
//             .strict()
//             .help('h')
//             .alias('h', 'help').argv;
//     })
//     .middleware((argv: ArgumentsCamelCase) => {
//         console.log('Middleware:', argv);
//         if ('_' in argv) {
//             commandPath = argv._.map(String);
//         }
//     })
//     .fail(async (msg, err, yargs) => {
//         if (err) {
//             console.error(`${commandPath.join(' ')} encountered error:`, err.message);
//             process.exit(1);
//         }
//         console.error(`${commandPath.join(' ')} failed:`, msg);
//         process.exit(1);
//     })
//     .demandCommand(1, 'You must provide a valid command')
//     .scriptName('pdk')
//     .strict()
//     .help('h')
//     .alias('h', 'help').argv;
