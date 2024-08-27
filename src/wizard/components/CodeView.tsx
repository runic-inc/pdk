import { Badge } from '@/wizard/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/wizard/primitives/filetabs';
import { useState } from 'react';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { Button } from '../primitives/button';
import Icon from '../primitives/icon';
import CodeBlock from './CodeBlock';

const CodeView = () => {
    const [code, setCode] = useState('');
    const [_, copy, wasCopied] = useCopyToClipboard();

    const handleCopy = () => {
        copy(code);
    };

    return (
        <Tabs defaultValue='genContract' className='grid grid-rows-[2.75rem_1fr] min-h-0 min-w-0 max-h-full max-w-full'>
            <TabsList>
                <div className='w-4' />
                <TabsTrigger value='genContract' className='gap-2'>
                    Generated Abstract Contract
                    <Badge className='ext'>.sol</Badge>
                </TabsTrigger>
                <TabsTrigger value='userContract' className='gap-2'>
                    User Contract
                    <Badge className='ext'>.sol</Badge>
                </TabsTrigger>
                <TabsTrigger value='schema' className='gap-2'>
                    Contract Schema
                    <Badge className='ext'>.json</Badge>
                </TabsTrigger>
                <div className='grow flex justify-end'>
                    <Button className='relative' size={'icon'} variant={'ghost'} onClick={() => handleCopy()}>
                        <Icon icon='fa-copy' className='text-[14px]' />
                        {wasCopied && (
                            <Badge className='absolute pointer-events-none right-full top-1/2 -translate-y-1/2 gap-1 -mr-0.5'>
                                <Icon icon='fa-check' />
                                Copied
                            </Badge>
                        )}
                    </Button>
                </div>
            </TabsList>
            <TabsContent value='genContract'>
                <CodeBlock viewType='genContract' setClipboard={setCode} />
            </TabsContent>
            <TabsContent value='userContract'>
                <CodeBlock viewType='userContract' setClipboard={setCode} />
            </TabsContent>
            <TabsContent value='schema'>
                <CodeBlock viewType='schema' setClipboard={setCode} />
            </TabsContent>
        </Tabs>
    );
};

export default CodeView;
