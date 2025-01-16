import { ContractConfig, ProjectConfig, ScopeConfig } from '../types';

export class TSProjectConfigGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        const constantName = this.generateConstantName(projectConfig.name);
        
        let out = `import { ContractConfig, Feature, FunctionConfig, ProjectConfig } from "@patchworkdev/common/types";\n\n`;
        out += `const ${constantName}: ProjectConfig = {\n`;
        out += `    name: "${projectConfig.name}",\n`;
        out += `    scopes: [\n`;
        out += projectConfig.scopes.map(scope => this.genScopeConfig(scope)).join(',\n');
        out += `\n    ],\n`;
        out += `    contracts: {\n`;
        out += this.genContractsMap(projectConfig.contracts);
        out += `\n    },\n`;
        if (projectConfig.networks) {
            out += `    networks: {\n`;
            out += `        ${Object.entries(projectConfig.networks).map(([key, network]) => {
                return `        ${key}: {\n            chain: "${network.chain}",\n            rpc: "${network.rpc}"\n        }`;
            }).join(',\n')}\n`;
            out += `    },\n`;
        }
        if (projectConfig.plugins) {
            out += `    plugins: [\n`;
            out += projectConfig.plugins.map(plugin => `        { name: "${plugin.name}", props: ${plugin.props} }`).join(',\n');
            out += `\n    ],\n`;
        }
        out += `};\n\n`;
        out += `export default ${constantName};\n`;
        return out;
    }

    private generateConstantName(projectName: string): string {
        const words = projectName.split(/\s+/);
        const camelCaseWords = words.map((word, index) => 
            index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        return camelCaseWords.join('') + 'ProjectConfig';
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
        out += `        }`;
        return out;
    }

    private genRecordEntries(map: Record<string, any>): string {
        return `\n                ${Object.entries(map).map(([key, value]) => `"${key}": ${this.stringifyValue(value)}`).join(',\n                ')}\n`;
    }

    private stringifyValue(value: any): string {
        if (typeof value === 'object' && value !== null) {
            return `{${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')}}`;
        }
        return JSON.stringify(value);
    }

    private genContractsMap(contracts: Record<string, string | ContractConfig>): string {
        return Object.entries(contracts)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `        "${key}": "${value}"`;
                } else {
                    return `        "${key}": ${this.stringifyContractConfig(value)}`;
                }
            })
            .join(',\n');
    }

    private stringifyContractConfig(config: ContractConfig): string {
        let out = '{\n';
        out += `            scopeName: "${config.scopeName}",\n`;
        out += `            name: "${config.name}",\n`;
        out += `            symbol: "${config.symbol}",\n`;
        out += `            baseURI: "${config.baseURI}",\n`;
        out += `            schemaURI: "${config.schemaURI}",\n`;
        out += `            imageURI: "${config.imageURI}",\n`;
        out += `            fields: [\n`;
        out += config.fields.map(field => {
            let fieldStr = '                {\n';
            fieldStr += `                    id: ${field.id},\n`;
            fieldStr += `                    key: "${field.key}",\n`;
            fieldStr += `                    type: "${field.type}",\n`;
            if (field.description) fieldStr += `                    description: "${field.description}",\n`;
            if (field.arrayLength !== undefined && field.arrayLength !== 1) fieldStr += `                    arrayLength: ${field.arrayLength},\n`;
            if (field.functionConfig) fieldStr += `                    functionConfig: FunctionConfig.${field.functionConfig},\n`;
            fieldStr += '                }';
            return fieldStr;
        }).join(',\n');
        out += '\n            ],\n';
        out += `            features: [${config.features.map(f => this.formatFeature(f)).join(', ')}],\n`;
        out += `            fragments: [${config.fragments?.map(f => `\"${f}\"`).join(', ')}]\n`;
        out += '        }';
        return out;
    }
    
    private formatFeature(feature: string): string {
        return feature === "1155PATCH" ? `Feature["${feature}"]` : `Feature.${feature}`;
    }
}