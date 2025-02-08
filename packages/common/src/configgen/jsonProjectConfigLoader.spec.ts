import fs from 'fs';
import path from 'path';
import exampleProjectProjectConfig from "../codegen/test_data/project_configs/project-config";
import contractConfigProjectProjectConfig from "../codegen/test_data/project_configs/project-config-contract-config";
import { ContractConfig, FieldConfig, ProjectConfig } from "../types";
import { JSONProjectConfigLoader } from "./jsonProjectConfigLoader";

// Custom function to compare ContractConfigs while ignoring certain fields
function compareContractConfigs(actual: ContractConfig, expected: ContractConfig) {
    const simplifyField = (field: FieldConfig) => {
        const { arrayLength, permissionId, visibility, ...rest } = field;
        return rest;
    };

    const simplifyContractConfig = (config: ContractConfig): Partial<ContractConfig> => ({
        ...config,
        fields: config.fields.map(simplifyField)
    });

    expect(simplifyContractConfig(actual)).toEqual(simplifyContractConfig(expected));
}

// Custom function to compare ProjectConfigs with ContractConfig
function compareProjectConfigsWithContractConfig(actual: ProjectConfig, expected: ProjectConfig) {
    expect(actual.name).toEqual(expected.name);
    expect(actual.scopes).toEqual(expected.scopes);

    // Compare contracts separately
    expect(actual.contracts.size).toEqual(expected.contracts.size);
    Object.entries(actual.contracts).forEach((kv: [string, string | ContractConfig]) => {
        const expectedValue = expected.contracts[kv[0]];
        if (typeof kv[1] === 'string' || typeof expectedValue === 'string') {
            expect(kv[1]).toEqual(expectedValue);
        } else {
            compareContractConfigs(kv[1], expectedValue as ContractConfig);
        }
    });
}

describe("JSONProjectConfigLoader", () => {
    describe("JSONProjectConfigLoader", () => {
        it("should load a project config matching project-config.json", async () => {
            const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config.json');
            const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');
            const loadedConfig = new JSONProjectConfigLoader().load(projectJson);
    
            // Build the expected config by merging in default plugins if they're missing.
            const expectedConfig = {
                ...exampleProjectProjectConfig,
                plugins: exampleProjectProjectConfig.plugins || [
                    { name: 'ponder' },
                    { name: 'react' }
                ]
            };
    
            expect(loadedConfig).toEqual(expectedConfig);
        });
    });
    

    it("should load a project config matching project-config-contract-config.json", async () => {
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config-contract-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');
        const loadedConfig = new JSONProjectConfigLoader().load(projectJson);
        compareProjectConfigsWithContractConfig(loadedConfig, contractConfigProjectProjectConfig);
    });
});