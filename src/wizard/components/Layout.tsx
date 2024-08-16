import { FC } from 'hono/jsx';
import Tabs from './Tabs';
import InputFields from './InputFields';

const Layout: FC = (props) => {
  return (
    <html className="h-full">
      <body className="bg-gray-100 h-full flex">
        <div className="w-1/4 bg-white p-4">
          <InputFields />
        </div>
        <div className="w-3/4 bg-gray-50 p-4">
          <Tabs />
          <div className="mt-4">{props.children}</div>
        </div>
      </body>
    </html>
  );
};

export default Layout;