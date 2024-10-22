import { ContractSchema } from "./contractSchema";
import { Generator } from "./generator";
import { cleanAndCapitalizeFirstLetter } from "./utils";

export class UserContractGen implements Generator {
    constructor() {}

    gen(schema: ContractSchema): string {
        let contractName = cleanAndCapitalizeFirstLetter(schema.name);
        let generatedContractName = contractName + "Generated";
        return `` +
        `// SPDX-License-Identifier: UNLICENSED\n` +
        `pragma solidity ^0.8.23;\n` +
        `\n` +
        `import "./${generatedContractName}.sol";\n` +
        `\n` +
        `contract ${contractName} is ${generatedContractName} {\n` +
        `    constructor(address _manager, address _owner) ${generatedContractName}(_manager, _owner) {}\n` +
        `\n` +
        `    // Add your custom logic here\n` +
        `    // This contract will not be overwritten by PDK when regenerating contracts\n` +
        `    // See https://docs.patchwork.dev for more details\n` +
        `\n` +
        `    // example - customizing minting rules for an IPatchworkMintable\n` +
        `    // function _mintSingle(address to, bytes calldata /* data */) internal override returns (uint256) {\n` +
        `        // add custom mint rules here\n` +
        `    // }\n` +
        `\n` +
        `    // example - adding a burn function\n` +
        `    // function burn(uint256 tokenId) internal override {\n` +
        `        // add custom burn rules here\n` +
        `        // _burn(tokenId);\n` +
        `    // }\n` +
        `}\n`;
    }
}