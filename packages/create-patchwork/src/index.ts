import cpy from 'cpy';
import fs from 'fs/promises';
import { parseArgs } from 'node:util';
import path from 'path';
import pico from "picocolors";
import { fileURLToPath } from 'url';
import { forgeBuild, forgeInit, generateAllComponents, generateContracts, initGitRepo, installNodeDependencies } from './calls.js';

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

function sanitizeProjectName(name: string): string {
    // Replace spaces and special characters with hyphens
    // Remove any non-alphanumeric characters except hyphens
    // Trim hyphens from start and end
    // Ensure the name starts with a letter (prepend 'project-' if it doesn't)
    let sanitized = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    if (!/^[a-z]/.test(sanitized)) {
        sanitized = `project-${sanitized}`;
    }
    
    return sanitized;
}

async function getProjectNameFromConfig(configPath: string): Promise<string> {
    try {
        const content = await fs.readFile(configPath, 'utf8');
        const match = content.match(/name:\s*["'](.+?)["']/);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error('Project name not found in config file');
    } catch (error) {
        console.error(pico.red(`Error reading project name from config: ${error}`));
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
        const templatePath = path.join(__dirname, '', 'templates', templateProject);

        // Check if we should use local packages
        const useLocalPackages = values['use-local-packages'] || process.env.USE_LOCAL_PACKAGES === 'true';

        // Handle config file
        let configPath: string;
        if (configArg) {
            configPath = path.resolve(process.cwd(), configArg);
        } else {
            configPath = path.join(templatePath, 'patchwork.config.ts');
        }

        // Get project name from config and sanitize it
        const projectName = await getProjectNameFromConfig(configPath);
        const sanitizedProjectName = sanitizeProjectName(projectName);
        const targetDir = path.join(targetPath, sanitizedProjectName);

        console.log(pico.blue(`Creating project "${projectName}" in directory: ${sanitizedProjectName}`));

        // Copy template files
        await copyFiles(templatePath, targetDir, "Copying example app to templates path:");

        // Copy or use the provided config file
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

        // Install dependencies (including @patchworkdev/common and pdk)
        await installNodeDependencies(targetDir);

        // Initialize git repo
        await initGitRepo(targetDir);

        // Generate contracts using the appropriate pdk version
        await generateContracts(targetDir, useLocalPackages, defaultConfigPath);

        // Initialize forge
        await forgeInit(targetDir);

        // Build contracts with Forge
        await forgeBuild(targetDir);

        // Generate all components using pdk
        await generateAllComponents(targetDir, useLocalPackages, defaultConfigPath);

        console.log(pico.green(`Patchwork app "${projectName}" created successfully in directory "${sanitizedProjectName}"!`));
    } catch (e) {
        console.error(pico.red("Error creating Patchwork app:"), e);
    }
}

main();