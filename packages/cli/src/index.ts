import { Command } from 'commander';
import { loadPatchworkConfig } from './lib/loadProjectConfig';
import { GeneratorService } from './services/generator';
import { PatchworkProject, PDKContext } from './types';

const context: PDKContext = {
    rootDir: process.cwd(),
    network: 'local',
    config: {} as PatchworkProject,
    contracts: [],
    artifacts: {},
};

// // Run the generate stack
// async function runGenerateStack(plugins: PDKPlugin[], pluginNames: string[]): Promise<void> {
//     for (const plugin of plugins) {
//         if (pluginNames.length > 0 && !pluginNames.includes(plugin.name)) {
//             continue; // Skip plugins not in the specified list
//         }

//         if (plugin.generate) {
//             consola.start(`Running generator for ${plugin.name}`);
//             await plugin.generate({ context });
//         }
//     }
// }

// async function runAllGenerators(context: PDKContext, plugins: PDKPlugin[]) {
//     const tasks = new Listr([
//         {
//             title: 'Setting things up...',
//             task: async () => {
//                 context.config = await loadPatchworkConfig(context.rootDir);
//             },
//         },
//         {
//             title: 'Generating contracts',
//             task: async () => {
//                 await generateContracts(context);
//             },
//         },
//         {
//             title: 'Generating deployment scripts',
//             task: async () => {
//                 await generateDeployScripts(context);
//             },
//         },
//         {
//             title: 'Running plugin generators',
//             task: async () => {
//                 for (const plugin of plugins) {
//                     if (plugin.generate) {
//                         console.log(`Running generator for plugin: ${plugin.name}`);
//                         await plugin.generate({ context });
//                     }
//                 }
//             },
//         },
//     ]);

//     await tasks.run();
// }

// CLI program
const program = new Command();

(async () => {
    // Load project configuration
    context.config = await loadPatchworkConfig();

    const generatorService = new GeneratorService(context);

    // Example: Dynamically load plugins
    //const plugins: PDKPlugin[] = context.config.plugins;

    // Load plugins and register commands
    //await loadPlugins(plugins, context, program);

    // Top-level generate command
    const generateCommand = program.command('generate').description('Run generators');

    // Built-in subcommands for generate
    generateCommand
        .command('contracts')
        .description('Generate contract-related code')
        .action(async () => {
            await generatorService.runGeneratorByName('contracts');
        });

    generateCommand
        .command('deploy')
        .description('Generate deployment scripts')
        .action(async () => {
            await generatorService.runGeneratorByName('deploy');
        });

    generateCommand
        .command('all')
        .description('Run all generators')
        .action(async () => {
            await generatorService.runAllGenerators();
        });

    // Dynamic plugin-based subcommands for generate
    generateCommand
        .argument('[plugin]', 'Run generators for a specific plugin')
        .description('Run generators for a specific plugin')
        .action(async (plugin?: string) => {
            if (!plugin) {
                console.error('You must specify a generator name.');
                process.exit(1);
            }

            try {
                await generatorService.runGeneratorByName(plugin);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        });

    program.parse(process.argv);
})();
