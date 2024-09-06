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
    expect(actual.contractRelations).toEqual(expected.contractRelations);

    // Compare contracts separately
    expect(actual.contracts.size).toEqual(expected.contracts.size);
    actual.contracts.forEach((value, key) => {
        const expectedValue = expected.contracts.get(key);
        if (typeof value === 'string' || typeof expectedValue === 'string') {
            expect(value).toEqual(expectedValue);
        } else {
            compareContractConfigs(value, expectedValue as ContractConfig);
        }
    });
}

describe("JSONProjectConfigLoader", () => {
    it("should load a project config matching project-config.json", async () => {
        // Read the content of the actual project-config.json file
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');
        const loadedConfig = new JSONProjectConfigLoader().load(projectJson);
        expect(loadedConfig).toEqual(exampleProjectProjectConfig);
    });

    it("should load a project config matching project-config-contract-config.json", async () => {
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config-contract-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');
        const loadedConfig = new JSONProjectConfigLoader().load(projectJson);
        compareProjectConfigsWithContractConfig(loadedConfig, contractConfigProjectProjectConfig);
    });
});