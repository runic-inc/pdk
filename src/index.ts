#!/usr/bin/env node

import Ajv2019 from "ajv/dist/2019";
import fs from "fs";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { parseJson } from './contractSchemaJsonParser';
import { MainContractGen } from './mainContractGen';

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

function validateJson(argv: any): void {
    const jsonFile = argv.jsonFile;
    const schemaFile = path.resolve(__dirname, "../src/patchwork.schema.json");

    try {
        const jsonData = require(path.resolve(jsonFile));
        const schemaData = require(schemaFile);
        const ajv = new Ajv2019()
        const validate = ajv.compile(schemaData);

        if (validate(jsonData)) {
            console.log("The JSON file is a valid Patchwork metadata schema.");
        } else {
            console.log("The JSON file is not a valid Patchwork metadata schema. Errors:", validate.errors);
        }
    }catch (error: any) {
        console.error("Error reading JSON or schema file:", error.message);
    }
}

function generateSolidity(argv: any) {
    const jsonFile = argv.jsonFile;
    const outputDir = argv.output || process.cwd();
  
    try {
      const jsonData = require(path.resolve(jsonFile));
      const solidityCode = new MainContractGen().gen(parseJson(jsonData));
  
      const solidityFilename = path.basename(jsonFile, ".json") + ".sol";
      const outputPath = path.join(outputDir, solidityFilename);
  
      fs.writeFileSync(outputPath, solidityCode);
      console.log(`Solidity file generated at ${outputPath}`);
    } catch (error: any) {
      console.error("Error generating Solidity file:", error.message);
    }
}