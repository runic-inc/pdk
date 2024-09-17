import { cleanAndCapitalizeFirstLetter, ContractSchemaImpl, JSONSchemaGen, MainContractGen, parseJson, UserContractGen, validateSchema, JSONProjectConfigLoader } from "@patchworkdev/common";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { launchWizardApp } from "./wizardServer";

console.log(__dirname);

const CONTRACT_SCHEMA = `${__dirname}/../../../schemas/patchwork-contract-config.schema.json`;
const PROJECT_SCHEMA = `${__dirname}/../../../schemas/patchwork-project-config.schema.json`;

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
        const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));

        if (configFile.endsWith(".json")) {
            if (validateSchema(jsonData, CONTRACT_SCHEMA).isValid) {
                // Contract config
                generateContract(getContractSchema(configFile, rootDir, tmpout), outputDir);
            } else if (validateSchema(jsonData, PROJECT_SCHEMA).isValid) {
                // Project config
                const projectConfig = new JSONProjectConfigLoader().load(fs.readFileSync(configFile, 'utf8'));
                if (contract) {
                    const contractSchema = projectConfig.contracts.get(contract);
                    if (!contractSchema) {
                        console.error(`Contract '${contract}' not found in the project config.`);
                        process.exit(1);
                    }
                    generateContract(contractSchema as ContractSchemaImpl, outputDir);
                } else {
                    projectConfig.contracts.forEach((contractSchema, name) => {
                        generateContract(contractSchema as ContractSchemaImpl, outputDir);
                    });
                }
            } else {
                console.error(`Invalid config file: ${configFile}`);
                process.exit(1);
            }
        } else if (configFile.endsWith(".ts")) {
            generateContract(getContractSchema(configFile, rootDir, tmpout), outputDir);
        } else {
            console.error(`Invalid config file: ${configFile}`);
            process.exit(1);
        }
    }
}

function generateContract(schema: ContractSchemaImpl, outputDir: string) {
    schema.validate();
    const solidityGenFilename = cleanAndCapitalizeFirstLetter(schema.name) + "Generated.sol";
    const solidityUserFilename = cleanAndCapitalizeFirstLetter(schema.name) + ".sol";
    const jsonFilename = cleanAndCapitalizeFirstLetter(schema.name) + "-schema.json";
    const solidityCode = new MainContractGen().gen(schema);
    const outputPath = path.join(outputDir, solidityGenFilename);
    fs.writeFileSync(outputPath, solidityCode);
    console.log(`Solidity gen file generated at ${outputPath}`);
}

function getContractSchema(configFile: string, rootDir: string, tmpout: string): ContractSchemaImpl {
    let schema: ContractSchemaImpl;

    if (configFile.endsWith(".ts")) {
        try {
            const result = execSync(`tsc --outdir ${tmpout} ${configFile}`);
            console.log("TSC compile success");
            console.log(result.toString());
        } catch (err: any) {
            console.log("Error", err.message);
            console.log("output", err.stdout.toString());
            console.log("stderr", err.stderr.toString());
        }
        const jsConfigFile = path.dirname(configFile).replace(rootDir, tmpout) + path.sep + path.basename(configFile, ".ts") + ".js";
        const t = require(path.resolve(jsConfigFile)).default;
        schema = new ContractSchemaImpl(t);
        fs.rmSync(tmpout, { recursive: true });
    } else {
        if (!configFile.endsWith(".json")) {
            throw new Error("Invalid file type. Please provide a JSON or TS file.");
        }
        const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        const parsedSchema = parseJson(jsonData);
        if (!(parsedSchema instanceof ContractSchemaImpl)) {
            throw new Error("Parsed schema is not an instance of ContractSchemaImpl");
        }
        schema = parsedSchema;
    }
    return schema;
}