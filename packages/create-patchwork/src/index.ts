import { ContractSchemaImpl, JSONProjectConfigLoader, JSONSchemaGen, MainContractGen, ProjectConfig, UserContractGen, cleanAndCapitalizeFirstLetter } from "@patchworkdev/common";
import cpy from 'cpy';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import pico from "picocolors";
import { register } from 'ts-node';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFiles(src: string, dest: string, message: string = 'copying from src to dest') {
    console.log(message, src, dest);
    await cpy(path.join(src, '**', '*'), dest, {
        rename: (name) => name.replace(/^_dot_/, '.'),
    });
}

async function generateContract(schema: ContractSchemaImpl, outputDir: string) {
    schema.validate();
    const solidityGenFilename = cleanAndCapitalizeFirstLetter(schema.name) + "Generated.sol";
    const solidityUserFilename = cleanAndCapitalizeFirstLetter(schema.name) + ".sol";
    const jsonFilename = cleanAndCapitalizeFirstLetter(schema.name) + "-schema.json";

    const solidityCode = new MainContractGen().gen(schema);
    const solidityUserCode = new UserContractGen().gen(schema);
    const jsonSchema = new JSONSchemaGen().gen(schema);

    await fs.mkdir(outputDir, { recursive: true });

    let outputPath = path.join(outputDir, solidityGenFilename);
    await fs.writeFile(outputPath, solidityCode);
    console.log(`Solidity gen file generated at ${outputPath}`);

    outputPath = path.join(outputDir, solidityUserFilename);
    try {
        await fs.access(outputPath);
        console.log(`Output file ${outputPath} already exists. Skipping overwrite.`);
    } catch {
        await fs.writeFile(outputPath, solidityUserCode);
        console.log(`Solidity user file generated at ${outputPath}`);
    }

    outputPath = path.join(outputDir, jsonFilename);
    await fs.writeFile(outputPath, jsonSchema);
    console.log(`JSON Schema file generated at ${outputPath}`);
}

async function loadTSConfig(configFile: string): Promise<ProjectConfig> {
    try {
        // Register ts-node
        register({
            transpileOnly: true,
            compilerOptions: {
                module: 'ESNext',
                moduleResolution: 'node',
            },
        });

        // Dynamically import the TypeScript file
        const configModule = await import(configFile);
        return configModule.default || configModule;
    } catch (err: any) {
        console.error("Error loading TypeScript config:", err.message);
        if (err.stack) console.error(err.stack);
        throw err;
    }
}

async function generateContractsFromConfig(configPath: string, outputDir: string) {
    let projectConfig: ProjectConfig;

    if (configPath.endsWith('.ts')) {
        projectConfig = await loadTSConfig(configPath);
    } else if (configPath.endsWith('.json')) {
        const configContent = await fs.readFile(configPath, 'utf8');
        projectConfig = new JSONProjectConfigLoader().load(configContent);
    } else {
        throw new Error("Invalid config file type. Please provide a .ts or .json file.");
    }

    for (const [contractName, contractConfig] of Object.entries(projectConfig.contracts)) {
        const schema = new ContractSchemaImpl(contractConfig);
        await generateContract(schema, outputDir);
    }
}

(async () => {
    try {
        const templateProject = 'ponder_next';
        const targetPath = process.cwd();
        const targetDir = path.join(targetPath, 'patchworkApp');
        const templatePath = path.join(__dirname, '', 'templates', templateProject);

        // Copy the template project
        await copyFiles(templatePath, targetDir, "Copying example app to templates path:");

        // Generate contracts from patchwork.config.ts
        const configPath = path.join(targetDir, 'patchwork.config.ts');
        const targetContractDir = path.join(targetDir, 'contracts', 'src');
        await generateContractsFromConfig(configPath, targetContractDir);

        // Install dependencies, init git repo, and build with forge
        //await installNodeDependencies(targetDir);
        //await initGitRepo(targetDir);
        //await forgeBuild(targetDir);

        console.log(pico.green("Patchwork app created successfully!"));
    } catch (e) {
        console.error(pico.red("Error creating Patchwork app:"), e);
    }
})();