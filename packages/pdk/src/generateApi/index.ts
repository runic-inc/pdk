import fs from 'fs/promises';
import path from 'path';
import { loadPonderSchema } from '../common/helpers/config';
// import { FieldDefinition, Schema } from "./ponderMocks";
import { formatAndSaveFile } from '../common/helpers/file';
import { logger } from '../common/helpers/logger';
import { FieldDefinition, SchemaModule, TableDefinition } from '../common/helpers/ponderSchemaMock';

export async function generateAPI(ponderSchema: string, apiOutputDir: string) {
    const schema = await loadPonderSchema(ponderSchema);

    // Check if the API output directory exists, create it if it doesn't
    try {
        await fs.access(apiOutputDir);
    } catch (error) {
        logger.info(`API output directory does not exist. Creating ${apiOutputDir}`);
        await fs.mkdir(apiOutputDir, { recursive: true });
    }

    // Generate the tRPC API content
    const output = await generateTrpcApi(schema);

    // Write the formatted API content to file
    const outputPath = path.join(apiOutputDir, 'api.ts');
    // await fs.writeFile(outputPath, apiContent, 'utf8');
    await formatAndSaveFile(outputPath, output.join('\n'));
    logger.info(`tRPC API generation completed. Output written to ${outputPath}`);
}

function getZodType(fieldDef: FieldDefinition): string {
    switch (fieldDef.type) {
        case 'bigint':
            return 'z.bigint()';
        case 'int':
            return 'z.number().int()';
        case 'hex':
            return 'z.string().regex(/^0x[a-fA-F0-9]+$/)';
        case 'boolean':
            return 'z.boolean()';
        case 'string':
            return 'z.string()';
        default:
            return 'z.unknown()';
    }
}

function generateFilterInput(tableName: string, tableDefinition: Record<string, FieldDefinition>): string {
    const filterFields = Object.entries(tableDefinition)
        .filter(([_, fieldDef]) => fieldDef.type !== 'many' && fieldDef.type !== 'one')
        .map(([fieldName, fieldDef]) => {
            const zodType = getZodType(fieldDef);
            return `${fieldName}: ${zodType}.optional(),`;
        })
        .join('\n        ');

    return `z.object({
        limit: z.number().min(1).max(100).default(10),
        lastTimestamp: z.number().optional(),
        ${filterFields}
    })`;
}

function generateWhereClause(tableName: string, tableDefinition: Record<string, FieldDefinition>): string {
    const filterConditions = Object.entries(tableDefinition)
        .filter(([_, fieldDef]) => fieldDef.type !== 'many' && fieldDef.type !== 'one')
        .map(([fieldName, fieldDef]) => {
            if (fieldDef.type === 'hex') {
                return `input.${fieldName} !== undefined ? eq(${tableName.toLowerCase()}.${fieldName}, input.${fieldName} as \`0x\${string}\`) : undefined`;
            }
            return `input.${fieldName} !== undefined ? eq(${tableName.toLowerCase()}.${fieldName}, input.${fieldName}) : undefined`;
        })
        .join(',\n          ');

    return `
        and(
          lastTimestamp ? gt(${tableName.toLowerCase()}.timestamp, BigInt(lastTimestamp)) : undefined,
          ${filterConditions}
        )
    `;
}

async function generateTrpcApi(schema: SchemaModule): Promise<string[]> {
    let apiContent: string[] = [
        `
import { eq, gt, and } from "@ponder/core";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";`,
    ];

    const imports: Set<string> = new Set();

    const apiObject = `
export const api = {
${Object.entries(schema)
    .filter((entry): entry is [string, TableDefinition] => entry[1].type === 'table')
    .map(([tableName, entity]) => {
        // if (entity.type === "enum") {
        //     return "";
        // }
        const tableDefinition = entity._schema!;
        const filterInput = generateFilterInput(tableName, tableDefinition);
        const whereClause = generateWhereClause(tableName, tableDefinition);
        imports.add(tableName);
        // const typeName = pascalCase(tableName);

        return `
  ${tableName}: router({
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input, ctx }) => {
        const result = await ctx.db
          .select()
          .from(${tableName})
          .where((${tableName.toLowerCase()}) => eq(${tableName.toLowerCase()}.id, input))
          .limit(1);
        return result[0] || null;
      }),
    
    getPaginated: publicProcedure
      .input(${filterInput})
      .query(async ({ input, ctx }) => {
        const { limit, lastTimestamp, ...filters } = input;
        
        const query = ctx.db
          .select()
          .from(${tableName})
          .where((${tableName.toLowerCase()}) => 
            ${whereClause}
          )
          .orderBy(${tableName}.timestamp)
          .limit(limit + 1);
        const items = await query;
        let nextTimestamp: number | undefined = undefined;
        if (items.length > limit) {
          const nextItem = items.pop();
          nextTimestamp = nextItem?.timestamp ? Number(nextItem.timestamp) : undefined;
        }
        return {
          items,
          nextTimestamp,
        };
      }),
  }),
`;
    })
    .join('')}
};
`;
    apiContent.push(`import {${[...imports].sort().join(',')}} from "../../ponder.schema"`);
    // apiContent.push(`type GetPaginatedOutput<T> = { items: T[], nextTimestamp: number | undefined }`);
    // [...imports].forEach((i) => {
    //     apiContent.push(`type ${_.upperFirst(_.camelCase(i))} = typeof ${i}.$inferSelect;`);
    // });
    apiContent.push();
    apiContent.push(apiObject);
    return apiContent;
}
