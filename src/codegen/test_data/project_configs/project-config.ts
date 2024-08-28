import { ProjectConfig, ScopeConfig, MintConfig, ContractRelation } from "../../../types";

const projectConfig: ProjectConfig = {
    name: "My Project",
    scopes: [
        {
            name: "MyScope",
            owner: "0x222222cf1046e68e36E1aA2E0E07105eDDD1f08E",
            whitelist: true,
            userAssign: false,
            userPatch: false,
            bankers: ["0x000000254729296a45a3885639AC7E10F9d54979", "Contract1"],
            operators: ["0x000000111129296a45a3885639AC7E10F9d54979", "Contract1"],
            mintConfigs: new Map<string, MintConfig>([
                ["0xc0ffee254729296a45a3885639AC7E10F9d54979", {
                    flatFee: 0,
                    active: true
                }]
            ]),
            patchFees: new Map<string, number>([
                ["0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E", 0]
            ]),
            assignFees: new Map<string, number>([
                ["0x555555cf1046e68e36E1aA2E0E07105eDDD1f08E", 0]
            ])
        }
    ],
    contracts: new Map<string, string>([
        ["Contract1", "config1.json"],
        ["Contract2", "config2.json"]
    ]),
    contractRelations: new Map<string, ContractRelation>([
        ["Contract1", {
            fragments: ["Contract2"]
        }]
    ])
};

export default projectConfig;