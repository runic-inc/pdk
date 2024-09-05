import { parseJson } from '../codegen/contractSchemaJsonParser';
import { ContractConfig, ContractRelation, ProjectConfig, ScopeConfig } from "../types";

export class JSONProjectConfigLoader {
    constructor() { }

    load(jsonString: string): ProjectConfig {
        let projectConfig = JSON.parse(jsonString);
        let contractRelations = new Map<string, ContractRelation>();
        let contracts = new Map<string, string | ContractConfig>();

        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const v = value as any;
            if (v.config && typeof v.config === 'string') {
                // If v.config exists and is a string, use it as is
                contracts.set(key, v.config);
            } else {
                // If v.config doesn't exist or isn't a string, attempt to parse v as a ContractConfig
                const contractConfig = parseJson(v);
                contracts.set(key, contractConfig);
            }

            if (v.fragments && Array.isArray(v.fragments)) {
                contractRelations.set(key, { fragments: v.fragments });
            }
        });

        return {
            name: projectConfig.name,
            scopes: Object.entries(projectConfig.scopes).map(([key, value]) => {
                return this.loadScopeConfig(key, value);
            }),
            contracts: contracts,
            contractRelations: contractRelations
        };
    }

    loadScopeConfig(name: string, scopeConfig: any): ScopeConfig {
        return {
            name: name,
            owner: scopeConfig.owner,
            whitelist: scopeConfig.whitelist,
            userAssign: scopeConfig.userAssign,
            userPatch: scopeConfig.userPatch,
            bankers: scopeConfig.bankers,
            operators: scopeConfig.operators,
            mintConfigs: new Map(Object.entries(scopeConfig.mintConfigs || {})),
            patchFees: new Map(Object.entries(scopeConfig.patchFees || {})),
            assignFees: new Map(Object.entries(scopeConfig.assignFees || {}))
        };
    }
}