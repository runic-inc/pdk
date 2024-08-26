import fs from "fs";
import path from "path";
import { ErrorObject } from "ajv";
import { tryValidate } from "./configValidator";

const schemaFile: string = "./src/patchwork-contract-config.schema.json";

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
});


describe("tryValidate", () => {
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
    const result = tryValidate(invalidJson, schemaFile);

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
    const result = tryValidate(invalidJson, schemaFile);

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
    const result = tryValidate(invalidJson, schemaFile);
    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(result[0].message).toBe('PATCH, 1155PATCH, and ACCOUNTPATCH are mutually exclusive.');
    } else {
      fail('Expected validation to fail with an array of errors');
    }
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
    const result = tryValidate(invalidJson, schemaFile);
    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(result[0].message).toBe(
        "FRAGMENTMULTI and FRAGMENTSINGLE are mutually exclusive."
      );
    } else {
      fail("Expected validation to fail with an array of errors");
    }
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
    const result = tryValidate(invalidJson, schemaFile);
    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(result[0].message).toBe(
        "REVERSIBLE feature requires at least one of PATCH, 1155PATCH, or ACCOUNTPATCH to be present."
      );
    } else {
      fail("Expected validation to fail with an array of errors");
    }
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
    const result = tryValidate(invalidJson, schemaFile);
    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(result[0].message).toBe(
        "WEAKREF feature requires FRAGMENTSINGLE feature"
      );
    } else {
      fail("Expected validation to fail with an array of errors");
    }
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
    const result = tryValidate(invalidJson, schemaFile);
    expect(result).not.toBe(true);
    if (Array.isArray(result)) {
      expect(result[0].message).toBe(
        "DYNAMICREFLIBRARY feature requires a dynamic array length literef field"
      );
    } else {
      fail("Expected validation to fail with an array of errors");
    }
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
    const result = tryValidate(validJson, schemaFile);
    expect(result).toBe(true);
  });
});
