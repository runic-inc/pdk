import fs from "fs";
import path from "path";
import { ErrorObject } from "ajv";
import { validateSchema } from "./validateSchema";

const schemaFile: string = "../../schemas/patchwork-contract-config.schema.json";

type GroupedFiles = {
  [key: string]: {
    json: string;
    sol: string;
  };
};

describe("validateJsonSchema", () => {
  const testDirectory: string = "./src/codegen/test_data";
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
      it(`should validate ${baseName}.json successfully`, () => {
        const jsonData: unknown = JSON.parse(
          fs.readFileSync(files.json, "utf8")
        );
        const result = validateSchema(jsonData, schemaFile);

        if (!result.isValid) {
          console.error(`Validation errors for ${baseName}.json:`, result.errors);
        }

        expect(result.isValid).toBe(true);
      });
    }
  }
});

describe("validateSchema", () => {
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
    const result = validateSchema(invalidJson, schemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(
      (error: ErrorObject) =>
        error.keyword === "required" &&
        error.params.missingProperty === "$schema"
    )).toBe(true);
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
    const result = validateSchema(invalidJson, schemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(
      (error: ErrorObject) =>
        error.keyword === "const" &&
        error.message === "must be one of"
    )).toBe(true);
  });

  it('should fail validation when multiple patch types are present', () => {
    const invalidJson = {
      "$schema": "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      "scopeName": "test",
      "name": "Test",
      "symbol": "TST",
      "baseURI": "https://test.com/",
      "schemaURI": "https://test.com/schema.json",
      "imageURI": "https://test.com/image.png",
      "fields": [],
      "features": ["patch", "1155patch"]
    };
    const result = validateSchema(invalidJson, schemaFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe('PATCH, 1155PATCH, and ACCOUNTPATCH are mutually exclusive.');
  });

  it("should fail validation when multiple fragment types are present", () => {
    const invalidJson = {
      $schema:
        "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      scopeName: "test",
      name: "Test",
      symbol: "TST",
      baseURI: "https://test.com/",
      schemaURI: "https://test.com/schema.json",
      imageURI: "https://test.com/image.png",
      fields: [],
      features: ["fragmentmulti", "fragmentsingle"],
    };
    const result = validateSchema(invalidJson, schemaFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe(
      "FRAGMENTMULTI and FRAGMENTSINGLE are mutually exclusive."
    );
  });

  it("should fail validation when REVERSIBLE is present without a patch type", () => {
    const invalidJson = {
      $schema:
        "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      scopeName: "test",
      name: "Test",
      symbol: "TST",
      baseURI: "https://test.com/",
      schemaURI: "https://test.com/schema.json",
      imageURI: "https://test.com/image.png",
      fields: [],
      features: ["reversible"],
    };
    const result = validateSchema(invalidJson, schemaFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe(
      "REVERSIBLE feature requires at least one of PATCH, 1155PATCH, or ACCOUNTPATCH to be present."
    );
  });

  it("should fail validation when WEAKREF is present without FRAGMENTSINGLE", () => {
    const invalidJson = {
      $schema:
        "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      scopeName: "test",
      name: "Test",
      symbol: "TST",
      baseURI: "https://test.com/",
      schemaURI: "https://test.com/schema.json",
      imageURI: "https://test.com/image.png",
      fields: [],
      features: ["weakref"],
    };
    const result = validateSchema(invalidJson, schemaFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe(
      "WEAKREF feature requires FRAGMENTSINGLE feature"
    );
  });

  it("should fail validation when DYNAMICREFLIBRARY is present without a dynamic array length literef field", () => {
    const invalidJson = {
      $schema:
        "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      scopeName: "test",
      name: "Test",
      symbol: "TST",
      baseURI: "https://test.com/",
      schemaURI: "https://test.com/schema.json",
      imageURI: "https://test.com/image.png",
      fields: [],
      features: ["dynamicreflibrary"],
    };
    const result = validateSchema(invalidJson, schemaFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0].message).toBe(
      "DYNAMICREFLIBRARY feature requires a dynamic array length literef field"
    );
  });

  it("should pass validation for a valid configuration", () => {
    const validJson = {
      $schema:
        "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      scopeName: "test",
      name: "Test",
      symbol: "TST",
      baseURI: "https://test.com/",
      schemaURI: "https://test.com/schema.json",
      imageURI: "https://test.com/image.png",
      fields: [],
      features: ["patch", "fragmentsingle"],
    };
    const result = validateSchema(validJson, schemaFile);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});