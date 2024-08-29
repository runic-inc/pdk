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

export type FieldConfig = {
    //_uid?: string;
    id: number;
    key: string;
    description?: string;
    fieldType: string;
    arrayLength?: number;
    //values?: PatchworkEnum[];
    permissionId?: number;
    visibility?: string;
    functionConfig?: FunctionConfig;
}

export type MintConfig = {
    flatFee: number;
    active: boolean;
}

export type ScopeConfig = {
    name: string;
    owner?: `0x${string}`;
    whitelist?: boolean;
    userAssign?: boolean;
    userPatch?: boolean;
    bankers?: string[];
    operators?: string[];
    mintConfigs?: Map<string, MintConfig>;
    patchFees?: Map<string, number>;
    assignFees?: Map<string, number>;
}

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
    //ENUM,
}

export type ContractRelation = {
    fragments: string[];
}

export type ProjectConfig = {
    name: string;
    scopes: ScopeConfig[];
    contracts: Map<string, string>;
    contractRelations: Map<string, ContractRelation>;
}