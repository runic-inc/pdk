import { ContractSchema } from "./contractSchema";
import { Generator } from "./generator";

export class JSONSchemaGen implements Generator {
  gens = new Map<string, Generator>();

  constructor() {
  }

  gen(schema: ContractSchema): string {
    let out = "";
    out += `{\n`;
    out += `  "$schema": "https://patchwork.dev/schema/patchwork-metadata.schema.json",\n`;
    out += `  "scopeName": "${schema.scopeName}",\n`;
    out += `  "name": "${schema.name}",\n`;
    out += `  "symbol": "${schema.symbol}",\n`;
    out += `  "schemaURI": "${schema.schemaURI}",\n`;
    out += `  "imageURI": "${schema.imageURI}",\n`;
    if (schema.storage.fields.length > 0) {
      out += `  "fields": [\n`;      
    }
    let first = true;
    for (let field of schema.storage.fields) {
      if (!first) {
        out += `,\n`;
      }
      first = false;
      out += `    {\n`;
      out += `      "id": ${field.id},\n`;
      out += `      "key": "${field.key}",\n`;
      out += `      "type": "${field.type}",\n`;
      out += `      "arrayLength": ${field.arrayLength},\n`;
      out += `      "description": "${field.description}",\n`;
      if (field.permissionId > 0) {
        out += `      "permissionId": ${field.permissionId},\n`;
      }
      out += `      "visibility": "public",\n`;
      out += `      "slot": ${field.slot},\n`;
      out += `      "offset": ${field.offset}\n`;
      out += `    }`;
    }
    if (schema.storage.fields.length > 0) {
      out += `\n  ]\n`;
    }
    out += `}\n`;
    return out;
  }
}
