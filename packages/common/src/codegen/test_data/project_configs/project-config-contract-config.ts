import { ContractConfig, ContractRelation, Feature, FunctionConfig, MintConfig, ProjectConfig } from "@patchworkdev/common/types";

const contractConfigProjectProjectConfig: ProjectConfig = {
    name: "Contract Config Project",
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
    contracts: new Map<string, string | ContractConfig>([
        ["Contract1", {
            scopeName: "test",
            name: "AccountPatch",
            symbol: "AP",
            baseURI: "https://mything/my/",
            schemaURI: "https://mything/my-metadata.json",
            imageURI: "https://mything/my/{tokenID}.png",
            fields: [
                {
                    id: 1,
                    key: "name",
                    type: "char32",
                    description: "Name",
                    functionConfig: FunctionConfig.ALL,
                }
            ],
            features: [Feature.ACCOUNTPATCH]
        }],
        ["Contract2", {
            scopeName: "test",
            name: "SecondContract",
            symbol: "SC",
            baseURI: "https://mysecondthing/my/",
            schemaURI: "https://mysecondthing/my-metadata.json",
            imageURI: "https://mysecondthing/my/{tokenID}.png",
            fields: [
                {
                    id: 1,
                    key: "description",
                    type: "char32",
                    description: "Description",
                    functionConfig: FunctionConfig.ALL,
                }
            ],
            features: [Feature.PATCH]
        }]
    ]),
    contractRelations: new Map<string, ContractRelation>([
        ["Contract1", {
            fragments: ["Contract2"]
        }]
    ])
};

export default contractConfigProjectProjectConfig;