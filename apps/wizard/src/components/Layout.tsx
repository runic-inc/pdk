import { ScrollArea } from '../primitives/scroll-area';
import useStore, { Store } from '../store';
import CodeView from './CodeView';
import ContractEditor from './ContractEditor';
import ProjectCodeView from './ProjectCodeView';
import ScopeEditor from './ScopeEditor';
import Toolbar from './Toolbar';

const Layout = () => {
    const contract = useStore((state: Store) => (state.editor ? (state.contractsConfig[state.editor]?._uid ?? null) : null));
    const { scopeConfig } = useStore();

    return (
        <main className='grid grid-rows-[min-content_1fr] grid-cols-[1fr_26rem] h-[100vh] items-stretch justify-stretch max-h-screen gap-4 min-h-0 min-w-0 p-4'>
            <Toolbar />
            {contract ? (
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
                <>
                    <ProjectCodeView />
                    <ScrollArea className='bg-background border border-border rounded shadow-lg'>
                        <div className='p-6 ppb-0'>
                            <h2 className='text-2xl font-bold mb-4'>Project Editor</h2>
                            <ScopeEditor key={scopeConfig.name} />
                        </div>
                    </ScrollArea>
                </>
            )}
        </main>
    );
};

export default Layout;
