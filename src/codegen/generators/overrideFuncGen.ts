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
        if (features.includes(Feature.WEAKREF)) {
            out += `\n`;
            out += `/**\n`;
            out += `@dev See {IERC721-ownerOf}\n`;
            out += `*/\n`;
            out += `function ownerOf(uint256 tokenId) public view virtual override returns (address) {\n`;
            out += `    // Weak assignment uses normal ownership\n`;
            out += `    return ERC721.ownerOf(tokenId);\n`;
            out += `}\n`;
            out += `\n`;
            out += `/**\n`;
            out += `@dev See {IPatchwork721-locked}\n`;
            out += `*/\n`;
            out += `function locked(uint256 tokenId) public view virtual override returns (bool) {\n`;
            out += `    // Weak assignment uses base 721 locking behavior\n`;
            out += `    return Patchwork721.locked(tokenId);\n`;
            out += `}\n`;
            out += `\n`;
            out += `/**\n`;
            out += `@dev See {IPatchwork721-setLocked}\n`;
            out += `*/\n`;
            out += `function setLocked(uint256 tokenId, bool locked_) public virtual override {\n`;
            out += `    // Weak assignment uses base 721 locking behavior\n`;
            out += `    Patchwork721.setLocked(tokenId, locked_);\n`;
            out += `}\n`;
            out += `\n`;
            out += `/**\n`;
            out += `@dev See {IERC721-transferFrom}.\n`;
            out += `*/\n`;
            out += `function transferFrom(address from, address to, uint256 tokenId) public virtual override {\n`;
            out += `    // Weak assignment skips calling PatchworkProtocol.applyTransfer()\n`;
            out += `    if (locked(tokenId)) {\n`;
            out += `        revert IPatchworkProtocol.Locked(address(this), tokenId);\n`;
            out += `    }\n`;
            out += `    ERC721.transferFrom(from, to, tokenId);\n`;
            out += `}\n`;
            out += `\n`;
            out += `/**\n`;
            out += `@dev See {IERC721-safeTransferFrom}.\n`;
            out += `*/\n`;
            out += `function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {\n`;
            out += `    // Weak assignment skips calling PatchworkProtocol.applyTransfer()\n`;
            out += `    if (locked(tokenId)) {\n`;
            out += `        revert IPatchworkProtocol.Locked(address(this), tokenId);\n`;
            out += `    }\n`;
            out += `    ERC721.safeTransferFrom(from, to, tokenId, data);\n`;
            out += `}\n`;
        }
        return ind(4, `${out}`);
    }
}