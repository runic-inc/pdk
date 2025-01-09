import crypto from 'crypto';
import path from 'path';
// import { generateAPI } from '../../../commands/generate';
import { GeneratorService as Gen } from '../../../services/generator';
import LockFileManager from '../../../services/lockFile';

export type GeneratorType = 'contracts' | 'deployScripts' | 'buildContracts'; //| 'abis' | 'schema' | 'eventHooks' | 'ponderConfig' | 'api' | 'reactHooks';

interface GeneratorConfig {
    inputs: string[];
    outputs: string[];
    run: (configPath: string) => Promise<void>;
}

export class GeneratorService {
    private lockFile: LockFileManager;
    private configPath: string;
    private PDKGenerator: Gen;
    private generators: Record<GeneratorType, GeneratorConfig>;
    private generatorOrder: GeneratorType[];

    constructor(configPath: string, lockFile: LockFileManager) {
        this.configPath = configPath;
        this.lockFile = lockFile;
        this.generators = this.initializeGenerators();
        this.PDKGenerator = new Gen(lockFile);
        this.generatorOrder = ['contracts', 'deployScripts', 'buildContracts' /*'abis', 'schema', 'eventHooks', 'ponderConfig', 'api', 'reactHooks'*/];
    }

    private async runGenerateContracts(): Promise<void> {
        const targetDir = path.dirname(this.configPath);
        await this.generateContracts(targetDir, false, this.configPath);
    }

    private async runGenerateDeployScripts(): Promise<void> {
        const targetDir = path.dirname(this.configPath);
        await this.generateDeployScripts(targetDir, false, this.configPath);
    }

    // private async runGenerateAPI(): Promise<void> {
    //     const schemaPath = path.join(path.dirname(this.configPath), 'ponder', 'ponder.schema.ts');
    //     const apiOutputDir = path.join(path.dirname(this.configPath), 'ponder', 'src', 'generated');
    //     await generateAPI(schemaPath, apiOutputDir);
    // }

    private async generateContracts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
        this.PDKGenerator.runGenerator('contracts');
    }

    private async generateDeployScripts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
        this.PDKGenerator.runGenerator('deploy');
    }

    private async buildContracts(): Promise<void> {
        this.PDKGenerator.runGenerator('artifacts');
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
