import { parseJson } from '../codegen/contractSchemaJsonParser';
import { ContractConfig, ContractRelation, ProjectConfig, ScopeConfig } from "../types";

export class JSONProjectConfigLoader {
    constructor() { }

    load(jsonString: string): ProjectConfig {
        let projectConfig = JSON.parse(jsonString);
        let contractRelations: Record<string, ContractRelation> = {};
        let contracts: Record<string, string | ContractConfig> = {};

        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const v = value as any;
            if (v.config && typeof v.config === 'string') {
                contracts[key] = v.config;
            } else {
                contracts[key] = parseJson(v.config);
            }
            if (v.fragments && Array.isArray(v.fragments)) {
                contractRelations[key] = { fragments: v.fragments };
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
            name: scopeConfig.name,
            owner: scopeConfig.owner,
            whitelist: scopeConfig.whitelist,
            userAssign: scopeConfig.userAssign,
            userPatch: scopeConfig.userPatch,
            bankers: scopeConfig.bankers,
            operators: scopeConfig.operators,
            mintConfigs: scopeConfig.mintConfigs || {},
            patchFees: scopeConfig.patchFees || {},
            assignFees: scopeConfig.assignFees || {}
        };
    }
}