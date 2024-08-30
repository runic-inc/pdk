#!/usr/bin/env node
import { cleanAndCapitalizeFirstLetter, ContractSchemaImpl, JSONSchemaGen, MainContractGen, parseJson, UserContractGen, validateSchema } from "@patchworkdev/common";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { launchWizardApp } from "./wizardServer";

const argv = yargs(hideBin(process.argv))
    .command(
        "validate <jsonFile>",
        "Validate a JSON metadata schema file",
        (yargs) => {
            yargs.positional("jsonFile", {
                describe: "Path to the JSON file",
                type: "string",
            });
        },
        validateJson
    )
    .command(
        "generate <configFiles..>",
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

function validateJson(argv: any): void {
    const jsonFile = argv.jsonFile;
    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const result = validateSchema(jsonData, "./src/patchwork-contract-config.schema.json");

    if (result.isValid) {
        console.log("The JSON file is a valid Patchwork contract configuration.");
    } else {
        console.log("The JSON file is not a valid Patchwork contract config");
        console.log("Contract Config Validation Errors:", result.errors);
    }
}

function generateSolidity(argv: any) {
    const configFiles = argv.configFiles;
    const outputDir = argv.output || process.cwd();
    const rootDir = argv.rootdir || "src";
    const tmpout = "tmpout";

    for (const configFile of configFiles) {
        try {
            let schema: ContractSchemaImpl;
            let solidityGenFilename: string;
            let solidityUserFilename: string;
            let jsonFilename: string;

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
                const validationResult = validateSchema(jsonData, "./src/patchwork-contract-config.schema.json");
                if (!validationResult.isValid) {
                    console.log(`${configFile} did not validate:`, validationResult.errors);
                    process.exit(1);
                }
                const parsedSchema = parseJson(jsonData);
                if (!(parsedSchema instanceof ContractSchemaImpl)) {
                    throw new Error("Parsed schema is not an instance of ContractSchemaImpl");
                }
                schema = parsedSchema;
            }

            schema.validate();
            solidityGenFilename = cleanAndCapitalizeFirstLetter(schema.name) + "Generated.sol";
            solidityUserFilename = cleanAndCapitalizeFirstLetter(schema.name) + ".sol";
            jsonFilename = cleanAndCapitalizeFirstLetter(schema.name) + "-schema.json";
            const solidityCode = new MainContractGen().gen(schema);
            let outputPath = path.join(outputDir, solidityGenFilename);
            fs.writeFileSync(outputPath, solidityCode);
            console.log(`Solidity gen file generated at ${outputPath}`);

            const solidityUserCode = new UserContractGen().gen(schema);
            outputPath = path.join(outputDir, solidityUserFilename);
            if (fs.existsSync(outputPath)) {
                console.log(`Output file ${outputPath} already exists. Skipping overwrite.`);
            } else {
                fs.writeFileSync(outputPath, solidityUserCode);
                console.log(`Solidity user file generated at ${outputPath}`);
            }
            const jsonSchema = new JSONSchemaGen().gen(schema);
            outputPath = path.join(outputDir, jsonFilename);
            fs.writeFileSync(outputPath, jsonSchema);
            console.log(`JSON Schema file generated at ${outputPath}`);
        } catch (error: any) {
            console.error("Error generating Solidity file:", error.message);
        }
    }
}