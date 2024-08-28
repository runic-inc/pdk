import cpy from 'cpy';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

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
