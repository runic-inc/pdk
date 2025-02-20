import fs from 'fs/promises';
import path from 'path';
import { loadPonderSchema } from '../../common/helpers/config';
// import { FieldDefinition, Schema } from "./ponderMocks";
import { formatAndSaveFile } from '../../common/helpers/file';
import { logger } from '../../common/helpers/logger';
import { SchemaModule, TableDefinition } from '../../common/helpers/ponderSchemaMock';
import { pascalCase } from '../../common/helpers/text';

export async function generateTypes(rootDir: string): Promise<{ [key: string]: string }> {
    const schemaPath = path.join(rootDir, 'ponder', 'ponder.schema.ts');
    const typesOutputDir = path.join(rootDir, 'ponder', 'src', 'generated');
    const schema = await loadPonderSchema(schemaPath);

    // Check if the API output directory exists, create it if it doesn't
    try {
        await fs.access(typesOutputDir);
    } catch (error) {
        logger.info(`API output directory does not exist. Creating ${typesOutputDir}`);
        await fs.mkdir(typesOutputDir, { recursive: true });
    }

    // Generate the tRPC API content
    const output = await generator(schema);

    // Write the formatted API content to file
    const outputPath = path.join(typesOutputDir, 'types.ts');
    // await fs.writeFile(outputPath, apiContent, 'utf8');
    await formatAndSaveFile(outputPath, output.join('\n'));
    logger.info(`type generation completed. Output written to ${outputPath}`);
    return { types: typesOutputDir };
}

async function generator(schema: SchemaModule): Promise<string[]> {
    const imports: string[] = [];
    const output = Object.entries(schema)
        .filter((entry): entry is [string, TableDefinition] => entry[1].type === 'table')
        .flatMap(([tableName, entity]) => {
            imports.push(tableName);
            return [
                `export type ${pascalCase(tableName)} = typeof ${tableName}.$inferSelect;`,
                `export type ${pascalCase(tableName)}Insert = typeof ${tableName}.$inferInsert;`,
            ];
        });

    output.unshift(`import {${imports.join(',')}} from "../../ponder.schema"`);
    return output;
}
