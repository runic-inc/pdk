import CodeBlock from './CodeBlock';
import { ContractConfig } from '../../types';
import { Button } from '@wizard/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@wizard/primitives/filetabs';

interface TabsProps {
    contractConfig: ContractConfig;
}

const CodeView = ({ contractConfig }: TabsProps) => {
    return (
        <Tabs defaultValue='userContract' className='grid grid-rows-[3rem_1fr] max-h-full h-full'>
            <TabsList>
                <div className='w-4' />
                <TabsTrigger value='userContract' className='flex-col'>
                    User Contract
                </TabsTrigger>
                <TabsTrigger value='genContract' className='flex-col'>
                    Generated Contract
                </TabsTrigger>
                <TabsTrigger value='schema' className='flex-col'>
                    Contract Schema
                </TabsTrigger>
                <div className='grow flex justify-end items-start gap-2'>
                    <Button>Open in Remix</Button>
                    <Button>Save</Button>
                </div>
            </TabsList>
            <TabsContent value='userContract'>
                <CodeBlock viewType='userContract' contractConfig={contractConfig} />
            </TabsContent>
            <TabsContent value='genContract'>
                <CodeBlock viewType='genContract' contractConfig={contractConfig} />
            </TabsContent>
            <TabsContent value='schema'>
                <CodeBlock viewType='schema' contractConfig={contractConfig} />
            </TabsContent>
        </Tabs>
    );
};

export default CodeView;
