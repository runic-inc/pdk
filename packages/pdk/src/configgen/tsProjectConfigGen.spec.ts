import { TSProjectConfigGen } from "./tsProjectConfigGen";
import projectConfig from "../codegen/test_data/project_configs/project-config";
import fs from 'fs';
import path from 'path';

describe("TypeScriptProjectConfigGen", () => {
  it("should generate a project config matching project-config.ts", async () => {
    // Generate the TypeScript code
    const genString = new TSProjectConfigGen().gen(projectConfig);

    // Read the content of the actual project-config.ts file
    const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config.ts');
    const actualFileContent = fs.readFileSync(projectConfigPath, 'utf-8');

    // Normalize both strings by removing all whitespace
    const normalizedGenString = genString.replace(/\s/g, '');
    const normalizedFileContent = actualFileContent.replace(/\s/g, '');
    
    // Compare the normalized strings
    expect(normalizedGenString).toEqual(normalizedFileContent);
  });
});