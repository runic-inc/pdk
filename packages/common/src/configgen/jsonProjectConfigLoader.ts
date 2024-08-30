import { ContractRelation, ProjectConfig, ScopeConfig } from "@patchworkdev/common/types";

export class JSONProjectConfigLoader {
    constructor() { }

    load(jsonString: string): ProjectConfig {
        let projectConfig = JSON.parse(jsonString);
        let contractRelations = new Map<string, ContractRelation>();
        return {
            name: projectConfig.name,
            scopes: Object.entries(projectConfig.scopes).map(([key, value]) => {
                return this.loadScopeConfig(key, value);
            }),
            contracts: Object.entries(projectConfig.contracts).reduce((map, [key, value]) => {
                const v = value as any;
                map.set(key, v.config);
                const fragments = v.fragments as string[];
                if (fragments) {
                    contractRelations.set(key, { fragments: fragments });
                }
                return map;
            }, new Map<string, string>()),
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
            mintConfigs: new Map(Object.entries(scopeConfig.mintConfigs)),
            patchFees: new Map(Object.entries(scopeConfig.patchFees)),
            assignFees: new Map(Object.entries(scopeConfig.assignFees))
        };
    }
}