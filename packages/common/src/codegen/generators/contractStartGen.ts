import { Feature } from "../../types";
import { ContractSchema } from "../contractSchema";
import { Generator, ind } from "../generator";
import { cleanAndCapitalizeFirstLetter } from "../utils";

export class ContractStartGen implements Generator {
    gen(schema: ContractSchema): string {
        let inheritance = this.getBaseInheritance(schema.features);
        if (schema.hasLiteRef()) {
            inheritance.push("PatchworkLiteRef");
        }
        if (schema.features.some((feature: Feature) => feature === Feature.MINTABLE)) {
            inheritance.push("IPatchworkMintable");
        }
        let out = `abstract contract ${cleanAndCapitalizeFirstLetter(schema.name)}Generated is ${inheritance.join(", ")} {\n`;
        if (schema.hasLiteRef()) {
            out += `\n`;
            if (schema.liteRefArrayLength(0) == 0) {
                out += ind(4, `error AlreadyLoaded();\nerror NotFound();\nerror StorageIntegrityError();\nerror UnsupportedMetadataId();\n`);
            } else if (schema.liteRefArrayLength(0) == 1) {
                out += ind(4, `error NoReferenceSlotsAvailable();\nerror TooManyReferences();\nerror NoReference();\nerror UnsupportedMetadataId();\n`);
            } else {
                out += ind(4, `error NoReferenceSlotsAvailable();\nerror TooManyReferences();\nerror NoReference();\nerror UnsupportedMetadataId();\nerror AlreadyHaveReferences();\n`);
            }
        }
        return out;
    }

    getBaseInheritance(features: Feature[]): string[] {
        let inheritance: string[] = [];
        if (features.includes(Feature.PATCH)) {
            inheritance.push(features.includes(Feature.REVERSIBLE) ? `PatchworkReversiblePatch` : `PatchworkPatch`);
        }
        if (features.includes(Feature['1155PATCH'])) {
            inheritance.push(features.includes(Feature.REVERSIBLE) ? `PatchworkReversible1155Patch` : `Patchwork1155Patch`);
        }
        if (features.includes(Feature.ACCOUNTPATCH)) {
            inheritance.push(features.includes(Feature.REVERSIBLE) ? `PatchworkReversibleAccountPatch` : `PatchworkAccountPatch`);
        }
        if (features.includes(Feature.FRAGMENTMULTI)) {
            inheritance.push(`PatchworkFragmentMulti`);
        }
        if (features.includes(Feature.FRAGMENTSINGLE)) {
            inheritance.push(`PatchworkFragmentSingle`);
        }
        // If no specific feature is found, default to Patchwork721
        if (inheritance.length === 0) {
            inheritance.push(`Patchwork721`);
        }
        return inheritance;
    }

}