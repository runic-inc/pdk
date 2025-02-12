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
    it('throws an error when a contract field key starts with the reserved word "metadata"', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                myContract: {
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
});

describe('ProjectConfig field ID validation', () => {
    it('passes when field ids are sequential starting at 0 with no duplicates regardless of order', () => {
        const validProjectConfig: ProjectConfig = {
            name: 'validProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                myContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [
                        { id: 2, key: 'fieldC', type: 'uint256', description: 'Field C' },
                        { id: 0, key: 'fieldA', type: 'uint256', description: 'Field A' },
                        { id: 1, key: 'fieldB', type: 'uint256', description: 'Field B' },
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
                myContract: {
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

    it('throws an error if field ids do not start at 0', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                myContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [
                        { id: 1, key: 'fieldA', type: 'uint256', description: 'Field A' },
                        { id: 2, key: 'fieldB', type: 'uint256', description: 'Field B' },
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

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(/must start at 0/);
    });

    it('throws an error if field ids have gaps', () => {
        const invalidProjectConfig: ProjectConfig = {
            name: 'invalidProject' as ValidNameIdentifier,
            scopes: [{ name: 'default', whitelist: true, userAssign: true, userPatch: true }],
            contracts: {
                myContract: {
                    scopeName: 'default',
                    name: 'MyContract' as ValidNameIdentifier,
                    symbol: 'MYC',
                    baseURI: 'https://example.com/base',
                    schemaURI: 'https://example.com/schema',
                    imageURI: 'https://example.com/image',
                    fields: [
                        { id: 0, key: 'fieldA', type: 'uint256', description: 'Field A' },
                        { id: 2, key: 'fieldB', type: 'uint256', description: 'Field B' },
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

        expect(() => importProjectConfig(invalidProjectConfig)).toThrow(/must be sequential with no gaps/);
    });
});
