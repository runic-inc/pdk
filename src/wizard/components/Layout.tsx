import InputFields from './InputFields';
import { ContractConfig } from '../../types';
import { ReactNode, useState } from 'react';
import CodeView from './CodeView';

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
        <main className='grid grid-cols-[28rem_1fr] h-[100vh]'>
            <div className='p-4 pr-0 h-[100vh] flex'>
                <div className='bg-white p-6 border border-black overflow-scroll rounded shadow-lg w-full'>
                    <h2 className='text-2xl font-bold mb-4'>Contract Editor</h2>
                    <InputFields setContractConfig={setContractConfig} />
                </div>
            </div>
            <div className='p-4 h-[100vh] flex flex-col'>
                <CodeView contractConfig={contractConfig} />
            </div>
        </main>
    );
};

export default Layout;
