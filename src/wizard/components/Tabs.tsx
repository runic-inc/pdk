import CodeView from './CodeView';
import { ContractConfig } from '../../types';
import { useState } from 'react';
import { Button } from '@wizard/primitives/button';

interface TabsProps {
    contractConfig: ContractConfig;
}

const Tabs = ({ contractConfig }: TabsProps) => {
    const [activeTab, setActiveTab] = useState('userContract');

    return (
        <div>
            <div className='flex space-x-4'>
                <Button className={`${activeTab === 'userContract' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setActiveTab('userContract')}>
                    User Contract
                </Button>
                <button className={`py-2 px-4 ${activeTab === 'genContract' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setActiveTab('genContract')}>
                    Generated Contract
                </button>
                <button className={`py-2 px-4 ${activeTab === 'schema' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setActiveTab('schema')}>
                    Schema JSON
                </button>
            </div>
            <div className='mt-4'>
                <CodeView viewType={activeTab} contractConfig={contractConfig} />
            </div>
        </div>
    );
};

export default Tabs;
