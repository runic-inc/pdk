import { ContractConfig, Network, ScopeConfig, ValidNameIdentifier } from '@patchworkdev/common';
import { Command } from 'commander';
import { Listr, ListrTaskWrapper } from 'listr2';

export type TableData = { [key: string]: { [key: string]: string | number } };

export type Compute<type> = { [key in keyof type]: type[key] } & unknown;
export type RequiredBy<TType, TKeys extends keyof TType> = Required<Pick<TType, TKeys>> & Omit<TType, TKeys>;

export type PatchworkProject = {
    src?: string; // Defaults to the src in stdout of forge config
    plugins: PDKPlugin[];
    name: ValidNameIdentifier;
    scopes: ScopeConfig[];
    contracts: Record<string, ContractConfig | string>;
    networks?: Record<'local' | 'testnet' | 'mainnet', Network>;
};

export type PDKContext = {
    rootDir: string;
    config: PatchworkProject;
    network: 'local' | 'testnet' | 'mainnet';
    contracts: {
        name: string;
        path: string;
        abi: string;
        bytecode: string;
        md5: string;
        address: `0x${string}`;
    }[];
    artifacts: Record<string, any>;
};

export type PatchworkSetup = {
    src: string;
    out: string;
    scripts: string;
};

export type PDKPlugin = {
    name: string;

    /**
     * Called before any compilation/build/codegen to provide setup context to PDK
     */
    // setup?: (context: PatchworkContext) => Promise<PatchworkSetup> | PatchworkSetup;

    /**
     * Called to initialize and modify the context object.
     */
    // compile?: (context: PatchworkContext) => Promise<void> | void;

    /**
     * Called to generate code or other artifacts using the context object.
     */
    generate?: (props: {
        context: PDKContext;
        task: ListrTaskWrapper<PDKContext, any, any>;
        log?: (message: string) => void;
    }) => Promise<Listr<PDKContext>> | Listr<PDKContext>;

    /**
     * Returns one or more commands to be added to the CLI.
     */
    commands?: (context: PDKContext) => Command;

    /**
     * Called when user runs pdk network switch
     */
    onNetworkChange?: (context: PDKContext) => Promise<void> | void;

    /**
     * Called to run deploy scripts
     */
    // deploy?: (context: PatchworkContext) => Promise<void> | void;
};
