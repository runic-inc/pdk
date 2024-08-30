import { ContractRelation, ProjectConfig, ScopeConfig } from "../types";


export class TSProjectConfigGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        let out = `import { ContractRelation, MintConfig, ProjectConfig } from "@patchworkdev/common/types";\n\n`;
        out += `const projectConfig: ProjectConfig = {\n`;
        out += `    name: "${projectConfig.name}",\n`;
        out += `    scopes: [\n`;
        out += projectConfig.scopes.map(scope => this.genScopeConfig(scope)).join(',\n');
        out += `\n    ],\n`;
        out += `    contracts: new Map<string, string>([\n`;
        out += this.genContractsMap(projectConfig.contracts);
        out += `\n    ]),\n`;
        out += `    contractRelations: new Map<string, ContractRelation>([\n`;
        out += this.genContractRelationsMap(projectConfig.contractRelations);
        out += `\n    ])\n`;
        out += `};\n\n`;
        out += `export default projectConfig;\n`;

        return out;
    }

    private genScopeConfig(scopeConfig: ScopeConfig): string {
        let out = `        {\n`;
        out += `            name: "${scopeConfig.name}",\n`;
        if (scopeConfig.owner) {
            out += `            owner: "${scopeConfig.owner}",\n`;
        }
        out += `            whitelist: ${scopeConfig.whitelist},\n`;
        out += `            userAssign: ${scopeConfig.userAssign},\n`;
        out += `            userPatch: ${scopeConfig.userPatch},\n`;
        if (scopeConfig.bankers && scopeConfig.bankers.length > 0) {
            out += `            bankers: [${scopeConfig.bankers.map(banker => `"${banker}"`).join(', ')}],\n`;
        }
        if (scopeConfig.operators && scopeConfig.operators.length > 0) {
            out += `            operators: [${scopeConfig.operators.map(operator => `"${operator}"`).join(', ')}],\n`;
        }
        if (scopeConfig.mintConfigs) {
            out += `            mintConfigs: new Map<string, MintConfig>(${this.genMapEntries(scopeConfig.mintConfigs)}),\n`;
        }
        if (scopeConfig.patchFees) {
            out += `            patchFees: new Map<string, number>(${this.genMapEntries(scopeConfig.patchFees)}),\n`;
        }
        if (scopeConfig.assignFees) {
            out += `            assignFees: new Map<string, number>(${this.genMapEntries(scopeConfig.assignFees)})\n`;
        }
        out += `        }`;
        return out;
    }

    private genMapEntries(map: Map<string, any>): string {
        return `[\n                ${Array.from(map.entries()).map(([key, value]) => `["${key}", ${this.stringifyValue(value)}]`).join(',\n                ')}\n            ]`;
    }

    private stringifyValue(value: any): string {
        if (typeof value === 'object' && value !== null) {
            return `{${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')}}`;
        }
        return JSON.stringify(value);
    }

    private genContractsMap(contracts: Map<string, string>): string {
        return Array.from(contracts.entries())
            .map(([key, value]) => `        ["${key}", "${value}"]`)
            .join(',\n');
    }

    private genContractRelationsMap(relations: Map<string, ContractRelation>): string {
        return Array.from(relations.entries())
            .map(([key, value]) => `        ["${key}", { fragments: [${value.fragments.map(f => `"${f}"`).join(', ')}] }]`)
            .join(',\n');
    }
}