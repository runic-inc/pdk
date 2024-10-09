import path from "path";
import { generateABIs } from "../generateABIs";
import { generateAPI } from "../generateApi";
import { generateEventHooks } from "../generateEventHooks";
import { generatePonderConfig } from "../generatePonderConfig";
import { generateSchema } from "../generateSchema";
import { findPonderSchema } from "../helpers/config";

export async function generateAll(configPath: string) {
    try {
        console.log("Generating all components...");
        console.log("Using config file:", configPath);

        // Generate TypeScript ABIs
        console.log("Generating TypeScript ABIs...");
        await generateABIs(configPath);

        // Generate Ponder Schema
        console.log("Generating Ponder Schema...");
        await generateSchema(configPath);

        // Generate Event Hooks
        console.log("Generating Event Hooks...");
        await generateEventHooks(configPath);

        // Generate Ponder Config
        console.log("Generating Ponder Config...");
        await generatePonderConfig(configPath);

        // Generate API
        console.log("Generating API...");
        const schemaPath = await findPonderSchema();
        if (!schemaPath) {
            console.error("No ponder schema file found.");
            return;
        }
        const apiOutputDir = path.join(path.dirname(configPath), "src", "api");
        await generateAPI(schemaPath, apiOutputDir);

        console.log("All components generated successfully!");
    } catch (error) {
        console.error("An error occurred during generation:", error);
    }
}
