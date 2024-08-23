//import { parseJson } from '../../codegen/contractSchemaJsonParser';
import { MainContractGen } from '../../codegen/mainContractGen';
import { UserContractGen } from '../../codegen/userContractGen';
import { JSONSchemaGen } from '../../codegen/jsonSchemaGen';
import { ContractConfig } from '../../types';
import { ContractSchemaImpl } from '../../codegen/contractSchema';
import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
    viewType: string;
    contractConfig: ContractConfig;
}
const themes = {
    light: 'github-light',
    dark: 'aurora-x',
};

const CodeBlock = ({ viewType, contractConfig }: CodeBlockProps) => {
    const [code, setCode] = useState('');

    useEffect(() => {
        console.log('contract config', contractConfig);
        try {
            if (viewType === 'userContract') {
                codeToHtml(new UserContractGen().gen(new ContractSchemaImpl(contractConfig)), {
                    lang: 'solidity',
                    themes,
                }).then((html) => {
                    setCode(html);
                });
            } else if (viewType === 'genContract') {
                codeToHtml(new MainContractGen().gen(new ContractSchemaImpl(contractConfig)), {
                    lang: 'solidity',
                    themes,
                }).then((html) => {
                    setCode(html);
                });
            } else if (viewType === 'schema') {
                codeToHtml(new JSONSchemaGen().gen(new ContractSchemaImpl(contractConfig)), {
                    lang: 'json',
                    themes,
                }).then((html) => {
                    setCode(html);
                });
            }
        } catch (error) {
            console.error('Error generating code:', error);
            setCode('Error generating code');
        }
    }, [contractConfig, viewType]);
    const a = { __html: code };
    return (
        <div className='p-4 text-[13px] antialiased'>
            <pre>
                <code dangerouslySetInnerHTML={a}></code>
            </pre>
        </div>
    );
};

export default CodeBlock;
