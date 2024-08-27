import React from 'react';
import { Button } from '@/wizard/primitives/button';
import { ScrollArea } from '@/wizard/primitives/scroll-area';
import { Separator } from '../primitives/separator';
import useStore, { useConfig } from '../store';
import CodeView from './CodeView';
import ContractEditor from './ContractEditor';
import ContractList from './ContractList';
import DarkModeToggle from './DarkModeToggle';
import Logo from './Logo';
import ScopeEditor from './ScopeEditor';
import { ContractSchemaImpl } from '@/codegen/contractSchema';
import { RemixExporter } from '../utils/RemixExporter';

const Layout = () => {
    const { editor } = useStore();
    const contractConfig = useConfig()!;

    const openInRemix = () => {
        const remixUrl = RemixExporter.getRemixUrl(new ContractSchemaImpl(contractConfig));
        window.open(remixUrl, '_blank');
    }  

    return (
        <main className='grid grid-rows-[min-content_1fr] grid-cols-[1fr_26rem] h-[100vh] items-stretch justify-stretch max-h-screen gap-4 min-h-0 min-w-0 p-4'>
            <header className='col-span-2 flex items-stretch justify-start gap-4'>
                <div className='flex h-full items-center justify-center text-sm font-semibold rounded gap-3 px-3 bg-foreground text-background'>
                    <Logo className='h-4 w-4' />
                    <div className='w-[1px] h-full bg-muted-foreground z-[0] opacity-50' />
                    <ScopeEditor />
                </div>
                <ContractList />
                <div className='flex grow justify-end items-stretch gap-4'>
                    <Button variant={'ghost'} className='h-auto' onClick={openInRemix}>
                        Open in Remix
                    </Button>
                    <Button className='h-auto'>Save project</Button>
                    <Separator orientation='vertical' className='bg-muted-border' />
                    <DarkModeToggle />
                </div>
            </header>
            {editor ? (
                <>
                    <CodeView />
                    <ScrollArea className='bg-background border border-border rounded shadow-lg'>
                        <div className='p-6 ppb-0'>
                            <h2 className='text-2xl font-bold mb-4'>Contract Editor</h2>
                            <ContractEditor />
                        </div>
                    </ScrollArea>
                </>
            ) : (
                <div className='col-span-2 flex items-center justify-center font-light text-muted-foreground/50 text-2xl'>Add a contract to get started.</div>
            )}
        </main>
    );
};

export default Layout;