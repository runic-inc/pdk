export enum Feature {
    FRAGMENTMULTI = "FRAGMENTMULTI",
    FRAGMENTSINGLE = "FRAGMENTSINGLE",
    PATCH = "PATCH",
    PATCHACCOUNT = "ACCOUNTPATCH",
    PATCH1155 = "1155PATCH",
    MINTABLE = "MINTABLE",
    REVERSIBLE = "REVERSIBLE",
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
    id: number;
    permissionId?: number;
    fieldType: string;
    arrayLength?: number;
    visibility?: string;
    key: string;
    description?: string;
    functionConfig?: FunctionConfig;
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