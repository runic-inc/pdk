import fs from 'fs/promises';
import path from 'path';
import { analyzeAPI } from '../common/helpers/api';
import { ErrorCode, PDKError } from '../common/helpers/error';
import { formatAndSaveFile } from '../common/helpers/file';
import { logger } from '../common/helpers/logger';
import { pascalCase } from '../common/helpers/text';

export async function generateDemoPage(configPath: string) {
    const configDir = path.dirname(configPath);
    const trpcRouter = path.join(configDir, 'ponder', 'src', 'generated', 'api.ts');
    const demoFile = path.join(configDir, 'www', 'app', 'demo', 'page.tsx');

    const apiStructure = analyzeAPI(trpcRouter);
    const demoFileArray = [`"use client";\n\nimport React from "react";\n`];
    const components = [];

    for (let key in apiStructure) {
        if (key.includes('getPaginated')) {
            const entity = key.split('.')[0];
            const component = `${pascalCase(entity)}List`;
            components.push(component);
            demoFileArray.push(`import ${component} from "../../src/generated/components/${component}";\n`);
        }
    }

    demoFileArray.push(`
export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
`);

    for (let component of components) {
        demoFileArray.push(`            <${component} />\n`);
    }

    demoFileArray.push(`        </main>
    );
}`);

    // Ensure the demo directory exists
    const demoDir = path.dirname(demoFile);
    try {
        await fs.mkdir(demoDir, { recursive: true });
    } catch (error) {
        throw new PDKError(ErrorCode.DIR_NOT_FOUND, `Error creating demo directory at  ${demoDir}`);
    }

    await formatAndSaveFile(demoFile, demoFileArray.join(''));
    logger.info(`Demo page generated successfully at ${demoFile}`);
}
