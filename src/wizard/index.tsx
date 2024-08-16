import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { FC } from 'hono/jsx';
import Layout from './components/Layout';

const app = new Hono();

const Home: FC = () => {
  return (
    <Layout>
    </Layout>
  );
};

app.get('/', jsxRenderer(({ children }) => (
  <html>
    <head>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      {children}
      <script type="module" src="/client.js"></script>
    </body>
  </html>
)), (c) => c.render(<Home />));


export default app;