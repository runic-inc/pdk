import { Listr, ListrTask } from 'listr2';
import picocolors from 'picocolors';
import { generateContractDeployScripts, generateContracts } from '../commands/generate';
import { cliProcessor } from '../common/cliProcessor';
import { getForgePaths } from '../common/helpers/getForgePaths';
import { asyncLocalStorage, TaskLogger } from '../common/helpers/logger';
import { PDKContext } from '../types';
import LockFileManager from './lockFile';
// import { saveContext } from '../utils/context';

export class GeneratorService {
    // private context: PDKContext;
    private builtinGeneratorsMap: Map<string, ListrTask<PDKContext>>;
    private pluginGeneratorMap: Map<string, ListrTask<PDKContext>>;
    private lockFileManager: LockFileManager;

    constructor(lockFileManager: LockFileManager) {
        this.lockFileManager = lockFileManager;
        // this.context = context;
        this.builtinGeneratorsMap = new Map();
        this.pluginGeneratorMap = new Map();

        // Add built-in generators
        this.addBuiltInGenerators();
        // Add plugin generators
        this.addPluginGenerators();
    }

    /**
     * Add built-in generators to the map
     */
    private addBuiltInGenerators(): void {
        const { src, script, out } = getForgePaths();

        this.builtinGeneratorsMap
            // Contract generation task
            .set('contracts', {
                title: picocolors.bold('Generating contracts'),
                task: async (ctx, task) => {
                    const logger = new TaskLogger(task);
                    await asyncLocalStorage.run({ logger }, async () => {
                        await generateContracts(ctx.config, src);
                    });
                },
            })
            // Deploy script generation task
            .set('deploy', {
                title: picocolors.bold('Generating deploy scripts'),
                task: async (ctx, task) => {
                    const logger = new TaskLogger(task);
                    await asyncLocalStorage.run({ logger }, async () => {
                        await generateContractDeployScripts(ctx.config, src, script);
                    });
                },
            })
            // Build step task
            .set('artifacts', {
                title: picocolors.bold('Compiling contracts and generating artifacts'),
                task: async (ctx, task) => {
                    const logger = new TaskLogger(task);
                    await asyncLocalStorage.run({ logger }, async () => {
                        await cliProcessor.buildContracts(process.cwd());
                    });
                },
            });
    }

    /**
     * Add plugin generators to the map
     */
    private addPluginGenerators(): void {
        const ctx = this.lockFileManager.getCtx();
        [...ctx.config.plugins].forEach((plugin) => {
            if (plugin.generate) {
                this.pluginGeneratorMap.set(plugin.name.toLowerCase(), {
                    title: picocolors.bold(`Running ${plugin.name} generator`),
                    task: (ctx, task) => plugin.generate!({ context: ctx, task }),
                });
            }
        });
    }

    /**
     * Get a generator by key
     */
    public getGenerator(key: string): ListrTask<PDKContext> | undefined {
        return this.builtinGeneratorsMap.get(key.toLowerCase()) || this.pluginGeneratorMap.get(key.toLowerCase());
    }

    /**
     * Get all generators in insertion order
     */
    public getAllGenerators(): ListrTask<PDKContext>[] {
        return Array.from([...this.builtinGeneratorsMap.values(), ...this.pluginGeneratorMap.values()]);
    }

    /**
     * Get all generator keys
     */
    public getGeneratorKeys(): string[] {
        return Array.from([...this.builtinGeneratorsMap.keys(), ...this.pluginGeneratorMap.keys()]);
    }

    /**
     * Run a specific generator by key
     */
    public async runGenerator(key: string): Promise<void> {
        const task = this.getGenerator(key);
        if (!task) {
            throw new Error(`Unknown generator: ${key}`);
        }

        const listr = new Listr<PDKContext>([task], {
            rendererOptions: {
                collapseSubtasks: false,
            },
        });
        await listr.run(this.lockFileManager.getCtx()).then((ctx) => {
            this.lockFileManager.updateAndSaveCtx(ctx);
        });
    }

    /**
     * Run all generators in insertion order
     */
    public async runAllGenerators(): Promise<void> {
        const listr = new Listr<PDKContext>(this.getAllGenerators(), {
            rendererOptions: {
                collapseSubtasks: true,
            },
        });
        await listr.run(this.lockFileManager.getCtx()).then((ctx) => {
            this.lockFileManager.updateAndSaveCtx(ctx);
        });
    }

    /**
     * Run all core generators in insertion order
     */
    public async runAllCoreGenerators(): Promise<void> {
        const listr = new Listr<PDKContext>(Array.from(this.builtinGeneratorsMap.values()), {
            rendererOptions: {
                collapseSubtasks: false,
            },
        });
        await listr.run(this.lockFileManager.getCtx()).then((ctx) => {
            this.lockFileManager.updateAndSaveCtx(ctx);
        });
    }

    /**
     * Run all plugin generators in insertion order
     */
    public async runAllPluginGenerators(): Promise<void> {
        const listr = new Listr<PDKContext>(Array.from(this.pluginGeneratorMap.values()), {
            rendererOptions: {
                collapseSubtasks: false,
            },
        });
        await listr.run(this.lockFileManager.getCtx()).then((ctx) => {
            this.lockFileManager.updateAndSaveCtx(ctx);
        });
    }
}
