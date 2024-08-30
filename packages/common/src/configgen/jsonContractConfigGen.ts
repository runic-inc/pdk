import { ContractSchema } from "../codegen/contractSchema";
import { Generator } from "../codegen/generator";

export class JSONContractConfigGen implements Generator {
    constructor() { }

    gen(schema: ContractSchema): string {
        let out = "{\n";
        out += `  "$schema": "https://patchwork.dev/schema/patchwork-contract-config.schema.json",\n`;
        if (schema.scopeName) {
            out += `  "scopeName": "${schema.scopeName}",\n`;
        }
        out += `  "name": "${schema.name}",\n`;
        out += `  "symbol": "${schema.symbol}",\n`;
        if (schema.baseURI) {
            out += `  "baseURI": "${schema.baseURI}",\n`;
        }
        if (schema.schemaURI) {
            out += `  "schemaURI": "${schema.schemaURI}",\n`;
        }
        if (schema.imageURI) {
            out += `  "imageURI": "${schema.imageURI}",\n`;
        }
        if (schema.features && schema.features.length > 0) {
            out += `  "features": ${JSON.stringify(schema.features.map(f => f.toLowerCase()))},\n`;
        }
        if (schema.fields && schema.fields.length > 0) {
            out += `  "fields": [\n`;
            const fields = schema.fields.map(field => {
                let fieldObj: any = {
                    id: field.id
                };
                if (field.permissionId !== undefined && field.permissionId !== 0) {
                    fieldObj.permissionId = field.permissionId;
                }
                fieldObj.key = field.key;
                fieldObj.type = field.fieldType;
                if (field.fieldType === 'literef' || (field.arrayLength !== undefined && field.arrayLength !== 1)) {
                    fieldObj.arrayLength = field.arrayLength;
                }
                if (field.description) {
                    fieldObj.description = field.description;
                }
                if (field.functionConfig) {
                    fieldObj.functionConfig = field.functionConfig.toLowerCase();
                }
                return JSON.stringify(fieldObj, null, 2).replace(/^/gm, "    ");
            });
            out += fields.join(",\n");
            out += "\n  ]\n";
        }
        out += "}\n";
        return out;
    }
}