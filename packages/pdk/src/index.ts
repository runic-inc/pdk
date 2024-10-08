import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CLIProcessor } from './cliProcessor';
import { generateABIs } from "./generateABIs";
import { generateAll } from './generateAll';
import { generateAPI } from "./generateApi";
import { generateDemoPage } from './generateDemoPage';
import { generateEventHooks } from "./generateEventHooks";
import { generatePonderConfig } from './generatePonderConfig';
import { generateReactComponents } from './generateReactComponents';
import { generateReactHooks } from './generateReactHooks';
import { generateSchema } from "./generateSchema";
import { findConfig, findPonderSchema } from "./helpers/config";
import { launchWizardApp } from "./wizardServer";

const CONTRACT_SCHEMA = `${__dirname}/schemas/patchwork-contract-config.schema.json`;
const PROJECT_SCHEMA = `${__dirname}/schemas/patchwork-project-config.schema.json`;

const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

const argv = yargs(hideBin(process.argv))
    .command(
        "validate [configFiles..]",
        "Validate Patchwork contract or project configuration files",
        (yargs) => {
            yargs
                .positional("configFiles", {
                    describe: "Path to the JSON files",
                    type: "string",
                });
        },
        (argv) => {
            for (const configFile of argv.configFiles as string[]) {
                if (!cliProcessor.validateConfig(configFile)) {
                    process.exit(1);
                }
            }
        }
    )
    .command(
        "generate [configFiles..]",
        "Generate patchwork contracts",
        (yargs) => {
            yargs
                .positional("configFiles", {
                    describe: "Path to the JSON or TS files",
                    type: "string",
                })
                .option("output", {
                    alias: "o",
                    type: "string",
                    description: "Output directory for the generated Solidity files",
                })
                .option("rootdir", {
                    alias: "r",
                    type: "string",
                    description: "Root directory for the TS files (defaults to '.')",
                })
                .option("contract", {
                    alias: "c",
                    type: "string",
                    description: "Name of the specific contract to generate (optional for project configs)"
                });
        },
        (argv) => {
            try {
                cliProcessor.generateSolidity(argv.configFiles as string[], argv.output as string, argv.rootdir as string, argv.contract as string);
            } catch (e) {
                process.exit(1);
            }
        }
    )
    .command(
        "wizard",
        "Launch the Patchwork Wizard",
        {},
        () => {
            launchWizardApp();
        }
    )
    .command(
        "generateTsABIs [configFile]",
        "Generate TypeScript ABIs for ponder",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating TypeScript ABIs...");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generateABIs(configPath);
        }
    )
    .command(
        "generateSchema [configFile]",
        "Generate the ponder schema",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating Ponder Schema");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generateSchema(configPath);
        }
    )
    .command(
        "generateEventHooks [configFile]",
        "Generate the ponder event code",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating Ponder event code");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generateEventHooks(configPath);
        }
    )
    .command(
        "generatePonderConfig [configFile]",
        "Generate the ponder config code",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating Ponder config code");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generatePonderConfig(configPath);
        }
    )
    .command(
        "generateReactHooks [configFile]",
        "Generate the React hooks for app",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating React hooks for app");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generateReactHooks(configPath);
        }
    )
    .command(
        "generateReactComponents [configFile]",
        "Generate the React components for app",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating React components for app");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generateReactComponents(configPath);
        }
    )
    .command(
        "generateDemoPage [configFile]",
        "Generate the demo app page",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating the demo app page");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            console.log("Using config file:", configPath);
            await generateDemoPage(configPath);
        }
    )
    .command(
        "generateAPI [configFile]",
        "Generate the trpc api",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            console.log("Generating API");
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            const schemaPath = await findPonderSchema();
            if (!schemaPath) {
                console.error("No ponder schema file found.");
                process.exit(1);
            }
            const apiOutputDir = path.join(path.dirname(configPath), "src", "api");
            await generateAPI(schemaPath, apiOutputDir);
        }
    )
    .command(
        "generateAll [configFile]",
        "Generate all components (TypeScript ABIs, Ponder Schema, Event Hooks, Ponder Config, and API)",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the config file",
                type: "string",
            });
        },
        async (argv) => {
            const configPath = argv.configFile || await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                process.exit(1);
            }
            await generateAll(configPath);
        }
    )
    .demandCommand(1, "You must provide a valid command")
    .help("h")
    .alias("h", "help")
    .argv;