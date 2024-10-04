import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { analyzeAPI } from '../helpers/api';

export async function generateDemoPage(configPath: string) {
    const trpcRouter = path.join(path.dirname(configPath), "src", "api", "index.ts");
    const demoFile = path.join(path.dirname(configPath), "app", "demo", "page.tsx");

    const apiStructure = analyzeAPI(trpcRouter);

    const demoFileArray = [`"use client";
        
        `]
    const components = []
    for (let key in apiStructure) {
        if (key.includes("getPaginated")) {
            const entity = key.split(".")[0];
            const component = `${entity}List`;
            components.push(component);
            demoFileArray.push(`import ${component} from "../components/${component}";\n`);
        }
    }

    demoFileArray.push(
        `
        export default function Home() {
            return (
                <main className="flex min-h-screen flex-col items-center justify-between p-24">
        `
    );

    for (let component of components) {
        demoFileArray.push(`<${component} />\n`);
    }

    demoFileArray.push(`</main>
    );
    }`);

    const formatted = await prettier.format(demoFileArray.join(""), { parser: 'typescript', tabWidth: 4, printWidth: 120 });
    await fs.writeFile(demoFile, formatted, 'utf-8');

}