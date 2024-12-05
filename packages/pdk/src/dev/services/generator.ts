import crypto from 'crypto';
import path from 'path';
import LockFileManager from '../../common/helpers/lockFile';
import { generateABIs, generateAPI, generateEventHooks, generatePonderConfig, generateReactHooks, generateSchema } from '../../generate';

export type GeneratorType = 'contracts' | 'deployScripts' | 'buildContracts' | 'abis' | 'schema' | 'eventHooks' | 'ponderConfig' | 'api' | 'reactHooks';

interface GeneratorConfig {
    inputs: string[];
    outputs: string[];
    run: (configPath: string) => Promise<void>;
}

export class GeneratorService {
    private lockFile: LockFileManager;
    private configPath: string;
    private generators: Record<GeneratorType, GeneratorConfig>;
    private generatorOrder: GeneratorType[];

    constructor(configPath: string, lockFile: LockFileManager) {
        this.configPath = configPath;
        this.lockFile = lockFile;
        this.generators = this.initializeGenerators();
        this.generatorOrder = ['contracts', 'deployScripts', 'buildContracts', 'abis', 'schema', 'eventHooks', 'ponderConfig', 'api', 'reactHooks'];
    }

    private async runGenerateContracts(): Promise<void> {
        const targetDir = path.dirname(this.configPath);
        await this.generateContracts(targetDir, false, this.configPath);
    }

    private async runGenerateDeployScripts(): Promise<void> {
        const targetDir = path.dirname(this.configPath);
        await this.generateDeployScripts(targetDir, false, this.configPath);
    }

    private async runGenerateAPI(): Promise<void> {
        const schemaPath = path.join(path.dirname(this.configPath), 'ponder', 'ponder.schema.ts');
        const apiOutputDir = path.join(path.dirname(this.configPath), 'ponder', 'src', 'generated');
        await generateAPI(schemaPath, apiOutputDir);
    }

    private async generateContracts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
        const outputDir = './contracts/src';
        const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');
        const { execa } = await import('execa');
        const { oraPromise } = await import('ora');
        await oraPromise(
            execa(pdkCommand, ['generate', 'contracts', configPath, '-o', outputDir], {
                cwd: targetDir,
            }),
            {
                text: `Generating contracts`,
                failText: 'Failed to generate contracts',
                successText: `Contracts generated successfully`,
            },
        );
    }

    private async generateDeployScripts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
        const outputDir = './contracts/script';
        const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');
        const { execa } = await import('execa');
        const { oraPromise } = await import('ora');
        await oraPromise(
            execa(pdkCommand, ['generate', 'deployScripts', configPath, '-o', outputDir, '-c', '../src'], {
                cwd: targetDir,
            }),
            {
                text: `Generating deploy scripts`,
                failText: 'Failed to generate deploy scripts',
                successText: `Deploy scripts generated successfully`,
            },
        );
    }

    private async buildContracts(): Promise<void> {
        const targetDir = path.dirname(this.configPath);
        const pdkCommand = path.join(targetDir, 'node_modules', '.bin', 'pdk');
        const { execa } = await import('execa');
        const { oraPromise } = await import('ora');

        await oraPromise(
            execa(pdkCommand, ['generate', 'contractBuild', this.configPath], {
                cwd: targetDir,
            }),
            {
                text: 'Building contracts',
                failText: 'Failed to build contracts',
                successText: 'Contracts built successfully',
            },
        );
    }

    private initializeGenerators(): Record<GeneratorType, GeneratorConfig> {
        return {
            contracts: {
                inputs: ['patchwork.config.ts'],
                outputs: ['contracts/src/**/*.sol'],
                run: () => this.runGenerateContracts(),
            },
            deployScripts: {
                inputs: ['patchwork.config.ts', 'contracts/src/**/*.sol'],
                outputs: ['contracts/script/**/*.sol'],
                run: () => this.runGenerateDeployScripts(),
            },
            buildContracts: {
                inputs: ['contracts/src/**/*.sol', 'contracts/script/**/*.sol'],
                outputs: ['contracts/out/**/*.json'],
                run: () => this.buildContracts(),
            },
            abis: {
                inputs: ['contracts/out/**/*.abi.json'],
                outputs: ['ponder/abis/**/*.ts'],
                run: () => generateABIs(this.configPath),
            },
            schema: {
                inputs: ['ponder/abis/**/*.ts', 'patchwork.config.ts'],
                outputs: ['ponder/ponder.schema.ts'],
                run: () => generateSchema(this.configPath),
            },
            eventHooks: {
                inputs: ['ponder/abis/**/*.ts', 'ponder/ponder.schema.ts', 'patchwork.config.ts'],
                outputs: ['ponder/src/generated/events.ts'],
                run: () => generateEventHooks(this.configPath),
            },
            ponderConfig: {
                inputs: ['ponder/abis/**/*.ts', 'ponder/ponder.schema.ts'],
                outputs: ['ponder/ponder.config.ts'],
                run: () => generatePonderConfig(this.configPath),
            },
            api: {
                inputs: ['ponder/ponder.schema.ts'],
                outputs: ['ponder/src/generated/api.ts'],
                run: () => this.runGenerateAPI(),
            },
            reactHooks: {
                inputs: ['ponder/src/generated/api.ts'],
                outputs: ['www/generated/hooks/index.ts'],
                run: () => generateReactHooks(this.configPath),
            },
        };
    }

    private async calculateFilesHash(patterns: string[]): Promise<string> {
        const hash = crypto.createHash('sha256');

        for (const pattern of patterns) {
            const files = await this.lockFile.getMatchingFiles(pattern);
            const sortedFiles = files.sort();

            for (const file of sortedFiles) {
                const content = await this.lockFile.calculateFileHash(file);
                hash.update(`${file}:${content}`);
            }
        }

        return hash.digest('hex');
    }

    private getGeneratorStateKey(generator: GeneratorType): string {
        return `generator:${generator}`;
    }

    private async hasInputsChanged(generator: GeneratorType): Promise<boolean> {
        const config = this.generators[generator];
        const stateKey = this.getGeneratorStateKey(generator);
        const previousHash = this.lockFile.getFileHash(stateKey);

        if (!previousHash) return true;

        const currentInputHash = await this.calculateFilesHash(config.inputs);
        return currentInputHash !== previousHash;
    }

    public async processGenerators(): Promise<void> {
        for (const generator of this.generatorOrder) {
            if (await this.hasInputsChanged(generator)) {
                console.info(`Running generator: ${generator}`);
                const config = this.generators[generator];
                await config.run(this.configPath);

                const inputHash = await this.calculateFilesHash(config.inputs);
                const stateKey = this.getGeneratorStateKey(generator);
                this.lockFile.updateFileHash(stateKey, inputHash);
            }
        }
    }
}
