import fs from 'fs/promises';
import path from 'path';

async function getAbiJsonFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    try {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                const subFiles = await getAbiJsonFiles(filePath);
                files.push(...subFiles);
            } else if (entry.isFile() && entry.name.endsWith('.abi.json')) {
                files.push(filePath);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
    return files;
}


export async function generateABIs(buildOutDir: string, abiDir: string) {
    try {
        const files = await getAbiJsonFiles(buildOutDir);
        // we're going to be writing files to the out directory
        // naively we'll delete the current contents of the out directory
        const outFiles = await fs.readdir(abiDir);
        for (const file of outFiles) {
            await fs.unlink(path.join(abiDir, file));
        }

        let indexContent = "";
        for (const file of files) {
            const baseName = path.basename(file, '.abi.json');

            // Read the content of the .abi.json file
            const fileContent = await fs.readFile(file, { encoding: 'utf8' });

            // Generate the content for the .abi.ts file
            const tsContent = `export const ${baseName} = ${fileContent} as const;\n`;
            indexContent += `export * from './${baseName}.abi';\n`;

            // Write the .abi.ts file
            await fs.writeFile(path.join(abiDir, `${baseName}.abi.ts`), tsContent);
            console.log(`File created: ${baseName}.abi.ts`);
        }
        await fs.writeFile(path.join(abiDir, `index.ts`), indexContent);
    } catch (err) {
        console.error('Error:', err);
    }
}