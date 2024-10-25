import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { analyzeAPI } from '../helpers/api';
import { pascalCase } from '../helpers/text';

export async function generateReactHooks(configPath: string) {
    try {
        const configDir = path.dirname(configPath);
        const trpcRouter = path.join(configDir, 'ponder', 'src', 'generated', 'api.ts');
        const hooksDir = path.join(configDir, 'www', 'generated', 'hooks');
        const hooksFile = path.join(hooksDir, 'index.ts');

        // Check if tRPC router file exists
        try {
            await fs.access(trpcRouter);
        } catch (error) {
            console.error(`Error: Unable to access tRPC router file at ${trpcRouter}`);
            return;
        }

        // Ensure hooks directory exists
        try {
            await fs.mkdir(hooksDir, { recursive: true });
        } catch (error) {
            console.error(`Error creating hooks directory at ${hooksDir}:`, error);
            return;
        }

        const apiStructure = analyzeAPI(trpcRouter);
        const hooksFileArray = [
            `import { trpc } from '../utils/trpc';
            `,
        ];

        for (let key in apiStructure) {
            hooksFileArray.push(`export const use${pascalCase(key)} = trpc.${key}.useQuery;
            `);
        }

        try {
            const formatted = await prettier.format(hooksFileArray.join(''), {
                parser: 'typescript',
                tabWidth: 4,
                printWidth: 120,
            });
            await fs.writeFile(hooksFile, formatted, 'utf-8');
            console.log(`React hooks generated successfully at ${hooksFile}`);
        } catch (error) {
            console.error('Error formatting or writing hooks file:', error);
        }
    } catch (error) {
        console.error('Error generating React hooks:', error);
    }
}
