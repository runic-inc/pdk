import * as p from '@clack/prompts';
import { Command } from '@commander-js/extra-typings';
import cpy from 'cpy';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pico from 'picocolors';
import { checkPnpmInstalled, generateAllComponents, initGitRepo, installNodeDependencies, linkLocalPackages, selectLocalNetwork } from './calls.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { version } = require('../package.json');

const program = new Command()
    .name('create-patchwork')
    .version(version)
    .argument('[configFile]', 'Path to the JSON or TS file')
    .option('-l, --use-local-packages', 'Use local packages for Patchwork dependencies', false)
    .description('Create a new Patchwork project')
    .action(async (configFile, options) => createPatchwork(configFile, options));

type CreatePatchworkOptions = Awaited<ReturnType<typeof program.opts>>;

(async () => {
    try {
        await program.parseAsync();
    } catch (error) {
        console.error(pico.red('Error creating Patchwork app:'), error);
        process.exit(1);
    }
})();

async function createPatchwork(configFile: string | undefined, options: CreatePatchworkOptions) {
    const targetPath = process.cwd();
    const { useLocalPackages } = options;

    /*
     * Intro logging
     */
    console.log('\n');
    p.intro('🚀 ' + pico.bold(pico.cyan('create-patchwork')) + pico.dim(` v${version}`));
    if (useLocalPackages) p.log.warn(pico.yellow('Using local packages!'));

    /*
     * Check for pnpm
     * TODO: remove this when we support other pkg mgrs
     */
    if (!(await checkPnpmInstalled())) {
        p.log.error(pico.red('pnpm is not installed and is required by the PDK. Please install pnpm and try again.'));
        process.exit(0);
    }

    /*
     * User prompts
     */
    const prompts = await p.group(
        {
            template: () => {
                if (configFile) return Promise.resolve('custom');
                return p.select({
                    message: `Which starter template/configuration would you like to use?`,
                    initialValue: 'default',
                    options: [
                        { value: 'default', label: 'Default', hint: 'Basic starter template you can start customizing' },
                        { value: 'demo-composable-pfp', label: 'Composable PFP demo', hint: 'Dynamic NFT app where users compose PFPs from minted traits' },
                        //{ value: 'demo-canvas', label: 'Canvas demo', hint: 'Collaborative NFT app where users attach elements to a single NFT' },
                        { value: 'custom', label: 'Custom config file', hint: 'Provide your own patchwork.config.ts file' },
                    ],
                });
            },
            customConfig: ({ results }) => {
                if (configFile) return Promise.resolve(configFile);
                if (results.template === 'custom') {
                    return p.text({
                        message: 'Enter the path to your Patchwork configuration file',
                        placeholder: 'path/to/your/patchwork.config.ts',
                        validate: (value) => {
                            if (!value) {
                                return 'Please enter a path';
                            } else if (!fs.existsSync(value)) {
                                return 'File does not exist or is not accessible';
                            }
                        },
                    });
                }
                return Promise.resolve(undefined);
            },
            dirName: () =>
                p.text({
                    message: 'Where would you like to install the project?',
                    placeholder: './my-patchwork-app',
                    defaultValue: 'my-patchwork-app',
                }),
        },
        {
            onCancel: () => {
                p.cancel('Cancelled.');
                process.exit(0);
            },
        },
    );

    /*
     * Task formatting utils
     */
    const titled = (msg: string) => pico.magenta('→ ') + msg;
    const successful = (msg: string) => pico.green('✔ ') + msg;

    /*
     * Task runner
     */
    const templatesDir = path.join(__dirname, 'templates');
    const boilerplatePath = path.join(templatesDir, 'default');
    const targetDir = path.join(targetPath, prompts.dirName);
    const targetConfigPath = path.join(targetDir, 'patchwork.config.ts');

    await p
        .tasks([
            {
                title: titled('Copying core project files'),
                task: async () => {
                    await copyFiles(boilerplatePath, targetDir);
                    return successful('Copying core project files');
                },
            },
            {
                title: titled('Copying additional template files'),
                enabled: prompts.template !== 'default' && prompts.template !== 'custom',
                task: async () => {
                    await copyFiles(path.join(templatesDir, prompts.template), targetDir);
                    return successful('Copying additional template files');
                },
            },
            {
                title: titled('Copying user-provided template'),
                enabled: !!prompts.customConfig,
                task: async () => {
                    await copyConfigFile(path.resolve(process.cwd(), prompts.customConfig as string), targetConfigPath);
                    return successful('Copying user-provided template');
                },
            },
            {
                title: titled('Installing dependencies'),
                task: async () => {
                    await installNodeDependencies(targetDir, detectPackageManager());
                    return successful('Installing dependencies');
                },
            },
            {
                title: titled('Linking local packages'),
                enabled: useLocalPackages,
                task: async () => {
                    await linkLocalPackages(targetDir);
                    return successful('Linking local packages');
                },
            },
            {
                title: titled('Setting up git'),
                task: async () => {
                    await initGitRepo(targetDir);
                    return successful('Setting up git');
                },
            },
            {
                title: titled('Running PDK code generators'),
                task: async () => {
                    await generateAllComponents(targetDir, useLocalPackages, targetConfigPath);
                    await selectLocalNetwork(targetDir, useLocalPackages, targetConfigPath);
                    return successful('Running PDK code generators');
                },
            },
        ])
        .catch((error) => {
            p.log.error(pico.red(`Error creating Patchwork app:`));
            p.log.error(pico.red(JSON.stringify(error.cause)));
            process.exit(0);
        });

    /*
     * Outro logging
     */
    p.note(`To run your project via Docker, run:\n\ncd ${prompts.dirName}\npdk dev up`, pico.green('Project created! 🎉 '));
    p.log.info(pico.blue(`Share what you're building in our Discord server! https://discord.gg/vq43ss25Bu`));
    p.outro('👋');
    process.exit(0);
}

function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
    return 'pnpm';
    // TODO: uncomment this later once we support more than just pnpm in pdk
    // const userAgent = process.env.npm_config_user_agent || '';
    // if (userAgent.startsWith('yarn')) return 'yarn';
    // if (userAgent.startsWith('pnpm')) return 'pnpm';
    // if (userAgent.startsWith('bun')) return 'bun';
    // return 'npm';
}

async function copyFiles(src: string, dest: string) {
    //console.log(message, src, dest);
    await cpy(path.join(src, '**', '*'), dest, {
        rename: (name) => name.replace(/^_dot_/, '.'),
    });
}

async function copyConfigFile(src: string, dest: string) {
    //console.log(`Copying config file from ${src} to ${dest}`);
    try {
        const content = fs.readFileSync(src, 'utf8');
        fs.writeFileSync(dest, content, 'utf8');
    } catch (error) {
        console.error(pico.red(`Error copying config file: ${error}`));
        throw error;
    }
}
