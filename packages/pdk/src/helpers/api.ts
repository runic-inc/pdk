import path from 'path';
import * as ts from 'typescript';
import { ErrorCode, PDKError } from './error';
import { logger } from './logger';

interface APIRoute {
    name: string;
    type: 'query' | 'mutation' | 'subscription';
}

interface APIStructure {
    [key: string]: APIRoute | APIStructure;
}

export function analyzeAPI(filePath: string): APIStructure {
    const configPath = ts.findConfigFile(path.dirname(filePath), ts.sys.fileExists, 'tsconfig.json');
    if (!configPath) {
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Could not find a valid 'tsconfig.json' at ${configPath}`);
    }
    logger.debug('Found tsconfig at:', configPath);

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
    const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));

    const program = ts.createProgram(fileNames, options);
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) {
        throw new PDKError(ErrorCode.FILE_NOT_FOUND, `Could not find source file at ${filePath}`);
    }

    const apiStructure: APIStructure = {};
    logger.debug('Starting analysis of file:', filePath);

    function analyzeNode(node: ts.Node) {
        if (ts.isVariableStatement(node)) {
            const declaration = node.declarationList.declarations[0];
            if (ts.isIdentifier(declaration.name) && declaration.name.text === 'api') {
                logger.debug('Found api variable declaration');
                if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
                    extractAPIStructure(declaration.initializer, apiStructure);
                }
            }
        }
        ts.forEachChild(node, analyzeNode);
    }

    function extractAPIStructure(node: ts.ObjectLiteralExpression, structure: APIStructure) {
        logger.debug('Extracting API structure');
        node.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const routerName = prop.name.text;
                logger.debug('Found router:', routerName);
                if (ts.isCallExpression(prop.initializer) && ts.isIdentifier(prop.initializer.expression) && prop.initializer.expression.text === 'router') {
                    extractRouterProcedures(prop.initializer, structure, routerName);
                }
            }
        });
    }

    function extractRouterProcedures(node: ts.CallExpression, structure: APIStructure, routerName: string) {
        logger.debug('Extracting procedures for router:', routerName);
        if (node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
            extractProcedures(node.arguments[0], structure, routerName);
        }
    }

    function extractProcedures(node: ts.ObjectLiteralExpression, structure: APIStructure, routerName: string) {
        node.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                const procedureName = prop.name.text;
                const fullName = `${routerName}.${procedureName}`;
                const procedureType = getProcedureType(prop.initializer);
                structure[fullName] = {
                    name: procedureName,
                    type: procedureType,
                };
                logger.debug('Added procedure:', fullName, 'with type:', procedureType);
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
        return 'query';
    }

    analyzeNode(sourceFile);
    return apiStructure;
}
