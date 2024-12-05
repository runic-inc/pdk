import { Listr, ListrTask } from 'listr2';
import picocolors from 'picocolors';
import { PDKContext } from '../types';
import { saveContext } from '../utils/context';

export class GeneratorService {
    private context: PDKContext;
    private generatorMap: Map<string, ListrTask<PDKContext>>;

    constructor(context: PDKContext) {
        this.context = context;
        this.generatorMap = new Map();
        // Add built-in generators
        this.addBuiltInGenerators();
        // Add plugin generators
        this.addPluginGenerators();
    }

    /**
     * Add built-in generators to the map
     */
    private addBuiltInGenerators(): void {
        this.generatorMap
            // Contract generation task
            .set('contracts', {
                title: picocolors.bold('Generating contracts'),
                task: async (ctx, task) => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                },
            })
            // Deploy script generation task
            .set('deploy', {
                title: picocolors.bold('Generating deploy scripts'),
                task: async (ctx, task) => {
                    await new Promise((resolve) => setTimeout(resolve, 600));
                },
            })
            // Build step task
            .set('artfacts', {
                title: picocolors.bold('Compiling contracts and generating artifacts'),
                task: async (ctx, task) => {
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                },
            });
    }

    /**
     * Add plugin generators to the map
     */
    private addPluginGenerators(): void {
        [...this.context.config.plugins].forEach((plugin) => {
            if (plugin.generate) {
                this.generatorMap.set(plugin.name.toLowerCase(), {
                    title: picocolors.bold(`Running ${plugin.name} generator`),
                    task: (ctx, task) => plugin.generate!({ context: this.context, task }),
                });
            }
        });
    }

    /**
     * Get a generator by key
     */
    public getGenerator(key: string): ListrTask<PDKContext> | undefined {
        return this.generatorMap.get(key.toLowerCase());
    }

    /**
     * Get all generators in insertion order
     */
    public getAllGenerators(): ListrTask<PDKContext>[] {
        return Array.from(this.generatorMap.values());
    }

    /**
     * Get generator keys
     */
    public getGeneratorKeys(): string[] {
        return Array.from(this.generatorMap.keys());
    }

    /**
     * Run a specific generator by key
     */
    public async runGenerator(key: string): Promise<void> {
        const task = this.getGenerator(key);
        if (!task) {
            throw new Error(`Unknown generator: ${key}`);
        }

        const listr = new Listr<PDKContext>([task]);
        await listr.run(this.context).then((ctx) => {
            saveContext(ctx);
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
        await listr.run(this.context).then((ctx) => {
            saveContext(ctx);
        });
    }
}
