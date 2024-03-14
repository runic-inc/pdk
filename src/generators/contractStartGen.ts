import { ContractSchema, Feature } from "../contractSchema";
import { Generator } from "../generator";
import { capitalizeFirstLetter } from "../utils";

export class ContractStartGen implements Generator {
    gen(schema: ContractSchema): string {
        let inheritance = this.getBaseInheritance(schema.features);
        if (schema.hasLiteRef()) {
            inheritance.push("PatchworkLiteRef");
        }
        if (schema.features.some((feature: Feature) => feature === Feature.MINTABLE)) {
            inheritance.push("IPatchworkMintable");
        }
        return `contract ${capitalizeFirstLetter(schema.name)} is ${inheritance.join(", ")} {\n`;
    }

    getBaseInheritance(features: Feature[]): string[] {
        let inheritance: string[] = [];
        if (features.some((feature: Feature) => feature === Feature.PATCH)) {
            inheritance.push(`PatchworkPatch`);
        }
        if (features.some((feature: Feature) => feature === Feature.PATCH1155)) {
            inheritance.push(`Patchwork1155Patch`);
        }
        if (features.some((feature: Feature) => feature === Feature.PATCHACCOUNT)) {
            inheritance.push(`PatchworkAccountPatch`);
        }
        if (features.some((feature: Feature) => feature === Feature.FRAGMENTMULTI)) {
            inheritance.push(`PatchworkFragmentMulti`);
        }
        if (features.some((feature: Feature) => feature === Feature.FRAGMENTSINGLE)) {
            inheritance.push(`PatchworkFragmentSingle`);
        }
        // If no specific feature is found, default to Patchwork721
        if (inheritance.length === 0) {
            inheritance.push(`Patchwork721`);
        }
        return inheritance;
    }

}