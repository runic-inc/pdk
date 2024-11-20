import { ContractSchemaImpl } from '../codegen/contractSchema';
import { parseJson } from '../codegen/contractSchemaJsonParser';
import { ind } from "../codegen/generator";
import { ContractConfig, ContractRelation, MintConfig, ProjectConfig, ScopeConfig } from "../types";
import { JSONContractConfigGen } from './jsonContractConfigGen';

export class JSONProjectConfigGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        let contractConfigString = '';
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            if (contractConfigString.length > 0) { contractConfigString += ',\n' };
            contractConfigString += this.genContractConfig(key, value, projectConfig.contractRelations[key]);
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
        const scopeProps = [];
        scopeProps.push(`"name": "${scopeConfig.name}"`);
        if (scopeConfig.owner) {
            scopeProps.push(`"owner": "${scopeConfig.owner}"`);
        }
        if (scopeConfig.whitelist !== undefined) {
            scopeProps.push(`"whitelist": ${scopeConfig.whitelist}`);
        }
        if (scopeConfig.userAssign !== undefined) {
            scopeProps.push(`"userAssign": ${scopeConfig.userAssign}`);
        }
        if (scopeConfig.userPatch !== undefined) {
            scopeProps.push(`"userPatch": ${scopeConfig.userPatch}`);
        }
        if (scopeConfig.bankers) {
            scopeProps.push(`"bankers": [${scopeConfig.bankers.map(banker => `"${banker}"`).join(',')}]`);
        }
        if (scopeConfig.operators) {
            scopeProps.push(`"operators": [${scopeConfig.operators.map(operator => `"${operator}"`).join(',')}]`);
        }
        if (scopeConfig.mintConfigs) {
            scopeProps.push(`"mintConfigs": ${this.genMintConfigs(scopeConfig.mintConfigs)}`);
        }
        if (scopeConfig.patchFees) {
            scopeProps.push(`"patchFees": ${this.genPatchFees(scopeConfig.patchFees)}`);
        }
        if (scopeConfig.assignFees) {
            scopeProps.push(`"assignFees": ${this.genAssignFees(scopeConfig.assignFees)}`);
        }
        return `        "${scopeConfig.name}": {\n` +
            ind(12, scopeProps.join(',\n')) +
            `        }`;
    }

    genMintConfigs(mintConfigs: Record<string, MintConfig> | undefined): string {
        if (!mintConfigs) return '{}';
        return JSON.stringify(mintConfigs);
    }

    genPatchFees(patchFees: Record<string, number> | undefined): string {
        if (!patchFees) return '{}';
        return JSON.stringify(patchFees);
    }

    genAssignFees(assignFees: Record<string, number> | undefined): string {
        if (!assignFees) return '{}';
        return JSON.stringify(assignFees);
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
            const contractConfig = parseJson(value);
            const contractConfigString = generator.gen(new ContractSchemaImpl(contractConfig)).split('\n');
            contractConfigString.pop();

            return `        "${name}": {\n` +
                   `            "config": ${contractConfigString.join('\n            ')}` +
                   `${fragments}\n` +
                   `        }`;
        }
    }
}