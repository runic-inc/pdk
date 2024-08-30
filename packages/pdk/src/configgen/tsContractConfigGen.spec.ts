import fs from "fs";
import path from "path";
import { parseJson } from "../codegen/contractSchemaJsonParser";
import { TSContractConfigGen } from "./tsContractConfigGen";

type GroupedFiles = {
  [key: string]: {
    json: string;
    ts: string;
  };
};

describe("TypeScriptContractConfigGen", () => {
  const testDirectory: string = "./src/codegen/test_data";
  const files: string[] = fs.readdirSync(testDirectory);
  const jsonFiles: string[] = files.filter((file: string) => file.endsWith(".json"));
  const tsFiles: string[] = files.filter((file: string) => file.endsWith(".ts"));

  const groupedFiles: GroupedFiles = jsonFiles.reduce<GroupedFiles>(
    (acc: GroupedFiles, jsonFile: string) => {
      const baseName: string = path.basename(jsonFile, ".json");
      const tsFile = baseName + ".ts";
      if (tsFiles.includes(tsFile)) {
        acc[baseName] = {
          json: path.join(testDirectory, jsonFile),
          ts: path.join(testDirectory, tsFile),
        };
      }
      return acc;
    },
    {}
  );

  for (const [baseName, files] of Object.entries(groupedFiles)) {
    it(`should generate matching TypeScript for ${baseName}`, () => {
      // 1. Construct ContractSchema from JSON
      const jsonString: string = fs.readFileSync(files.json, "utf8");
      const jsonData = JSON.parse(jsonString);
      const contractSchema = parseJson(jsonData);

      // 2. Call TSContractConfigGen with the ContractSchema
      const generator = new TSContractConfigGen();
      const generatedTypeScript: string = generator.gen(contractSchema);

      // 3. Read the existing TypeScript file
      const existingTypeScript: string = fs.readFileSync(files.ts, "utf8");

      // 4. Compare generated TypeScript with existing TypeScript
      const normalizeTypeScript = (content: string) => 
        content.replace(/\s/g, '')
               .replace(/\/\*[\s\S]*?\*\//g, '')
               .replace(/\/\/.*/g, '');

      const normalizedGenerated = normalizeTypeScript(generatedTypeScript);
      const normalizedExisting = normalizeTypeScript(existingTypeScript);

      expect(normalizedGenerated).toEqual(normalizedExisting);
    });
  }
});