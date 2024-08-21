import { FC, useState } from 'hono/jsx';
import Tabs from './Tabs';
import InputFields from './InputFields';
import { ContractConfig } from '../../types';

const Layout: FC = (props) => {
  const [contractConfig, setContractConfig] = useState({} as ContractConfig)
  
  return (
    <html className="h-full">
      <body className="bg-gray-100 h-full flex">
        <div className="w-1/4 bg-white p-4">
          <InputFields setContractConfig/>
        </div>
        <div className="w-3/4 bg-gray-50 p-4">
          <Tabs contractConfig/>
          <div className="mt-4">{props.children}</div>
        </div>
      </body>
    </html>
  );
};

export default Layout;