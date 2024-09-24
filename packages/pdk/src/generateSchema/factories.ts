
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
    const columns = createTableProcessInputs(abiEvent.inputs);

    return createTableProperty(`${contractName}_${abiEvent.name}`, [...requiredColumns, ...columns.filter((column) => column !== undefined)] as ts.PropertyAssignment[]);
}

function createTableProcessInputs(inputs: AbiEvent['inputs'], prefix = ''): ts.PropertyAssignment[] {
    return inputs.flatMap((input) => {
        const fullName = prefix ? `${prefix}_${input.name}` : input.name ?? '';
        switch (input.type) {
            case "address":
            case "bytes":
                if (!input.name) return [];
                return [createColumn(fullName, 'p.hex()')];
            case "bool":
                if (!input.name) return [];
                return [createColumn(fullName, 'p.boolean()')];
            case "string":
                if (!input.name) return [];
                return [createColumn(fullName, 'p.string()')];
            case "uint8":
                if (!input.name) return [];
                return [createColumn(fullName, 'p.int()')];
            case "uint256":
                if (!input.name) return [];
                return [createColumn(fullName, 'p.bigint()')];
            case "tuple":
                if ('components' in input && Array.isArray(input.components)) {
                    return createTableProcessInputs(input.components, fullName);
                }
                return [];
            // ToDo. Need to work out which ones will appear in events
            // // type list
            //     BOOLEAN,  ///< A Boolean type (true or false).
            //     INT8,     ///< An 8-bit signed integer.
            //     INT16,    ///< A 16-bit signed integer.
            //     INT32,    ///< A 32-bit signed integer.
            //     INT64,    ///< A 64-bit signed integer.
            //     INT128,   ///< A 128-bit signed integer.
            //     INT256,   ///< A 256-bit signed integer.
            //     UINT8,    ///< An 8-bit unsigned integer.
            //     UINT16,   ///< A 16-bit unsigned integer.
            //     UINT32,   ///< A 32-bit unsigned integer.
            //     UINT64,   ///< A 64-bit unsigned integer.
            //     UINT128,  ///< A 128-bit unsigned integer.
            //     UINT256,  ///< A 256-bit unsigned integer.
            //     CHAR8,    ///< An 8-character string (64 bits).
            //     CHAR16,   ///< A 16-character string (128 bits).
            //     CHAR32,   ///< A 32-character string (256 bits).
            //     CHAR64,   ///< A 64-character string (512 bits).
            //     LITEREF,  ///< A 64-bit Literef reference to a patchwork fragment.
            //     ADDRESS,  ///< A 160-bit address.
            //     STRING    ///< A dynamically-sized string.

            default:
                console.log("didn't match ", input.type);
                return [];
        }
    });
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