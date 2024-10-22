import { cleanAndCapitalizeFirstLetter, ContractConfig, ContractSchemaImpl, JSONProjectConfigLoader, JSONSchemaGen, MainContractGen, parseJson, ProjectConfig, UserContractGen, validateSchema } from "@patchworkdev/common";
import fs from "fs";
import path from "path";
import { register } from 'ts-node';

export class CLIProcessor {
    contractSchema: string;
    projectSchema: string;

    constructor(contractSchema: string, projectSchema: string) {
        this.contractSchema = contractSchema;
        this.projectSchema = projectSchema;
    }

    validateConfig(configFile: string): boolean {
        if (!configFile.endsWith(".json")) {
            console.log("Invalid file type. Please provide a JSON file.");
            return false;
        }
        const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    
        let result;
        if (jsonData.$schema === "https://patchwork.dev/schema/patchwork-contract-config.schema.json") {
            result = validateSchema(jsonData, this.contractSchema);
            if (result.isValid) {
                console.log("The file is a valid Patchwork contract configuration.");
            }
        } else if (jsonData.$schema === "https://patchwork.dev/schema/patchwork-project-config.schema.json") {
            result = validateSchema(jsonData, this.projectSchema);
            if (result.isValid) {
                console.log("The file is a valid Patchwork project configuration.");
            }
        } else {
            console.log("File missing $schema property.");
            return false;
        }
        if (!result.isValid) {
            console.log("Validation Errors:", result.errors);
            return false;
        }
        return true;
    }
    
    generateSolidity(configFiles: string[], outputDir: string = process.cwd(), rootDir: string = ".", contract?: string) {
        const tmpout = "tmpout";
        console.log("Generating Solidity files...");
        for (const configFile of configFiles) {
            if (configFile.endsWith(".json")) {
                const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                if (validateSchema(jsonData, this.contractSchema).isValid) {
                    // Contract config
                    this.generateContract(this.getContractSchema(configFile, rootDir, tmpout), outputDir);
                } else if (validateSchema(jsonData, this.projectSchema).isValid) {
                    // Project config
                    const projectConfig = new JSONProjectConfigLoader().load(fs.readFileSync(configFile, 'utf8'));
                    this.processProjectConfig(projectConfig, contract, configFile, rootDir, tmpout, outputDir);
                } else {
                    console.error(`Invalid config file: ${configFile}`);
                    throw new Error(`Invalid config file: ${configFile}`);
                }
            } else if (configFile.endsWith(".ts")) {
                const tsConfig = this.getTSConfig(configFile, rootDir, tmpout);
                if (tsConfig instanceof ContractSchemaImpl) {
                    this.generateContract(tsConfig, outputDir);
                } else if (tsConfig.contracts) {
                    this.processProjectConfig(tsConfig, contract, configFile, rootDir, tmpout, outputDir);
                } else {
                    console.error(`Invalid TS config file: ${configFile}`);
                    throw new Error(`Invalid TS config file: ${configFile}`);
                }
            } else {
                console.error(`Invalid config file: ${configFile}`);
                throw new Error(`Invalid config file: ${configFile}`);
            }
        }
    }
    
    processProjectConfig(projectConfig: ProjectConfig, contract: string | undefined, configFile: string, rootDir: string, tmpout: string, outputDir: string) {
        if (contract) {
            const contractConfig = projectConfig.contracts[contract];
            if (!contractConfig) {
                console.error(`Contract '${contract}' not found in the project config.`);
                throw new Error(`Contract '${contract}' not found in the project config.`);
            }
            this.generateContract(new ContractSchemaImpl(contractConfig as ContractConfig), outputDir);
        } else {
            Object.entries(projectConfig.contracts).forEach(([key, value]) => {
                if (typeof value === "string") {
                    this.generateContract(this.getContractSchema(`${path.dirname(configFile)}/${value}`, rootDir, tmpout), outputDir);
                } else {
                    this.generateContract(new ContractSchemaImpl(value as ContractConfig), outputDir);
                }
            });
        }
    }
    
    generateContract(schema: ContractSchemaImpl, outputDir: string) {
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
    
    getTSConfig(configFile: string, rootDir: string, tmpout: string): ContractSchemaImpl | ProjectConfig {
        console.log(`dirname is ${__dirname}`);
        // TODO - check if we're in the pdk repo anywhere
        const useProject = this.isPatchworkDevCommon(rootDir);

        const tsNode = register({
            "compilerOptions": {
                "rootDir": "src",
                "outDir": "dist",
            },
        });
        try {
            const absoluteConfigFile = path.resolve(configFile);
            console.log("ts-node start", absoluteConfigFile);
            // const result = tsNode.compile("", configFile);
            const result = require(absoluteConfigFile);
            console.log("TSC compile success");
            /*
            console.log(result);
            return new ContractSchemaImpl({
                scopeName: "",
                name: "",
                symbol: "",
                baseURI: "",
                schemaURI: "",
                imageURI: "",
                fields: [],
                features: []
            })
                */
            return result.default;
        } catch (err: any) {
            console.log("Error:", err.message);
            throw new Error("Error compiling TS file");
        }
    }
    
    isPatchworkDevCommon(rootDir: string): boolean {
        // walk up the directory tree to find package.json and see if the package is packworkdev/common
        let currentDir = rootDir;
        let found = false;
        while (currentDir !== "/") {
            console.log("Checking", currentDir);
            if (fs.existsSync(path.join(currentDir, "package.json"))) {
                const packageJson = JSON.parse(fs.readFileSync(path.join(currentDir, "package.json"), 'utf8'));
                if (packageJson.name === "@patchworkdev/pdk") {
                    found = true;
                    break;
                }
            }
            currentDir = path.resolve(currentDir, "..");
        }
        return found;
    }

    findJSConfigFile(dir: string, filename: string): string | null {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                const result = this.findJSConfigFile(filePath, filename);
                if (result) return result;
            } else if (file === filename) {
                return filePath;
            }
        }
        
        return null;
    }
    
    getContractSchema(configFile: string, rootDir: string, tmpout: string): ContractSchemaImpl {
        let schema: ContractSchemaImpl;
    
        if (configFile.endsWith(".ts")) {
            const tsConfig = this.getTSConfig(configFile, rootDir, tmpout);
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
}