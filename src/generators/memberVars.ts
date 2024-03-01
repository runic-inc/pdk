import { ContractSchema, Feature } from "../contractSchema";
import { Generator, ind } from "../generator";

export class MemberVarsGen implements Generator {
    gen(schema: ContractSchema): string {
        let members = ``;
        if (schema.hasLiteRef() && schema.liteRefArrayLength(0) === 0) {
            members += `` +
            `struct DynamicLiteRefs {\n` +
            `    uint256[] slots; // 4 per\n` +
            `    mapping(uint64 => uint256) idx;\n` +
            `}\n\n` +
            `mapping(uint256 => DynamicLiteRefs) internal _dynamicLiterefStorage; // tokenId => indexed slots\n` +
            `\n`;
        }
        const hasAnyPatchType = [Feature.PATCH, Feature.PATCH1155, Feature.PATCHACCOUNT].some(patch => schema.features.includes(patch));
        if (hasAnyPatchType) {
            members += `uint256 private _nextTokenId;\n\n`;
        }
        return ind(4, members);
    }
}