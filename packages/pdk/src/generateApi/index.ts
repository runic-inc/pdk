import { register } from 'ts-node';
import Module from 'module';
import path from 'path';
import fs from 'fs/promises';

interface TableDefinition {
  [key: string]: 'bigint' | 'int' | 'hex' | 'boolean' | 'string';
}

interface Schema {
  [tableName: string]: TableDefinition;
}

async function generateTrpcApi(schema: Schema, outputPath: string) {
  let apiContent = `
import { ponder } from '@/generated';
import { trpcServer } from '@hono/trpc-server';
import { eq } from '@ponder/core';
import { z } from 'zod';
import { publicProcedure, router } from './trpc';

const appRouter = router({
${Object.entries(schema).map(([tableName, tableDefinition]) => `
  ${tableName}: router({
    getById: publicProcedure
      .input(z.string())
      .query(async ({ input, ctx }) => {
        const result = await ctx.db
          .select()
          .from(ctx.tables.${tableName})
          .where(eq(ctx.tables.${tableName}.id, input))
          .limit(1);
        return result[0] || null;
      }),
    
    getPaginated: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { limit, cursor } = input;
        const items = await ctx.db
          .select()
          .from(ctx.tables.${tableName})
          .limit(limit + 1)
          .cursor(cursor ? { id: cursor } : undefined);

        let nextCursor: string | undefined = undefined;
        if (items.length > limit) {
          const nextItem = items.pop();
          nextCursor = nextItem?.id;
        }

        return {
          items,
          nextCursor,
        };
      }),
  }),
`).join('')}
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

  await fs.writeFile(outputPath, apiContent);
  console.log(`API file generated at: ${outputPath}`);
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
        const newRequire = function(this: NodeModule, id: string) {
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
            // Generate the tRPC API
            const outputPath = path.join(apiOutputDir, 'index.ts');
            await generateTrpcApi(schema, outputPath);
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