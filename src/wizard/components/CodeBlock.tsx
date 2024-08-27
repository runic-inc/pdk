//import { parseJson } from '../../codegen/contractSchemaJsonParser';
import { ContractSchemaImpl } from '@/codegen/contractSchema';
import { JSONSchemaGen } from '@/codegen/jsonSchemaGen';
import { MainContractGen } from '@/codegen/mainContractGen';
import { UserContractGen } from '@/codegen/userContractGen';
import { ContractConfig } from '@/types';
import { useConfig } from '@/wizard/store';
import { memo, useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { ScrollArea } from '../primitives/scroll-area';

const themes = {
    light: 'github-light',
    dark: 'aurora-x',
};

const files = {
    userContract: {
        lang: 'solidity',
        generate: (config: ContractConfig) => new UserContractGen().gen(new ContractSchemaImpl(config)),
    },
    genContract: {
        lang: 'solidity',
        generate: (config: ContractConfig) => new MainContractGen().gen(new ContractSchemaImpl(config)),
    },
    schema: {
        lang: 'json',
        generate: (config: ContractConfig) => new JSONSchemaGen().gen(new ContractSchemaImpl(config)),
    },
};

const CodeBlock = memo(
    ({ viewType, setClipboard }: { viewType: 'userContract' | 'genContract' | 'schema'; setClipboard: React.Dispatch<React.SetStateAction<string>> }) => {
        const [code, setCode] = useState('');
        const contractConfig = useConfig()!;

        useEffect(() => {
            let _code = '';
            try {
                _code = files[viewType].generate(contractConfig);
                codeToHtml(_code, {
                    lang: files[viewType].lang,
                    themes,
                }).then((html) => {
                    setCode(html);
                });
            } catch (error) {
                console.error('Error generating code:', error);
                setCode('Error generating code. View console logs for details.');
            }
            setClipboard(_code);
        }, [contractConfig, viewType]);

        return (
            <ScrollArea className='h-full'>
                <div className='p-4 text-[13px] antialiased'>
                    <pre>
                        <code dangerouslySetInnerHTML={{ __html: code }}></code>
                    </pre>
                </div>
            </ScrollArea>
        );
    },
);

export default CodeBlock;
