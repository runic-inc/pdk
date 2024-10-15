import path from 'path';
import * as ts from 'typescript';

interface APIRoute {
    name: string;
    type: 'query' | 'mutation' | 'subscription';
    // inputType: string;
    // outputType: string;
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

    console.log("Starting analysis of file:", filePath);

    function analyzeNode(node: ts.Node) {
        if (ts.isVariableStatement(node)) {
            const declaration = node.declarationList.declarations[0];
            if (ts.isIdentifier(declaration.name) && declaration.name.text === 'api') {
                console.log("Found api variable declaration");
                if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
                    extractAPIStructure(declaration.initializer, apiStructure);
                }
            }
        }
        ts.forEachChild(node, analyzeNode);
    }

    function extractAPIStructure(node: ts.ObjectLiteralExpression, structure: APIStructure) {
        console.log("Extracting API structure");
        node.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const routerName = prop.name.text;
                console.log("Found router:", routerName);
                if (ts.isCallExpression(prop.initializer) &&
                    ts.isIdentifier(prop.initializer.expression) &&
                    prop.initializer.expression.text === 'router') {
                    extractRouterProcedures(prop.initializer, structure, routerName);
                }
            }
        });
    }

    function extractRouterProcedures(node: ts.CallExpression, structure: APIStructure, routerName: string) {
        console.log("Extracting procedures for router:", routerName);
        if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
            extractProcedures(node.arguments[0], structure, routerName);
        }
    }

    function extractProcedures(node: ts.ObjectLiteralExpression, structure: APIStructure, routerName: string) {
        node.properties.forEach(prop => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const procedureName = prop.name.text;
                const fullName = `${routerName}.${procedureName}`;
                console.log("Found procedure:", fullName);
                const procedureType = getProcedureType(prop.initializer);
                structure[fullName] = {
                    name: procedureName,
                    type: procedureType,
                    // inputType: 'unknown', // We'll skip detailed type extraction for now
                    // outputType: 'unknown'
                };
                console.log("Added procedure:", fullName, "with type:", procedureType);
            }
        });
    }

    function getProcedureType(node: ts.Expression): 'query' | 'mutation' | 'subscription' {
        if (ts.isCallExpression(node)) {
            let current = node;
            while (ts.isCallExpression(current)) {
                if (ts.isPropertyAccessExpression(current.expression)) {
                    const name = current.expression.name.text;
                    if (name === 'query') return 'query';
                    if (name === 'mutation') return 'mutation';
                    if (name === 'subscription') return 'subscription';
                }
                current = current.expression as ts.CallExpression;
            }
        }
        return 'query'; // Default to query if we can't determine
    }


    analyzeNode(sourceFile);
    console.log("API Structure:", apiStructure);
    return apiStructure;
}