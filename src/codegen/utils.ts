import fs from 'fs';
import path from 'path';
import Ajv2019 from "ajv/dist/2019";
import { ErrorObject, ValidateFunction } from "ajv";

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
        const valid: boolean = validate(jsonData);
        if (valid) {
            return true;
        }
        return validate.errors || [];
    } catch (error: unknown) {
        console.error("Error reading schema file:", (error as Error).message);
        return [{ message: (error as Error).message } as ErrorObject];
    }
}