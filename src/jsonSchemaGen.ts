import { ContractSchema } from "./contractSchema";
import { Generator } from "./generator";
import { ConstructorGen } from "./generators/constructorGen";
import { ContractEndGen } from "./generators/contractEndGen";
import { ContractStartGen } from "./generators/contractStartGen";
import { DynamicRefFuncGen } from "./generators/dynamicRefFuncGen";
import { FieldFuncGen } from "./generators/fieldFuncGen";
import { GeneralFuncGen } from "./generators/generalFuncGen";
import { HeaderGen } from "./generators/headerGen";
import { MemberVarsGen } from "./generators/memberVars";
import { MetadataStructGen } from "./generators/metadataStructGen";
import { MintFuncGen } from "./generators/mintFuncGen";
import { OverrideFuncGen } from "./generators/overrideFuncGen";
import { PackFuncGen } from "./generators/packFuncGen";
import { PatchFuncGen } from "./generators/patchFuncGen";
import { SchemaFuncGen } from "./generators/schemaFuncGen";
import { StaticRefFuncGen } from "./generators/staticRefFuncGen";

export class JSONSchemaGen implements Generator {
  gens = new Map<string, Generator>();

  constructor() {
  }

  gen(schema: ContractSchema): string {
    let out = "";
    out += `{\n`;
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
      out += `      "type": "${field.fieldType}",\n`;
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
