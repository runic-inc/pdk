import fs from 'fs';
import Ajv2019 from "ajv/dist/2019";
import { ErrorObject } from "ajv";
import { parseJson } from './contractSchemaJsonParser';
import { ContractSchemaImpl } from './contractSchema';
import { JSONProjectConfigLoader } from '../configgen/jsonProjectConfigLoader';
import { ContractConfig, ProjectConfig } from '../types';

interface ValidationResult {
  isValid: boolean;
  errors: ErrorObject[];
}

export function validateSchema(jsonData: unknown, schemaFile: string): ValidationResult {
  try {
    const schemaData: object = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
    const ajv: Ajv2019 = new Ajv2019();
    const validate = ajv.compile(schemaData);
    
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
    
    const allowedSchemas = [
      "https://patchwork.dev/schema/patchwork-contract-config.schema.json",
      "https://patchwork.dev/schema/patchwork-project-config.schema.json"
    ];
    
    if (!allowedSchemas.includes(schema)) {
      return {
        isValid: false,
        errors: [createErrorObject("const", "must be one of", { allowedValues: allowedSchemas })]
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
      return validateContractConfig(jsonData);
    } else if (schema === "https://patchwork.dev/schema/patchwork-project-config.schema.json") {
      return validateProjectConfig(jsonData);
    }
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

function validateContractConfig(jsonData: unknown): ValidationResult {
  try {
    const contractSchema = parseJson(jsonData);
    new ContractSchemaImpl(contractSchema).validate();
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: [createErrorObject("contractSchema", (error as Error).message, {})]
    };
  }
}

function validateProjectConfig(jsonData: unknown): ValidationResult {
  try {
    const projectConfigLoader = new JSONProjectConfigLoader();
    const projectConfig = projectConfigLoader.load(JSON.stringify(jsonData)) as ProjectConfig;
    
    const contractErrors: ErrorObject[] = [];
    Object.entries(projectConfig.contracts).forEach(([contractName, contractConfig]) => {
      if (typeof contractConfig === 'object' && contractConfig !== null) {
        const config = (contractConfig as { config?: ContractConfig }).config;
        if (config) {
          try {
            const contractSchema = parseJson(config);
            new ContractSchemaImpl(contractSchema).validate();
          } catch (error) {
            contractErrors.push(createErrorObject(
              "contractSchema",
              `Invalid contract config for ${contractName}: ${(error as Error).message}`,
              { contractName }
            ));
          }
        }
      }
    });
    
    if (contractErrors.length > 0) {
      return {
        isValid: false,
        errors: contractErrors
      };
    }
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: [createErrorObject("projectConfig", (error as Error).message, {})]
    };
  }
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