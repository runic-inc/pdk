import { ContractSchema, Feature } from "../contractSchema";
import { Generator, ind } from "../generator";

export class PatchFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        if (schema.features.some((feature: Feature) => feature === Feature.PATCH)) {
            return ind(4,`` +
            `function mintPatch(address owner, PatchTarget memory target) external payable returns (uint256 tokenId) {\n` +
            `    if (msg.sender != _manager) {\n` +
            `        return IPatchworkProtocol(_manager).patch{value: msg.value}(owner, target.addr, target.tokenId, address(this));\n` +
            `    }\n` +
            `    // require inherited ownership\n` +
            `    if (IERC721(target.addr).ownerOf(target.tokenId) != owner) {\n` +
            `        revert IPatchworkProtocol.NotAuthorized(owner);\n` +
            `    }\n` +
            `    tokenId = _nextTokenId++;\n` +
            `    _storePatch(tokenId, target);\n` +
            `    _safeMint(owner, tokenId);\n` +
            `    _metadataStorage[tokenId] = new uint256[](${schema.slots()});\n` +
            `    return tokenId;\n` +
            `}\n\n`);
        }
        if (schema.features.some((feature: Feature) => feature === Feature.PATCH1155)) {
            return ind(4,`` +
            `function mintPatch(address owner, PatchTarget memory target) external payable returns (uint256 tokenId) {\n` +
            `    if (msg.sender != _manager) {\n` +
            `        return IPatchworkProtocol(_manager).patch1155{value: msg.value}(owner, target.addr, target.tokenId, target.account, address(this));\n` +
            `    }\n` +
            `    tokenId = _nextTokenId++;\n` +
            `    _storePatch(tokenId, target);\n` +
            `    _safeMint(owner, tokenId);\n` +
            `    _metadataStorage[tokenId] = new uint256[](${schema.slots()});\n` +
            `    return tokenId;\n` +
            `}\n\n`);
        }
        if (schema.features.some((feature: Feature) => feature === Feature.PATCHACCOUNT)) {
            return ind(4,`` +
            `function mintPatch(address owner, address target) external payable returns (uint256 tokenId) {\n` +
            `    if (msg.sender != _manager) {\n` +
            `        return IPatchworkProtocol(_manager).patchAccount{value: msg.value}(owner, target, address(this));\n` +
            `    }\n` +
            `    // require inherited ownership\n` +
            `    if (owner != target) {\n` +
            `        revert IPatchworkProtocol.MintNotAllowed(owner);\n` +
            `    }\n` +
            `    tokenId = _nextTokenId++;\n` +
            `    _storePatch(tokenId, target);\n` +
            `    _safeMint(owner, tokenId);\n` +
            `    _metadataStorage[tokenId] = new uint256[](${schema.slots()});\n` +
            `    return tokenId;\n` +
            `}\n\n`);
        }
        return "";
    }
}