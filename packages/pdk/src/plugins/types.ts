import { ProjectConfig } from '@patchworkdev/common/types';
import { Address } from 'viem';

export type Compute<type> = { [key in keyof type]: type[key] } & unknown;
export type RequiredBy<TType, TKeys extends keyof TType> = Required<Pick<TType, TKeys>> & Omit<TType, TKeys>;

export type PluginContext = {
    rootDir: string;
    config: ProjectConfig;
    contracts: {
        name: string;
        path: string;
        abi: string;
        bytecode: string;
        address: Address;
    }[];
    artifacts: Record<string, any>;
};

export type PatchworkPlugin = {
    name: string;
    generate?: (props: PluginContext) => Promise<void> | void;
};
