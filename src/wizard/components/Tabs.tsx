import { FC, useState } from 'hono/jsx';
import CodeView from './CodeView';
import { ContractConfig } from '../../types';

const Tabs: FC = (contractConfig) => {
  const [activeTab, setActiveTab] = useState('userContract');

  let currentTabComponent = null;
  if (activeTab === 'userContract') { 
    currentTabComponent = <CodeView viewType="userCode" contractConfig />;
  } else if (activeTab === 'genContract') {
    currentTabComponent = <CodeView viewType="genCode" contractConfig/>;
  } else if (activeTab === 'schema') {
    currentTabComponent = <CodeView viewType="schema" contractConfig/>;
  }

  return (
    <div>
      <div className="flex space-x-4">
        <button
          className={`py-2 px-4 ${activeTab === 'userContract' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('userContract')}
        >
          User Contract
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'genContract' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('genContract')}
        >
          Generated Contract
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'schema' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Schema JSON
        </button>
      </div>
      <div className="mt-4">
        {currentTabComponent}
      </div>
    </div>
  );
};

export default Tabs;