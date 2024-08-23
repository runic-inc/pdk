import fs from "fs";
import path from "path";
import { ContractSchemaImpl } from "./contractSchema";
import { parseJson } from "./contractSchemaJsonParser";
import { JSONContractConfigGen } from "./jsonContractConfigGen";

type GroupedFiles = {
  [key: string]: {
    json: string;
    sol: string;
  };
};

describe("JSONContractConfigGen", () => {
  const testDirectory: string = "./src/codegen/test_data";
  const files: string[] = fs.readdirSync(testDirectory);
  const jsonFiles: string[] = files.filter((file: string) => file.endsWith(".json"));
  const solFiles: string[] = files.filter((file: string) => file.endsWith(".sol"));

  const groupedFiles: GroupedFiles = jsonFiles.reduce<GroupedFiles>(
    (acc: GroupedFiles, jsonFile: string) => {
      const baseName: string = path.basename(jsonFile, ".json");
      acc[baseName] = {
        json: path.join(testDirectory, jsonFile),
        sol: path.join(testDirectory, baseName + ".sol"),
      };
      return acc;
    },
    {}
  );

  for (const [baseName, files] of Object.entries(groupedFiles)) {
    if (solFiles.includes(baseName + ".sol")) {
      it(`should generate matching JSON for ${baseName}`, () => {
        // 1. Construct ContractSchema from JSON
        const originalJsonString: string = fs.readFileSync(files.json, "utf8");
        const originalJson = JSON.parse(originalJsonString);
        const contractSchema = parseJson(originalJson);

        // 2. Call JSONContractConfigGen with the ContractSchema
        const generator = new JSONContractConfigGen();
        const generatedJsonString: string = generator.gen(contractSchema);

        // 3. Compare generated JSON with original JSON
        const generatedJson = JSON.parse(generatedJsonString);
        
        // Remove whitespace and newlines for comparison
        const normalizedOriginal = JSON.stringify(originalJson).replace(/\s/g, '');
        const normalizedGenerated = JSON.stringify(generatedJson).replace(/\s/g, '');

        expect(normalizedGenerated).toEqual(normalizedOriginal);
      });
    }
  }
});