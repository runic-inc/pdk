
import ts from 'typescript';
import { AbiEvent } from 'viem';
import fs from 'fs/promises';
import prettier from 'prettier';

export async function createSchemaFile(tableArray: ts.PropertyAssignment[], schemaFile: string) {


    const importDeclaration = createImport('createSchema', '@ponder/core');
    const exportDefault = createSchemaObject(tableArray);

    // Create a new SourceFile with the statements we want
    const sourceFile = ts.factory.createSourceFile(
        [importDeclaration, exportDefault],
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );
    // Create a printer
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    // Print the SourceFile to a string
    const result = printer.printFile(sourceFile);

    // Format with prettier and write the result to a file
    await fs.writeFile(schemaFile, await prettier.format(result, { parser: "typescript" }), 'utf8');
}

function createImport(imports: string, module: string) {
    return ts.factory.createImportDeclaration(
        undefined, // modifiers
        ts.factory.createImportClause(
            false, // isTypeOnly
            undefined, // name
            ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(
                    false, // isTypeOnly
                    undefined, // propertyName
                    ts.factory.createIdentifier(imports)
                )
            ])
        ),
        ts.factory.createStringLiteral(module),
        undefined // assertClause
    );
}

export function createSchemaObject(tableArray: ts.PropertyAssignment[]) {
    const factory = ts.factory;

    const schemaObject = factory.createObjectLiteralExpression(tableArray);

    const arrowFunction = factory.createArrowFunction(
        undefined,
        undefined,
        [factory.createParameterDeclaration(undefined, undefined, factory.createIdentifier('p'))],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createParenthesizedExpression(schemaObject)
    );

    const createSchemaCall = factory.createCallExpression(
        factory.createIdentifier('createSchema'),
        undefined,
        [arrowFunction]
    );

    const exportDefault = factory.createExportAssignment(
        undefined,
        undefined,
        createSchemaCall
    );

    return exportDefault;
}

export function createTable(contractName: string, abiEvent: AbiEvent) {
    const requiredColumns = [
        createColumn('id', 'p.bigint()'),
    ];
    const columns = abiEvent.inputs.map((input) => {
        switch (input.type) {
            case "address":
            case "bytes":
                if (!input.name) return undefined;
                return createColumn(input.name, 'p.hex()');
            case "bool":
                if (!input.name) return undefined;
                return createColumn(input.name, 'p.boolean()');

            case "string":
                if (!input.name) return undefined;
                return createColumn(input.name, 'p.string()');
            case "uint8":
                if (!input.name) return undefined;
                return createColumn(input.name, 'p.int()');
            case "uint256":
                if (!input.name) return undefined;
                return createColumn(input.name, 'p.bigint()');
            case "tuple": // need to add support for tuples
            default:
                console.log("didn't match ", input.type);
                break;
        }
    });

    return createTableProperty(`${contractName}_${abiEvent.name}`, [...requiredColumns, ...columns.filter((column) => column !== undefined)] as ts.PropertyAssignment[]);
}

function createTableProperty(tableName: string, columns: ts.PropertyAssignment[]) {
    const factory = ts.factory;
    return factory.createPropertyAssignment(
        factory.createIdentifier(tableName),
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier('p'),
                factory.createIdentifier('createTable')
            ),
            undefined,
            [factory.createObjectLiteralExpression(columns, true)]
        )
    );
}

function createColumn(name: string, type: string) {
    const factory = ts.factory;
    return factory.createPropertyAssignment(
        factory.createIdentifier(name),
        factory.createIdentifier(type)
    );
}

function print(node: ts.Node) {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const sourceFile = ts.createSourceFile(
        'schema.ts',
        '',
        ts.ScriptTarget.Latest,
        false,
        ts.ScriptKind.TS
    );
    return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}