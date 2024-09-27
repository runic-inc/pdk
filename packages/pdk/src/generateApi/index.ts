import fs from 'fs/promises';
import Module from 'module';
import path from 'path';
import prettier from 'prettier';
import { register } from 'ts-node';
import { Schema } from './ponderMocks';

// ToDo 
// api generation needs to be aware of column types to allow us to generate which fields to filter on.
// Paginated results need to be ordered by a field that is sortable - might need to add some fields to the tables such as a timestamp

async function generateTrpcApi(schema: Schema): Promise<string> {
    let apiContent = `
import { ponder } from '@/generated';
import { trpcServer } from '@hono/trpc-server';
import { eq, gt } from '@ponder/core';
import { z } from 'zod';
import { publicProcedure, router } from './trpc';

const appRouter = router({
${Object.entries(schema).map(([tableName, entity]) => {
        if (entity.type === 'enum') {
            return '';
        }
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
      .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        lastTimestamp: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { limit, lastTimestamp } = input;
        
        const query = ctx.db
          .select()
          .from(ctx.tables.${tableName})
          .where(lastTimestamp
            ? (${tableName.toLowerCase()}) => gt(${tableName.toLowerCase()}.timestamp, BigInt(lastTimestamp))
            : undefined)
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
`}).join('')}
});

export type AppRouter = typeof appRouter;

ponder.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_, c) => c.var,
  }),
);
`;
    return await prettier.format(apiContent, { parser: "typescript", tabWidth: 4 });
}

export async function generateAPI(ponderSchema: string, apiOutputDir: string) {
    try {
        // Set up ts-node
        register({
            transpileOnly: true,
            compilerOptions: {
                module: 'CommonJS',
                moduleResolution: 'node',
            }
        });
        const originalRequire = Module.prototype.require;
        const newRequire = function (this: NodeModule, id: string) {
            if (id === '@ponder/core') {
                return require(path.resolve(__dirname, './ponderMocks'));
            }
            return originalRequire.call(this, id);
        } as NodeRequire;
        Object.assign(newRequire, originalRequire);
        Module.prototype.require = newRequire;
        try {
            const schemaModule = await import(ponderSchema);
            const schema = schemaModule.default;

            // Generate the tRPC API content
            const apiContent = await generateTrpcApi(schema);

            // Write the formatted API content to file
            const outputPath = path.join(apiOutputDir, 'index.ts');
            await fs.writeFile(outputPath, apiContent, 'utf8');
            console.log("tRPC API generation completed.");
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('is not a function')) {
                console.error("Error: It seems a method is missing from our mock implementation.");
                console.error("Full error:", error);
                console.error("Please add this method to the mockSchemaBuilder in ponderMocks.ts");
            } else {
                throw error;
            }
        } finally {
            Module.prototype.require = originalRequire;
        }
    } catch (err) {
        console.error('Error:', err);
    }
}