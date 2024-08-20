import { FC, useState } from 'hono/jsx';
import CodeView from './CodeView';

const Tabs: FC = () => {
  const [activeTab, setActiveTab] = useState('solidity');

  return (
    <div>
      <div className="flex space-x-4">
        <button
          className={`py-2 px-4 ${activeTab === 'solidity' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('solidity')}
        >
          Solidity
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'schema' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Schema
        </button>
      </div>
      <div className="mt-4">
        {activeTab === 'solidity' ? <CodeView /> : <CodeView content="Schema Hello World!" />}
      </div>
    </div>
  );
};

export default Tabs;