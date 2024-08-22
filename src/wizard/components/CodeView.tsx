import CodeBlock from './CodeBlock';
import { ContractConfig } from '../../types';
import { useState } from 'react';
import { Button } from '@wizard/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@wizard/primitives/filetabs';

interface TabsProps {
    contractConfig: ContractConfig;
}

const CodeView = ({ contractConfig }: TabsProps) => {
    const [activeTab, setActiveTab] = useState('userContract');

    return (
        <div>
            <Tabs defaultValue='userContract'>
                <TabsList>
                    <div className='w-14 -ml-10 border-b border-muted-foreground items-center flex' />
                    <TabsTrigger value='userContract' className='flex-col'>
                        User Contract
                    </TabsTrigger>
                    <TabsTrigger value='genContract' className='flex-col'>
                        Generated Contract
                    </TabsTrigger>
                    <TabsTrigger value='schema' className='flex-col'>
                        Contract Schema
                    </TabsTrigger>
                    <div className='grow border-b border-muted-foreground items-center flex' />
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
        </div>
    );
};

export default CodeView;
