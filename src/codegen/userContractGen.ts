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
        `  constructor() ${generatedContractName}() {}\n` +
        `}\n`;
    }
}