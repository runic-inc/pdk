import { JSONProjectConfigLoader } from '@patchworkdev/common/index';
import { ProjectConfig } from '@patchworkdev/common/types';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { Button } from '../primitives/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../primitives/dialog';
import Icon from '../primitives/icon';
import { Input } from '../primitives/input';
import { Separator } from '../primitives/separator';
import useStore from '../store';
import { UContractConfig, UFieldConfig } from '../types';
import { ProjectSaver } from '../utils/ProjectSaver';
import ContractList from './ContractList';
import DarkModeToggle from './DarkModeToggle';
import Logo from './Logo';

const Toolbar = () => {
    const { scopeConfig, setEditor, updateScopeConfig, updateContractsConfig, updateContractsOrder } = useStore();
    const [projectConfigJsonData, setProjectConfigJsonData] = useState<ProjectConfig | null>(null);
    const [valid, setValid] = useState(false);

    const validateProjectConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e);
        const file = e.target.files?.[0]; // Get the selected file
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const schema = new JSONProjectConfigLoader().load(content);
                    setProjectConfigJsonData(schema);
                    setValid(true);
                    console.log('Config data:', schema);
                } catch (error) {
                    console.error('Invalid JSON format:', error);
                }
            };
            reader.readAsText(file);
        } else {
            console.error('Please upload a valid JSON file');
        }
    };

    const handleImportProjectConfig = async () => {
        if (projectConfigJsonData) {
            setEditor(null);
            const scope = Object.values(projectConfigJsonData.scopes)[0]!;
            updateScopeConfig({
                ...scope,
                name: projectConfigJsonData.name,
            });
            const contracts: Record<string, UContractConfig> = {};
            Object.entries(projectConfigJsonData.contracts).forEach(([_uid, contractConfig]) => {
                if (typeof contractConfig === 'string') return;
                const fragments = new Set<string>(projectConfigJsonData.contractRelations[_uid]?.fragments ?? []);
                contracts[_uid] = {
                    ...(contractConfig as unknown as UContractConfig),
                    _uid,
                    fields: contractConfig.fields.map((field) => {
                        return {
                            ...field,
                            _uid: nanoid(),
                        } as UFieldConfig;
                    }),
                    fragments,
                    mintFee: (scope.mintConfigs && scope.mintConfigs[_uid]?.flatFee.toString()) ?? '',
                    patchFee: '',
                    assignFee: '',
                };
            });
            updateContractsConfig(contracts);
            updateContractsOrder(Object.keys(contracts));
        }
    };

    const handleSaveProjectConfig = async () => {
        await ProjectSaver.saveProjectConfig();
    };

    const handleSaveProjectZip = async () => {
        await ProjectSaver.saveProject();
    };
    return (
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
                <Dialog onOpenChange={() => {}}>
                    <DialogTrigger asChild>
                        <Button variant={'outline'} className='h-auto gap-2'>
                            <Icon icon='fa-file-import' />
                            Import project
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Import a project configuration</DialogTitle>
                            <DialogDescription className='py-2'>
                                Load an existing project configuration file. <span className='underline'>This will overwrite your current Wizard project!</span>{' '}
                                Only single-scope configurations are supported at the moment.
                            </DialogDescription>
                            <div>
                                <Input type='file' accept='.json' onChange={validateProjectConfig} />
                            </div>
                            <DialogFooter className='pt-4'>
                                <DialogClose asChild>
                                    <Button disabled={!valid} className='gap-2' onClick={() => handleImportProjectConfig()}>
                                        <Icon icon='fa-file-import' />
                                        Import project config
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className='h-auto gap-2'>
                            <Icon icon='fa-wand-magic-sparkles' />
                            Export project
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
    );
};

export default Toolbar;
