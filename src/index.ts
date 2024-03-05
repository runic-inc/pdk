#!/usr/bin/env node

import Ajv2019 from "ajv/dist/2019";
import fs from "fs";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { parseJson } from './contractSchemaJsonParser';
import { MainContractGen } from './mainContractGen';
import { JSONSchemaGen } from "./jsonSchemaGen";

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
        "generate <jsonFile>",
        "Generate NFT source",
        (yargs) => {
            yargs
                .positional("jsonFile", {
                    describe: "Path to the JSON file",
                    type: "string",
                })
                .option("output", {
                    alias: "o",
                    type: "string",
                    description: "Output directory for the generated Solidity file",
                });
        },
        generateSolidity
    )
    .demandCommand(1, "You must provide a valid command")
    .help("h")
    .alias("h", "help")
    .argv;

function tryValidate(jsonFile: string, schemaFile: string): any {
    try {
        const jsonData = require(path.resolve(jsonFile));
        const schemaData = require(schemaFile);
        const ajv = new Ajv2019()
        const validate = ajv.compile(schemaData);
        if (validate(jsonData)) {
            return true;
        }
        return validate.errors;
    }catch (error: any) {
        console.error("Error reading JSON or schema file:", error.message);
    }
}

function validateJson(argv: any): void {
    const jsonFile = argv.jsonFile;
    const t1 = tryValidate(jsonFile, "../src/patchwork-contract-config.schema.json");
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
    const jsonFile = argv.jsonFile;
    const outputDir = argv.output || process.cwd();
  
    try {
      const jsonData = require(path.resolve(jsonFile));
      const schema = parseJson(jsonData);
      schema.validate();
      const solidityCode = new MainContractGen().gen(schema);
  
      const solidityFilename = path.basename(jsonFile, ".json") + ".sol";
      let outputPath = path.join(outputDir, solidityFilename);
  
      fs.writeFileSync(outputPath, solidityCode);
      console.log(`Solidity file generated at ${outputPath}`);

      const jsonSchema = new JSONSchemaGen().gen(schema);

      const jsonFilename = path.basename(jsonFile, ".json") + "-schema.json";
      outputPath = path.join(outputDir, jsonFilename);
  
      fs.writeFileSync(outputPath, jsonSchema);
      console.log(`JSON Schema file generated at ${outputPath}`);
    } catch (error: any) {
      console.error("Error generating Solidity file:", error.message);
    }
}