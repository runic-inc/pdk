import { ContractSchemaImpl } from '../codegen/contractSchema';
import { parseJson } from '../codegen/contractSchemaJsonParser';
import { ind } from "../codegen/generator";
import { ContractConfig, ProjectConfig, ScopeConfig } from "../types";
import { JSONContractConfigGen } from './jsonContractConfigGen';

export class JSONProjectConfigGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        let contractConfigString = '';
        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            if (contractConfigString.length > 0) { contractConfigString += ',\n' };
            contractConfigString += this.genContractConfig(key, value);
        });

        // Create default plugins if none specified
        const plugins = projectConfig.plugins || [
            { name: 'ponder' },
            { name: 'react' }
        ];

        return `` +
            `{\n` +
            `    "$schema": "https://patchwork.dev/schema/patchwork-project-config.schema.json",\n` +
            `    "name": "${projectConfig.name}",\n` +
            `    "plugins": ${JSON.stringify(plugins, null, 4).replace(/^/gm, '    ')},\n` + // Add plugins with proper indentation
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
        return `        "${scopeConfig.name}": {\n` +
            ind(12, scopeProps.join(',\n')) +
            `        }`;
    }

    genContractConfig(name: string, value: string | ContractConfig): string {
        if (typeof value === 'string') {
            return `        "${name}": {\n` +
                   `            "config": "${value}"` +
                   `        }`;
        } else {
            const generator = new JSONContractConfigGen();
            const contractConfig = parseJson(value);
            const contractConfigString = generator.gen(new ContractSchemaImpl(contractConfig)).split('\n');
            contractConfigString.pop();

            return `        "${name}": {\n` +
                   `            "config": ${contractConfigString.join('\n            ')}` +
                   `        }`;
        }
    }
}