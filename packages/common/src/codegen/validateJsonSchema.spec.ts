import fs from "fs";
import path from "path";
import { ErrorObject } from "ajv";
import { validateSchema } from "./validateSchema";

const schemaFile: string = "../../schemas/patchwork-contract-config.schema.json";
const projectSchemaFile: string = "../../schemas/patchwork-project-config.schema.json";

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

describe("validateProjectConfigSchema", () => {
  const testDirectory: string = "./src/codegen/test_data/project_configs";
  const files: string[] = fs.readdirSync(testDirectory);
  const jsonFiles: string[] = files.filter((file: string) => file.endsWith(".json"));

  jsonFiles.forEach((jsonFile: string) => {
    it(`should validate ${jsonFile} successfully`, () => {
      const jsonData: unknown = JSON.parse(
        fs.readFileSync(path.join(testDirectory, jsonFile), "utf8")
      );
      const result = validateSchema(jsonData, projectSchemaFile);

      if (!result.isValid) {
        console.error(`Validation errors for ${jsonFile}:`, result.errors);
      }

      expect(result.isValid).toBe(true);
    });
  });

  it("should fail validation for project config without $schema", () => {
    const invalidJson = {
      name: "Invalid Project",
      scopes: {},
      contracts: {}
    };
    const result = validateSchema(invalidJson, projectSchemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        keyword: "required",
        params: { missingProperty: '$schema' },
        message: "must have required property '$schema'"
      })
    );
  });

  it("should fail validation for project config with incorrect $schema value", () => {
    const invalidJson = {
      $schema: "https://wrong-url.com/schema.json",
      name: "Invalid Project",
      scopes: {},
      contracts: {}
    };
    const result = validateSchema(invalidJson, projectSchemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        keyword: "const",
        message: "must be one of",
        params: {
          allowedValues: [
            "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
            "https://patchwork.dev/schema/patchwork-project-config.schema.json"
          ]
        }
      })
    );
  });

  it("should fail validation when a required field is missing", () => {
    const invalidJson = {
      $schema: "https://patchwork.dev/schema/patchwork-project-config.schema.json",
      name: "Invalid Project",
      // missing 'scopes' field
      contracts: {}
    };
    const result = validateSchema(invalidJson, projectSchemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(
      (error: ErrorObject) =>
        error.keyword === "required" &&
        error.params.missingProperty === "scopes"
    )).toBe(true);
  });

  it("should fail validation when a scope has invalid properties", () => {
    const invalidJson = {
      $schema: "https://patchwork.dev/schema/patchwork-project-config.schema.json",
      name: "Invalid Project",
      scopes: {
        MyScope: {
          name: "MyScope",
          owner: "not-an-address",
          whitelist: "not-a-boolean",
          userAssign: "not-a-boolean",
          userPatch: "not-a-boolean",
          bankers: ["not-an-address"],
          operators: ["not-an-address"],
          mintConfigs: {
            "not-an-address": {
              flatFee: "not-a-number",
              active: "not-a-boolean"
            }
          },
          patchFees: {
            "not-an-address": "not-a-number"
          },
          assignFees: {
            "not-an-address": "not-a-number"
          }
        }
      },
      contracts: {}
    };
    const result = validateSchema(invalidJson, projectSchemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should fail validation when a contract config is invalid", () => {
    const invalidJson = {
      $schema: "https://patchwork.dev/schema/patchwork-project-config.schema.json",
      name: "Invalid Project",
      scopes: {},
      contracts: {
        InvalidContract: {
          config: {
            $schema: "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
            // missing required fields
          },
          fragments: []
        }
      }
    };
    const result = validateSchema(invalidJson, projectSchemaFile);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        keyword: "projectConfig"
      })
    );
  });

  it("should pass validation for a valid project configuration", () => {
    const validJson = {
      $schema: "https://patchwork.dev/schema/patchwork-project-config.schema.json",
      name: "Valid Project",
      scopes: {
        MyScope: {
          name: "MyScope",
          owner: "0x1234567890123456789012345678901234567890",
          whitelist: true,
          userAssign: false,
          userPatch: false,
          bankers: ["0x1234567890123456789012345678901234567890"],
          operators: ["0x1234567890123456789012345678901234567890"],
          mintConfigs: {
            "0x1234567890123456789012345678901234567890": {
              flatFee: 0,
              active: true
            }
          },
          patchFees: {
            "0x1234567890123456789012345678901234567890": 0
          },
          assignFees: {
            "0x1234567890123456789012345678901234567890": 0
          }
        }
      },
      contracts: {
        ValidContract: {
          config: {
            $schema: "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
            scopeName: "MyScope",
            name: "ValidContract",
            symbol: "VC",
            baseURI: "https://example.com/",
            schemaURI: "https://example.com/schema.json",
            imageURI: "https://example.com/image.png",
            features: ["patch"],
            fields: [
              {
                id: 1,
                key: "name",
                type: "char32",
                description: "Name",
                functionConfig: "all"
              }
            ]
          },
          fragments: []
        }
      }
    };
    const result = validateSchema(validJson, projectSchemaFile);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should fail validation when a contract config is invalid", () => {
    const invalidJson = {
      $schema: "https://patchwork.dev/schema/patchwork-project-config.schema.json",
      name: "Invalid Project",
      scopes: {
        MyScope: {
          name: "MyScope",
          owner: "0x1234567890123456789012345678901234567890",
          whitelist: true,
          userAssign: false,
          userPatch: false,
        }
      },
      contracts: {
        InvalidContract: {
          config: {
            $schema: "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
            scopeName: "MyScope",
            name: "InvalidContract",
            symbol: "IC",
            baseURI: "https://example.com/",
            schemaURI: "https://example.com/schema.json",
            imageURI: "https://example.com/image.png",
            features: ["invalidFeature"], // Invalid feature
            fields: [
              {
                id: 1,
                key: "name",
                type: "invalidType", // Invalid field type
                description: "Name",
                functionConfig: "all"
              }
            ]
          },
          fragments: []
        }
      },
      contractRelations: {}
    };
    const result = validateSchema(invalidJson, projectSchemaFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toEqual(
      expect.objectContaining({
        keyword: "projectConfig",
        message: expect.stringContaining("Feature not found: invalidFeature")
      })
    );
  });
  
});