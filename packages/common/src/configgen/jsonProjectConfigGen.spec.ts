import projectConfig from "@patchworkdev/common/codegen/test_data/project_configs/project-config";
import fs from 'fs';
import path from 'path';
import { JSONProjectConfigGen } from "./jsonProjectConfigGen";

describe("JSONProjectConfigGen", () => {
    it("should generate a project config matching project-config.json", async () => {
        // Read the content of the actual project-config.json file
        const projectConfigPath = path.join(__dirname, '@patchworkdev/common/codegen/test_data/project_configs/project-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');

        // Generate the JSON string
        const genString = new JSONProjectConfigGen().gen(projectConfig);

        // Parse both JSONs for comparison
        expect(JSON.parse(genString)).toEqual(JSON.parse(projectJson));
    });
});