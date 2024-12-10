import { ponder } from '@/generated';
import { trpcServer } from '@hono/trpc-server';
import { serveStatic } from 'hono/serve-static';
import fs from 'node:fs';
import path from 'node:path';
import { api } from '../generated/api';
import { router } from '../generated/trpc';

const appRouter = router({
    ...api,
});

export type AppRouter = typeof appRouter;

// serveStatic middleware
ponder.use(
    '/assets/*',
    serveStatic({
        root: path.resolve(process.cwd(), 'assets'),
        rewriteRequestPath: (requestPath) => {
            const basePath = requestPath.replace(/^\/assets/, '');
            const extensions = ['.svg', '.json', '.png', '.webp', '.jpg'];
            for (const ext of extensions) {
                const fullPath = path.join(process.cwd(), 'assets', basePath + ext);
                if (fs.existsSync(fullPath)) return basePath + ext;
            }
            return basePath;
        },
        getContent: async (filePath, c) => {
            try {
                const file = await fs.promises.readFile(filePath);
                return file;
            } catch (error) {
                return c.text('Not found', 404);
            }
        },
    }),
);

// tRPC middleware
ponder.use(
    '/trpc/*',
    trpcServer({
        router: appRouter,
        createContext: (_, c) => c.var,
    }),
);

/*
 * Define additional Hono routes below.
 * See https://ponder.sh/docs/query/api-functions for more info.
 */
