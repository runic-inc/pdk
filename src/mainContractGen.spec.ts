import fs from 'fs';
import path from 'path';
import { parseJson } from "./contractSchemaJsonParser";
import { MainContractGen } from './mainContractGen';

describe('generateSolidityCode', () => {
  const testDirectory = './src/test_data';
  const files = fs.readdirSync(testDirectory);

  const jsonFiles = files.filter((file) => file.endsWith('.json'));
  const solFiles = files.filter((file) => file.endsWith('.sol'));

  const gen = new MainContractGen()

  const groupedFiles = jsonFiles.reduce<{ [key: string]: { json: string; sol: string } }>(
    (acc, jsonFile) => {
      const baseName = path.basename(jsonFile, '.json');
      acc[baseName] = {
        json: path.join(testDirectory, jsonFile),
        sol: path.join(testDirectory, baseName + '.sol'),
      };
      return acc;
    },
    {},
  );

  for (const [baseName, files] of Object.entries(groupedFiles)) {
    if (solFiles.includes(baseName + '.sol')) {
      it(`should generate the correct Solidity code for ${baseName}.json`, () => {
        const jsonData = JSON.parse(fs.readFileSync(files.json, 'utf8'));
        const solidityExpected = fs.readFileSync(files.sol, 'utf8');

        const solidityGenerated = gen.gen(parseJson(jsonData));

        expect(solidityGenerated).toEqual(solidityExpected);
      });
    }
  }
});