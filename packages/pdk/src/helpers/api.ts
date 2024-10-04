import path from 'path';
import * as ts from 'typescript';

interface APIRoute {
    name: string;
    type: 'query' | 'mutation' | 'subscription';
    inputType: string;
    outputType: string;
}

interface APIStructure {
    [key: string]: APIRoute | APIStructure;
}

export function analyzeAPI(filePath: string): APIStructure {
    const configPath = ts.findConfigFile(
        path.dirname(filePath),
        ts.sys.fileExists,
        'tsconfig.json'
    );

    if (!configPath) {
        throw new Error("Could not find a valid 'tsconfig.json'.");
    }
    console.log("Found tsconfig at:", configPath);

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

    const apiStructure: APIStructure = {};

    function analyzeNode(node: ts.Node) {
        if (ts.isVariableStatement(node)) {
            const declaration = node.declarationList.declarations[0];
            if (ts.isIdentifier(declaration.name) && declaration.name.text === 'appRouter') {
                if (declaration.initializer && ts.isCallExpression(declaration.initializer)) {
                    extractRouterStructure(declaration.initializer, apiStructure);
                }
            }
        }
        ts.forEachChild(node, analyzeNode);
    }

    function extractRouterStructure(node: ts.CallExpression, structure: APIStructure) {
        if (node.arguments.length > 0) {
            const arg = node.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
                arg.properties.forEach(prop => {
                    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                        const routerName = prop.name.text;
                        extractRouterProcedures(prop.initializer, structure, routerName);
                    }
                });
            }
        }
    }

    function extractRouterProcedures(node: ts.Expression, structure: APIStructure, routerName: string) {
        if (ts.isIdentifier(node)) {
            // The router might be a reference to a variable
            const symbol = typeChecker.getSymbolAtLocation(node);
            if (symbol && symbol.valueDeclaration) {
                const declaration = symbol.valueDeclaration;
                if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
                    extractRouterProcedures(declaration.initializer, structure, routerName);
                }
            }
        } else if (ts.isCallExpression(node)) {
            // The router might be a function call (like createTRPCRouter)
            if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
                extractProcedures(node.arguments[0], structure, routerName);
            }
        }
    }

    function extractProcedures(node: ts.ObjectLiteralExpression, structure: APIStructure, routerName: string) {
        console.log(`Extracting procedures for router: ${routerName}`);
        node.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const procedureName = prop.name.text;
                const fullName = `${routerName}.${procedureName}`;
                const procedureType = getProcedureType(prop.initializer);
                const { inputType, outputType } = extractProcedureTypes(prop.initializer);
                structure[fullName] = {
                    name: procedureName,
                    type: procedureType,
                    inputType,
                    outputType
                };
                console.log(`Added procedure: ${fullName}`);
            }
        });
    }

    function getProcedureType(node: ts.Expression): 'query' | 'mutation' | 'subscription' {
        if (ts.isCallExpression(node)) {
            const expression = node.expression;
            if (ts.isPropertyAccessExpression(expression)) {
                const name = expression.name.text;
                if (name === 'query') return 'query';
                if (name === 'mutation') return 'mutation';
                if (name === 'subscription') return 'subscription';
            }
        }
        return 'query'; // Default to query if we can't determine
    }

    function extractProcedureTypes(node: ts.Expression): { inputType: string; outputType: string } {
        let inputType = 'unknown';
        let outputType = 'unknown';

        if (ts.isCallExpression(node)) {
            const signature = typeChecker.getResolvedSignature(node);
            if (signature) {
                const returnType = typeChecker.getReturnTypeOfSignature(signature);
                const typeString = typeChecker.typeToString(returnType);

                const inputMatch = typeString.match(/input\s*:\s*([^;]+);/);
                const outputMatch = typeString.match(/output\s*:\s*([^}]+)}/s);

                if (inputMatch) {
                    inputType = inputMatch[1].trim();
                }
                if (outputMatch) {
                    outputType = outputMatch[1].trim();
                }

                // Clean up the types
                inputType = cleanType(inputType);
                outputType = cleanType(outputType);
            }
        }

        return { inputType, outputType };
    }

    function cleanType(type: string): string {
        // Handle template literal types
        type = type.replace(/`0x\$\{string\}`/g, '"0x${string}"');

        // Remove newlines and extra spaces
        type = type.replace(/\s+/g, ' ').trim();

        // Ensure object types are properly closed
        let openBraces = 0;
        for (let char of type) {
            if (char === '{') openBraces++;
            if (char === '}') openBraces--;
        }
        type += '}'.repeat(openBraces);

        return type;
    }

    analyzeNode(sourceFile);
    return apiStructure;
}