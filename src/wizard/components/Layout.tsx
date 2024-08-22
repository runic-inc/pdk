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
        <main className='grid grid-cols-4 h-[100vh]'>
            <div className='p-4 h-[100vh] flex'>
                <div className='bg-white p-6 border border-black overflow-scroll rounded shadow-lg '>
                    <h2 className='text-2xl font-bold mb-4'>Contract Editor</h2>
                    <InputFields setContractConfig={setContractConfig} />
                </div>
            </div>
            <div className='col-span-3 bg-stone-50 px-4 overflow-scroll'>
                <CodeView contractConfig={contractConfig} />
                <div className='mt-4'>{children}</div>
            </div>
        </main>
    );
};

export default Layout;
