import fs from 'fs';
import path from 'path';
import { register } from 'ts-node';
import { ContractSchemaImpl } from './contractSchema';
import { parseJson } from "./contractSchemaJsonParser";
import { MainContractGen } from './mainContractGen';

describe('generateSolidityCodeFromJSON', () => {
  const testDirectory = './src/codegen/test_data';
  const files = fs.readdirSync(testDirectory);

  const jsonFiles = files.filter((file) => file.endsWith('.json'));
  const solFiles = files.filter((file) => file.endsWith('.sol'));

  const gen = new MainContractGen()

  const groupedFiles = jsonFiles.reduce<{ [key: string]: { json: string; sol: string } }>(
    (acc, jsonFile) => {
      const baseName = path.basename(jsonFile, '.json');
      acc[baseName] = {
        json: path.join(testDirectory, jsonFile),
        sol: path.join(testDirectory, baseName + 'Generated.sol'),
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

        const solidityGenerated = gen.gen(new ContractSchemaImpl(parseJson(jsonData)));

        expect(solidityGenerated).toEqual(solidityExpected);
      });
    }
  }
});

describe('generateSolidityCodeFromTS', () => {
  register({
    "compilerOptions": {
        "rootDir": "src",
        "outDir": "dist"
    }
  });
  const testDirectory = './src/codegen/test_data';
  const files = fs.readdirSync(testDirectory);

  const tsFiles = files.filter((file) => file.endsWith('.ts'));
  const solFiles = files.filter((file) => file.endsWith('.sol'));

  const gen = new MainContractGen()

  const groupedFiles = tsFiles.reduce<{ [key: string]: { ts: string; js: string; sol: string } }>(
    (acc, tsFile) => {
      const baseName = path.basename(tsFile, '.ts');
      acc[baseName] = {
        ts: path.join(testDirectory, tsFile).replace('src/codegen/', './'),
        js: path.join(testDirectory, baseName + '.js'),
        sol: path.join(testDirectory, baseName + 'Generated.sol'),
      };
      return acc;
    },
    {},
  );

  for (const [baseName, files] of Object.entries(groupedFiles)) {
    if (solFiles.includes(baseName + '.sol')) {
      it(`should generate the correct Solidity code for ${baseName}.ts`, () => {
        const solidityExpected = fs.readFileSync(files.sol, 'utf8');
        let result;
        try {
          console.log("ts-node compile start", files.ts)
          result = require(files.ts);
          console.log("ts-node compile success")
          const t = result.default;
          const solidityGenerated = gen.gen(new ContractSchemaImpl(t));
          expect(solidityGenerated).toEqual(solidityExpected);
        } catch (err: any) { 
          console.log("Error:", err.message);
          throw new Error("ts-node compile failed");
        }
      });
    }
  }
});