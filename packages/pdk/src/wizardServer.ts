import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static'
import path from 'path';

export const launchWizardApp = () => {
  const app = new Hono();

  // console.log(process.cwd());
  // console.log(__dirname);
  const rel = path.relative(process.cwd(), __dirname);
  // console.log(rel);
  
  app.get('/api', async (c) => {
    return c.text('Hello from Patchwork Wizard API');
  });
  
  app.use('/*', serveStatic({ 
    root: `${rel}/wizard`, 
    onNotFound: (path, c) => {
      // console.log(`${path} is not found, checked ${c.req.path}`)
    }
  }));

  serve({
    fetch: app.fetch,
    port: 3333
  });
  console.log('Patchwork Wizard is running on http://localhost:3333');
};
