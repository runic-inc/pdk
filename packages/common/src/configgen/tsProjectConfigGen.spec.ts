import fs from 'fs';
import path from 'path';
import exampleProjectProjectConfig from "../codegen/test_data/project_configs/project-config";
import contractConfigProjectProjectConfig from "../codegen/test_data/project_configs/project-config-contract-config";
import { TSProjectConfigGen } from "./tsProjectConfigGen";

describe("TypeScriptProjectConfigGen", () => {
    it("should generate a project config matching project-config.ts plus default plugins", async () => {
        // Generate the TypeScript code
        const genString = new TSProjectConfigGen().gen(exampleProjectProjectConfig);
        
        // Read the content of the actual project-config.ts file
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config.ts');
        const actualFileContent = fs.readFileSync(projectConfigPath, 'utf-8');
        
        // Create expected content by adding plugins section
        const expectedContent = actualFileContent
            .replace(
                'contracts: {\n        "Contract1": "config1.json",\n        "Contract2": "config2.json"\n    }',
                'contracts: {\n        "Contract1": "config1.json",\n        "Contract2": "config2.json"\n    },\n    plugins: [\n        { name: \'ponder\' },\n        { name: \'react\' }\n    ]'
            );
        
        // Normalize both strings by removing all whitespace for comparison
        const normalizedGenString = genString.replace(/\s/g, '');
        const normalizedExpectedContent = expectedContent.replace(/\s/g, '');
        
        expect(normalizedGenString).toEqual(normalizedExpectedContent);
    });

    it("should generate a project config matching project-config-contract-config.ts", async () => {
        // Generate the TypeScript code
        const genString = new TSProjectConfigGen().gen(contractConfigProjectProjectConfig);
        
        // Read the content of the actual project-config-contract-config.ts file
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config-contract-config.ts');
        const actualFileContent = fs.readFileSync(projectConfigPath, 'utf-8');
        
        // Normalize both strings by removing all whitespace
        const normalizedGenString = genString.replace(/\s/g, '');
        const normalizedFileContent = actualFileContent.replace(/\s/g, '');
        
        // Compare the normalized strings
        expect(normalizedGenString).toEqual(normalizedFileContent);
    });
});