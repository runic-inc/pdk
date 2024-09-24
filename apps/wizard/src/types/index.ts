import { ContractConfig, Feature, FieldConfig } from '@patchworkdev/common/types';
import { ReactNode } from 'react';

export type FeatureFlag = {
    key: Feature;
    label: string;
    default?: boolean;
    optional?: boolean;
    description?: string;
    autoToggle?: boolean;
    validator?: (value: ContractConfig) => boolean;
    validatorMessage?: string;
};

export type FeatureOption = {
    key: string;
    label: string;
    type: 'input' | 'select' | 'checkbox' | 'toggle';
    description?: string;
    placeholder?: string;
};

export type FeatureFlagConfig = {
    [key: string]: string | number | boolean;
};

export type FeatureConfig = {
    name: string;
    description: string | ReactNode;
    icon: `fa-${string}`;
    autoToggle?: boolean;
    validator?: (value: ContractConfig) => boolean;
    validatorMessage?: string;
    featureSet: [FeatureFlag, ...FeatureFlag[]];
    options: FeatureOption[];
};

export type UContractConfig = Omit<ContractConfig, 'fields' | 'scopeName'> & {
    _uid: string;
    fields: UFieldConfig[];
    featureOptions: Partial<Record<keyof typeof Feature, FeatureFlagConfig>>;
    mintFee?: string;
    patchFee?: string;
    assignFee?: string;
    fragments: Set<string>;
};

export type UFieldConfig = FieldConfig & {
    _uid: string;
};

export interface PatchworkEnum {
    uid: string;
    value: string;
}
