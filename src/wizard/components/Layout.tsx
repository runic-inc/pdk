import ContractEditor from './ContractEditor';
import CodeView from './CodeView';
import { ScrollArea } from '@/wizard/primitives/scroll-area';
import { Button } from '@/wizard/primitives/button';
import ContractList from './ContractList';
import useStore from '../store';
import Logo from './Logo';
import ScopeEditor from './ScopeEditor';

const Layout = () => {
    const { editor } = useStore();
    return (
        <main className='grid grid-rows-[min-content_1fr] grid-cols-[1fr_26rem] h-[100vh] items-stretch justify-stretch max-h-screen gap-4 min-h-0 min-w-0 p-4'>
            <header className='col-span-2 flex items-stretch justify-start gap-4'>
                <div className='flex h-full items-center justify-center text-sm font-semibold rounded gap-3 px-3 bg-foreground text-background'>
                    <Logo className='h-4 w-4' />
                    <div className='w-[1px] h-full bg-muted-foreground z-[0] opacity-50' />
                    <ScopeEditor />
                </div>
                <ContractList />
                <div className='flex grow justify-end items-stretch'>
                    <Button variant={'ghost'} className='h-auto'>
                        Open project in Remix
                    </Button>
                    <Button className='h-auto'>Save project</Button>
                </div>
            </header>
            {editor && (
                <>
                    <CodeView />
                    <ScrollArea className='bg-background border border-foreground rounded shadow-lg'>
                        <div className='p-6 pb-0'>
                            <h2 className='text-2xl font-bold mb-4'>Contract Editor</h2>
                            <ContractEditor />
                        </div>
                    </ScrollArea>
                </>
            )}
        </main>
    );
};

export default Layout;
