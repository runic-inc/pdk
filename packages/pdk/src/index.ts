
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CLIProcessor } from './cliProcessor';
import { generateABIs } from "./generateABIs";
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
                    description: "Root directory for the TS files (defaults to 'src')",
                })
                .option("contract", {
                    alias: "c",
                    type: "string",
                    description: "Name of the specific contract to generate (optional for project configs)"
                });
        },
        (argv) => cliProcessor.generateSolidity(argv.configFiles as string[], argv.output as string, argv.rootdir as string, argv.contract as string)
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
        "generateTsABIs",
        "Generate TypeScript ABIs for ponder",
        {},
        async () => {
            console.log("Generating TypeScript ABIs...");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            await generateABIs(configPath);
        }
    )
    .command(
        "generateSchema",
        "Generate the ponder schema",
        {},
        async () => {
            console.log("Generating Ponder Schema");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            generateSchema(configPath);
        }
    ).command(
        "generateEventHooks",
        "Generate the ponder event code",
        {},
        async () => {
            console.log("Generating Ponder event code");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            generateEventHooks(configPath);
        }
    ).command(
        "generatePonderConfig",
        "Generate the ponder config code",
        {},
        async () => {
            console.log("Generating Ponder config code");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            generatePonderConfig(configPath);
        }
    ).command(
        "generateReactHooks",
        "Generate the React hooks for app",
        {},
        async () => {
            console.log("Generating React hooks for app");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            await generateReactHooks(configPath);
        }
    ).command(
        "generateReactComponents",
        "Generate the React components for app",
        {},
        async () => {
            console.log("Generating React components for app");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            await generateReactComponents(configPath);
        }
    ).command(
        "generateDemoPage",
        "Generate the demo app page",
        {},
        async () => {
            console.log("Generating the demo app page");
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            console.log("Using config file:", configPath);
            await generateDemoPage(configPath);
        }
    ).command(
        "generateAPI",
        "Generate the trpc api",
        {},
        async () => {
            console.log("Generating API");
            const schemaPath = await findPonderSchema();
            if (!schemaPath) {
                console.error("No ponder schema file found.");
                return;
            }
            const configPath = await findConfig();
            if (!configPath) {
                console.error("No config file found.");
                return;
            }
            const apiOutputDir = path.join(path.dirname(configPath), "src", "api");
            await generateAPI(schemaPath, apiOutputDir);
        }
    )
    .demandCommand(1, "You must provide a valid command")
    .help("h")
    .alias("h", "help")
    .argv;