// import fs from 'fs';
// import path from 'path';
// import { CLIProcessor } from './cliProcessor';
// const CONTRACT_SCHEMA = path.join(__dirname, '../../../../../schemas/patchwork-contract-config.schema.json');
// const PROJECT_SCHEMA = path.join(__dirname, '../../../../../schemas/patchwork-project-config.schema.json');
// const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

import { ProjectConfig, ValidNameIdentifier } from '@patchworkdev/common';
import { importProjectConfig } from '../helpers/project';

//TODO: Uncomment adn add back commented out tests.
describe('CLI', () => {
    // Placeholder test to keep Jest happy while other tests are commented out
    test('placeholder - remove when real tests are uncommented', () => {
        expect(true).toBe(true);
    });

    // const testDataDir = path.resolve(__dirname, '../../../../common/src/codegen/test_data');
    // const projectConfigsDir = path.join(testDataDir, 'project_configs');
    // const outputDir = path.resolve(__dirname, '../test_output');

    // beforeAll(() => {
    //     // Ensure the output directory exists
    //     if (!fs.existsSync(outputDir)) {
    //         fs.mkdirSync(outputDir, { recursive: true });
    //     }
    // });

    // afterAll(() => {
    //     // Clean up the output directory after tests
    //     if (fs.existsSync(outputDir)) {
    //         fs.rmSync(outputDir, { recursive: true });
    //     }
    // });

    // test('validate command with valid contract config', () => {
    //     const configFile = path.join(testDataDir, 'Arrays.json');
    //     const result = cliProcessor.validateConfig(configFile);
    //     expect(result).toBe(true);
    // });

    // test('validate command with valid project config', () => {
    //     const configFile = path.join(projectConfigsDir, 'project-config.json');
    //     const result = cliProcessor.validateConfig(configFile);
    //     expect(result).toBe(true);
    // });

    // test('validate command with invalid config', () => {
    //     const configFile = path.join(testDataDir, 'Arrays-schema.json');
    //     const result = cliProcessor.validateConfig(configFile);
    //     expect(result).toBe(false);
    // });

    // test('generate command with contract config', () => {
    //     const configFile = path.join(testDataDir, 'Arrays.json');
    //     cliProcessor.generateSolidity([configFile], outputDir);
    //     const generatedFiles = fs.readdirSync(outputDir);
    //     expect(generatedFiles).toContain('ArraysGenerated.sol');
    //     expect(generatedFiles).toContain('Arrays.sol');
    //     expect(generatedFiles).toContain('Arrays-schema.json');
    // });

    // test('generate command with project config', () => {
    //     const configFile = path.join(projectConfigsDir, 'project-config-contract-config.json');
    //     cliProcessor.generateSolidity([configFile], outputDir);
    //     const generatedFiles = fs.readdirSync(outputDir);
    //     expect(generatedFiles.length).toBeGreaterThan(0);
    //     // Check for specific files that should be generated based on project-config-contract-config.json
    //     expect(generatedFiles).toContain('AccountPatchGenerated.sol');
    //     expect(generatedFiles).toContain('AccountPatch.sol');
    //     expect(generatedFiles).toContain('AccountPatch-schema.json');
    //     expect(generatedFiles).toContain('SecondContractGenerated.sol');
    //     expect(generatedFiles).toContain('SecondContract.sol');
    //     expect(generatedFiles).toContain('SecondContract-schema.json');
    // });
});

describe('ProjectConfig validation', () => {
    test('placeholder - remove when real tests are uncommented', () => {
        expect(true).toBe(true);
    });

    it('throws an error when a contract field key is exactly the reserved word "metadata"', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                MyContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [{ id: 1, key: 'metadata', type: 'uint256', description: 'Test field' }],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Invalid field key "metadata" in contract "MyContract": field keys cannot be exactly the reserved word "metadata"',
        );
    });

    it('throws an error when there are duplicate field keys', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                MyContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [
                        { id: 0, key: 'fieldA', type: 'uint256', description: 'Field A' },
                        { id: 1, key: 'fieldA', type: 'uint256', description: 'Duplicate Field A' },
                    ],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(/Duplicate field keys/);
    });

    // New tests for alphanumeric validation
    it('throws an error when project name contains non-alphanumeric characters', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalid-project' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {},
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Invalid project name "invalid-project": project name must contain only alphanumeric characters',
        );
    });

    it('throws an error when contract name contains non-alphanumeric characters', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'ValidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                'My-Contract': {
                    scopeName: 'default',
                    name: 'My-Contract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Invalid contract name "My-Contract": contract name must contain only alphanumeric characters',
        );
    });

    // New tests for contract key matching
    it('throws an error when contract key does not match contract name', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'ValidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                ContractOne: {
                    scopeName: 'default',
                    name: 'DifferentName' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Contract key mismatch: the key "ContractOne" must match the contract name "DifferentName"',
        );
    });

    // New tests for contract reference validation
    it('throws an error when banker references non-existent contract', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'ValidProject' as ValidNameIdentifier,
            scopes: [
                {
                    name: 'default',
                    whitelist: true,
                    userAssign: true,
                    userPatch: true,
                    bankers: ['0x1234567890123456789012345678901234567890', 'NonExistentContract'],
                },
            ],
            contracts: {
                ExistingContract: {
                    scopeName: 'default',
                    name: 'ExistingContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Invalid banker reference "NonExistentContract" in scope "default": must be an Ethereum address or a valid contract key',
        );
    });

    it('throws an error when operator references non-existent contract', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'ValidProject' as ValidNameIdentifier,
            scopes: [
                {
                    name: 'default',
                    whitelist: true,
                    userAssign: true,
                    userPatch: true,
                    operators: ['0x1234567890123456789012345678901234567890', 'NonExistentContract'],
                },
            ],
            contracts: {
                ExistingContract: {
                    scopeName: 'default',
                    name: 'ExistingContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Invalid operator reference "NonExistentContract" in scope "default": must be an Ethereum address or a valid contract key',
        );
    });

    it('throws an error when fragment references non-existent contract', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'ValidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                ExistingContract: {
                    scopeName: 'default',
                    name: 'ExistingContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [],
                    features: [],
                    fragments: ['NonExistentContract'],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(
            'Invalid fragment reference "NonExistentContract" in contract "ExistingContract": must be a valid contract key',
        );
    });

    it('accepts valid Ethereum addresses in bankers and operators', () => {
        const validProjectConfig: ProjectConfig = {
            name: 'ValidProject' as ValidNameIdentifier,
            scopes: [
                {
                    name: 'default',
                    whitelist: true,
                    userAssign: true,
                    userPatch: true,
                    bankers: ['0x1234567890123456789012345678901234567890', 'ExistingContract'],
                    operators: ['0x0987654321098765432109876543210987654321', 'ExistingContract'],
                },
            ],
            contracts: {
                ExistingContract: {
                    scopeName: 'default',
                    name: 'ExistingContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(validProjectConfig)).not.toThrow();
    });
});

describe('ProjectConfig field ID validation', () => {
    it('passes when there are no duplicate field ids, regardless of order or gaps', () => {
        // Valid config: field ids are 2, 5, 9. They are not sequential,
        // but that's acceptable since we only require uniqueness.
        const validProjectConfig: ProjectConfig = {
            name: 'validProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                MyContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [
                        { id: 2, key: 'fieldC', type: 'uint256', description: 'Field C' },
                        { id: 5, key: 'fieldA', type: 'uint256', description: 'Field A' },
                        { id: 9, key: 'fieldB', type: 'uint256', description: 'Field B' },
                    ],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(validProjectConfig)).not.toThrow();
    });

    it('throws an error if there are duplicate field ids', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                MyContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [
                        { id: 0, key: 'fieldA', type: 'uint256', description: 'Field A' },
                        { id: 0, key: 'fieldB', type: 'uint256', description: 'Field B' },
                    ],
                    features: [],
                    fragments: [],
                },
            },
            networks: {
                local: { chain: 'anvil', rpc: 'http://localhost' },
                testnet: { chain: 'anvil', rpc: 'http://localhost' },
                mainnet: { chain: 'anvil', rpc: 'http://localhost' },
            },
            plugins: [],
        };

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(/Duplicate field IDs/);
    });
});
