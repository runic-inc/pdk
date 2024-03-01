import { ContractSchema } from "../contractSchema";
import { Generator, ind } from "../generator";

export class MetadataStructGen implements Generator {
    gen(schema: ContractSchema): string {
        const structDef = `struct ${schema.getMetadataStructName()} {`;
        const structFields = schema.storage.fields
            .filter((field: any) => field.arrayLength !== 0)
            .map((field: any) => {
                let fieldType = field.fieldType;
                if (fieldType == "literef") {
                    fieldType = "uint64";
                }
                if (fieldType == "char8" || fieldType == "char16" || fieldType == "char32" || fieldType == "char64") {
                    fieldType = "string";
                }
                if (field.arrayLength > 1) {
                    fieldType += `[${field.arrayLength}]`;
                }
                return `    ${fieldType} ${field.key};`;
            })
            .join("\n");
        const structEnd = "}";
    
        return ind(4, 
            `${structDef}\n` +
            `${structFields}\n` +
            `${structEnd}\n`);
    }
}