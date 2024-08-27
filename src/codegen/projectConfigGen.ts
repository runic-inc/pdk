import { ContractRelation, MintConfig, ProjectConfig, ScopeConfig } from "@/types";

export class ProjectConfigGen {
    constructor() {}

    gen(projectConfig: ProjectConfig): string {
        let contractConfigString = '';
        projectConfig.contracts.forEach((value, key) => {
            if (contractConfigString.length > 0) { contractConfigString += ',\n' };
            contractConfigString += this.genContractConfig(key, value, projectConfig.contractRelations.get(key));
        });

        return `` +
        `{\n` +
        `    "name": "${projectConfig.name}",\n` +
        `    "scopes": {\n` +
        projectConfig.scopes.map(scope => {
            return this.genScopeConfig(scope);
        }).join(',\n') +
        `    },\n` +
        `    "contracts": {\n` +
        contractConfigString + `\n` +
        `    }\n` +
        `}`;
    }

    genScopeConfig(scopeConfig: ScopeConfig): string {
        return `        "${scopeConfig.name}": {\n` +
        `            "whitelist": ${scopeConfig.whitelist},\n` +
        `            "userAssign": ${scopeConfig.userAssign},\n` +
        `            "userPatch": ${scopeConfig.userPatch},\n` +
        `            "bankers": ${scopeConfig.bankers},\n` +
        `            "operators": ${scopeConfig.operators},\n` +
        `            "mintConfigs": ${this.genMintConfigs(scopeConfig.mintConfigs)},\n` +
        `            "patchFees": ${this.genPatchFees(scopeConfig.patchFees)},\n` +
        `            "assignFees": ${this.genAssignFees(scopeConfig.assignFees)}\n` +
        `        }`;
    }

    genMintConfigs(mintConfigs: Map<string, MintConfig> | undefined): string {
        if (!mintConfigs) return '{}';
        return JSON.stringify(Object.fromEntries(mintConfigs.entries()));
    }

    genPatchFees(patchFees: Map<string, number> | undefined): string {
        if (!patchFees) return '{}';
        return JSON.stringify(Object.fromEntries(patchFees.entries()));
    }

    genAssignFees(assignFees: Map<string, number> | undefined): string {
        if (!assignFees) return '{}';
        return JSON.stringify(Object.fromEntries(assignFees.entries()));
    }

    genContractConfig(name: string, filename: string, relations: ContractRelation | undefined): string {
        return `        "${name}": {\n` +
        `            "config": "${filename}",\n` +
        `            "fragments": [\n` +
        (relations ? relations.fragments.map(fragment => {
            return `                "${fragment}"`;
        }).join(',\n') : '') +
        `\n            ]\n` +
        `        }`;
    }
}