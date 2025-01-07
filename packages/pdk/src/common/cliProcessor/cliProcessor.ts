import {
    cleanAndCapitalizeFirstLetter,
    ContractConfig,
    ContractSchemaImpl,
    DeployScriptGen,
    JSONSchemaGen,
    MainContractGen,
    ProjectConfig,
    UserContractGen,
} from '@patchworkdev/common';
import fs from 'fs';
import path from 'path';
import { PatchworkProject } from '../../types';

export class CLIProcessor {
    contractSchema: string;
    projectSchema: string;

    constructor(contractSchema: string, projectSchema: string) {
        this.contractSchema = contractSchema;
        this.projectSchema = projectSchema;
    }

    generateSolidity(config: PatchworkProject, outputDir: string = process.cwd(), contract?: string) {
        //console.log('Generating Solidity files...');
        const _config = this.setProjectConfigDefaults(config);
        this.generateProjectContracts(_config, contract, outputDir);
    }

    generateProjectContracts(config: PatchworkProject, contract: string | undefined, outputDir: string) {
        if (contract) {
            const contractConfig = config.contracts[contract];
            if (!contractConfig) {
                console.error(`Contract '${contract}' not found in the project config.`);
                throw new Error(`Contract '${contract}' not found in the project config.`);
            }
            this.generateContract(new ContractSchemaImpl(contractConfig as ContractConfig), outputDir);
        } else {
            const fullProjectConfig = this.loadFullProjectConfig(config);
            Object.values(fullProjectConfig.contracts).forEach((value) => {
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
    loadFullProjectConfig(config: ProjectConfig): ProjectConfig {
        const fullProjectConfig = { ...config };
        Object.entries(config.contracts).forEach(([key, value]) => {
            fullProjectConfig.contracts[key] = new ContractSchemaImpl(value as ContractConfig);
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
            //console.log(`Solidity gen file generated at ${outputPath}`);
            outputPath = path.join(outputDir, solidityUserFilename);
            if (fs.existsSync(outputPath)) {
                //console.log(`Output file ${outputPath} already exists. Skipping overwrite.`);
            } else {
                fs.writeFileSync(outputPath, solidityUserCode);
                //console.log(`Solidity user file generated at ${outputPath}`);
            }
            outputPath = path.join(outputDir, jsonFilename);
            fs.writeFileSync(outputPath, jsonSchema);
            //console.log(`JSON Schema file generated at ${outputPath}`);
        } catch (err: any) {
            console.error('Error:', err.message);
            throw new Error('Error generating contract');
        }
    }

    generateDeployScripts(config: PatchworkProject, contractsDir: string | undefined, outputDir: string = process.cwd()) {
        const _config = this.setProjectConfigDefaults(config);
        const projectConfig = this.loadFullProjectConfig(_config);
        try {
            const deployScriptCode = new DeployScriptGen().gen(projectConfig, contractsDir);
            const deployerFilename = cleanAndCapitalizeFirstLetter(projectConfig.name) + '-deploy.s.sol';
            let outputPath = path.join(outputDir, deployerFilename);
            fs.writeFileSync(outputPath, deployScriptCode);
            //console.log(`Deploy script generated at ${outputPath}`);
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

    // Set default values for project config
    setProjectConfigDefaults(projectConfig: PatchworkProject): PatchworkProject {
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
