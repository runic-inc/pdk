import fs from 'fs';
import path from 'path';
import Ajv2019 from "ajv/dist/2019";
import { ErrorObject, ValidateFunction } from "ajv";

type GroupedFiles = {
  [key: string]: {
    json: string;
    sol: string;
  };
};

describe('validateJsonSchema', () => {
  const testDirectory: string = './src/codegen/test_data';
  const schemaFile: string = './src/patchwork-contract-config.schema.json';
  const files: string[] = fs.readdirSync(testDirectory);
  const jsonFiles: string[] = files.filter((file: string) => file.endsWith('.json'));
  const solFiles: string[] = files.filter((file: string) => file.endsWith('.sol'));

  const groupedFiles: GroupedFiles = jsonFiles.reduce<GroupedFiles>(
    (acc: GroupedFiles, jsonFile: string) => {
      const baseName: string = path.basename(jsonFile, '.json');
      acc[baseName] = {
        json: path.join(testDirectory, jsonFile),
        sol: path.join(testDirectory, baseName + '.sol'),
      };
      return acc;
    },
    {},
  );

  function tryValidate(jsonFile: string, schemaFile: string): boolean | ErrorObject[] {
    try {
      const jsonData: unknown = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      const schemaData: object = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
      const ajv: Ajv2019 = new Ajv2019();
      const validate: ValidateFunction = ajv.compile(schemaData);
      const valid: boolean = validate(jsonData);
      if (valid) {
        return true;
      }
      return validate.errors || [];
    } catch (error: unknown) {
      console.error("Error reading JSON or schema file:", (error as Error).message);
      return [{ message: (error as Error).message } as ErrorObject];
    }
  }

  for (const [baseName, files] of Object.entries(groupedFiles)) {
    if (solFiles.includes(baseName + '.sol')) {
      it(`should validate ${baseName}.json successfully`, () => {
        const result: boolean | ErrorObject[] = tryValidate(files.json, schemaFile);
        
        if (result !== true) {
          console.error(`Validation errors for ${baseName}.json:`, result);
        }
        
        expect(result).toBe(true);
      });
    }
  }
});