import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { FC } from 'hono/jsx';
import Layout from './components/Layout';

const Home: FC = () => {
  return (
    <Layout>
      {/* The content for the layout will be filled by the tabs and input fields */}
    </Layout>
  );
};

export const launchWizardApp = () => {
  const app = new Hono();
  app.get('/', (c) => c.html(<Home />));
  serve({ fetch: app.fetch, port: 3333 });
  console.log('Patchwork Wizard is running on http://localhost:3333');
};