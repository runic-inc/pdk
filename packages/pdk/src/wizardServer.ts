import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import path from 'path';
import { logger } from './common/helpers/logger';

export const launchWizardApp = () => {
    const app = new Hono();

    // logger.info(process.cwd());
    // logger.info(__dirname);
    const rel = path.relative(process.cwd(), __dirname);
    // logger.info(rel);

    app.get('/api', async (c) => {
        return c.text('Hello from Patchwork Wizard API');
    });

    app.use(
        '/*',
        serveStatic({
            root: `${rel}/wizard`,
            onNotFound: (path, c) => {
                // logger.info(`${path} is not found, checked ${c.req.path}`)
            },
        }),
    );

    serve({
        fetch: app.fetch,
        port: 3333,
    });
    logger.info('Patchwork Wizard is running on http://localhost:3333');
};
