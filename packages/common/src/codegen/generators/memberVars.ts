import { ContractSchema } from "../contractSchema";
import { Generator, ind } from "../generator";
import { Feature } from "../../types";

export class MemberVarsGen implements Generator {
    gen(schema: ContractSchema): string {
        let members = ``;
        if (schema.hasLiteRef() && schema.liteRefArrayLength(0) === 0) {
            if (schema.features.includes(Feature.DYNAMICREFLIBRARY)) {
                members += `` +
                `mapping(uint256 => PatchworkDynamicRefs.DynamicLiteRefs) internal _dynamicLiterefStorage; // tokenId => indexed slots\n` +
                `\n`;
            } else {
                members += `` +
                `struct DynamicLiteRefs {\n` +
                `    uint256[] slots; // 4 per\n` +
                `    mapping(uint64 => uint256) idx;\n` +
                `}\n\n` +
                `mapping(uint256 => DynamicLiteRefs) internal _dynamicLiterefStorage; // tokenId => indexed slots\n` +
                `\n`;
            }
        }
        if (schema.fields.some((field: any) => field.fieldType === "string")) {
            members += `mapping(uint256 => string) internal _dynamicStringStorage; // tokenId => string\n\n`;
        }
        const hasAnyPatchType = [Feature.PATCH, Feature['1155PATCH'], Feature.ACCOUNTPATCH].some(patch => schema.features.includes(patch));
        if (hasAnyPatchType ||  schema.features.some((feature: Feature) => feature === Feature.MINTABLE)) {
            members += `uint256 internal _nextTokenId;\n\n`;
        }
        return ind(4, members);
    }
}