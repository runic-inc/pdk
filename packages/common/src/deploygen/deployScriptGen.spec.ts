import fs from 'fs';
import path, { dirname } from 'path';
import { JSONProjectConfigLoader } from '../configgen/jsonProjectConfigLoader';
import { ContractConfig, ProjectConfig } from '../types';
import { DeployScriptGen } from './deployScriptGen';

describe('generateDeployerScript', () => {
  const testDirectory = './src/deploygen/test_data';
  const files = fs.readdirSync(testDirectory);

  const testFiles = ['sampleproj'];

  const gen = new DeployScriptGen()

  const jsonConfigLoader = new JSONProjectConfigLoader();
  
  for (const baseName of testFiles) {
    const fullBaseName = `${testDirectory}/${baseName}`;
    it(`should generate the correct Solidity code for ${baseName}.json`, () => {
        const jsonData = fs.readFileSync(`${fullBaseName}.json`, 'utf8');
        const solidityExpected = fs.readFileSync(`${fullBaseName}.deploy.s.sol`, 'utf8');

        const projectConfig = loadFullProjectConfig(jsonConfigLoader.load(jsonData), dirname(fullBaseName));
        // console.log(projectConfig);
        const solidityGenerated = gen.gen(projectConfig);

        expect(solidityGenerated).toEqual(solidityExpected);
      });
  }
});

function loadFullProjectConfig(projectConfig: ProjectConfig, baseDir: string): ProjectConfig {
    const fullProjectConfig = { ...projectConfig };
    for (const contractName of Object.keys(projectConfig.contracts)) {
        const contractConfig = projectConfig.contracts[contractName];
        if (typeof contractConfig === "string") {
            const config = loadContractConfig(contractConfig, baseDir);
            fullProjectConfig.contracts[contractName] = config;
        }
    }
    return fullProjectConfig;
}

function loadContractConfig(contractName: string, baseDir: string): ContractConfig {
    // TODO load TS files
    const configPath = path.resolve(baseDir, contractName);
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config: ContractConfig = JSON.parse(configFile);

    return config;
}
