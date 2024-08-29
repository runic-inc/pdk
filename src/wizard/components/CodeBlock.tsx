//import { parseJson } from '../../codegen/contractSchemaJsonParser';
import { ContractSchemaImpl } from '@/codegen/contractSchema';
import { JSONSchemaGen } from '@/codegen/jsonSchemaGen';
import { MainContractGen } from '@/codegen/mainContractGen';
import { UserContractGen } from '@/codegen/userContractGen';
import { ContractConfig } from '@/types';
import useStore, { Store } from '@/wizard/store';
import { memo, useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { useKeyDown } from '../hooks/useKeyDown';
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
        const contractConfig = useStore((state: Store) => state.contractsConfig[state.editor!]);
        if (!contractConfig) return null;

        useKeyDown(
            () => {
                document.activeElement && window.getSelection()?.selectAllChildren(document.activeElement);
            },
            [['Meta', 'Control'], 'a'],
            'pre.shiki',
        );

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
            <ScrollArea className='h-full [&_.viewport]:!overflow-x-scroll'>
                <div className='p-4 pr-8 text-[13px] antialiased relative'>
                    <pre>
                        <code dangerouslySetInnerHTML={{ __html: code }}></code>
                    </pre>
                </div>
            </ScrollArea>
        );
    },
);

export default CodeBlock;
