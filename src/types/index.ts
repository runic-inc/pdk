import { ReactNode } from "react";

export enum Feature {
    FRAGMENTMULTI = "FRAGMENTMULTI",
    FRAGMENTSINGLE = "FRAGMENTSINGLE",
    PATCH = "PATCH",
    ACCOUNTPATCH = "ACCOUNTPATCH",
    "1155PATCH" = "1155PATCH",
    MINTABLE = "MINTABLE",
    REVERSIBLE = "REVERSIBLE",
    LITEREF = "LITEREF",
    WEAKREF = "WEAKREF",
    DYNAMICREFLIBRARY = "DYNAMICREFLIBRARY"
}

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

export enum FunctionConfig {
    ALL = "ALL",
    NONE = "NONE",
    LOAD = "LOAD",
    STORE = "STORE"
}

export type FieldConfig = {
    _uid?: string;
    id: number;
    key: string;
    description?: string;
    fieldType: string;
    arrayLength?: number;
    values?: PatchworkEnum[];
    permissionId?: number;
    visibility?: string;
    functionConfig?: FunctionConfig;
}

export interface Patchwork721Field {
    _uid: string;
    id: number;
    key: string;
    description: string;
    fieldType: string;
    arrayLength: string;
    values?: PatchworkEnum[];
    permissionId?: number;
    visibility?: string;
    functionConfig?: FunctionConfig;
}

export type ScopeConfig = {
    name: string;
    owner?: `0x${string}`;
}

export type ContractConfig = {
    scopeName: string;
    name: string;
    symbol: string;
    baseURI: string;
    schemaURI: string;
    imageURI: string;
    fields: FieldConfig[];
    features?: Feature[];
}

export type UContractConfig = ContractConfig & {
    _uid: string;
}

export enum Patchwork721Interface {
    Assignee = 1,
    Assignable,
    Patch,
}

export interface PatchworkEnum {
    uid: string;
    value: string;
}

export interface Patchwork721Data {
    name: string;
    features: Patchwork721Interface[];
    fields: Patchwork721Field[];
}

export type AssignmentNodeData = {
    name: string;
};

export type Patchwork721InterfaceDecorators = {
    [key in Patchwork721Interface]: {
        icon: `fa-${string}`;
    };
};

export enum FieldType {
    empty,
    BOOLEAN,
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
    LITEREF,
    ADDRESS,
    STRING,
    ENUM,
}

export const InterfaceDecorators: Patchwork721InterfaceDecorators = {
    [Patchwork721Interface.Assignee]: {
        icon: 'fa-frame',
    },
    [Patchwork721Interface.Assignable]: {
        icon: 'fa-frame',
    },
    [Patchwork721Interface.Patch]: {
        icon: 'fa-frame',
    },
};