import cpy from 'cpy';
import path, { dirname } from 'path';
import pico from "picocolors";
import { fileURLToPath } from 'url';
import { generateContracts, installNodeDependencies } from './calls.js';

// Convert `import.meta.url` to `__dirname` equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFiles(src: string, dest: string, message: string = 'copying from src to dest') {
    console.log(message, src, dest);
    await cpy(path.join(src, '**', '*'), dest, {
        rename: (name) => name.replace(/^_dot_/, '.'),
    });
}

(async () => {
    try {
        const templateProject = 'ponder_next';
        const targetPath = process.cwd();
        const targetDir = path.join(targetPath, 'patchworkApp');
        const templatePath = path.join(__dirname, '', 'templates', templateProject);

        // Copy template files
        await copyFiles(templatePath, targetDir, "Copying example app to templates path:");

        // Install dependencies (including @patchworkdev/common and pdk)
        await installNodeDependencies(targetDir);

        // Generate contracts using the newly installed pdk
        await generateContracts(targetDir);

        // Initialize git repo
        //await initGitRepo(targetDir);

        // Build contracts with Forge
        //await forgeBuild(targetDir);

        console.log(pico.green("Patchwork app created successfully!"));
    } catch (e) {
        console.error(pico.red("Error creating Patchwork app:"), e);
    }
})();