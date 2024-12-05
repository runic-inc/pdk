import { Command } from 'commander';
import { GeneratorService } from './services/generator';
import { PatchworkProject, PDKContext } from './types';
import { loadContext } from './utils/context';
import { loadPatchworkConfig } from './utils/loadProjectConfig';

let context: PDKContext = {
    rootDir: process.cwd(),
    network: 'local',
    config: {} as PatchworkProject,
    contracts: [],
    artifacts: {},
};

// CLI program
const program = new Command().name('pdk').version('0.1.0', '-v, --version').exitOverride();

(async () => {
    // Load context, or use default context object
    Object.assign(context, await loadContext());

    // Load project configuration
    context.config = await loadPatchworkConfig();

    // Initialize generator service
    const generatorService = new GeneratorService(context);

    // Top-level generate command
    const generateCommand = program.command('generate').description('Run generators').allowUnknownOption().helpCommand(false);

    // Built-in subcommands for generate
    generateCommand
        .command('all')
        .summary('Run all generators')
        .action(async () => {
            await generatorService.runAllGenerators();
        });
    generateCommand
        .command('contracts')
        .summary('Generate contract-related code')
        .action(async () => {
            await generatorService.runGenerator('contracts');
        });
    generateCommand
        .command('deploy')
        .summary('Generate deployment scripts')
        .description(
            'This command parses all of your contracts and generates deployment scripts.\nThese are used by our Docker workflow to automatically deploy your project to Anvil,\nbut can be also be used manually to run your deployments via Forge',
        )
        .action(async () => {
            await generatorService.runGenerator('deploy');
        });
    generateCommand
        .command('artifacts')
        .summary('Compile contracts and generate outputs (ABI, bytecode, etc.)')
        .action(async () => {
            await generatorService.runGenerator('artifacts');
        });

    // Add plugins w/ generators to the command list
    for (const plugin of context.config.plugins) {
        if (plugin.generate) {
            generateCommand
                .command(plugin.name.toLowerCase())
                .description(`Run ${plugin.name} plugin generators`)
                .action(async () => {
                    await generatorService.runGenerator(plugin.name.toLowerCase());
                });
        }
    }
    try {
        program.parse(process.argv);
    } catch (err) {
        // custom processing...
        console.log('\n');
    }
})();
