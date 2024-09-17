import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
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
  const testDirectory = './src/codegen/test_data';
  const files = fs.readdirSync(testDirectory);

  const tsFiles = files.filter((file) => file.endsWith('.ts'));
  const solFiles = files.filter((file) => file.endsWith('.sol'));

  const gen = new MainContractGen()

  const groupedFiles = tsFiles.reduce<{ [key: string]: { ts: string; js: string; sol: string } }>(
    (acc, tsFile) => {
      const baseName = path.basename(tsFile, '.ts');
      acc[baseName] = {
        ts: path.join(testDirectory, tsFile),
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
        try {
          const result = execSync(`tsc --outdir tmpout ${files.ts}`);
          console.log("TSC compile success")
          console.log(result.toString())
        } catch (err: any) { 
          console.log("output", err)
          console.log("sdterr", err.stderr.toString())
        }
        const t2 = files.js.replace('src', 'tmpout');
        console.log("requiring ", t2)
        const t = require("../../" + t2).default;
        const solidityGenerated = gen.gen(new ContractSchemaImpl(t));
        fs.rmSync("tmpout", { recursive: true });
        expect(solidityGenerated).toEqual(solidityExpected);
      });
    }
  }
});