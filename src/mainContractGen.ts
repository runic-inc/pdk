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

export class MainContractGen implements Generator {
  gens = new Map<string, Generator>();

  constructor() {
    this.gens.set("header", new HeaderGen());
    this.gens.set("contractStart", new ContractStartGen());
    this.gens.set("constructor", new ConstructorGen());
    this.gens.set("metadataStruct", new MetadataStructGen());
    this.gens.set("memberVars", new MemberVarsGen());
    this.gens.set("generalFuncs", new GeneralFuncGen());
    this.gens.set("schemaFuncs", new SchemaFuncGen());
    this.gens.set("packFuncs", new PackFuncGen());
    this.gens.set("mintFuncs", new MintFuncGen());
    this.gens.set("fieldFuncs", new FieldFuncGen());
    this.gens.set("staticRefFuncs", new StaticRefFuncGen());
    this.gens.set("dynamicRefFuncs", new DynamicRefFuncGen());
    this.gens.set("overrides", new OverrideFuncGen());
    this.gens.set("contractEnd", new ContractEndGen());
    this.gens.set("patchFuncs", new PatchFuncGen());
    this.gens.set("nl", { gen: (schema: ContractSchema) => '\n' });
  }

  gen(schema: ContractSchema): string {
    return this.appendGens([
      "header",
      "nl",
      "contractStart",
      "nl",
      "metadataStruct",
      "nl",
      "memberVars",
      "constructor",
      "nl",
      "generalFuncs",
      "schemaFuncs",
      "nl",
      "patchFuncs",
      "packFuncs", 
      "mintFuncs", 
      "fieldFuncs", 
      "staticRefFuncs", 
      "dynamicRefFuncs", 
      "overrides", 
      "contractEnd"
    ], schema);
  }

  appendGens(names: string[], schema: ContractSchema): string {
    let output = "";
    for (let name of names) {
      output = this.appendGen(name, schema, output);
    }
    return output;
  }

  appendGen(name: string, schema: ContractSchema, output: string): string {
    return output + this.gens.get(name)?.gen(schema);
  }
}
