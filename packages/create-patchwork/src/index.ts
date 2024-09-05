import cpy from 'cpy';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Convert `import.meta.url` to `__dirname` equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyTemplate(src: string, dest: string) {
    const targetPath = path.join(__dirname);
    console.log('Copying examples to templates path:', src, dest);
    await cpy(path.join(src, '**', '*'), dest, {
        rename: (name) => name.replace(/^_dot_/, '.'),
    });
}

(async () => {
    try {
        const templateProject = 'ponder_next';
        // currently we change to the working directory but we should create a directory to put the template files in.
        // further option would be to have a command line directory option but the default should be to create a directory
        const cwd = process.cwd();
        const templatePath = path.join(__dirname, '', 'templates', templateProject);
        await copyTemplate(templatePath, cwd);
        // need to pnpm install
        // pdk deps install - foundry, solidity
        // git init `git init` , `git add .`, `git commit -m "Initial commit"`
    } catch (e) {
        console.error(e);
    }
})();
