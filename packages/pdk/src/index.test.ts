import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../dist/index.js');

describe('CLI', () => {
  const testDataDir = path.resolve(__dirname, '../../common/src/codegen/test_data');
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
    const result = execSync(`node ${CLI_PATH} validate ${configFile}`).toString();
    expect(result).toContain('The file is a valid Patchwork contract configuration.');
  });

  test('validate command with valid project config', () => {
    const configFile = path.join(projectConfigsDir, 'project-config.json');
    const result = execSync(`node ${CLI_PATH} validate ${configFile}`).toString();
    expect(result).toContain('The file is a valid Patchwork project configuration.');
  });

  test('validate command with invalid config', () => {
    const configFile = path.join(testDataDir, 'Arrays-schema.json');
    expect(() => {
      execSync(`node ${CLI_PATH} validate ${configFile}`);
    }).toThrow();
  });

  test('generate command with contract config', () => {
    const configFile = path.join(testDataDir, 'Arrays.json');
    execSync(`node ${CLI_PATH} generate ${configFile} --output ${outputDir}`);
    
    const generatedFiles = fs.readdirSync(outputDir);
    expect(generatedFiles).toContain('ArraysGenerated.sol');
    expect(generatedFiles).toContain('Arrays.sol');
    expect(generatedFiles).toContain('Arrays-schema.json');
  });

  test('generate command with project config', () => {
    const configFile = path.join(projectConfigsDir, 'project-config-contract-config.json');
    execSync(`node ${CLI_PATH} generate ${configFile} --output ${outputDir}`);
    
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

  // Add more tests for other commands like generateTsABIs, generateSchema, etc.
});