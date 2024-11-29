import crypto from 'crypto';
import path from 'path';
import LockFileManager from '../../common/helpers/lockFile';
import { generateABIs, generateAPI, generateEventHooks, generatePonderConfig, generateReactHooks, generateSchema } from '../../generate';
// import { generateABIs } from '../../generate/abis';
// import { generateAPI } from '../../generate/api';
// import { generatePonderConfig } from '../../generate/ponderConfig';
// import { generateReactHooks } from '../../generate/reactHooks';
// import { generateEventHooks } from '../../generateEventHooks';
// import { generateSchema } from '../../generateSchema';

export type GeneratorType = 'contracts' | 'deployScripts' | 'forgeBuild' | 'abis' | 'schema' | 'eventHooks' | 'ponderConfig' | 'api' | 'reactHooks';
// | 'reactComponents'
// | 'demoPage';

interface GeneratorConfig {
    inputs: string[];
    outputs: string[];
    run: (configPath: string) => Promise<void>;
}

//TODO: use versions exported in create-patchwork?
async function generateContracts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
    const outputDir = './contracts/src';
    const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');

    const { execa } = await import('execa');
    const { oraPromise } = await import('ora');

    await oraPromise(
        execa(pdkCommand, ['generateContracts', configPath, '-o', outputDir], {
            cwd: targetDir,
        }),
        {
            text: `Generating contracts`,
            failText: 'Failed to generate contracts',
            successText: `Contracts generated successfully`,
        },
    );
}

async function generateDeployScripts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
    const outputDir = './contracts/script';
    const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');

    const { execa } = await import('execa');
    const { oraPromise } = await import('ora');

    await oraPromise(
        execa(pdkCommand, ['generateDeployScripts', configPath, '-o', outputDir, '-c', '../src'], {
            cwd: targetDir,
        }),
        {
            text: `Generating deploy scripts`,
            failText: 'Failed to generate deploy scripts',
            successText: `Deploy scripts generated successfully`,
        },
    );
}

async function runGenerateContracts(configPath: string): Promise<void> {
    const targetDir = path.dirname(configPath);
    await generateContracts(targetDir, false, configPath);
}

async function runGenerateDeployScripts(configPath: string): Promise<void> {
    const targetDir = path.dirname(configPath);
    await generateDeployScripts(targetDir, false, configPath);
}

async function runGenerateAPI(configPath: string): Promise<void> {
    const schemaPath = path.join(path.dirname(configPath), 'ponder', 'ponder.schema.ts');
    const apiOutputDir = path.join(path.dirname(configPath), 'ponder', 'src', 'generated');
    await generateAPI(schemaPath, apiOutputDir);
}

async function runForgeBuild(configPath: string): Promise<void> {
    const targetDir = path.dirname(configPath);

    const { execa } = await import('execa');
    const { oraPromise } = await import('ora');

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
}

export class GeneratorManager {
    private lockFile: LockFileManager;
    private configPath: string;
    private generators: Record<GeneratorType, GeneratorConfig>;
    private generatorOrder: GeneratorType[];

    constructor(configPath: string, lockFile: LockFileManager) {
        this.configPath = configPath;
        this.lockFile = lockFile;
        this.generators = this.initializeGenerators();
        this.generatorOrder = [
            'contracts',
            'deployScripts',
            'forgeBuild',
            'abis',
            'schema',
            'eventHooks',
            'ponderConfig',
            'api',
            'reactHooks',
            // 'reactComponents',
            // 'demoPage',
        ];
    }

    private initializeGenerators(): Record<GeneratorType, GeneratorConfig> {
        return {
            contracts: {
                inputs: ['patchwork.config.ts'],
                outputs: ['contracts/src/**/*.sol'],
                run: runGenerateContracts,
            },
            deployScripts: {
                inputs: ['patchwork.config.ts', 'contracts/src/**/*.sol'],
                outputs: ['contracts/script/**/*.sol'],
                run: runGenerateDeployScripts,
            },
            forgeBuild: {
                inputs: ['contracts/src/**/*.sol', 'contracts/script/**/*.sol'],
                outputs: ['contracts/out/**/*.json'],
                run: runForgeBuild,
            },
            abis: {
                inputs: ['contracts/out/**/*.abi.json'],
                outputs: ['ponder/abis/**/*.ts'],
                run: generateABIs,
            },
            schema: {
                inputs: ['ponder/abis/**/*.ts', 'patchwork.config.ts'],
                outputs: ['ponder/ponder.schema.ts'],
                run: generateSchema,
            },
            eventHooks: {
                inputs: ['ponder/abis/**/*.ts', 'ponder/ponder.schema.ts', 'patchwork.config.ts'],
                outputs: ['ponder/src/generated/events.ts'],
                run: generateEventHooks,
            },
            ponderConfig: {
                inputs: ['ponder/abis/**/*.ts', 'ponder/ponder.schema.ts'],
                outputs: ['ponder/ponder.config.ts'],
                run: generatePonderConfig,
            },
            api: {
                inputs: ['ponder/ponder.schema.ts'],
                outputs: ['ponder/src/generated/api.ts'],
                run: runGenerateAPI,
            },
            reactHooks: {
                inputs: ['ponder/src/generated/api.ts'],
                outputs: ['www/generated/hooks/index.ts'],
                run: generateReactHooks,
            },
            // reactComponents: {
            //     inputs: ['ponder/src/generated/api.ts', 'ponder/ponder.schema.ts'],
            //     outputs: ['www/generated/components/**/*.tsx'],
            //     run: generateReactComponents,
            // },
            // demoPage: {
            //     inputs: ['ponder/src/generated/api.ts'],
            //     outputs: ['www/app/demo/page.tsx'],
            //     run: generateDemoPage,
            // },
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
