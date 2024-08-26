import CodeBlock from './CodeBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/wizard/primitives/filetabs';
import { Badge } from '@/wizard/primitives/badge';

const CodeView = () => {
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
