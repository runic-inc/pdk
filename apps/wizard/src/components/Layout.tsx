import { Button } from '../primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../primitives/dialog';
import Icon from '../primitives/icon';
import { ScrollArea } from '../primitives/scroll-area';
import { Separator } from '../primitives/separator';
import useStore, { Store } from '../store';
import { ProjectSaver } from '../utils/ProjectSaver';
import CodeView from './CodeView';
import ContractEditor from './ContractEditor';
import ContractList from './ContractList';
import DarkModeToggle from './DarkModeToggle';
import Logo from './Logo';
import ProjectCodeView from './ProjectCodeView';
import ScopeEditor from './ScopeEditor';

const Layout = () => {
    const { scopeConfig, setEditor } = useStore();
    const contract = useStore((state: Store) => (state.editor ? (state.contractsConfig[state.editor]?._uid ?? null) : null));

    const handleImportProjectConfig = async () => {
        // tba
    };

    const handleSaveProjectConfig = async () => {
        await ProjectSaver.saveProjectConfig();
    };

    const handleSaveProjectZip = async () => {
        await ProjectSaver.saveProject();
    };

    return (
        <main className='grid grid-rows-[min-content_1fr] grid-cols-[1fr_26rem] h-[100vh] items-stretch justify-stretch max-h-screen gap-4 min-h-0 min-w-0 p-4'>
            <header className='col-span-2 flex items-stretch justify-start gap-4'>
                <div
                    onClick={() => setEditor(scopeConfig.name)}
                    className='flex h-full cursor-pointer items-center justify-center text-sm font-semibold rounded gap-3 px-3 bg-foreground text-background'
                >
                    <Logo className='h-4 w-4' />
                    <div className='w-[1px] h-full bg-muted-foreground z-[0] opacity-50' />
                    <div className='grow h-full flex gap-2 items-center font-bold'>
                        <span>{scopeConfig.name}</span>
                        <Icon icon='fa-gear' className='opacity-50' />
                    </div>
                </div>
                <ContractList />
                <div className='flex grow justify-end items-stretch gap-2'>
                    <Button variant={'outline'} className='h-auto gap-2' onClick={() => handleImportProjectConfig()}>
                        <Icon icon='fa-file-import' />
                        Import project
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='h-auto gap-2'>
                                <Icon icon='fa-wand-magic-sparkles' />
                                Save project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Save your project</DialogTitle>
                                <DialogDescription className='py-2'>
                                    Download a project configuration file that can be used with our{' '}
                                    <a href='https://docs.patchwork.dev/pdk/introduction' target='_blank' className='text-foreground underline font-semibold'>
                                        PDK CLI tool
                                    </a>
                                    . When provided with this configuration file, PDK will generate all the necessary files for your project.
                                </DialogDescription>
                                <DialogFooter className='pt-4'>
                                    <div className='grow flex flex-col gap-2'>
                                        <Button className='gap-2 text-[14px]' size={'lg'} onClick={() => handleSaveProjectConfig()}>
                                            <Icon icon='fa-wand-magic-sparkles' />
                                            Download project configuration
                                        </Button>
                                        <Button className='gap-2 opacity-50' variant={'ghost'} onClick={() => handleSaveProjectZip()}>
                                            <Icon icon='fa-file-zipper' />
                                            Download generated files instead
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                    <Separator orientation='vertical' className='bg-muted-border ml-2' />
                    <DarkModeToggle />
                </div>
            </header>
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
                            <ScopeEditor />
                        </div>
                    </ScrollArea>
                </>
            )}
        </main>
    );
};

export default Layout;
