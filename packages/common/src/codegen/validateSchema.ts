import fs from 'fs';
import Ajv2019 from "ajv/dist/2019";
import { ErrorObject } from "ajv";
import { parseJson } from './contractSchemaJsonParser';
import { ContractSchemaImpl } from './contractSchema';

// Define a structured return type
interface ValidationResult {
  isValid: boolean;
  errors: ErrorObject[];
}

export function validateSchema(jsonData: unknown, schemaFile: string): ValidationResult {
  try {
    const schemaData: object = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
    const ajv: Ajv2019 = new Ajv2019();
    const validate = ajv.compile(schemaData);
    
    // Check if jsonData is an object and has the correct $schema value
    if (typeof jsonData !== 'object' || jsonData === null) {
      return {
        isValid: false,
        errors: [createErrorObject("type", "must be object", { type: "object" })]
      };
    }

    const schema = (jsonData as any).$schema;
    if (schema === undefined) {
      return {
        isValid: false,
        errors: [createErrorObject("required", "must have required property '$schema'", { missingProperty: '$schema' })]
      };
    }
    if (!(schema === "https://patchwork.dev/schema/patchwork-contract-config.schema.json" || schema === "https://patchwork.dev/schema/patchwork-project-config.schema.json")) {
      return {
        isValid: false,
        errors: [createErrorObject("const", "must be one of", { allowedValues: ["https://patchwork.dev/schema/patchwork-contract-config.schema.json", "https://patchwork.dev/schema/patchwork-project-config.schema.json"] })]
      };
    }

    const valid: boolean = validate(jsonData);
    if (!valid) {
      return {
        isValid: false,
        errors: validate.errors || []
      };
    }

    if (schema === "https://patchwork.dev/schema/patchwork-contract-config.schema.json") {
      // If JSON schema validation passes for a contract config, create ContractSchemaImpl and validate
      try {
        const contractSchema = parseJson(jsonData);
        new ContractSchemaImpl(contractSchema).validate();
      } catch (error) {
        return {
          isValid: false,
          errors: [createErrorObject("contractSchema", (error as Error).message, {})]
        };
      }
    }
    // TODO project validation
  } catch (error: unknown) {
    console.error("Error reading schema file:", (error as Error).message);
    return {
      isValid: false,
      errors: [createErrorObject("$schema", (error as Error).message, {})]
    };
  }
  return {
    isValid: true,
    errors: []
  };
}

function createErrorObject(keyword: string, message: string, params: Record<string, any>): ErrorObject {
  return {
    keyword,
    instancePath: "",
    schemaPath: `#/${keyword}`,
    params,
    message
  };
}