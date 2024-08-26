//import { parseJson } from '../../codegen/contractSchemaJsonParser';
import { MainContractGen } from '@/codegen/mainContractGen';
import { UserContractGen } from '@/codegen/userContractGen';
import { JSONSchemaGen } from '@/codegen/jsonSchemaGen';
import { ContractSchemaImpl } from '@/codegen/contractSchema';
import { memo, useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import useStore, { useConfig } from '@/wizard/store';
import { ScrollArea } from '../primitives/scroll-area';

const themes = {
    light: 'github-light',
    dark: 'aurora-x',
};

const CodeBlock = memo(({ viewType }: { viewType: 'userContract' | 'genContract' | 'schema' }) => {
    const [code, setCode] = useState('');
    const contractConfig = useConfig()!;

    useEffect(() => {
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
        <ScrollArea className='h-full'>
            <div className='p-4 text-[13px] antialiased'>
                <pre>
                    <code dangerouslySetInnerHTML={a}></code>
                </pre>
            </div>
        </ScrollArea>
    );
});

export default CodeBlock;
