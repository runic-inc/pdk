import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { FC } from 'hono/jsx';

const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  );
};

const Home = () => {
  return (
    <Layout>
      <h1>Welcome to the Patchwork Wizard!</h1>
    </Layout>
  );
};

export const launchWizardApp = () => {
  const app = new Hono();
  app.get('/', (c) => c.html(<Home />));
  serve({ fetch: app.fetch, port: 3333 });
  console.log('Patchwork Wizard is running on http://localhost:3333');
};
