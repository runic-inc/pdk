import { Command } from 'commander';
import { PDKContext, PatchworkPlugin } from './types';

const context: PDKContext = {
    rootDir: process.cwd(),
    network: 'local',
    config: {
        plugins: [ponder(), react()],
    },
    contracts: [],
    artifacts: {},
};

export function react(): PatchworkPlugin {
    return {
        name: 'React',
        generate: (context: PDKContext) => {
            console.log('Generating Wagmi hooks...');
            if (context.artifacts['trpc']) {
                console.log('Found valid tRPC router definition at: ', context.artifacts['trpc']);
                console.log('Generating tRPC hooks...');
            }
        },
    };
}

export function ponder(): PatchworkPlugin {
    return {
        name: 'Ponder',
        generate: ({ artifacts }: PDKContext) => {
            console.log('Generating schema...');
            console.log('Generating event filters...');
            console.log('Generating tRPC API...');
            artifacts['trpc'] = 'my/path/to/trpcRouter.ts';
        },
    };
}

// Dynamically load and initialize plugins
async function loadPlugins(plugins: PatchworkPlugin[]): Promise<void> {
    for (const plugin of plugins) {
        // console.log(`Loading plugin: ${plugin.name}`);
        if (plugin.commands) {
            const commands = plugin.commands(context);
            if (Array.isArray(commands)) {
                commands.forEach((cmd) => program.addCommand(cmd));
            } else {
                program.addCommand(commands);
            }
        }
    }
}

// Run the generate stack
async function runGenerateStack(plugins: PatchworkPlugin[], pluginNames: string[]): Promise<void> {
    for (const plugin of plugins) {
        if (pluginNames.length > 0 && !pluginNames.includes(plugin.name)) {
            continue; // Skip plugins not in the specified list
        }

        if (plugin.generate) {
            console.log(`Running generator for ${plugin.name}`);
            await plugin.generate(context);
        }
    }
}

// CLI program
const program = new Command();

(async () => {
    // Example: Dynamically load plugins
    const plugins: PatchworkPlugin[] = context.config.plugins;

    // Load plugins and register commands
    await loadPlugins(plugins);

    // Top-level generate command
    const generateCommand = program.command('generate').description('Run generators');

    // Built-in subcommands for generate
    generateCommand
        .command('contracts')
        .description('Generate contract-related code')
        .action(async () => {
            console.log('Generating contracts...');
            // Add built-in logic for generating contracts here
        });

    generateCommand
        .command('deploy')
        .description('Generate deployment scripts')
        .action(async () => {
            console.log('Generating deployment scripts...');
            // Add built-in logic for generating deploy scripts here
        });

    generateCommand
        .command('all')
        .description('Run all generators')
        .action(async () => {
            console.log('Running all generators...');
            const pluginNames = plugins.map((plugin) => plugin.name);
            await runGenerateStack(plugins, pluginNames);
        });

    // Dynamic plugin-based subcommands for generate
    generateCommand
        .command('[plugins...]') // Accepts a list of plugin names
        .description('Run generators for specific plugins')
        .action(async (pluginNames: string[] = []) => {
            // Get the list of valid plugin names
            const validPlugins = plugins.map((plugin) => plugin.name);

            // Find any invalid plugin names
            const invalidPlugins = pluginNames.filter((name) => !validPlugins.includes(name));

            if (invalidPlugins.length > 0) {
                console.error(`Error: Unknown plugin(s): ${invalidPlugins.join(', ')}`);
                console.error(`Available plugins: ${validPlugins.join(', ')}`);
                process.exit(1);
            }

            if (pluginNames.length > 0) {
                console.log(`Running generators for plugins: ${pluginNames.join(', ')}`);
            }

            await runGenerateStack(plugins, pluginNames);
        });

    program.parse(process.argv);
})();
