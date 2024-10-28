import fs from "fs/promises";
import prettier from "prettier";

export async function formatAndSaveFile(filePath: string, content: string, parser: string = "typescript") {
    const formatted = await formatFile(content, parser);
    await fs.writeFile(filePath, formatted, "utf-8");
}

export async function formatFile(content: string, parser: string = "typescript") {
    return await prettier.format(content, {
        parser: parser,
        tabWidth: 4,
        printWidth: 120,
    });
}