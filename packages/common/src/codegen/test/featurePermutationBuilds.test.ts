import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { ContractConfig, Feature, FieldConfig } from "../../types";
import { ContractSchemaImpl } from "../contractSchema";
import { MainContractGen } from "../mainContractGen";
import { UserContractGen } from "../userContractGen";

function generateField(features: Feature[]): FieldConfig[] {
  const fields: FieldConfig[] = [
    {
      id: 1,
      key: "single_char_field",
      type: "char16",
      description: "A single char field",
    },
  ];

  // Special case for DYNAMICREFLIBRARY feature
  if (features.includes(Feature.DYNAMICREFLIBRARY)) {
    fields.push({
      id: fields.length + 1,
      key: 'dynamic_literef',
      type: 'literef',
      arrayLength: 0,
      description: 'Dynamic literef array for DYNAMICREFLIBRARY feature',
    });
  }

  return fields;
}

function generateFeaturePermutations(): Feature[][] {
  const baseFeatures = [Feature.MINTABLE, Feature.LITEREF];
  const patchTypes = [Feature.PATCH, Feature["1155PATCH"], Feature.ACCOUNTPATCH];
  const fragmentTypes = [Feature.FRAGMENTMULTI, Feature.FRAGMENTSINGLE];

  let permutations: Feature[][] = [[]];

  // Add base features
  baseFeatures.forEach((feature) => {
    permutations = permutations.flatMap((perm) => [perm, [...perm, feature]]);
  });

  // Add patch types (mutually exclusive)
  permutations = permutations.flatMap((perm) => [
    perm,
    ...patchTypes.map((patchType) => [...perm, patchType]),
  ]);

  // Add fragment types (mutually exclusive)
  permutations = permutations.flatMap((perm) => [
    perm,
    ...fragmentTypes.map((fragmentType) => [...perm, fragmentType]),
  ]);

  // Add REVERSIBLE only to permutations with a patch type
  permutations = permutations.flatMap((perm) =>
    patchTypes.some((patch) => perm.includes(patch))
      ? [perm, [...perm, Feature.REVERSIBLE]]
      : [perm]
  );

  // Add WEAKREF only to permutations with FRAGMENTSINGLE
  permutations = permutations.flatMap((perm) =>
    perm.includes(Feature.FRAGMENTSINGLE)
      ? [perm, [...perm, Feature.WEAKREF]]
      : [perm]
  );

  // Add DYNAMICREFLIBRARY only to permutations with LITEREF
  permutations = permutations.flatMap((perm) =>
    perm.includes(Feature.LITEREF)
      ? [perm, [...perm, Feature.DYNAMICREFLIBRARY]]
      : [perm]
  );

  return permutations;
}

function generateContractSchemaPermutations(): ContractConfig[] {
  const baseConfig: ContractConfig = {
    scopeName: "TestScope",
    name: "TestContract",
    symbol: "TST",
    baseURI: "https://example.com/",
    schemaURI: "https://example.com/schema",
    imageURI: "https://example.com/image",
    fields: [],
    features: [],
    fragments: []
  };

  const featurePermutations = generateFeaturePermutations();

  return featurePermutations.map((features) => ({
    ...baseConfig,
    fields: generateField(features),
    features,
  }));
}

function removeDirectoryRecursive(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        removeDirectoryRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

describe("Generate and Build Contract Schema Permutations", () => {
  const outputDir = path.join(__dirname, "generated_contracts");
  const schemaNoVerifyDir = path.join(__dirname, "schema_noverify");
  const schemaNoBuildDir = path.join(__dirname, "schema_nobuild");

  beforeAll(() => {
    // Create directories if they don't exist
    [outputDir, schemaNoVerifyDir, schemaNoBuildDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Clear contents of schema_noverify and schema_nobuild
    [schemaNoVerifyDir, schemaNoBuildDir].forEach(dir => {
      removeDirectoryRecursive(dir);
      fs.mkdirSync(dir);
    });

    // Clear contents of generated_contracts, preserving remappings.txt and foundry.toml
    fs.readdirSync(outputDir).forEach(file => {
      const filePath = path.join(outputDir, file);
      if (file !== 'remappings.txt' && file !== 'foundry.toml') {
        if (fs.lstatSync(filePath).isDirectory()) {
          removeDirectoryRecursive(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
    });
  });

  it("should generate, save, and build all contract schema permutations", async () => {
    console.log("Generating contract schema permutations...");

    const permutations = generateContractSchemaPermutations();
    const mainContractGen = new MainContractGen();
    const userContractGen = new UserContractGen();

    let errors: string[] = [];

    for (let index = 0; index < permutations.length; index++) {
//      if (index > 1) {
//        break;
//      }
      const config = permutations[index];
      console.log(`Processing permutation ${index}:`, config);
      const schema = new ContractSchemaImpl(config);
      
      try {
        schema.validate();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Schema validation failed for contract ${index}:`, errorMessage);
        fs.writeFileSync(path.join(schemaNoVerifyDir, `schema_${index}.json`), JSON.stringify(config, null, 2));
        errors.push(`Schema validation failed for contract ${index}: ${errorMessage}`);
        continue; // Skip to the next permutation
      }

      try {
        const mainCode = mainContractGen.gen(schema);
        const userCode = userContractGen.gen(schema);
        const mainFileName = path.join(outputDir, `TestContractGenerated.sol`);
        const userFileName = path.join(outputDir, `TestContract.sol`);
        fs.writeFileSync(mainFileName, mainCode);
        fs.writeFileSync(userFileName, userCode);
        console.log(`Generated contract ${index}`);

        // Call forge build
        await new Promise<void>((resolve, reject) => {
          exec('forge build', { cwd: outputDir }, (error, stdout, stderr) => {
            if (error) {
              console.error(`forge build failed for contract ${index}:`);
              console.error(error);
              fs.writeFileSync(path.join(schemaNoBuildDir, `schema_${index}.json`), JSON.stringify(config, null, 2));
              errors.push(`forge build failed for contract ${index}: ${stderr}`);
              resolve(); // Resolve even on error to continue processing
            } else {
              console.log(`Successfully built contract ${index}`);
              resolve();
            }
          });
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error in contract ${index}:`, errorMessage);
        errors.push(`Error in contract ${index}: ${errorMessage}`);
      } finally {
        // Clean up .sol files after each attempt
        const mainFileName = path.join(outputDir, `TestContractGenerated.sol`);
        const userFileName = path.join(outputDir, `TestContract.sol`);
        if (fs.existsSync(mainFileName)) fs.unlinkSync(mainFileName);
        if (fs.existsSync(userFileName)) fs.unlinkSync(userFileName);
      }

      // Add a small delay between iterations to allow for any pending I/O operations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Total permutations processed: ${permutations.length}`);
    console.log(`Total errors encountered: ${errors.length}`);

    if (errors.length > 0) {
      console.error("Errors encountered during processing:");
      errors.forEach((error, index) => {
        console.error(`${index + 1}: ${error}`);
      });
      throw new Error(`${errors.length} errors encountered during processing`);
    }

    expect(permutations.length).toBeGreaterThan(0);
  });

  afterAll(() => {
    // Clean up after all tests
    removeDirectoryRecursive(path.join(outputDir, 'out'));
    removeDirectoryRecursive(path.join(outputDir, 'cache'));
  });
});