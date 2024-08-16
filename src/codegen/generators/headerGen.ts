import { ContractSchema, ContractStorageField, Feature } from "../contractSchema";
import { Generator } from "../generator";

export class HeaderGen implements Generator {
    gen(schema: ContractSchema): string {
        let header = 
        `// SPDX-License-Identifier: UNLICENSED\n` + 
        `pragma solidity ^0.8.23;\n` +
        `\n`;
        if (schema.imageURI && schema.imageURI.includes('{tokenID}')) {
            header += `import "@openzeppelin/contracts/utils/Strings.sol";\n`
        }
        header += this.getBaseImports(schema.features).join("");
        if (schema.hasLiteRef()) {
            header += `import "@patchwork/PatchworkLiteRef.sol";\n`;
        }
        if (schema.features.some((feature: Feature) => feature === Feature.MINTABLE)) {
            header += `import "@patchwork/interfaces/IPatchworkMintable.sol";\n`;
        }
        if (schema.storage.fields.some((field: ContractStorageField) => field.isString)) {
            header += `import "@patchwork/PatchworkUtils.sol";\n`;
        }
        if (schema.hasLiteRef() && schema.features.includes(Feature.DYNAMICREFLIBRARY)) {
            header += `import "@patchwork/libraries/PatchworkDynamicRefs.sol";\n`;
        }
        return header;
    }

    getBaseImports(features: Feature[]): string[] {
        let imports: string[] = [];
        if (features.some((feature: Feature) => feature === Feature.FRAGMENTMULTI)) {
            imports.push(`import "@patchwork/PatchworkFragmentMulti.sol";\n`);
        }
        if (features.some((feature: Feature) => feature === Feature.FRAGMENTSINGLE)) {
            imports.push(`import "@patchwork/PatchworkFragmentSingle.sol";\n`);
        }
        if (features.some((feature: Feature) => feature === Feature.PATCH)) {
            imports.push(`import "@patchwork/PatchworkPatch.sol";\n`);
        }
        if (features.some((feature: Feature) => feature === Feature.PATCH1155)) {
            imports.push(`import "@patchwork/Patchwork1155Patch.sol";\n`);
        }
        if (features.some((feature: Feature) => feature === Feature.PATCHACCOUNT)) {
            imports.push(`import "@patchwork/PatchworkAccountPatch.sol";\n`);
        }
        // If no specific feature is found, default to Patchwork721
        if (imports.length === 0) {
            imports.push(`import "@patchwork/Patchwork721.sol";\n`);
        }
        // Join all imports with a newline
        return imports;
    }

}