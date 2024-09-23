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

export enum FunctionConfig {
    ALL = "ALL",
    NONE = "NONE",
    LOAD = "LOAD",
    STORE = "STORE"
}

type FieldType =
    | 'BOOLEAN'
    | 'INT8'
    | 'INT16'
    | 'INT32'
    | 'INT64'
    | 'INT128'
    | 'INT256'
    | 'UINT8'
    | 'UINT16'
    | 'UINT32'
    | 'UINT64'
    | 'UINT128'
    | 'UINT256'
    | 'CHAR8'
    | 'CHAR16'
    | 'CHAR32'
    | 'CHAR64'
    | 'LITEREF'
    | 'ADDRESS'
    | 'STRING';

type Visibility = 'PUBLIC' | 'PRIVATE';

export type FieldConfig = {
    id: number;
    key: string;
    description?: string;
    type: FieldType;
    arrayLength?: number;
    permissionId?: number;
    visibility?: Visibility;
    functionConfig?: FunctionConfig;
}

export type MintConfig = {
    flatFee: number;
    active: boolean;
}


export type MintConfigs = Record<string, MintConfig>;
export type PatchFees = Record<string, number>;
export type AssignFees = Record<string, number>;

export type ScopeConfig = {
    name: string;
    owner?: `0x${string}`;
    whitelist?: boolean;
    userAssign?: boolean;
    userPatch?: boolean;
    bankers?: `0x${string}`[];
    operators?: `0x${string}`[];
    mintConfigs?: MintConfigs;
    patchFees?: PatchFees;
    assignFees?: AssignFees;
};

export type ContractConfig = {
    scopeName: string;
    name: string;
    symbol: string;
    baseURI: string;
    schemaURI: string;
    imageURI: string;
    fields: FieldConfig[];
    features: Feature[];
}

export type AssignmentNodeData = {
    name: string;
};

export enum FieldTypeEnum {
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
    //ENUM,
}

export type ContractRelation = {
    fragments: string[];
}

type ContractsConfig = Record<string, ContractConfig>;

type ContractRelationsConfig = Record<string, ContractRelation>;

export type ProjectConfig = {
    name: string;
    scopes: ScopeConfig[];
    contracts: ContractsConfig;
    contractRelations: ContractRelationsConfig;
};