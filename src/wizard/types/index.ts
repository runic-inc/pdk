import { ContractConfig, Feature, FieldConfig } from '@/types';
import { ReactNode } from 'react';

export type FeatureInterface = {
    interface: Feature;
    label: string;
    default?: boolean;
    optional?: boolean;
    description?: string;
    autoToggle?: boolean;
    validator?: (value: ContractConfig) => boolean;
    validatorMessage?: string;
};

export type FeatureOption = {
    label: string;
    name: string;
    type: 'input' | 'select' | 'checkbox' | 'toggle';
    description?: string;
    placeholder?: string;
};

export type FeatureConfig = {
    name: string;
    description: string | ReactNode;
    icon: `fa-${string}`;
    autoToggle?: boolean;
    validator?: (value: ContractConfig) => boolean;
    validatorMessage?: string;
    interfaces: [FeatureInterface, ...FeatureInterface[]];
    options: FeatureOption[];
};

export type UContractConfig = Omit<ContractConfig, 'fields'> & {
    _uid: string;
    fields: UFieldConfig[];
};

export type UFieldConfig = FieldConfig & {
    _uid: string;
};

export interface PatchworkEnum {
    uid: string;
    value: string;
}
