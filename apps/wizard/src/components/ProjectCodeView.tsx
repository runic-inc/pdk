import { useState } from 'react';
import useCopyToClipboard from '../hooks/useCopyToClipboard';
import { Badge } from '../primitives/badge';
import { Button } from '../primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../primitives/filetabs';
import Icon from '../primitives/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';
import ProjectCodeBlock from './ProjectCodeBlock';

const ProjectCodeView = () => {
    const [code, setCode] = useState('');
    const [copy, wasCopied] = useCopyToClipboard();

    const handleCopy = () => {
        copy(code);
    };

    return (
        <Tabs defaultValue='schema' className='grid grid-rows-[2.75rem_1fr] min-h-0 min-w-0 max-h-full max-w-full'>
            <TabsList>
                <div className='w-4' />
                <TabsTrigger value='schema' className='gap-2'>
                    Project Config
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
                    </div>
                </div>
            </TabsList>
            <TabsContent value='schema'>
                <ProjectCodeBlock viewType='schema' setClipboard={setCode} />
            </TabsContent>
        </Tabs>
    );
};

export default ProjectCodeView;
