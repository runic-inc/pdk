import crypto from 'crypto';
import path from 'path';
import { generateABIs } from '../../generateABIs';
import { generateAPI } from '../../generateApi';
import { generateDemoPage } from '../../generateDemoPage';
import { generateEventHooks } from '../../generateEventHooks';
import { generatePonderConfig } from '../../generatePonderConfig';
import { generateReactComponents } from '../../generateReactComponents';
import { generateReactHooks } from '../../generateReactHooks';
import { generateSchema } from '../../generateSchema';
import LockFileManager from '../lockFile';

export type GeneratorType =
    | 'contracts'
    | 'deployScripts'
    | 'forgeBuild'
    | 'abis'
    | 'schema'
    | 'eventHooks'
    | 'ponderConfig'
    | 'api'
    | 'reactHooks'
    | 'reactComponents'
    | 'demoPage';

export interface GeneratorConfig {
    inputs: string[];
    outputs: string[];
    requires: GeneratorType[];
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

export class DependencyManager {
    private lockFile: LockFileManager;
    private configPath: string;
    private generators: Record<GeneratorType, GeneratorConfig>;

    constructor(configPath: string, lockFile: LockFileManager) {
        this.configPath = configPath;
        this.lockFile = lockFile;
        this.generators = this.initializeGenerators();
    }

    private initializeGenerators(): Record<GeneratorType, GeneratorConfig> {
        return {
            contracts: {
                inputs: ['patchwork.config.ts'],
                outputs: ['contracts/src/**/*.sol'],
                requires: [],
                run: runGenerateContracts,
            },
            deployScripts: {
                inputs: ['patchwork.config.ts', 'contracts/src/**/*.sol'],
                outputs: ['contracts/script/**/*.sol'],
                requires: ['contracts'],
                run: runGenerateDeployScripts,
            },
            forgeBuild: {
                inputs: ['contracts/src/**/*.sol', 'contracts/script/**/*.sol'],
                outputs: ['contracts/out/**/*.json'],
                requires: ['contracts', 'deployScripts'],
                run: runForgeBuild,
            },
            abis: {
                inputs: ['contracts/out/**/*.abi.json'],
                outputs: ['ponder/abis/**/*.ts'],
                requires: ['forgeBuild'],
                run: generateABIs,
            },
            schema: {
                inputs: ['ponder/abis/**/*.ts', 'patchwork.config.ts'],
                outputs: ['ponder/ponder.schema.ts'],
                requires: ['abis'],
                run: generateSchema,
            },
            eventHooks: {
                inputs: ['ponder/abis/**/*.ts', 'ponder/ponder.schema.ts', 'patchwork.config.ts'],
                outputs: ['ponder/src/generated/events.ts'],
                requires: ['abis', 'schema'],
                run: generateEventHooks,
            },
            ponderConfig: {
                inputs: ['ponder/abis/**/*.ts', 'ponder/ponder.schema.ts'],
                outputs: ['ponder/ponder.config.ts'],
                requires: ['abis', 'schema'],
                run: generatePonderConfig,
            },
            api: {
                inputs: ['ponder/ponder.schema.ts'],
                outputs: ['ponder/src/generated/api.ts'],
                requires: ['schema'],
                run: runGenerateAPI,
            },
            reactHooks: {
                inputs: ['ponder/src/generated/api.ts'],
                outputs: ['www/generated/hooks/index.ts'],
                requires: ['api'],
                run: generateReactHooks,
            },
            reactComponents: {
                inputs: ['ponder/src/generated/api.ts', 'ponder/ponder.schema.ts'],
                outputs: ['www/generated/components/**/*.tsx'],
                requires: ['api', 'schema'],
                run: generateReactComponents,
            },
            demoPage: {
                inputs: ['ponder/src/generated/api.ts'],
                outputs: ['www/app/demo/page.tsx'],
                requires: ['reactComponents'],
                run: generateDemoPage,
            },
        };
    }

    
    private async calculateFilesHash(patterns: string[], generator?: GeneratorType): Promise<string> {
        const hash = crypto.createHash('sha256');

        for (const pattern of patterns) {
            const files = await this.lockFile.getMatchingFiles(pattern);
            const sortedFiles = files.sort(); // Sort for consistent ordering

            for (const file of sortedFiles) {
                const content = await this.lockFile.calculateFileHash(file);

                hash.update(`${file}:${content}`);
            }
        }

        const finalHash = hash.digest('hex');
        return finalHash;
    }

    private getGeneratorStateKey(generator: GeneratorType): string {
        return `generator:${generator}`;
    }

    private async hasInputsChanged(generator: GeneratorType): Promise<boolean> {
        const config = this.generators[generator];
        const stateKey = this.getGeneratorStateKey(generator);
        const previousHash = this.lockFile.getFileHash(stateKey);

        //if (generator === 'contracts') {
        //    console.log(stateKey, previousHash);
        // }
        if (!previousHash) return true;

        const currentInputHash = await this.calculateFilesHash(config.inputs, generator);

        //if (generator === 'contracts') {
        //   console.log(currentInputHash);
        //    console.log(config.inputs);
        // }
        return currentInputHash !== previousHash;
    }

    public async getRequiredGenerators(): Promise<GeneratorType[]> {
        const required = new Set<GeneratorType>();

        const checkGenerator = async (generator: GeneratorType) => {
            if (required.has(generator)) return;

            // Check required generators first
            for (const req of this.generators[generator].requires) {
                await checkGenerator(req);
            }

            if (await this.hasInputsChanged(generator)) {
                required.add(generator);

                // Add dependent generators
                for (const [dependent, config] of Object.entries(this.generators)) {
                    if (config.requires.includes(generator)) {
                        await checkGenerator(dependent as GeneratorType);
                    }
                }
            }
        };

        for (const generator of Object.keys(this.generators) as GeneratorType[]) {
            await checkGenerator(generator);
        }

        return this.sortByDependencies(Array.from(required));
    }

    private sortByDependencies(generators: GeneratorType[]): GeneratorType[] {
        const visited = new Set<GeneratorType>();
        const sorted: GeneratorType[] = [];

        const visit = (generator: GeneratorType) => {
            if (visited.has(generator)) return;
            visited.add(generator);

            for (const required of this.generators[generator].requires) {
                if (generators.includes(required)) {
                    visit(required);
                }
            }

            sorted.push(generator);
        };

        generators.forEach(visit);
        return sorted;
    }

    public async runGenerators(generators: GeneratorType[]) {
        for (const generator of generators) {
            console.log(`Running generator: ${generator}`);

            const config = this.generators[generator];
            await config.run(this.configPath);

            // Update state after successful run
            const inputHash = await this.calculateFilesHash(config.inputs);
            const stateKey = this.getGeneratorStateKey(generator);
            this.lockFile.updateFileHash(stateKey, inputHash);
        }
    }
}
