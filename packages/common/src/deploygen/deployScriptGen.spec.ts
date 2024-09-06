import fs from 'fs';
import { JSONProjectConfigLoader } from '../configgen/jsonProjectConfigLoader';
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

        const projectConfig = jsonConfigLoader.load(jsonData);
        // console.log(projectConfig);
        const solidityGenerated = gen.gen(projectConfig);

        expect(solidityGenerated).toEqual(solidityExpected);
      });
  }
});
