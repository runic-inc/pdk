import { JSONProjectConfigLoader } from '@patchworkdev/common/index';
import { ProjectConfig } from '@patchworkdev/common/types';
import * as esbuild from 'esbuild-wasm';
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
        } else if (file && file.name.endsWith('.ts')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    const schema = await compileTS(content);
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

    const compileTS = async (tsCode: string) => {
        // Initialize esbuild-wasm
        await esbuild.initialize({
            wasmURL: 'https://unpkg.com/esbuild-wasm@latest/esbuild.wasm', // Load WASM from a CDN
        });
        try {
            const result = await esbuild.build({
                stdin: {
                    contents: tsCode,
                    sourcefile: 'input.ts',
                    loader: 'ts',
                },
                bundle: true, // Bundle everything into one file
                format: 'cjs', // Ensure the output is an ECMAScript module
                target: 'esnext',
                write: false, // Prevent writing to disk
                plugins: [
                    {
                        name: 'resolve-external',
                        setup(build) {
                            // Mock the external module
                            build.onResolve({ filter: /^@patchworkdev\/common\/types$/ }, () => ({
                                path: '@patchworkdev/common/types',
                                namespace: 'external',
                            }));

                            // Provide the exports for the mock module
                            build.onLoad({ filter: /.*/, namespace: 'external' }, () => ({
                                contents: `
import type { Chain } from 'viem';

export enum Feature {
    FRAGMENTMULTI = 'FRAGMENTMULTI',
    FRAGMENTSINGLE = 'FRAGMENTSINGLE',
    PATCH = 'PATCH',
    ACCOUNTPATCH = 'ACCOUNTPATCH',
    '1155PATCH' = '1155PATCH',
    MINTABLE = 'MINTABLE',
    REVERSIBLE = 'REVERSIBLE',
    LITEREF = 'LITEREF',
    WEAKREF = 'WEAKREF',
    DYNAMICREFLIBRARY = 'DYNAMICREFLIBRARY',
}

export enum FunctionConfig {
    ALL = 'ALL',
    NONE = 'NONE',
    LOAD = 'LOAD',
    STORE = 'STORE',
}

export type FieldType =
    | 'empty'
    | 'bool'
    | 'int8'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'int128'
    | 'int256'
    | 'uint8'
    | 'uint16'
    | 'uint32'
    | 'uint64'
    | 'uint128'
    | 'uint256'
    | 'char8'
    | 'char16'
    | 'char32'
    | 'char64'
    | 'bytes8'
    | 'bytes16'
    | 'bytes32'
    | 'literef'
    | 'address'
    | 'string';

export type Visibility = 'public' | 'private';

export type FieldConfig = {
    id: number;
    key: string;
    description?: string;
    type: FieldType;
    arrayLength?: number;
    permissionId?: number;
    visibility?: Visibility;
    functionConfig?: FunctionConfig;
};

export type MintConfig = {
    flatFee: number;
    active: boolean;
};

export type MintConfigs = Record<string, MintConfig>;
export type PatchFees = Record<string, number>;
export type AssignFees = Record<string, number>;

export type ScopeConfig = {
    name: string;
    owner?: \`0x\${string}\`;
    whitelist?: boolean;
    userAssign?: boolean;
    userPatch?: boolean;
    bankers?: string[];
    operators?: string[];
};

type Letter =
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z'
    | 'a'
    | 'b'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'g'
    | 'h'
    | 'i'
    | 'j'
    | 'k'
    | 'l'
    | 'm'
    | 'n'
    | 'o'
    | 'p'
    | 'q'
    | 'r'
    | 's'
    | 't'
    | 'u'
    | 'v'
    | 'w'
    | 'x'
    | 'y'
    | 'z';

export type ValidNameIdentifier = \`\${Letter}\${string}\`;

export type ContractFeeConfig = {
    mintFee?: number;
    assignFee?: number;
    patchFee?: number;
};

export type ContractConfig = {
    scopeName: string;
    name: ValidNameIdentifier;
    symbol: string;
    baseURI: string;
    schemaURI: string;
    imageURI: string;
    fields: FieldConfig[];
    features: Feature[];
    fragments?: string[];
    fees?: ContractFeeConfig;
};

export type AssignmentNodeData = {
    name: string;
};

export enum FieldTypeEnum {
    empty,
    BOOL,
    INT8,
    INT16,
    INT32,
    INT64,
    INT128,
    INT256,
    UINT8,
    UINT16,
    UINT32,
    UINT64,
    UINT128,
    UINT256,
    CHAR8,
    CHAR16,
    CHAR32,
    CHAR64,
    BYTES8,
    BYTES16,
    BYTES32,
    LITEREF,
    ADDRESS,
    STRING,
    //ENUM,
}

export type DeployedContract = {
    name: string;
    address: \`0x\${string}\`;
    block: number;
};
export type Deployment<T extends string> = {
    network: T;
    contracts: Record<string, DeployedContract>;
    txHash?: string; // making this optional for now. Need to think whether it should stay optional or not
};

export type Network = {
    chain: Chain;
    rpc: string;
};

export type ProjectConfig<T extends string = 'local' | 'testnet' | 'mainnet'> = {
    name: ValidNameIdentifier;
    scopes: ScopeConfig[];
    contracts: Record<string, ContractConfig | string>;
    networks?: Record<T, Network>;
};

                        `,
                                loader: 'ts',
                            }));
                        },
                    },
                ],
            });

            console.log('compiling');
            // Extract the compiled code
            const compiledCode = result.outputFiles?.[0]?.text;

            console.log('done compiling');
            if (!compiledCode) {
                throw new Error('No output generated from esbuild.');
            }
            console.log(compiledCode);
            // Evaluate the compiled code into a variable
            const module: { exports: { default?: any } } = { exports: {} };
            const func = new Function('exports', 'module', compiledCode);
            func(module.exports, module);
            return module.exports.default;
        } catch (error) {
            console.error('Error:', (error as Error).message);
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
                const fragments = new Set<string>(contractConfig.fragments);
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
                    mintFee: contractConfig.fees?.mintFee?.toString() ?? '',
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
                                <Input type='file' accept='.json,.ts' onChange={validateProjectConfig} />
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
