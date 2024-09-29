import path from 'path';
import { register } from 'ts-node';
import * as tsConfigPaths from 'tsconfig-paths';
import { importPatchworkConfig } from '../helpers/config';


import * as ts from 'typescript';
import * as fs from 'fs';



function analyzeTypeScript(filePath: string) {

    const configPath = ts.findConfigFile(
        path.dirname(filePath),
        ts.sys.fileExists,
        'tsconfig.json'
      );
      
      if (!configPath) {
        throw new Error("Could not find a valid 'tsconfig.json'.");
      }
      console.log(configPath);

      const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options, fileNames } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath)
  );

  const program = ts.createProgram(fileNames, options);
  const typeChecker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`Could not find source file: ${filePath}`);
  }
//   // Read the file
//   const fileContents = fs.readFileSync(filePath, 'utf8');

//   // Create a SourceFile object
//   const sourceFile = ts.createSourceFile(
//     filePath,
//     fileContents,
//     ts.ScriptTarget.Latest,
//     true
//   );

//   // Create a program
//   const program = ts.createProgram([filePath], {});
//   const typeChecker = program.getTypeChecker();

  // Function to recursively analyze nodes
  function analyzeNode(node: ts.Node) {
    // console.log(node.getText());

    if (ts.isTypeAliasDeclaration(node) && node.name?.text === 'AppRouter') {
        console.log(`Found AppRouter type alias: ${node.name?.text}`);
        console.log(`  Node: ${node.getText()}`);
        const type = typeChecker.getTypeAtLocation(node);
        // exploreType(type);
        const appRouterType = typeChecker.typeToString(type);
        analyzeType(type,node);
        console.log(`Found AppRouter type: ${appRouterType}`);
    }
    if (ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) {
      console.log(`Found ${ts.isInterfaceDeclaration(node) ? 'interface' : 'class'}: ${node.name?.text}`);
      node.members.forEach(member => {
        if (ts.isPropertySignature(member) || ts.isMethodSignature(member)) {
          const type = typeChecker.getTypeAtLocation(member);
          console.log(`  Member ${member.name.getText()}: ${typeChecker.typeToString(type)}`);
        }
      });
    }

    ts.forEachChild(node, analyzeNode);
  }

  function analyzeType(type: ts.Type, node: ts.Node) {
    if (type.isUnion()) {
      console.log('Union type with the following types:');
      type.types.forEach(t => analyzeType(t, node));
    } else if (type.isIntersection()) {
      console.log('Intersection type with the following types:');
      type.types.forEach(t => analyzeType(t, node));
    } else if (type.isClassOrInterface()) {
      console.log('Class or Interface type:');
      type.getProperties().forEach(prop => {
        const propType = typeChecker.getTypeOfSymbolAtLocation(prop, node);
        console.log(`  ${prop.name}: ${typeChecker.typeToString(propType)}`);
      });
    } else if (type.isLiteral()) {
      console.log(`Literal type: ${type.value}`);
    } else {
      console.log(`Other type: ${typeChecker.typeToString(type)}`);
    }
  }

  function buildTypeObject(type: ts.Type, node: ts.Node): any {
    if (type.isUnion()) {
      return {
        kind: 'union',
        types: type.types.map(t => buildTypeObject(t, node))
      };
    } else if (type.isIntersection()) {
      return {
        kind: 'intersection',
        types: type.types.map(t => buildTypeObject(t, node))
      };
    } else if (type.isClassOrInterface()) {
      const properties: {[key: string]: any} = {};
      type.getProperties().forEach(prop => {
        const propType = typeChecker.getTypeOfSymbolAtLocation(prop, node);
        properties[prop.name] = buildTypeObject(propType, node);
      });
      return {
        kind: 'classOrInterface',
        properties
      };
    } else if (type.isLiteral()) {
      return {
        kind: 'literal',
        value: type.value
      };
    } else {
      return {
        kind: 'other',
        typeString: typeChecker.typeToString(type)
      };
    }
  }

  function exploreType(type: ts.Type, node: ts.Node, indent: string = '', depth: number = 0) {
    if (depth > 5) {  // Limit recursion depth
        console.log(`${indent}(Max depth reached)`);
        return;
      }
    
      console.log(`${indent}Type: ${typeChecker.typeToString(type)}`);
      
      if (type.isUnion()) {
        console.log(`${indent}Union type:`);
        type.types.forEach((t, i) => {
          console.log(`${indent}  Type ${i + 1}:`);
          exploreType(t, node, indent + '    ', depth + 1);
        });
      } else if (type.isIntersection()) {
        console.log(`${indent}Intersection type:`);
        type.types.forEach((t, i) => {
          console.log(`${indent}  Type ${i + 1}:`);
          exploreType(t, node, indent + '    ', depth + 1);
        });
      } else {
        const properties = typeChecker.getPropertiesOfType(type);
        if (properties.length > 0) {
          console.log(`${indent}Properties:`);
          properties.forEach(prop => {
            const propType = typeChecker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration || prop.declarations?.[0] || node);
            console.log(`${indent}  ${prop.name}: ${typeChecker.typeToString(propType)}`);
            if (isComplexType(propType)) {
              exploreType(propType, node, indent + '    ', depth + 1);
            }
          });
        }
      }
    
      // Add exploration of call signatures
      const callSignatures = type.getCallSignatures();
      if (callSignatures.length > 0) {
        console.log(`${indent}Call Signatures:`);
        callSignatures.forEach((sig, i) => {
          console.log(`${indent}  Signature ${i + 1}: ${typeChecker.signatureToString(sig)}`);
        });
      }
    
      // Add exploration of construct signatures
      const constructSignatures = type.getConstructSignatures();
      if (constructSignatures.length > 0) {
        console.log(`${indent}Construct Signatures:`);
        constructSignatures.forEach((sig, i) => {
          console.log(`${indent}  Signature ${i + 1}: ${typeChecker.signatureToString(sig)}`);
        });
      }
    // console.log(`${indent}Type: ${typeChecker.typeToString(type)}`);
    
    // if (type.isUnion() || type.isIntersection()) {
    //   type.types.forEach((t, i) => {
    //     console.log(`${indent}  Type ${i + 1}:`);
    //     exploreType(t, indent + '    ');
    //   });
    // } else {
    //   const properties = typeChecker.getPropertiesOfType(type);
    //   properties.forEach(prop => {
    //     const propType = typeChecker.getTypeOfPropertyOfType(type, prop.name);
    //     console.log(`${indent}  ${prop.name}: ${typeChecker.typeToString(propType)}`);
    //     if (propType.isObject()) {
    //       exploreType(propType, indent + '    ');
    //     }
    //   });
    // }
  }

  function isComplexType(type: ts.Type): boolean {
    return !(
      type.flags & ts.TypeFlags.Number ||
      type.flags & ts.TypeFlags.String ||
      type.flags & ts.TypeFlags.Boolean ||
      type.flags & ts.TypeFlags.Undefined ||
      type.flags & ts.TypeFlags.Null ||
      type.flags & ts.TypeFlags.Void ||
      type.flags & ts.TypeFlags.Never
    );
  }

//   4. Use getBaseTypes and getConstraint:
// For more complex types, you might need to explore base types and constraints:
function exploreTypeExtended(type: ts.Type, indent: string = '') {
  console.log(`${indent}Type: ${typeChecker.typeToString(type)}`);
  
  const baseTypes = type.getBaseTypes();
  if (baseTypes) {
    console.log(`${indent}Base Types:`);
    baseTypes.forEach(baseType => exploreTypeExtended(baseType, indent + '  '));
  }

  const constraint = typeChecker.getBaseConstraintOfType(type);
  if (constraint) {
    console.log(`${indent}Constraint:`);
    exploreTypeExtended(constraint, indent + '  ');
  }

  // ... rest of type exploration
}
  //

  // Start the analysis
  analyzeNode(sourceFile);
}

// Usage
// const filePath = path.join(__dirname, 'path', 'to', 'your', 'file.ts');
// analyzeTypeScript(filePath);

export async function generateReactHooks(configPath: string) {
    const trpcRouter = path.join(path.dirname(configPath), "src", "api", "index.ts");
    // const abis = await importABIFiles(abiDir);
    // const ponderConfig = path.join(path.dirname(configPath), "ponder.config.ts");

    // const abis = await importABIFiles(abiDir);
    const projectConfig = await importPatchworkConfig(configPath);
    if (!projectConfig) {
        console.error('Error importing ProjectConfig');
        return;
    }

    analyzeTypeScript(trpcRouter);

    // tsConfigPaths.register({
    //     baseUrl: '/tmp/patchworkApp',
    //     paths: {
    //         "@/*": ["./*"]
    //     }
    // });

    // // Register ts-node to handle TypeScript files
    // register({
    //     transpileOnly: true,
    //     compilerOptions: {
    //         module: 'CommonJS',
    //         moduleResolution: 'node',
    //         baseUrl: '/tmp/patchworkApp',
    //         rootDir: '/tmp/patchworkApp',
    //         paths: {
    //             "@/*": ["./*"]
    //         },
    //     }
    // });

    // try {
    //     const module = await import(trpcRouter);
    //     console.log('Module:', module);

    //     if ('AppRouter' in module) {
    //         console.log('AppRouter found in the imported module', module.AppRouter);
    //         // return module.AppRouter;
    //     } else {
    //         throw new Error('AppRouter not found in the imported module');
    //     }
    // } catch (error) {
    //     console.error('Error importing module:', error);
    //     throw error;
    // }

}