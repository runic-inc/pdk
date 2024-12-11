import { parseJson } from '../codegen/contractSchemaJsonParser';
import { ContractConfig, ProjectConfig, ScopeConfig } from "../types";

export class JSONProjectConfigLoader {
    constructor() { }

    load(jsonString: string): ProjectConfig {
        let projectConfig = JSON.parse(jsonString);
        let contracts: Record<string, string | ContractConfig> = {};

        Object.entries(projectConfig.contracts).forEach(([key, value]) => {
            const v = value as any;
            if (v.config && typeof v.config === 'string') {
                contracts[key] = v.config;
            } else {
                contracts[key] = parseJson(v.config);
            }
        });

        return {
            name: projectConfig.name,
            scopes: Object.entries(projectConfig.scopes).map(([key, value]) => {
                return this.loadScopeConfig(key, value);
            }),
            contracts: contracts
        };
    }

    loadScopeConfig(name: string, scopeConfig: any): ScopeConfig {
        return {
            name: scopeConfig.name,
            owner: scopeConfig.owner,
            whitelist: scopeConfig.whitelist !== undefined ? scopeConfig.whitelist : true,
            userAssign: scopeConfig.userAssign !== undefined ? scopeConfig.userAssign : false,
            userPatch: scopeConfig.userPatch !== undefined ? scopeConfig.userPatch : false,
            bankers: scopeConfig.bankers,
            operators: scopeConfig.operators,
            mintConfigs: scopeConfig.mintConfigs || {},
            patchFees: scopeConfig.patchFees || {},
            assignFees: scopeConfig.assignFees || {}
        };
    }
}