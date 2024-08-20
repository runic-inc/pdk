import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import path from 'path';
import fs from 'fs';
import wizardApp from './wizard/index';

export const launchWizardApp = () => {
  const app = new Hono();
  
  // Explicitly serve static files
  app.get('/style.css', async (c) => {
    const filePath = path.resolve(__dirname, 'wizard', 'style.css');
    if (fs.existsSync(filePath)) {
      return c.body(fs.readFileSync(filePath), 200, { 'Content-Type': 'text/css' });
    }
    console.log('CSS file not found at:', filePath);
    return c.notFound();
  });

  app.get('/client.js', async (c) => {
    const filePath = path.resolve(__dirname, 'wizard', 'client.js');
    if (fs.existsSync(filePath)) {
      return c.body(fs.readFileSync(filePath), 200, { 'Content-Type': 'application/javascript' });
    }
    console.log('JS file not found at:', filePath);
    return c.notFound();
  });
  
  // Mount the wizard app
  app.route('/', wizardApp);

  serve({
    fetch: app.fetch,
    port: 3333
  });
  console.log('Patchwork Wizard is running on http://localhost:3333');
};