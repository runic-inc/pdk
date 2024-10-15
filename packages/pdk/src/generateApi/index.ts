import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { loadPonderSchema } from "../helpers/config";
import { FieldDefinition, Schema } from "./ponderMocks";

function getZodType(fieldDef: FieldDefinition): string {
    switch (fieldDef.type) {
        case "bigint":
            return "z.bigint()";
        case "int":
            return "z.number().int()";
        case "hex":
            return "z.string().regex(/^0x[a-fA-F0-9]+$/)";
        case "boolean":
            return "z.boolean()";
        case "string":
            return "z.string()";
        default:
            return "z.unknown()";
    }
}

function generateFilterInput(
    tableName: string,
    tableDefinition: Record<string, FieldDefinition>
): string {
    const filterFields = Object.entries(tableDefinition)
        .filter(
            ([_, fieldDef]) =>
                fieldDef.type !== "many" && fieldDef.type !== "one"
        )
        .map(([fieldName, fieldDef]) => {
            const zodType = getZodType(fieldDef);
            return `${fieldName}: ${zodType}.optional(),`;
        })
        .join("\n        ");

    return `z.object({
        limit: z.number().min(1).max(100).default(10),
        lastTimestamp: z.number().optional(),
        ${filterFields}
    })`;
}

function generateWhereClause(
    tableName: string,
    tableDefinition: Record<string, FieldDefinition>
): string {
    const filterConditions = Object.entries(tableDefinition)
        .filter(
            ([_, fieldDef]) =>
                fieldDef.type !== "many" && fieldDef.type !== "one"
        )
        .map(([fieldName, fieldDef]) => {
            if (fieldDef.type === "hex") {
                return `input.${fieldName} !== undefined ? eq(${tableName.toLowerCase()}.${fieldName}, input.${fieldName} as \`0x\${string}\`) : undefined`;
            }
            return `input.${fieldName} !== undefined ? eq(${tableName.toLowerCase()}.${fieldName}, input.${fieldName}) : undefined`;
        })
        .join(",\n          ");

    return `
        and(
          lastTimestamp ? gt(${tableName.toLowerCase()}.timestamp, BigInt(lastTimestamp)) : undefined,
          ${filterConditions}
        )
    `;
}

async function generateTrpcApi(schema: Schema): Promise<string> {
    let apiContent = `
import { eq, gt, and } from "@ponder/core";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";

export const api = {
${Object.entries(schema)
            .map(([tableName, entity]) => {
                if (entity.type === "enum") {
                    return "";
                }
                const tableDefinition = entity.tableDefinition!;
                const filterInput = generateFilterInput(tableName, tableDefinition);
                const whereClause = generateWhereClause(tableName, tableDefinition);

                return `
  ${tableName}: router({
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input, ctx }) => {
        const result = await ctx.db
          .select()
          .from(ctx.tables.${tableName})
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
          .from(ctx.tables.${tableName})
          .where((${tableName.toLowerCase()}) => 
            ${whereClause}
          )
          .orderBy(ctx.tables.${tableName}.timestamp)
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
            .join("")}
};
`;
    return await prettier.format(apiContent, {
        parser: "typescript",
        tabWidth: 4,
    });
}

export async function generateAPI(ponderSchema: string, apiOutputDir: string) {
    try {
        // Check if the ponder schema file exists
        try {
            await fs.access(ponderSchema);
        } catch (error) {
            console.error(
                `Error: Unable to access Ponder schema file at ${ponderSchema}`
            );
            return;
        }

        const schema = await loadPonderSchema(ponderSchema);
        if (schema === undefined) {
            console.error("Error importing PonderSchema");
            return;
        }

        // Check if the API output directory exists, create it if it doesn't
        try {
            await fs.access(apiOutputDir);
        } catch (error) {
            console.log(
                `API output directory does not exist. Creating ${apiOutputDir}`
            );
            await fs.mkdir(apiOutputDir, { recursive: true });
        }

        // Generate the tRPC API content
        const apiContent = await generateTrpcApi(schema);

        // Write the formatted API content to file
        const outputPath = path.join(apiOutputDir, "api.ts");
        await fs.writeFile(outputPath, apiContent, "utf8");
        console.log(
            `tRPC API generation completed. Output written to ${outputPath}`
        );
    } catch (err) {
        console.error("Error:", err);
    }
}
