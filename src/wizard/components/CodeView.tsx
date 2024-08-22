import { parseJson } from '../../codegen/contractSchemaJsonParser';
import { MainContractGen } from '../../codegen/mainContractGen';
import { UserContractGen } from '../../codegen/userContractGen';
import { JSONSchemaGen } from '../../codegen/jsonSchemaGen';
import { ContractConfig } from '../../types';
import { ContractSchemaImpl } from '../../codegen/contractSchema';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import { useEffect, useState } from 'react';

interface CodeViewProps {
    viewType: string;
    contractConfig: ContractConfig;
}

const CodeView = ({ viewType, contractConfig }: CodeViewProps) => {
    const [solidityCode, setSolidityCode] = useState('');

    useEffect(() => {
        console.log('contract config', contractConfig);
        try {
            if (viewType === 'userContract') {
                const highlighted = hljs.highlight(new UserContractGen().gen(new ContractSchemaImpl(contractConfig)), { language: 'java' });
                setSolidityCode(highlighted.value);
            } else if (viewType === 'genContract') {
                const highlighted = hljs.highlight(new MainContractGen().gen(new ContractSchemaImpl(contractConfig)), { language: 'java' });
                setSolidityCode(highlighted.value);
            } else if (viewType === 'schema') {
                const highlighted = hljs.highlight(new JSONSchemaGen().gen(new ContractSchemaImpl(contractConfig)), { language: 'json' });
                setSolidityCode(highlighted.value);
            }
        } catch (error) {
            console.error('Error generating code:', error);
            setSolidityCode('Error generating code');
        }
    }, [contractConfig, viewType]);
    const a = { __html: solidityCode };
    return (
        <div className='bg-gray-900 text-white p-4 rounded'>
            <pre>
                <code dangerouslySetInnerHTML={a}></code>
            </pre>
        </div>
    );
};

export default CodeView;
