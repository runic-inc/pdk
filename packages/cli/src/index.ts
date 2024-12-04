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

// CLI program
const program = new Command();

(async () => {
    // Load project configuration
    context.config = await loadPatchworkConfig();

    const generatorService = new GeneratorService(context);

    // Top-level generate command
    const generateCommand = program.command('generate').description('Run generators');

    generateCommand
        .argument('all', 'Run all generators')
        .description('Run all generators')
        .action(async () => {
            await generatorService.runAllGenerators();
        });

    // Built-in subcommands for generate
    generateCommand
        .argument('contracts', 'Generate contract-related code')
        .description('Generate contract-related code')
        .action(async () => {
            await generatorService.runGenerator('contracts');
        });

    generateCommand
        .argument('deploy', 'Generate deployment scripts')
        .description('Generate deployment scripts')
        .action(async () => {
            await generatorService.runGenerator('deploy');
        });

    generateCommand
        .argument('build', 'Build contracts')
        .description('Build contracts')
        .action(async () => {
            await generatorService.runGenerator('build');
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

            if (!generatorService.hasGenerator(plugin)) {
                console.error(`No generator found for ${plugin}.`);
                process.exit(1);
            }

            try {
                await generatorService.runGenerator(plugin);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        });

    program.parse(process.argv);
})();
