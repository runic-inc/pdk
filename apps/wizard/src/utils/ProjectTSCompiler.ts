import { ProjectConfig } from '@patchworkdev/common/types';
import * as esbuild from 'esbuild-wasm';

const pwTypesContents = `
import type { Chain } from 'viem';

export enum Feature {
    FRAGMENTMULTI = 'FRAGMENTMULTI',
    FRAGMENTSINGLE = 'FRAGMENTSINGLE',
    PATCH = 'PATCH',
    ACCOUNTPATCH = 'ACCOUNTPATCH',
    '1155PATCH' = '1155PATCH',
    MINTABLE = 'MINTABLE',
    REVERSIBLE = 'REVERSIBLE',
    LITEREF = 'LITEREF',
    WEAKREF = 'WEAKREF',
    DYNAMICREFLIBRARY = 'DYNAMICREFLIBRARY',
}

export enum FunctionConfig {
    ALL = 'ALL',
    NONE = 'NONE',
    LOAD = 'LOAD',
    STORE = 'STORE',
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
    | 'bytes8'
    | 'bytes16'
    | 'bytes32'
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
};

export type MintConfig = {
    flatFee: number;
    active: boolean;
};

export type MintConfigs = Record<string, MintConfig>;
export type PatchFees = Record<string, number>;
export type AssignFees = Record<string, number>;

export type ScopeConfig = {
    name: string;
    owner?: \`0x\${string}\`;
    whitelist?: boolean;
    userAssign?: boolean;
    userPatch?: boolean;
    bankers?: string[];
    operators?: string[];
};

type Letter =
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q'
    | 'R'
    | 'S'
    | 'T'
    | 'U'
    | 'V'
    | 'W'
    | 'X'
    | 'Y'
    | 'Z'
    | 'a'
    | 'b'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'g'
    | 'h'
    | 'i'
    | 'j'
    | 'k'
    | 'l'
    | 'm'
    | 'n'
    | 'o'
    | 'p'
    | 'q'
    | 'r'
    | 's'
    | 't'
    | 'u'
    | 'v'
    | 'w'
    | 'x'
    | 'y'
    | 'z';

export type ValidNameIdentifier = \`\${Letter}\${string}\`;

export type ContractFeeConfig = {
    mintFee?: number;
    assignFee?: number;
    patchFee?: number;
};

export type ContractConfig = {
    scopeName: string;
    name: ValidNameIdentifier;
    symbol: string;
    baseURI: string;
    schemaURI: string;
    imageURI: string;
    fields: FieldConfig[];
    features: Feature[];
    fragments?: string[];
    fees?: ContractFeeConfig;
};

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
    BYTES8,
    BYTES16,
    BYTES32,
    LITEREF,
    ADDRESS,
    STRING,
    //ENUM,
}

export type DeployedContract = {
    name: string;
    address: \`0x\${string}\`;
    block: number;
};
export type Deployment<T extends string> = {
    network: T;
    contracts: Record<string, DeployedContract>;
    txHash?: string; // making this optional for now. Need to think whether it should stay optional or not
};

export type Network = {
    chain: Chain;
    rpc: string;
};

export type ProjectConfig<T extends string = 'local' | 'testnet' | 'mainnet'> = {
    name: ValidNameIdentifier;
    scopes: ScopeConfig[];
    contracts: Record<string, ContractConfig | string>;
    networks?: Record<T, Network>;
};
`;

export class ProjectTSCompiler {
    static async compileProject(tsCode: string): Promise<ProjectConfig> {
        // Initialize esbuild-wasm
        await esbuild.initialize({
            wasmURL: 'https://unpkg.com/esbuild-wasm@latest/esbuild.wasm', // Load WASM from a CDN
        });
        const result = await esbuild.build({
            stdin: {
                contents: tsCode,
                sourcefile: 'input.ts',
                loader: 'ts',
            },
            bundle: true, // Bundle everything into one file
            format: 'cjs', // Ensure the output is an ECMAScript module
            target: 'esnext',
            write: false, // Prevent writing to disk
            plugins: [
                {
                    name: 'resolve-external',
                    setup(build) {
                        // Mock the external module
                        build.onResolve({ filter: /^@patchworkdev\/common\/types$/ }, () => ({
                            path: '@patchworkdev/common/types',
                            namespace: 'external',
                        }));

                        // Provide the exports for the mock module
                        build.onLoad({ filter: /.*/, namespace: 'external' }, () => ({
                            contents: pwTypesContents,
                            loader: 'ts',
                        }));
                    },
                },
            ],
        });

        console.log('compiling');
        // Extract the compiled code
        const compiledCode = result.outputFiles?.[0]?.text;

        console.log('done compiling');
        if (!compiledCode) {
            throw new Error('No output generated from esbuild.');
        }
        console.log(compiledCode);
        // Evaluate the compiled code into a variable
        const module: { exports: { default?: any } } = { exports: {} };
        const func = new Function('exports', 'module', compiledCode);
        func(module.exports, module);
        return module.exports.default;
    }
}
