import { ContractConfig, Feature, FunctionConfig, ProjectConfig } from "@patchworkdev/common/types";

const contractConfigProjectProjectConfig: ProjectConfig = {
    name: "Contract Config Project",
    scopes: [
        {
            name: "test",
            owner: "0x222222cf1046e68e36E1aA2E0E07105eDDD1f08E",
            whitelist: true,
            userAssign: false,
            userPatch: false,
            bankers: ["0x000000254729296a45a3885639AC7E10F9d54979", "Contract1"],
            operators: ["0x000000111129296a45a3885639AC7E10F9d54979", "Contract1"],
        }
    ],
    contracts: {
        "Contract1": {
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
                },
                {
                    id: 2,
                    key: "patches",
                    type: "literef",
                    description: "Contract2",
                    arrayLength: 4,
                }
            ],
            features: [Feature.ACCOUNTPATCH],
            fragments: ["Contract2"]
        },
        "Contract2": {
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
            features: [Feature.PATCH, Feature.FRAGMENTSINGLE],
            fragments: []
        }
    },
    plugins: [{ name: "ponder" },{ name: "react" }],
};

export default contractConfigProjectProjectConfig;