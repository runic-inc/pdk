import cpy from 'cpy';
import { oraPromise } from 'ora';
import { execa } from 'execa';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pico from "picocolors";
import { installNodeDependencies, initGitRepo } from './calls.js';

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
        // need to get some of these values from the user. Interactive prompt with defaults
        const templateProject = 'ponder_next';
        const targetPath = process.cwd();
        const targetDir = path.join(targetPath, 'patchworkApp');

        const templatePath = path.join(__dirname, '', 'templates', templateProject);
        await copyFiles(templatePath, targetDir, "Copying example app to templates path:");

        const exampleContracts = path.join(__dirname, '', 'templates', 'projects', 'canvas', 'contracts', 'src');
        const targetContractDir = path.join(targetDir, 'contracts', 'src');
        await copyFiles(exampleContracts, targetContractDir, "Copying example contracts to contracts path:");

        // need to pnpm install

        // await oraPromise(
        //     execa('pnpm', ['install'], {
        //         cwd: targetDir,
        //         env: {
        //             ...process.env,
        //             ADBLOCK: '1',
        //             // we set NODE_ENV to development as pnpm skips dev
        //             // dependencies when production
        //             NODE_ENV: 'development',
        //             DISABLE_OPENCOLLECTIVE: '1',
        //         },
        //     }),
        //     {
        //         text: `Installing node dependencies`,
        //         failText: "Failed to install node dependencies.",
        //         successText: `Node dependencies installed successfully`,
        //     },
        // );
        await installNodeDependencies(targetDir);
        await initGitRepo(targetDir);
        // pdk deps install - foundry, solidity
        // git init `git init` , `git add .`, `git commit -m "Initial commit"`
    } catch (e) {
        console.error(e);
    }
})();
