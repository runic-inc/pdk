import fs from "fs";
import path from "path";
import { ErrorObject } from "ajv";
import { tryValidate } from "./utils";
type GroupedFiles = {
  [key: string]: {
    json: string;
    sol: string;
  };
};
describe("validateJsonSchema", () => {
  const testDirectory: string = "./src/codegen/test_data";
  const schemaFile: string = "./src/patchwork-contract-config.schema.json";
  const files: string[] = fs.readdirSync(testDirectory);
  const jsonFiles: string[] = files.filter((file: string) =>
    file.endsWith(".json")
  );

  const solFiles: string[] = files.filter((file: string) =>
    file.endsWith(".sol")
  );

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
      it("should validate ${baseName}.json successfully", () => {
        const jsonData: unknown = JSON.parse(
          fs.readFileSync(files.json, "utf8")
        );
        const result: true | ErrorObject[] = tryValidate(jsonData, schemaFile);

        if (result !== true) {
          console.error("Validation errors for ${baseName}.json:", result);
        }

        expect(result).toBe(true);
      });
    }
  }

  it("should fail validation for JSON without $schema", () => {
    const invalidJson = {
      scopeName: "test",
      name: "AccountPatch",
      symbol: "AP",
      baseURI: "https://mything/my/",
      schemaURI: "https://mything/my-metadata.json",
      imageURI: "https://mything/my/{tokenID}.png",
      features: ["accountpatch"],
      fields: [
        {
          id: 1,
          key: "name",
          type: "char32",
          description: "Name",
          functionConfig: "all",
        },
      ],
    };
    const result: true | ErrorObject[] = tryValidate(invalidJson, schemaFile);

    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(
        result.some(
          (error: ErrorObject) =>
            error.keyword === "required" &&
            error.params.missingProperty === "$schema"
        )
      ).toBe(true);
    } else {
      fail("Expected validation to fail with an array of errors");
    }
  });

  it("should fail validation for JSON with incorrect $schema value", () => {
    const invalidJson = {
      $schema: "https://wrong-url.com/schema.json",
      scopeName: "test",
      name: "AccountPatch",
      symbol: "AP",
      baseURI: "https://mything/my/",
      schemaURI: "https://mything/my-metadata.json",
      imageURI: "https://mything/my/{tokenID}.png",
      features: ["accountpatch"],
      fields: [
        {
          id: 1,
          key: "name",
          type: "char32",
          description: "Name",
          functionConfig: "all",
        },
      ],
    };
    const result: true | ErrorObject[] = tryValidate(invalidJson, schemaFile);

    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(
        result.some(
          (error: ErrorObject) =>
            error.keyword === "const" &&
            error.message === "must be equal to constant"
        )
      ).toBe(true);
    } else {
      fail("Expected validation to fail with an array of errors");
    }
  });
  //TODO: add test for ContractSchemaImpl.validate() rules
});
