import { cleanAndCapitalizeFirstLetter, ContractConfig, ContractSchemaImpl, JSONProjectConfigLoader, JSONSchemaGen, MainContractGen, parseJson, ProjectConfig, UserContractGen, validateSchema } from "@patchworkdev/common";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
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

const argv = yargs(hideBin(process.argv))
    .command(
        "validate <configFile>",
        "Validate a JSON or TS config file",
        (yargs) => {
            yargs.positional("configFile", {
                describe: "Path to the JSON or TS file",
                type: "string",
            });
        },
        validateConfig
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
        generateSolidity
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

function validateConfig(argv: any): void {
    const configFile = argv.configFile;
    const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));

    let result;
    if (jsonData.$schema === "https://patchwork.dev/schema/patchwork-contract-config.schema.json") {
        result = validateSchema(jsonData, CONTRACT_SCHEMA);
        if (result.isValid) {
            console.log("The file is a valid Patchwork contract configuration.");
        }
    } else if (jsonData.$schema === "https://patchwork.dev/schema/patchwork-project-config.schema.json") {
        result = validateSchema(jsonData, PROJECT_SCHEMA);
        if (result.isValid) {
            console.log("The file is a valid Patchwork project configuration.");
        }
    } else {
        console.log("File missing $schema property.");
        process.exit(1);
    }
    if (!result.isValid) {
        console.log("Validation Errors:", result.errors);
        process.exit(1);
    }
}

function generateSolidity(argv: any) {
    const configFiles = argv.configFiles;
    const outputDir = argv.output || process.cwd();
    const rootDir = argv.rootdir || "src";
    const tmpout = "tmpout";
    const contract = argv.contract;

    for (const configFile of configFiles) {
        if (configFile.endsWith(".json")) {
            const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            if (validateSchema(jsonData, CONTRACT_SCHEMA).isValid) {
                // Contract config
                generateContract(getContractSchema(configFile, rootDir, tmpout), outputDir);
            } else if (validateSchema(jsonData, PROJECT_SCHEMA).isValid) {
                // Project config
                const projectConfig = new JSONProjectConfigLoader().load(fs.readFileSync(configFile, 'utf8'));
                processProjectConfig(projectConfig, contract, configFile, rootDir, tmpout, outputDir);
            } else {
                console.error(`Invalid config file: ${configFile}`);
                process.exit(1);
            }
        } else if (configFile.endsWith(".ts")) {
            const tsConfig = getTSConfig(configFile, rootDir, tmpout);
            if (tsConfig instanceof ContractSchemaImpl) {
                generateContract(tsConfig, outputDir);
            } else if (tsConfig.contracts) {
                processProjectConfig(tsConfig, contract, configFile, rootDir, tmpout, outputDir);
            } else {
                console.error(`Invalid TS config file: ${configFile}`);
                process.exit(1);
            }
        } else {
            console.error(`Invalid config file: ${configFile}`);
            process.exit(1);
        }
    }
}

function processProjectConfig(projectConfig: ProjectConfig, contract: string | undefined, configFile: string, rootDir: string, tmpout: string, outputDir: string) {
    if (contract) {
        const contractConfig = projectConfig.contracts[contract];
        if (!contractConfig) {
            console.error(`Contract '${contract}' not found in the project config.`);
            process.exit(1);
        }
        generateContract(new ContractSchemaImpl(contractConfig as ContractConfig), outputDir);
    } else {
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            if (typeof value === "string") {
                generateContract(getContractSchema(`${path.dirname(configFile)}/${value}`, rootDir, tmpout), outputDir);
            } else {
                generateContract(new ContractSchemaImpl(value as ContractConfig), outputDir);
            }
        });
    }
}

function generateContract(schema: ContractSchemaImpl, outputDir: string) {
    schema.validate();
    const solidityGenFilename = cleanAndCapitalizeFirstLetter(schema.name) + "Generated.sol";
    const solidityUserFilename = cleanAndCapitalizeFirstLetter(schema.name) + ".sol";
    const jsonFilename = cleanAndCapitalizeFirstLetter(schema.name) + "-schema.json";
    const solidityCode = new MainContractGen().gen(schema);
    const solidityUserCode = new UserContractGen().gen(schema);
    const jsonSchema = new JSONSchemaGen().gen(schema);
    let outputPath = path.join(outputDir, solidityGenFilename);
    fs.writeFileSync(outputPath, solidityCode);
    console.log(`Solidity gen file generated at ${outputPath}`);
    outputPath = path.join(outputDir, solidityUserFilename);
    if (fs.existsSync(outputPath)) {
        console.log(`Output file ${outputPath} already exists. Skipping overwrite.`);
    } else {
        fs.writeFileSync(outputPath, solidityUserCode);
        console.log(`Solidity user file generated at ${outputPath}`);
    }
    outputPath = path.join(outputDir, jsonFilename);
    fs.writeFileSync(outputPath, jsonSchema);
    console.log(`JSON Schema file generated at ${outputPath}`);
}

function getTSConfig(configFile: string, rootDir: string, tmpout: string): ContractSchemaImpl | ProjectConfig {
    // console.log("getTSConfig", configFile, rootDir, tmpout);
    try {
        const result = execSync(`tsc --outdir ${tmpout} ${configFile}`);
        console.log("TSC compile success");
        // console.log(result.toString());
    } catch (err: any) {
        console.log("Error", err.message);
        console.log("output", err.stdout.toString());
        console.log("stderr", err.stderr.toString());
        throw err;
    }
    const jsConfigFile = path.dirname(configFile).replace(rootDir, tmpout) + path.sep + path.basename(configFile, ".ts") + ".js";
    // console.log(jsConfigFile);
    const t = require(path.resolve(jsConfigFile)).default;
    fs.rmSync(tmpout, { recursive: true });

    if (t.contracts) {
        return t as ProjectConfig;
    } else {
        return new ContractSchemaImpl(t);
    }
}

function getContractSchema(configFile: string, rootDir: string, tmpout: string): ContractSchemaImpl {
    let schema: ContractSchemaImpl;

    if (configFile.endsWith(".ts")) {
        const tsConfig = getTSConfig(configFile, rootDir, tmpout);
        if (tsConfig instanceof ContractSchemaImpl) {
            schema = tsConfig;
        } else {
            throw new Error("Expected ContractConfig, but got ProjectConfig");
        }
    } else {
        if (!configFile.endsWith(".json")) {
            throw new Error("Invalid file type. Please provide a JSON or TS file.");
        }
        const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        schema = new ContractSchemaImpl(parseJson(jsonData));
    }
    return schema;
}