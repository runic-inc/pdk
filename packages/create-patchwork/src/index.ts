import cpy from 'cpy';
import fs from 'fs/promises';
import { parseArgs } from 'node:util';
import path from 'path';
import pico from "picocolors";
import { fileURLToPath } from 'url';
import { forgeBuild, generateAllComponents, initGitRepo, installNodeDependencies, linkLocalPackages } from './calls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyFiles(src: string, dest: string, message: string = 'copying from src to dest') {
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

async function main() {
    try {
        const { values, positionals } = parseArgs({
            options: {
                'use-local-packages': {
                    type: 'boolean',
                },
            },
            allowPositionals: true,
        });

        const configArg = positionals[0];
        const templateProject = 'ponder_next';
        const targetPath = process.cwd();
        const targetDir = path.join(targetPath, 'patchworkApp');
        const templatePath = path.join(__dirname, '', 'templates', templateProject);

        // Check if we should use local packages
        const useLocalPackages = values['use-local-packages'] || process.env.USE_LOCAL_PACKAGES === 'true';

        // Copy template files
        await copyFiles(templatePath, targetDir, "Copying example app to templates path:");

        const exampleContracts = path.join(__dirname, '', 'templates', 'projects', 'canvas', 'contracts', 'src');
        const targetContractDir = path.join(targetDir, 'contracts', 'src');
        await copyFiles(exampleContracts, targetContractDir, "Copying example contracts to contracts path:");

        // Install dependencies (including @patchworkdev/common and pdk)
        await installNodeDependencies(targetDir);

        // Link local packages if specified
        if (useLocalPackages) {
            console.log(pico.yellow("Using local packages..."));
            await linkLocalPackages(targetDir);
        }

        // Initialize git repo
        await initGitRepo(targetDir);

        // Handle config file
        const defaultConfigPath = path.join(targetDir, 'patchwork.config.ts');
        if (configArg) {
            // Resolve the config path (supports both absolute and relative paths)
            const resolvedConfigPath = path.resolve(process.cwd(), configArg);

            try {
                await fs.access(resolvedConfigPath);
                await copyConfigFile(resolvedConfigPath, defaultConfigPath);
                console.log(pico.green(`Config file copied from ${resolvedConfigPath} to ${defaultConfigPath}`));
            } catch (error) {
                console.error(pico.red(`Error accessing or copying config file: ${error}`));
                process.exit(1);
            }
        } else {
            console.log(pico.yellow(`Using default config file: ${defaultConfigPath}`));
        }

        // Generate contracts using the appropriate pdk version
        // await generateContracts(targetDir, useLocalPackages, defaultConfigPath);

        // Build contracts with Forge
        await forgeBuild(targetDir);

        // Generate all components using pdk
        await generateAllComponents(targetDir, useLocalPackages, defaultConfigPath);

        console.log(pico.green("Patchwork app created successfully!"));
    } catch (e) {
        console.error(pico.red("Error creating Patchwork app:"), e);
    }
}

main();