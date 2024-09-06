import fs from 'fs';
import path from 'path';
import exampleProjectProjectConfig from "../codegen/test_data/project_configs/project-config";
import contractConfigProjectProjectConfig from "../codegen/test_data/project_configs/project-config-contract-config";
import { JSONProjectConfigGen } from "./jsonProjectConfigGen";

describe("JSONProjectConfigGen", () => {
    it("should generate a project config matching project-config.json", async () => {
        // Read the content of the actual project-config.json file
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');
        
        // Generate the JSON string
        const genString = new JSONProjectConfigGen().gen(exampleProjectProjectConfig);
        
        // Parse both JSONs for comparison
        expect(JSON.parse(genString)).toEqual(JSON.parse(projectJson));
    });

    it("should generate a project config with contract configs matching project-config-contract-config.json", async () => {
        // Read the content of the actual project-config-contract-config.json file
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config-contract-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');
        
        // Generate the JSON string
        const genString = new JSONProjectConfigGen().gen(contractConfigProjectProjectConfig);
        
        // Parse both JSONs for comparison
        expect(JSON.parse(genString)).toEqual(JSON.parse(projectJson));
    });
});