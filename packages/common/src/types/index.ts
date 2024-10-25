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
    bankers?: string[];
    operators?: string[];
    mintConfigs?: MintConfigs;
    patchFees?: PatchFees;
    assignFees?: AssignFees;
};

// The first character must be a letter (uppercase or lowercase)
type NameStartChar = 
  | 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'
  | 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z';

// All following characters must be alphanumeric (letters or digits only)
type AlphanumericChar = 
  | 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'
  | 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'
  | '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9';

// The full valid name: it must start with a letter and be followed by alphanumeric characters only
type ValidNameIdentifier = `${NameStartChar}${AlphanumericChar*}`;


export type ContractConfig = {
    scopeName: string;
    name: ValidNameIdentifier;
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
    LITEREF,
    ADDRESS,
    STRING,
    //ENUM,
}

export type ContractRelation = {
    fragments: string[];
}

export type DeployedContract = {
    name: string;
    address: `0x${string}`;
    block: number;
}
export type Deployment<T extends string> = {
    network: T;
    contracts: Record<string, DeployedContract>;
    txHash?: string; // making this optional for now. Need to think whether it should stay optional or not
}

export type Network = {
    chainId: number;
    rpc: string;
}

export type ContractsConfig = Record<string, ContractConfig | string>;

export type ContractRelationsConfig = Record<string, ContractRelation>;

export type ProjectConfig<T extends string = string> = {
    name: ValidNameIdentifier;
    scopes: ScopeConfig[];
    contracts: ContractsConfig;
    contractRelations: ContractRelationsConfig;
    networks?: Record<T, Network>;
    deployments?: Deployment<T>[];
};