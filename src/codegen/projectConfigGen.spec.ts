
import { ProjectConfigGen } from "./projectConfigGen";
import { ProjectConfig, ScopeConfig } from "@/types";

describe("JSONProjectConfigGen", () => {
  it("should generate a project config", async () => {
    const projectJson = `{
    "name": "My Project",
    "scopes": {
        "MyScope": {
            "owner": "0x222222cf1046e68e36E1aA2E0E07105eDDD1f08E",
            "whitelist": true,
            "userAssign": false,
            "userPatch": false,
            "bankers": ["0x000000254729296a45a3885639AC7E10F9d54979", "Contract1"],
            "operators": ["0x000000111129296a45a3885639AC7E10F9d54979", "Contract1"],
            "mintConfigs": {
                "0xc0ffee254729296a45a3885639AC7E10F9d54979": {
                    "flatFee": 0,
                    "active": true
                }
            },
            "patchFees": {
                "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E": 0
            },
            "assignFees": {
                "0x555555cf1046e68e36E1aA2E0E07105eDDD1f08E": 0
            }
        }
    },
    "contracts": {
        "Contract1": {
            "config": "config1.json",
            "fragments": [
                "Contract2"
            ]
        },
        "Contract2": {
            "config": "config2.json"
        }
    }
  }`;
  const projConfig = {
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
        mintConfigs: new Map([
          ["0xc0ffee254729296a45a3885639AC7E10F9d54979", { flatFee: 0, active: true }]
        ]),
        patchFees: new Map([
          ["0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E", 0]
        ]),
        assignFees: new Map([
          ["0x555555cf1046e68e36E1aA2E0E07105eDDD1f08E", 0]
        ])
      } as ScopeConfig
    ],
    contracts: new Map([
      ["Contract1", "config1.json"],
      ["Contract2", "config2.json"]
    ]),
    contractRelations: new Map([
      ["Contract1", { fragments: ["Contract2"] }]
    ])
  } as ProjectConfig;
  const genString = new ProjectConfigGen().gen(projConfig);
  // console.log(genString);
  expect( JSON.parse(genString)).toEqual(JSON.parse(projectJson));
  });
});