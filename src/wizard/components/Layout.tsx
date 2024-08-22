import Tabs from './Tabs';
import InputFields from './InputFields';
import { ContractConfig } from '../../types';
import ContractPanel from './Panel';
import { ReactNode, useState } from 'react';

const Layout = ({ children }: { children?: ReactNode }) => {
    const [contractConfig, setContractConfig] = useState<ContractConfig>({
        scopeName: '',
        name: '',
        symbol: '',
        baseURI: '',
        schemaURI: '',
        imageURI: '',
        fields: [],
        features: [],
    });

    return (
        <main className='bg-gray-100 h-full flex'>
            <div className='w-1/4 bg-white p-4'>
                <InputFields setContractConfig={setContractConfig} />
            </div>
            <div className='w-3/4 bg-gray-50 p-4'>
                <Tabs contractConfig={contractConfig} />
                <div className='mt-4'>{children}</div>
            </div>
        </main>
    );
};

export default Layout;
