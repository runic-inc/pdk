import * as p from '@clack/prompts';
import { Command } from '@commander-js/extra-typings';
import cpy from 'cpy';
import _ from 'lodash';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pico from 'picocolors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command()
    .name('create-patchwork')
    // .version('0.0.3')
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
    const prompts = await p.group(
        {
            template: ({ results }) =>
                p.select({
                    message: `Which starter template would you like to use?`,
                    options: [
                        { value: 'default', label: 'Default', hint: 'Barebones starter template you can start customizing' },
                        { value: 'composable-pfp', label: 'Composable PFP demo', hint: 'A functional NFT app where users can compose dynamic PFPs' },
                        { value: 'canvas', label: 'Canvas demo', hint: 'A function NFT app where users collectively attach elements to a collaborative NFT' },
                        { value: 'custom', label: 'Custom', hint: 'Use a custom Patchwork configuration file' },
                    ],
                }),
            dirName: () =>
                p.text({
                    message: 'Where would you like to install the project?',
                    placeholder: 'my-patchwork-app',
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

    console.log('createPatchwork', prompts);

    /*
    const targetPath = process.cwd();
    const templatePath = path.join(__dirname, '', 'templates', templateProject);
    const exampleProjectPath = path.join(__dirname, '', 'templates');

    const { useLocalPackages } = options;

    // if configFile is set try to use it if not ask user which example config they want to use
    const configPath = configFile ? path.resolve(process.cwd(), configFile) : path.join(exampleProjectPath, await selectExampleConfig());
    console.log(configPath);

    const projectName = await getProjectNameFromConfig(configPath);

    const projectFolderName = sanitizeProjectName(projectName);
    const targetDir = path.join(targetPath, projectFolderName);

    log.info(pico.blue(`Creating project "${projectName}" in directory: ${projectFolderName}`));

    await copyFiles(templatePath, targetDir, 'Copying example app to templates path:');
    const targetConfigPath = path.join(targetDir, 'patchwork.config.ts');
    await copyConfigFile(configPath, targetConfigPath);

    // Install dependencies (including @patchworkdev/common and pdk)
    await installNodeDependencies(targetDir);

    if (useLocalPackages) {
        await linkLocalPackages(targetDir);
    }

    // Initialize git repo
    await initGitRepo(targetDir);

    // Generate all components using pdk
    await generateAllComponents(targetDir, useLocalPackages, targetConfigPath);

    await selectLocalNetwork(targetDir, useLocalPackages, targetConfigPath);

    console.log(pico.green(`Patchwork app "${projectName}" created successfully in directory "${projectFolderName}"!`));
    */
}

async function copyFiles(src: string, dest: string, message = 'copying from src to dest') {
    console.log(message, src, dest);
    await cpy(path.join(src, '**', '*'), dest, {
        rename: (name) => name.replace(/^_dot_/, '.'),
    });
}

async function copyConfigFile(src: string, dest: string) {
    console.log(`Copying config file from ${src} to ${dest}`);
    try {
        const content = await fs.readFile(src, 'utf8');
        await fs.writeFile(dest, content, 'utf8');
    } catch (error) {
        console.error(pico.red(`Error copying config file: ${error}`));
        throw error;
    }
}

function sanitizeProjectName(name: string): string {
    // Replace spaces and special characters with hyphens
    // Remove any non-alphanumeric characters except hyphens
    // Trim hyphens from start and end
    // Ensure the name starts with a letter (prepend 'project-' if it doesn't)
    return (
        _.chain(name)
            .kebabCase()
            // Ensure starts with letter
            .thru((name) => (/^[a-z]/.test(name) ? name : `project-${name}`))
            .value()
    );
}

async function getProjectNameFromConfig(configPath: string): Promise<string> {
    try {
        const content = await fs.readFile(configPath, 'utf8');
        const match = content.match(/name:\s*["'](.+?)["']/);
        if (match?.[1]) {
            return match[1];
        }
        throw new Error('Project name not found in config file');
    } catch (error) {
        console.error(pico.red(`Error reading project name from config: ${error}`));
        throw error;
    }
}

async function selectExampleConfig(): Promise<string> {
    return 'default/patchwork.config.ts';
    /*const project = (await select({
        message: 'Choose a starter template',
        options: [
            { value: 'default/patchwork.config.ts', label: 'Default' },
            { value: 'demo-canvas/patchwork.config.ts', label: 'Demo app: Canvas' },
            { value: 'demo-pfp/patchwork.config.ts', label: 'Demo app: PFP' },
        ],
    })) as string;

    if (isCancel(project)) {
        process.exit(0);
    }

    return project;*/
}
