
import fs from 'fs';
import path from 'path';
import projectConfig from "../codegen/test_data/project_configs/project-config";
import { JSONProjectConfigLoader } from "./jsonProjectConfigLoader";

describe("JSONProjectConfigLoader", () => {
    it("should load a project config matching project-config.json", async () => {
        // Read the content of the actual project-config.json file
        const projectConfigPath = path.join(__dirname, '../codegen/test_data/project_configs/project-config.json');
        const projectJson = fs.readFileSync(projectConfigPath, 'utf-8');

        const loadedConfig = new JSONProjectConfigLoader().load(projectJson);

        expect(loadedConfig).toEqual(projectConfig);
    });
});