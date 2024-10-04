import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { analyzeAPI } from '../helpers/api';

export async function generateReactHooks(configPath: string) {
    const trpcRouter = path.join(path.dirname(configPath), "src", "api", "index.ts");
    const hooksFile = path.join(path.dirname(configPath), "app", "hooks", "index.ts");

    const apiStructure = analyzeAPI(trpcRouter);

    const hooksFileArray = [
        `import { trpc } from '../utils/trpc';

        `];
    for (let key in apiStructure) {
        const varname = key.split(".").map((word, index) => index === 1 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join("");
        hooksFileArray.push(`export const use${varname} = trpc.${key}.useQuery;
        `);
    }

    const formatted = await prettier.format(hooksFileArray.join(""), { parser: 'typescript', tabWidth: 4, printWidth: 120 });
    await fs.writeFile(hooksFile, formatted, 'utf-8');
}