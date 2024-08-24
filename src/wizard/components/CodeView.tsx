import CodeBlock from './CodeBlock';
import { Button } from '@/wizard/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/wizard/primitives/filetabs';
import { Badge } from '@/wizard/primitives/badge';

const CodeView = () => {
    return (
        <Tabs defaultValue='genContract' className='grid grid-rows-[3rem_1fr] max-h-full h-full'>
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
                <div className='grow flex justify-end items-start gap-2'>
                    <Button>Open in Remix</Button>
                    <Button>Save</Button>
                </div>
            </TabsList>
            <TabsContent value='genContract'>
                <CodeBlock viewType='genContract' />
            </TabsContent>
            <TabsContent value='userContract'>
                <CodeBlock viewType='userContract' />
            </TabsContent>
            <TabsContent value='schema'>
                <CodeBlock viewType='schema' />
            </TabsContent>
        </Tabs>
    );
};

export default CodeView;
