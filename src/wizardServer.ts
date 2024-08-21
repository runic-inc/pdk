import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static'

export const launchWizardApp = () => {
  const app = new Hono();

  app.get('/api', async (c) => {
    return c.text('Hello from Patchwork Wizard API');
  });
  
  app.use('/*', serveStatic({ root: 'dist/wizard' }));

  serve({
    fetch: app.fetch,
    port: 3333
  });
  console.log('Patchwork Wizard is running on http://localhost:3333');
};
