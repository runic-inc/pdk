import {
    cleanAndCapitalizeFirstLetter,
    ContractConfig,
    ContractSchemaImpl,
    DeployScriptGen,
    JSONProjectConfigGen,
    JSONProjectConfigLoader,
    JSONSchemaGen,
    MainContractGen,
    parseJson,
    ProjectConfig,
    TSProjectConfigGen,
    UserContractGen,
    validateSchema,
} from '@patchworkdev/common';
import fs from 'fs';
import path from 'path';
import { logger } from '../helpers/logger';
import { tsLoaderSync } from '../helpers/tsLoader';

export class CLIProcessor {
    contractSchema: string;
    projectSchema: string;

    constructor(contractSchema: string, projectSchema: string) {
        this.contractSchema = contractSchema;
        this.projectSchema = projectSchema;
    }

    validateConfig(configFile: string): boolean {
        if (!configFile.endsWith('.json')) {
            console.log('Invalid file type. Please provide a JSON file.');
            return false;
        }
        const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));

        let result;
        if (jsonData.$schema === 'https://patchwork.dev/schema/patchwork-contract-config.schema.json') {
            result = validateSchema(jsonData, this.contractSchema);
            if (result.isValid) {
                console.log('The file is a valid Patchwork contract configuration.');
            }
        } else if (jsonData.$schema === 'https://patchwork.dev/schema/patchwork-project-config.schema.json') {
            result = validateSchema(jsonData, this.projectSchema);
            if (result.isValid) {
                console.log('The file is a valid Patchwork project configuration.');
            }
        } else {
            console.log('File missing $schema property.');
            return false;
        }
        if (!result.isValid) {
            console.log('Validation Errors:', result.errors);
            return false;
        }
        return true;
    }

    generateSolidity(configFiles: string[], outputDir: string = process.cwd(), contract?: string) {
        console.log('Generating Solidity files...');
        for (const configFile of configFiles) {
            if (configFile.endsWith('.json')) {
                const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                if (validateSchema(jsonData, this.contractSchema).isValid) {
                    // Contract config
                    this.generateContract(this.loadContractConfigFromFile(configFile), outputDir);
                } else if (validateSchema(jsonData, this.projectSchema).isValid) {
                    // Project config
                    const projectConfig = new JSONProjectConfigLoader().load(fs.readFileSync(configFile, 'utf8'));
                    this.generateProjectContracts(projectConfig, contract, configFile, outputDir);
                } else {
                    console.error(`Invalid config file: ${configFile}`);
                    throw new Error(`Invalid config file: ${configFile}`);
                }
            } else if (configFile.endsWith('.ts')) {
                const tsConfig = this.loadTSConfigFile(configFile);
                if (tsConfig instanceof ContractSchemaImpl) {
                    this.generateContract(tsConfig, outputDir);
                } else if (tsConfig.contracts) {
                    this.generateProjectContracts(tsConfig, contract, configFile, outputDir);
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

    generateProjectContracts(projectConfig: ProjectConfig, contract: string | undefined, configFile: string, outputDir: string) {
        if (contract) {
            const contractConfig = projectConfig.contracts[contract];
            if (!contractConfig) {
                console.error(`Contract '${contract}' not found in the project config.`);
                throw new Error(`Contract '${contract}' not found in the project config.`);
            }
            this.generateContract(new ContractSchemaImpl(contractConfig as ContractConfig), outputDir);
        } else {
            const fullProjectConfig = this.loadFullProjectConfig(projectConfig, configFile);
            Object.entries(fullProjectConfig.contracts).forEach(([key, value]) => {
                this.generateContract(value as ContractSchemaImpl, outputDir);
            });
        }
    }

    /**
     * Loads the full project configuration by resolving and loading all contract configurations
     * referenced in the given project configuration.
     *
     * @param projectConfig - The initial project configuration containing contract references or full contracts
     * @param configFile - The path to the original project config file - needed to find relative contract config paths.
     * @returns The full project configuration with all contract configurations loaded.
     */
    loadFullProjectConfig(projectConfig: ProjectConfig, configFile: string): ProjectConfig {
        const fullProjectConfig = { ...projectConfig };
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            if (typeof value === 'string') {
                const config = this.loadContractConfigFromFile(`${path.dirname(configFile)}/${value}`);
                fullProjectConfig.contracts[key] = config;
            } else {
                fullProjectConfig.contracts[key] = new ContractSchemaImpl(value as ContractConfig);
            }
        });
        return fullProjectConfig;
    }

    generateContract(schema: ContractSchemaImpl, outputDir: string) {
        try {
            schema.validate();
            const solidityGenFilename = cleanAndCapitalizeFirstLetter(schema.name) + 'Generated.sol';
            const solidityUserFilename = cleanAndCapitalizeFirstLetter(schema.name) + '.sol';
            const jsonFilename = cleanAndCapitalizeFirstLetter(schema.name) + '-schema.json';
            const solidityCode = new MainContractGen().gen(schema);
            const solidityUserCode = new UserContractGen().gen(schema);
            const jsonSchema = new JSONSchemaGen().gen(schema);
            let outputPath = path.join(outputDir, solidityGenFilename);
            // TODO check the path to make sure it's not a file instead of a writeable directory
            // console.log("trying to write to", outputPath);
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
        } catch (err: any) {
            console.error('Error:', err.message);
            throw new Error('Error generating contract');
        }
    }

    generateDeployScripts(configFiles: string[], contractsDir: string | undefined, outputDir: string = process.cwd()) {
        console.log('Generating Deploy scripts...');
        for (const configFile of configFiles) {
            if (configFile.endsWith('.json')) {
                const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                if (validateSchema(jsonData, this.contractSchema).isValid) {
                    // Contract config
                    console.error('Contract config not supported for deploy script generation');
                    throw new Error('Contract config not supported for deploy script generation');
                } else if (validateSchema(jsonData, this.projectSchema).isValid) {
                    // Project config
                    const projectConfig = new JSONProjectConfigLoader().load(fs.readFileSync(configFile, 'utf8'));
                    this.generateDeployScript(projectConfig, configFile, contractsDir, outputDir);
                } else {
                    console.error(`Invalid config file: ${configFile}`);
                    throw new Error(`Invalid config file: ${configFile}`);
                }
            } else if (configFile.endsWith('.ts')) {
                const tsConfig = this.loadTSConfigFile(configFile);
                if (tsConfig instanceof ContractSchemaImpl) {
                    // Contract config
                    console.error('Contract config not supported for deploy script generation');
                    throw new Error('Contract config not supported for deploy script generation');
                } else if (tsConfig.contracts) {
                    this.generateDeployScript(tsConfig, configFile, contractsDir, outputDir);
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

    generateDeployScript(_projectConfig: ProjectConfig, configFile: string, contractsDir: string | undefined, outputDir: string) {
        const projectConfig = this.loadFullProjectConfig(_projectConfig, configFile);
        try {
            const deployScriptCode = new DeployScriptGen().gen(projectConfig, contractsDir);
            const deployerFilename = cleanAndCapitalizeFirstLetter(projectConfig.name) + '-deploy.s.sol';
            let outputPath = path.join(outputDir, deployerFilename);
            fs.writeFileSync(outputPath, deployScriptCode);
            console.log(`Deploy script generated at ${outputPath}`);
        } catch (err: any) {
            console.error('Error:', err.message);
            throw new Error('Error generating deploy script');
        }
    }

    async buildContracts(targetDir: string = process.cwd()): Promise<void> {
        try {
            const { oraPromise } = await import('ora');
            const { execa } = await import('execa');

            await oraPromise(
                execa('forge', ['build', '--extra-output-files', 'abi', '--force'], {
                    cwd: targetDir,
                }),
                {
                    text: `Building contracts`,
                    failText: 'Failed to build contracts',
                    successText: `Contracts built successfully`,
                },
            );
        } catch (err: any) {
            console.error('Error:', err.message);
            throw new Error('Error building contracts');
        }
    }

    loadTSConfigFile(configFile: string): ProjectConfig | ContractSchemaImpl {
        const pdkRepoRoot = this.isPDKRepo(process.cwd());

        const absoluteConfigFile = path.resolve(configFile);

        try {
            const config = tsLoaderSync<{ default: ProjectConfig | ContractConfig }>(absoluteConfigFile, {
                compilerOptions: {
                    rootDir: 'src',
                    outDir: 'dist',
                },
                moduleOverrides: {
                    ...(pdkRepoRoot && {
                        '@patchworkdev/common/types': path.relative(
                            path.dirname(absoluteConfigFile),
                            path.resolve(process.cwd(), path.join(pdkRepoRoot, 'packages/common/src')),
                        ),
                    }),
                },
            }).default;
            if (Object.hasOwn(config, 'contracts')) {
                logger.debug('Project Config detected');
                return this.setProjectConfigDefaults(config as ProjectConfig);
            } else {
                logger.debug('Individual contract config detected');
                return new ContractSchemaImpl(config as ContractConfig);
            }
        } catch (err: any) {
            console.log('Error:', err.message);
            throw new Error('Error compiling TS file');
        }
    }

    isPDKRepo(rootDir: string): string | undefined {
        // walk up the directory tree to find package.json and see if the package is packworkdev/common
        let currentDir = rootDir;
        while (currentDir !== '/') {
            // console.log("Checking", currentDir);
            if (fs.existsSync(path.join(currentDir, 'package.json'))) {
                const packageJson = JSON.parse(fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'));
                if (packageJson.name === '@patchworkdev/pdkmonorepo') {
                    return currentDir;
                }
            }
            currentDir = path.resolve(currentDir, '..');
        }
        return undefined;
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

    loadContractConfigFromFile(configFile: string): ContractSchemaImpl {
        let schema: ContractSchemaImpl;

        if (configFile.endsWith('.ts')) {
            const tsConfig = this.loadTSConfigFile(configFile);
            if (tsConfig instanceof ContractSchemaImpl) {
                schema = tsConfig;
            } else {
                throw new Error('Expected ContractConfig, but got ProjectConfig');
            }
        } else {
            if (!configFile.endsWith('.json')) {
                throw new Error('Invalid file type. Please provide a JSON or TS file.');
            }
            const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            schema = new ContractSchemaImpl(parseJson(jsonData));
        }
        return schema;
    }

    convertToJSON(configFiles: string[], outputDir: string = process.cwd(), contract?: string) {
        console.log('Converting...');
        for (const configFile of configFiles) {
            if (configFile.endsWith('.ts')) {
                const tsConfig = this.loadTSConfigFile(configFile);
                if (tsConfig instanceof ContractSchemaImpl) {
                    console.error(`Not a project config: ${configFile}`);
                    throw new Error(`Not a project config: ${configFile}`);
                } else if (tsConfig.contracts) {
                    const jsonFilename = path.basename(configFile).replace('.ts', '.json');
                    let outputPath = path.join(outputDir, jsonFilename);
                    const jsonContent = new JSONProjectConfigGen().gen(tsConfig);
                    fs.writeFileSync(outputPath, jsonContent);
                    console.log(`Project JSON generated at ${outputPath}`);
                } else {
                    console.error(`Invalid TS config file: ${configFile}`);
                    throw new Error(`Invalid TS config file: ${configFile}`);
                }
            } else {
                console.error(`Invalid Typescript filename: ${configFile}`);
                throw new Error(`Invalid Typescript filename: ${configFile}`);
            }
        }
    }

    convertToTS(configFiles: string[], outputDir: string = process.cwd(), contract?: string) {
        console.log('Converting...');
        for (const configFile of configFiles) {
            if (configFile.endsWith('.json')) {
                const jsonData = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                if (validateSchema(jsonData, this.contractSchema).isValid) {
                    // Contract config
                    console.error(`Found contract config but convert only supports project configs: ${configFile}`);
                    throw new Error(`Found contract config but convert only supports project configs: ${configFile}`);
                } else if (validateSchema(jsonData, this.projectSchema).isValid) {
                    // Project config
                    const projectConfig = new JSONProjectConfigLoader().load(fs.readFileSync(configFile, 'utf8'));
                    const jsonFilename = path.basename(configFile).replace('.json', '.ts');
                    let outputPath = path.join(outputDir, jsonFilename);
                    const tsContent = new TSProjectConfigGen().gen(projectConfig);
                    fs.writeFileSync(outputPath, tsContent);
                    console.log(`Project TS generated at ${outputPath}`);
                } else {
                    console.error(`Invalid config file: ${configFile}`);
                    throw new Error(`Invalid config file: ${configFile}`);
                }
            } else {
                console.error(`Invalid Typescript filename: ${configFile}`);
                throw new Error(`Invalid Typescript filename: ${configFile}`);
            }
        }
    }

    // Set default values for project config
    setProjectConfigDefaults(projectConfig: ProjectConfig): ProjectConfig {
        const projectConfigCopy = { ...projectConfig };
        Object.entries(projectConfigCopy.scopes).forEach(([key, value]) => {
            if (value.whitelist === undefined) {
                value.whitelist = true;
            }
            if (value.userAssign === undefined) {
                value.userAssign = false;
            }
            if (value.userPatch === undefined) {
                value.userPatch = false;
            }
        });
        return projectConfigCopy;
    }
}
