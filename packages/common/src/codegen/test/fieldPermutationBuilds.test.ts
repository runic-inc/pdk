import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { ContractConfig, Feature, FieldConfig, FieldTypeEnum } from "../../types";
import { ContractSchemaImpl } from "../contractSchema";
import { MainContractGen } from "../mainContractGen";
import { UserContractGen } from "../userContractGen";

function generateFieldPermutations(): FieldConfig[][] {
    const fieldTypes = Object.values(FieldTypeEnum)
      .filter(value => typeof value === 'string' && value !== 'empty' && value !== 'CHAR64') as string[];
    let permutations: FieldConfig[][] = [];
  
    fieldTypes.forEach((fieldType, index) => {
      let actualFieldType = fieldType === 'BOOLEAN' ? 'bool' : fieldType;
      actualFieldType = actualFieldType.toLowerCase();
      
      // Single field
      permutations.push([{
        id: 1,
        key: `field_${actualFieldType}`,
        fieldType: actualFieldType,
        description: `A single ${actualFieldType} field`,
      }]);
  
      // Array field (exclude for 'string' type)
      if (actualFieldType !== 'string') {
        permutations.push([{
          id: 1,
          key: `array_${actualFieldType}`,
          fieldType: actualFieldType,
          arrayLength: 4,
          description: `An array of ${actualFieldType} fields`,
        }]);
      }
    });
  
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
    features: [Feature.MINTABLE, Feature.LITEREF],
  };

  const fieldPermutations = generateFieldPermutations();

  return fieldPermutations.map((fields) => ({
    ...baseConfig,
    fields,
  }));
}

describe("Generate and Build Contract Schema Field Permutations", () => {
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
      fs.readdirSync(dir).forEach(file => fs.unlinkSync(path.join(dir, file)));
    });

    // Clear contents of generated_contracts, preserving remappings.txt and foundry.toml
    fs.readdirSync(outputDir).forEach(file => {
      if (file !== 'remappings.txt' && file !== 'foundry.toml') {
        fs.unlinkSync(path.join(outputDir, file));
      }
    });
  });

  it("should generate, save, and build all contract schema field permutations", async () => {
    console.log("Generating contract schema field permutations...");

    const permutations = generateContractSchemaPermutations();
    const mainContractGen = new MainContractGen();
    const userContractGen = new UserContractGen();

    let errors: string[] = [];

    for (let index = 0; index < permutations.length; index++) {
      const config = permutations[index];
      console.log(`Processing field permutation ${index}:`, config);
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
              console.error(stderr);
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

    console.log(`Total field permutations processed: ${permutations.length}`);
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
});