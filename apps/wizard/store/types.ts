import { Feature, ScopeConfig } from '@/types';
import { UContractConfig } from '../types';

export type EditorSlice = {
    editor: string | null;
    setEditor: (id: string | null) => void;
};

export type ContractSlice = {
    contractConfig: UContractConfig;
    getContractConfig: () => UContractConfig | undefined;
    updateContractConfig: (newConfig: UContractConfig) => void;
    //getContractFields: () => UFieldConfig[];
    //updateContractFields: (newFields: UFieldConfig[]) => void;
    getContractFeatures: () => Feature[];
    updateContractFeatures: (selectedKeys: Feature[], featureGroupKeys: Feature[]) => void;
};

export type ProjectSlice = {
    scopeConfig: ScopeConfig;
    updateScopeConfig: (config: ScopeConfig) => void;
    contractsConfig: UContractConfig[];
    updateContractsConfig: (newConfigs: UContractConfig[]) => void;
    addNewContract: () => string;
    deleteContract: (id: string) => void;
};

export type StoreSlices = EditorSlice & ContractSlice & ProjectSlice;
