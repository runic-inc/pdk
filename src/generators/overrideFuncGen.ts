import { ContractSchema, Feature } from "../contractSchema";
import { Generator, ind } from "../generator";

export class OverrideFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        let features = schema.features;
        let out = schema.hasLiteRef() ? `` +
        `function _checkWriteAuth() internal override(Patchwork721, PatchworkLiteRef) view returns (bool allow) {\n` +
        `    return Patchwork721._checkWriteAuth();\n` +
        `}\n` : "";
        // TODO make this work for all patch + fragment permutations
        if (features.some((feature: Feature) => feature === Feature.PATCH) && features.some((feature: Feature) => feature === Feature.FRAGMENTSINGLE)) {
            out += `\n`;
            out += `function setLocked(uint256 tokenId, bool locked_) public view virtual override(PatchworkPatch, PatchworkFragmentSingle) {\n`;
            out += `    return PatchworkPatch.setLocked(tokenId, locked_);\n`;
            out += `}\n`;
            out += `\n`;
            out += `function locked(uint256 /* tokenId */) public pure virtual override(PatchworkPatch, PatchworkFragmentSingle) returns (bool) {\n`;
            out += `    return false;\n`;
            out += `}\n`;
            out += `\n`;
            out += `function ownerOf(uint256 tokenId) public view virtual override(PatchworkPatch, PatchworkFragmentSingle) returns (address) {\n`;
            out += `    return PatchworkPatch.ownerOf(tokenId);\n`;
            out += `}\n`;
            out += `\n`;
            out += `function updateOwnership(uint256 tokenId) public virtual override(PatchworkPatch, PatchworkFragmentSingle) {\n`;
            out += `    PatchworkPatch.updateOwnership(tokenId);\n`;
            out += `}\n`;
        }
        return ind(4, `${out}`);
    }
}