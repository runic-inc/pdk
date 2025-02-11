import { ErrorObject } from "ajv";
import Ajv2019 from "ajv/dist/2019";
import fs from 'fs';
import { JSONProjectConfigLoader } from '../configgen/jsonProjectConfigLoader';
import { ContractConfig, ProjectConfig } from '../types';
import { ContractSchemaImpl } from './contractSchema';
import { parseJson } from './contractSchemaJsonParser';

interface ValidationResult {
  isValid: boolean;
  errors: ErrorObject[];
}

function isValidNameIdentifier(name: string): boolean {
  return /^[^0-9].*$/.test(name);
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

function validateContractConfig(jsonData: unknown): ValidationResult {
  try {
    if (typeof jsonData !== 'object' || jsonData === null) {
      throw new Error('Invalid contract config format');
    }

    const config = jsonData as ContractConfig;
    
    if (!isValidNameIdentifier(config.name)) {
      throw new Error('Contract name must not start with a number');
    }
    
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
    if (typeof jsonData !== 'object' || jsonData === null) {
      throw new Error('Invalid project config format');
    }

    const config = jsonData as ProjectConfig;
    
    if (!isValidNameIdentifier(config.name)) {
      throw new Error('Project name must not start with a number');
    }
    
    // Also validate names of all contracts within the project config
    if (config.contracts) {
      for (const [contractName, contractConfig] of Object.entries(config.contracts)) {
        if (typeof contractConfig === 'object') {
          if (!isValidNameIdentifier(contractConfig.name)) {
            throw new Error(`Contract "${contractName}" name must not start with a number`);
          }
        }
      }
    }
    
    const projectConfigLoader = new JSONProjectConfigLoader();
    const projectConfig = projectConfigLoader.load(JSON.stringify(jsonData)) as ProjectConfig;
    
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: [createErrorObject("projectConfig", (error as Error).message, {})]
    };
  }
}

export function validateJsonSchema(jsonData: unknown, schemaFile: string): ValidationResult {
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