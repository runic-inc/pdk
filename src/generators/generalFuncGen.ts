import { ContractSchema, Feature } from "../contractSchema";
import { Generator, ind } from "../generator";

export class GeneralFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        const schemaURI = schema.schemaURI ? schema.schemaURI : "";
        const schemaURIFunction = `` +
        `function schemaURI() pure external override returns (string memory) {\n` +
        `    return "${schemaURI}";\n` +
        `}\n`;
    
        const imageURI = schema.imageURI && schema.imageURI.includes('{tokenID}') 
          ? `string.concat("${schema.imageURI.split('{tokenID}').join('", Strings.toString(tokenId), "')}")`
          : `"${schema.imageURI}"` || `""`;
        const imageURIFunction = `` +
        `function imageURI(uint256 tokenId) pure external override returns (string memory) {\n` +
        `    return ${imageURI};\n` +
        `}\n`;
    
        const baseURI = schema.baseURI ? schema.baseURI : "";
        const baseURIFunction = `` +
        `function _baseURI() internal pure virtual override returns (string memory) {\n` +
        `    return "${baseURI}";\n` +
        `}\n`;

        const interfaceFunction = this.getSupportsInterfaceFunc(schema);
    
        const storeMetadataFunction = `` +
        `function storeMetadata(uint256 tokenId, ${schema.getMetadataStructName()} memory data) public {\n` +
        `    if (!_checkTokenWriteAuth(tokenId)) {\n` +
        `        revert IPatchworkProtocol.NotAuthorized(msg.sender);\n` +
        `    }\n` +
        `    _metadataStorage[tokenId] = packMetadata(data);\n` +
        `}\n`;
    
        const loadMetadataFunction = `` +
        `function loadMetadata(uint256 tokenId) public view returns (${schema.getMetadataStructName()} memory data) {\n` +
        `    return unpackMetadata(_metadataStorage[tokenId]);\n` +
        `}\n`;
       
        return ind(4, `` +
        `${schemaURIFunction}\n` +
        `${imageURIFunction}\n` +
        `${baseURIFunction}\n` +
        `${interfaceFunction}` +
        `${storeMetadataFunction}\n` +
        `${loadMetadataFunction}\n`);
    }

    getSupportsInterfaceFunc(schema: ContractSchema): string {
        // bases = Patchwork721, PatchworkFragmentSingle, PatchworkFragmentMulti
        //   PatchworkPatch, PatchworkReversiblePatch, ... PatchworkLiteRef
        // support adds = mintable
        // TODO add interface
        let support = [];
        let bases = [];
        let features = schema.features;
        if (features.some((feature: Feature) => feature === Feature.FRAGMENTMULTI)) {
            bases.push(`PatchworkFragmentMulti`);
        }
        if (features.some((feature: Feature) => feature === Feature.FRAGMENTSINGLE)) {
            bases.push(`PatchworkFragmentSingle`);
        }
        if (features.some((feature: Feature) => feature === Feature.PATCH)) {
            if (features.some((feature: Feature) => feature === Feature.REVERSIBLE)) {
                bases.push(`PatchworkReversiblePatch`);
            } else {
                bases.push(`PatchworkPatch`);
            }
        }
        if (features.some((feature: Feature) => feature === Feature.PATCH1155)) {
            if (features.some((feature: Feature) => feature === Feature.REVERSIBLE)) {
                bases.push(`PatchworkReversible1155Patch`);
            } else {
                bases.push(`Patchwork1155Patch`);
            }
        }
        if (features.some((feature: Feature) => feature === Feature.PATCHACCOUNT)) {
            if (features.some((feature: Feature) => feature === Feature.REVERSIBLE)) {
                bases.push(`PatchworkReversibleAccountPatch`);
            } else {
                bases.push(`PatchworkAccountPatch`);
            }
        }
        if (schema.hasLiteRef()) {
            if (bases.length === 0) {
                bases.push(`Patchwork721`);
            }
            bases.push(`PatchworkLiteRef`);
        }
        if (features.some((feature: Feature) => feature === Feature.MINTABLE)) {
            support.push(`IPatchworkMintable`);
        }
        if (bases.length === 0 && support.length > 0) {
            bases.push(`Patchwork721`);
        }
        if (bases.length <= 1 && support.length === 0) {
            // No need for an override
            return ``;
        }
        let baseString = `override `;
        if (bases.length > 1) {
            baseString = `override(${bases.join(", ")}) `;
        }
        let func = `function supportsInterface(bytes4 interfaceID) public view virtual ${baseString}returns (bool) {\n`
        func += `    return `;
        support.map((value: string) => { func += `type(${value}).interfaceId == interfaceID ||\n        `; })
        if (bases.length === 1) {
            func += `super.supportsInterface(interfaceID)`
        } else {
            func += bases.map(value => `${value}.supportsInterface(interfaceID)`).join(' ||\n        ');
        }
        func += `;\n}\n\n`;
        return func;
    }
}