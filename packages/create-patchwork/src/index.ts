import cpy from 'cpy';
import { parseArgs } from 'node:util';
import path from 'path';
import pico from "picocolors";
import { fileURLToPath } from 'url';
import { forgeBuild, generateAllComponents, generateContracts, initGitRepo, installNodeDependencies, linkLocalPackages } from './calls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyFiles(src: string, dest: string, message: string = 'copying from src to dest') {
    console.log(message, src, dest);
    await cpy(path.join(src, '**', '*'), dest, {
        rename: (name) => name.replace(/^_dot_/, '.'),
    });
}

async function main() {
    try {
        const { positionals } = parseArgs({
            allowPositionals: true,
        });

        const customConfigPath = positionals[0];
        const templateProject = 'ponder_next';
        const targetPath = process.cwd();
        const targetDir = path.join(targetPath, 'patchworkApp');
        const templatePath = path.join(__dirname, '', 'templates', templateProject);

        // Check if we should use local packages
        const useLocalPackages = process.env.USE_LOCAL_PACKAGES === 'true' || process.argv.includes('--use-local-packages');

        // Copy template files
        await copyFiles(templatePath, targetDir, "Copying example app to templates path:");

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
        let configPath: string;
        if (customConfigPath) {
            // Use the provided custom config file
            configPath = customConfigPath;
            const defaultConfigPath = path.join(targetDir, 'patchwork.config.ts');
            await copyFiles(customConfigPath, defaultConfigPath, "Replacing default config with provided config:");
        } else {
            // Use the default config in the copied project
            configPath = path.join(targetDir, 'patchwork.config.ts');
        }

        // Generate contracts using the appropriate pdk version
        await generateContracts(targetDir, useLocalPackages, configPath);

        // Build contracts with Forge
        await forgeBuild(targetDir);

        // Generate all components using pdk
        await generateAllComponents(targetDir, useLocalPackages, configPath);

        console.log(pico.green("Patchwork app created successfully!"));
    } catch (e) {
        console.error(pico.red("Error creating Patchwork app:"), e);
    }
}

main();