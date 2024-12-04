import { Listr, ListrTask } from 'listr2';
import pc from 'picocolors';
import { PDKContext, PDKPlugin } from '../types';

export class GeneratorService {
    private context: PDKContext;
    private builtInGenerators: Record<string, (props: { context: PDKContext; log: (message: string) => void }) => Promise<void>>;

    constructor(context: PDKContext) {
        this.context = context;

        // Define built-in generators
        this.builtInGenerators = {
            contracts: async ({ context, log }) => {
                log('Starting contract generation...');
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
                log?.('Contracts generated!');
            },
            deploy: async ({ context, log }) => {
                log('Starting deployment script generation...');
                await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate work
                log('Deployment scripts generated!');
            },
        };
    }

    /**
     * Load plugin generators as Listr tasks.
     */
    private async loadPluginGenerators(): Promise<ListrTask<any>[]> {
        const plugins: PDKPlugin[] = this.context.config.plugins || [];
        return plugins
            .filter((plugin) => plugin.generate)
            .map((plugin) => ({
                title: pc.bold(`Running ${plugin.name} generator`),
                persistentOutput: true,
                task: (ctx, task) => plugin.generate!({ context: this.context, task }),
            }));
    }

    /**
     * Run all generators (built-in + plugin).
     */
    public async runAllGenerators(): Promise<void> {
        const builtins = this.getBuiltInGeneratorTasks();
        const plugins = await this.loadPluginGenerators();

        const tasks = new Listr([...builtins, ...plugins], {
            rendererOptions: {
                collapseSubtasks: false,
            },
        });

        await tasks.run();
    }

    /**
     * Run a specific generator by name.
     */
    public async runGeneratorByName(generatorName: string): Promise<void> {
        const builtins = this.getBuiltInGeneratorTasks();
        const plugins = await this.loadPluginGenerators();

        const allTasks = [...builtins, ...plugins];

        const task = allTasks.find((t) => typeof t.title === 'string' && t.title.toLowerCase().includes(generatorName.toLowerCase()));
        if (!task) {
            throw new Error(`Generator "${generatorName}" not found.`);
        }

        await new Listr([task], {
            rendererOptions: {
                showSubtasks: true,
            },
        }).run();
    }

    /**
     * Get built-in generators as Listr tasks.
     */
    private getBuiltInGeneratorTasks(): ListrTask<any>[] {
        return Object.keys(this.builtInGenerators).map((name) => ({
            title: pc.bold(`Generating ${name}`),
            persistentOutput: true, // Keeps logs visible after the task is completed
            bottomBar: 'C',
            task: (ctx, task) =>
                this.builtInGenerators[name]({
                    context: this.context,
                    log: (message) => {
                        task.output = message;
                    },
                }),
        }));
    }
}
