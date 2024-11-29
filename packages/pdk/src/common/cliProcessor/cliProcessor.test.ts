import fs from 'fs';
import path from 'path';
import { CLIProcessor } from './cliProcessor';

const CONTRACT_SCHEMA = '../../../../../schemas/patchwork-contract-config.schema.json';
const PROJECT_SCHEMA = '../../../../../schemas/patchwork-project-config.schema.json';

const cliProcessor = new CLIProcessor(CONTRACT_SCHEMA, PROJECT_SCHEMA);

describe('CLI', () => {
    const testDataDir = path.resolve(__dirname, '../../../../common/src/codegen/test_data');
    const projectConfigsDir = path.join(testDataDir, 'project_configs');
    const outputDir = path.resolve(__dirname, '../test_output');

    beforeAll(() => {
        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    });

    afterAll(() => {
        // Clean up the output directory after tests
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true });
        }
    });

    test('validate command with valid contract config', () => {
        const configFile = path.join(testDataDir, 'Arrays.json');
        const result = cliProcessor.validateConfig(configFile);
        expect(result).toBe(true);
    });

    test('validate command with valid project config', () => {
        const configFile = path.join(projectConfigsDir, 'project-config.json');
        const result = cliProcessor.validateConfig(configFile);
        expect(result).toBe(true);
    });

    test('validate command with invalid config', () => {
        const configFile = path.join(testDataDir, 'Arrays-schema.json');
        const result = cliProcessor.validateConfig(configFile);
        expect(result).toBe(false);
    });

    test('generate command with contract config', () => {
        const configFile = path.join(testDataDir, 'Arrays.json');
        cliProcessor.generateSolidity([configFile], outputDir);

        const generatedFiles = fs.readdirSync(outputDir);
        expect(generatedFiles).toContain('ArraysGenerated.sol');
        expect(generatedFiles).toContain('Arrays.sol');
        expect(generatedFiles).toContain('Arrays-schema.json');
    });

    test('generate command with project config', () => {
        const configFile = path.join(projectConfigsDir, 'project-config-contract-config.json');
        cliProcessor.generateSolidity([configFile], outputDir);

        const generatedFiles = fs.readdirSync(outputDir);
        expect(generatedFiles.length).toBeGreaterThan(0);

        // Check for specific files that should be generated based on project-config-contract-config.json
        expect(generatedFiles).toContain('AccountPatchGenerated.sol');
        expect(generatedFiles).toContain('AccountPatch.sol');
        expect(generatedFiles).toContain('AccountPatch-schema.json');
        expect(generatedFiles).toContain('SecondContractGenerated.sol');
        expect(generatedFiles).toContain('SecondContract.sol');
        expect(generatedFiles).toContain('SecondContract-schema.json');
    });
});
