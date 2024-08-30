import { ContractSchema } from "../codegen/contractSchema";
import { Generator } from "../codegen/generator";
import { FieldConfig } from "../types";

export class TSContractConfigGen implements Generator {
    constructor() { }

    gen(schema: ContractSchema): string {
        let out = `import { ContractConfig, Feature, FunctionConfig } from '../../types';\n\n`;
        out += `const config: ContractConfig = {\n`;

        if (schema.scopeName) {
            out += `    "scopeName": "${schema.scopeName}",\n`;
        }
        out += `    "name": "${schema.name}",\n`;
        out += `    "symbol": "${schema.symbol}",\n`;
        if (schema.baseURI) {
            out += `    "baseURI": "${schema.baseURI}",\n`;
        }
        if (schema.schemaURI) {
            out += `    "schemaURI": "${schema.schemaURI}",\n`;
        }
        if (schema.imageURI) {
            out += `    "imageURI": "${schema.imageURI}",\n`;
        }
        if (schema.features && schema.features.length > 0) {
            out += `    "features": [${schema.features.map(f => `Feature.${f.toUpperCase()}`).join(', ')}],\n`;
        }
        if (schema.fields && schema.fields.length > 0) {
            out += `    "fields": [\n`;
            out += schema.fields.map(field => this.generateFieldConfig(field)).join(',\n');
            out += `\n    ]\n`;
        } else {
            out += `    "fields": []\n`;
        }
        out += `}\n`;
        out += `export default config;\n`;

        return out;
    }

    private generateFieldConfig(field: FieldConfig): string {
        let fieldConfig = `        {\n`;
        fieldConfig += `            "id": ${field.id},\n`;

        if (field.permissionId !== undefined && field.permissionId !== 0) {
            fieldConfig += `            "permissionId": ${field.permissionId},\n`;
        }
        fieldConfig += `            "key": "${field.key}",\n`;
        fieldConfig += `            "fieldType": "${field.fieldType}",\n`;
        if (field.arrayLength !== undefined && field.arrayLength !== 1) {
            fieldConfig += `            "arrayLength": ${field.arrayLength},\n`;
        }
        if (field.visibility) {
            fieldConfig += `            "visibility": "${field.visibility}",\n`;
        }
        if (field.description) {
            fieldConfig += `            "description": "${field.description}",\n`;
        }
        if (field.functionConfig) {
            fieldConfig += `            "functionConfig": FunctionConfig.${field.functionConfig.toUpperCase()},\n`;
        }
        fieldConfig += `        }`;
        return fieldConfig;
    }
}