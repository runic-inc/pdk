import fs from 'fs';
import path from 'path';
import Ajv2019 from "ajv/dist/2019";
import { ErrorObject, ValidateFunction } from "ajv";
import { ContractSchemaImpl } from './contractSchema';
import { ContractConfig } from '../types';
import { parseJson } from '../codegen/contractSchemaJsonParser';

export function cleanAndCapitalizeFirstLetter(string: string) {
     // Remove non-alphanumeric characters and whitespace
     const cleanedString = string.replace(/[^a-zA-Z0-9]/g, '');
     // Capitalize the first letter of the cleaned string
     return cleanedString.charAt(0).toUpperCase() + cleanedString.slice(1);
}

export function tryValidate(jsonData: unknown, schemaFile: string): true | ErrorObject[] {
     try {
         const schemaData: object = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
         const ajv: Ajv2019 = new Ajv2019();
         const validate: ValidateFunction = ajv.compile(schemaData);
         
         // Check if jsonData is an object and has the correct $schema value
         if (typeof jsonData === 'object' && jsonData !== null) {
             const schema = (jsonData as any).$schema;
             if (schema === undefined) {
                 return [createErrorObject("required", "must have required property '$schema'", { missingProperty: '$schema' })];
             }
             if (schema !== "https://patchwork.dev/schema/patchwork-contract-config.schema.json") {
                 return [createErrorObject("const", "must be equal to constant", { allowedValue: "https://patchwork.dev/schema/patchwork-contract-config.schema.json" })];
             }
         } else {
             return [createErrorObject("type", "must be object", { type: "object" })];
         }
 
         const valid: boolean = validate(jsonData);
         if (!valid) {
             return validate.errors || [];
         }
         // If JSON schema validation passes, create ContractSchemaImpl and validate
         try {
             const contractSchema = parseJson(jsonData);
             contractSchema.validate();
             return true;
         } catch (error) {
             return [createErrorObject("contractSchema", (error as Error).message, {})];
         }
     } catch (error: unknown) {
         console.error("Error reading schema file:", (error as Error).message);
         return [createErrorObject("$schema", (error as Error).message, {})];
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