#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { parseJson } from './codegen/contractSchemaJsonParser';
import { MainContractGen } from './codegen/mainContractGen';
import { JSONSchemaGen } from "./codegen/jsonSchemaGen";
import { ContractSchemaImpl } from "./codegen/contractSchema";
import { execSync } from "child_process";
import { launchWizardApp } from "./wizardServer";
import { UserContractGen } from "./codegen/userContractGen";
import { cleanAndCapitalizeFirstLetter, tryValidate } from "./codegen/utils";

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
    console.log(jsonData);
    const t1 = tryValidate(jsonData, "./src/patchwork-contract-config.schema.json");
    // TODO need separate commands to validate metadata schemas as one can bury errors in the other
    //const t2 = tryValidate(jsonFile, "../src/patchwork-metadata.schema.json")
    if (t1 === true) {
        console.log("The JSON file is a valid Patchwork contract configuration.");
    } else {
        console.log("The JSON file is not a valid Patchwork contract config");
        console.log("Contract Config Validation Errors:", t1);
        // console.log("Metadata Schema Validation Errors:", t2);
    }
}

function generateSolidity(argv: any) {
    const configFiles = argv.configFiles;
    const outputDir = argv.output || process.cwd();
  
    for (const configFile of configFiles) {
        try {
            let schema;
            let solidityGenFilename;
            let solidityUserFilename;
            let jsonFilename;
            if (configFile.endsWith(".ts")) {
                try {
                    const result = execSync(`tsc ${configFile}`);
                    console.log("TSC compile success");
                    console.log(result.toString());
                } catch (err: any) { 
                    console.log("Error", err.message);
                    console.log("output", err.stdout.toString());
                    console.log("stderr", err.stderr.toString());
                }
                const jsConfigFile = path.dirname(configFile) + path.sep + path.basename(configFile, ".ts") + ".js";
                const t = require(path.resolve(jsConfigFile)).default;
                schema = new ContractSchemaImpl(t);
                fs.unlinkSync(path.resolve(jsConfigFile));
            } else {
                if (!configFile.endsWith(".json")) {
                    throw new Error("Invalid file type. Please provide a JSON or TS file.");
                }
                const validated = tryValidate(configFile, "../src/patchwork-contract-config.schema.json");
                if (validated !== true) {
                    console.log(`${configFile} did not validate`, validated);
                    process.exit(1);
                }
                const jsonData = require(path.resolve(configFile));
                schema = parseJson(jsonData);
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