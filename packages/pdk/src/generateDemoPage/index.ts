import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { analyzeAPI } from "../helpers/api";

export async function generateDemoPage(configPath: string) {
    try {
        const configDir = path.dirname(configPath);
        const trpcRouter = path.join(configDir, "src", "api", "index.ts");
        const demoFile = path.join(configDir, "app", "demo", "page.tsx");

        // Check if the trpcRouter file exists
        try {
            await fs.access(trpcRouter);
        } catch (error) {
            console.error(
                `Error: Unable to access tRPC router file at ${trpcRouter}`
            );
            return;
        }

        const apiStructure = analyzeAPI(trpcRouter);
        const demoFileArray = [`"use client";\n\n`];
        const components = [];

        for (let key in apiStructure) {
            if (key.includes("getPaginated")) {
                const entity = key.split(".")[0];
                const component = `${entity}List`;
                components.push(component);
                demoFileArray.push(
                    `import ${component} from "../components/${component}";\n`
                );
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

        const formatted = await prettier.format(demoFileArray.join(""), {
            parser: "typescript",
            tabWidth: 4,
            printWidth: 120,
        });

        // Ensure the demo directory exists
        const demoDir = path.dirname(demoFile);
        try {
            await fs.mkdir(demoDir, { recursive: true });
        } catch (error) {
            console.error(
                `Error creating demo directory at ${demoDir}:`,
                error
            );
            return;
        }

        // Write the formatted content to the demo file
        await fs.writeFile(demoFile, formatted, "utf-8");
        console.log(`Demo page generated successfully at ${demoFile}`);
    } catch (error) {
        console.error("Error generating demo page:", error);
    }
}
