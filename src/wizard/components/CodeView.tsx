import { Badge } from '@/wizard/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/wizard/primitives/filetabs';
import { useState } from 'react';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { Button } from '../primitives/button';
import Icon from '../primitives/icon';
import { Separator } from '../primitives/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';
import useStore, { Store } from '../store';
import { ProjectSaver } from '../utils/ProjectSaver';
import { RemixExporter } from '../utils/RemixExporter';
import CodeBlock from './CodeBlock';

const CodeView = () => {
    const [code, setCode] = useState('');
    const [copy, wasCopied] = useCopyToClipboard();
    const editor = useStore((state: Store) => state.editor);

    const handleDownload = async () => {
        if (!editor) return;
        await ProjectSaver.saveContract(editor);
    };

    const handleOpenInRemix = () => {
        const remixUrl = RemixExporter.getRemixUrlByUID(editor ?? '');
        if (remixUrl instanceof Error) return;
        window.open(remixUrl, '_blank');
    };

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

                <div className='grow flex justify-end items-start'>
                    <div className='flex items-stretch justify-stretch'>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button className='!relative' size={'icon'} variant={'ghost'} onClick={() => handleCopy()}>
                                    <Icon icon='fa-copy' className='text-[14px]' />
                                    {wasCopied && (
                                        <Badge className='absolute pointer-events-none right-full top-1/2 -translate-y-1/2 gap-1 -mr-0.5'>
                                            <Icon icon='fa-check' />
                                            Copied
                                        </Badge>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copy file contents</p>
                            </TooltipContent>
                        </Tooltip>

                        <Separator orientation='vertical' className='mx-2 bg-muted-border/50 !h-auto my-0.5' />

                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button size={'icon'} variant={'ghost'} onClick={() => handleDownload()}>
                                    <Icon icon='fa-download' className='text-[14px]' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download contract files .zip</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button size={'icon'} variant={'ghost'} onClick={() => handleOpenInRemix()}>
                                    <Icon icon='fa-play' className='text-[14px]' />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Open contract in Remix</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
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
