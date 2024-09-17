import { parseJson } from '../codegen/contractSchemaJsonParser';
import { ContractConfig, ContractRelation, MintConfig, ProjectConfig, ScopeConfig } from "../types";
import { JSONContractConfigGen } from './jsonContractConfigGen';

export class JSONProjectConfigGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        let contractConfigString = '';
        projectConfig.contracts.forEach((value, key) => {
            if (contractConfigString.length > 0) { contractConfigString += ',\n' };
            contractConfigString += this.genContractConfig(key, value, projectConfig.contractRelations.get(key));
        });
        return `` +
            `{\n` +
            `    "$schema": "https://patchwork.dev/schema/patchwork-project-config.schema.json",\n` +
            `    "name": "${projectConfig.name}",\n` +
            `    "scopes": {\n` +
            projectConfig.scopes.map(scope => {
                return this.genScopeConfig(scope);
            }).join(',\n') +
            `\n    },\n` +
            `    "contracts": {\n` +
            contractConfigString + `\n` +
            `    }\n` +
            `}`;
    }

    genScopeConfig(scopeConfig: ScopeConfig): string {
        return `        "${scopeConfig.name}": {\n` +
            `            "name": "${scopeConfig.name}",\n` +
            `            "owner": "${scopeConfig.owner}",\n` +
            `            "whitelist": ${scopeConfig.whitelist},\n` +
            `            "userAssign": ${scopeConfig.userAssign},\n` +
            `            "userPatch": ${scopeConfig.userPatch},\n` +
            `            "bankers": [` +
            scopeConfig.bankers?.map(banker => {
                return `"${banker}"`;
            }).join(',') +
            `],\n` +
            `            "operators": [` +
            scopeConfig.operators?.map(operator => {
                return `"${operator}"`;
            }).join(',') +
            `],\n` +
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

    genContractConfig(name: string, value: string | ContractConfig, relations: ContractRelation | undefined): string {
        let fragments = '';
        if (relations) {
            fragments = `,\n            "fragments": [\n` + relations.fragments.map(fragment => {
                return `                "${fragment}"`;
            }).join(',\n') +
                `\n            ]`;
        }
        
        if (typeof value === 'string') {
            return `        "${name}": {\n` +
                   `            "config": "${value}"` +
                   `${fragments}\n` +
                   `        }`;
        } else {
            const generator = new JSONContractConfigGen();
            const contractSchema = parseJson(value);
            const contractConfigString = generator.gen(contractSchema).split('\n');
            contractConfigString.pop();

            return `        "${name}": {\n` +
                   `            "config": ${contractConfigString.join('\n            ')}` +
                   `${fragments}\n` +
                   `        }`;
        }
    }
}