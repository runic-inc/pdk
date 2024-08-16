import { Hono } from 'hono';
import { serve } from '@hono/node-server';

export const launchWizardApp = () => {

    const app = new Hono();

    app.get('/', (c) => c.text('Welcome to the Patchwork Wizard!'));

    serve({fetch: app.fetch, port: 3333});
        
    console.log('Patchwork Wizard is running on http://localhost:3333');
};