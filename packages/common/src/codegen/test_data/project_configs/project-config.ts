import { ContractConfig, Feature, FunctionConfig, ProjectConfig } from "@patchworkdev/common/types";

const exampleProjectProjectConfig: ProjectConfig = {
    name: "Example Project",
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
        "Contract1": "config1.json",
        "Contract2": "config2.json"
    },
    plugins: [{ name: "ponder" },{ name: "react" }],
};

export default exampleProjectProjectConfig;