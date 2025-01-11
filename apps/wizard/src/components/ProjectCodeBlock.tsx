//import { parseJson } from '../../codegen/contractSchemaJsonParser';
import { TSProjectConfigGen } from '@patchworkdev/common/index';
import { memo, useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { useKeyDown } from '../hooks/useKeyDown';
import { ScrollArea } from '../primitives/scroll-area';
import useStore from '../store';
import storeToSchema from '../utils/storeToSchema';

const themes = {
    light: 'github-light',
    dark: 'aurora-x',
};

const files = {
    schema: {
        lang: 'typescript',
        generate: () => {
            return new TSProjectConfigGen().gen(storeToSchema());
        },
    },
};

const ProjectCodeBlock = memo(({ viewType, setClipboard }: { viewType: 'schema'; setClipboard: React.Dispatch<React.SetStateAction<string>> }) => {
    const [code, setCode] = useState('');
    const { contractsConfig, scopeConfig } = useStore();

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
            _code = files[viewType].generate();
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
    }, [contractsConfig, scopeConfig, viewType]);

    return (
        <ScrollArea className='h-full [&_.viewport]:!overflow-x-scroll'>
            <div className='p-4 pr-8 text-[13px] antialiased relative'>
                <pre>
                    <code dangerouslySetInnerHTML={{ __html: code }}></code>
                </pre>
            </div>
        </ScrollArea>
    );
});

export default ProjectCodeBlock;
