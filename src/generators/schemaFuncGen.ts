import { ContractSchema, ContractStorageField } from "../contractSchema";
import { Generator, ind } from "../generator";

export class SchemaFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        const fieldEntries = schema.storage.fields.map((entry: ContractStorageField, index: number) => {
            return `entries[${index}] = MetadataSchemaEntry(${entry.id}, ${entry.permissionId?entry.permissionId:0}, FieldType.${entry.fieldTypeSolidityEnum}, ${entry.arrayLength}, ${entry.visibility}, ${entry.slot}, ${entry.offset}, "${entry.key}");`;
        });

        return ind(4, `` +
        `function schema() pure external override returns (MetadataSchema memory) {\n` +
        `    MetadataSchemaEntry[] memory entries = new MetadataSchemaEntry[](${schema.storage.fields.length});\n` +
        `    ${fieldEntries.join("\n    ")}\n` +
        `    return MetadataSchema(1, entries);\n` +
        `}\n`);
        }
}