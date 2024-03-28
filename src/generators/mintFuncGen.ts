import { ContractSchema, Feature } from "../contractSchema";
import { Generator, ind } from "../generator";
import { cleanAndCapitalizeFirstLetter } from "../utils";

export class MintFuncGen implements Generator {
    gen(schema: ContractSchema): string {
        if (schema.features.some((feature: Feature) => feature === Feature.MINTABLE)) {
            let out = ``;
            out += `function mint(address to, bytes calldata data) public payable returns (uint256 tokenId) {\n`;
            out += `    if (msg.sender != _manager) {\n`;
            out += `        return IPatchworkProtocol(_manager).mint{value: msg.value}(to, address(this), data);\n`;
            out += `    }\n`;
            out += `    return _mintSingle(to, data);\n`;
            out += `}\n`;
            out += `\n`;
            out += `function mintBatch(address to, bytes calldata data, uint256 quantity) public payable returns (uint256[] memory tokenIds) {\n`;
            out += `    if (msg.sender != _manager) {\n`;
            out += `        return IPatchworkProtocol(_manager).mintBatch{value: msg.value}(to, address(this), data, quantity);\n`;
            out += `    }\n`;
            out += `    tokenIds = new uint256[](quantity);\n`;
            out += `    for (uint256 i = 0; i < quantity; i++) {\n`;
            out += `        tokenIds[i] = _mintSingle(to, data);\n`;
            out += `    }\n`;
            out += `}\n`;
            out += `\n`;
            out += `function _mintSingle(address to, bytes calldata /* data */) internal returns (uint256) {\n`;
            out += `    uint256 tokenId = _nextTokenId;\n`;
            out += `    _metadataStorage[tokenId] = new uint256[](${schema.slots()});\n`;
            out += `    _nextTokenId++;\n`;
            out += `    _safeMint(to, tokenId);\n`;
            out += `    return tokenId;\n`;
            out += `}\n`;
            out += `\n`;
            return ind(4, out);
        }
        return "";
    }
}