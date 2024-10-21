
import fs from 'fs/promises';
import prettier from 'prettier';
import ts from 'typescript';
import { AbiEvent } from 'viem';
import { createImport } from '../helpers/factories';

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
    await fs.writeFile(schemaFile, await prettier.format(result, { parser: "typescript", tabWidth: 4 }), 'utf8');
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

export function createTableFromAbiEvent(contractName: string, abiEvent: AbiEvent) {
    const requiredColumns = [
        createColumn('id', 'p.bigint()'),
    ];
    const columns = createTableProcessInputs(abiEvent.inputs);

    return createTableProperty(`${contractName}_${abiEvent.name}`, [...requiredColumns, ...columns.filter((column) => column !== undefined)] as ts.PropertyAssignment[]);
}

export function createTableFromObject(tableName: string, fields: { key: string, value: string }[]) {
    // Check if a timestamp field already exists
    const hasTimestamp = fields.some(field => field.key === 'timestamp');

    // If there's no timestamp field, add one
    if (!hasTimestamp) {
        fields.push({ key: 'timestamp', value: 'p.bigint()' });
    }

    const columns = fields.map((entry) => {
        return createColumn(entry.key, entry.value);
    });

    // Create an index for the timestamp field
    const indexes = {
        timestampIndex: ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier('timestampIndex'),
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('p'),
                    ts.factory.createIdentifier('index')
                ),
                undefined,
                [ts.factory.createStringLiteral('timestamp')]
            )
        )
    };

    return createTableProperty(tableName, columns, indexes);
}

export function createEnumFromObject(enumName: string, values: string[]) {
    const factory = ts.factory;
    return factory.createPropertyAssignment(
        factory.createIdentifier(enumName),
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier('p'),
                factory.createIdentifier('createEnum')
            ),
            undefined,
            [factory.createArrayLiteralExpression(values.map((value) => factory.createStringLiteral(value)), true)]
        )
    );
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

// this function could be better named. Take a pass after we have a more finished schema generator
function createTableProperty(tableName: string, columns: ts.PropertyAssignment[], indexes?: Record<string, ts.PropertyAssignment>) {
    const factory = ts.factory;
    const tableDefinition = factory.createObjectLiteralExpression(columns, true);

    let args: ts.Expression[] = [tableDefinition];

    if (indexes && Object.keys(indexes).length > 0) {
        const indexesObject = factory.createObjectLiteralExpression(
            Object.values(indexes),
            true
        );
        args.push(indexesObject);
    }

    return factory.createPropertyAssignment(
        factory.createIdentifier(tableName),
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier('p'),
                factory.createIdentifier('createTable')
            ),
            undefined,
            args
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

// function print(node: ts.Node) {
//     const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
//     const sourceFile = ts.createSourceFile(
//         'schema.ts',
//         '',
//         ts.ScriptTarget.Latest,
//         false,
//         ts.ScriptKind.TS
//     );
//     return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
// }


export function generalDBStructure(): ts.PropertyAssignment[] {
    const enums: Record<string, string[]> = {
        "PatchType": ["PATCH", "ERC1155", "ACCOUNT"],
        "LogType": ["ADD", "REMOVE"],
        "FeeChangeType": ["PROPOSE", "COMMIT"],
        "AssignType": ["ASSIGN", "UNASSIGN"],
        "SchemaTypes": [
            "BOOLEAN",
            "INT8",
            "INT16",
            "INT32",
            "INT64",
            "INT128",
            "INT256",
            "UINT8",
            "UINT16",
            "UINT32",
            "UINT64",
            "UINT128",
            "UINT256",
            "CHAR8",
            "CHAR16",
            "CHAR32",
            "CHAR64",
            "LITEREF",
            "ADDRESS",
            "STRING"
        ]
    }
    const tables: Record<string, { key: string; value: string; }[]> = {
        Chain: [
            { key: "id", value: "p.string()" }, // making this a string as the trpc generation doesn't know about column types. Ideally should be p.int()
            { key: "name", value: "p.string()" },
            { key: "namespace", value: "p.string()" },
            { key: "patchworkAddress", value: "p.hex()" }
        ],
        Block: [
            { key: "id", value: "p.string()" },
            { key: "extraData", value: "p.hex()" },
            { key: "number", value: "p.bigint()" },
            { key: "timestamp", value: "p.bigint()" },
            { key: "chainId", value: "p.string().references('Chain.id')" }
        ],
        Tx: [
            { key: "id", value: "p.string()" },
            { key: "blockId", value: "p.string().references('Block.id')" },
            { key: "timestamp", value: "p.bigint()" },
            { key: "fromId", value: "p.string().references('Address.id')" },
            { key: "nonce", value: "p.int()" },
            { key: "toId", value: "p.string().references('Address.id').optional()" },
            { key: "txIndex", value: "p.int()" },
            { key: "value", value: "p.bigint()" },
            { key: "chainId", value: "p.string().references('Chain.id')" }
        ],
        GlobalAddress: [
            { key: "id", value: "p.string()" }, // making this a string as the trpc generation doesn't know about column types. possibly should be p.hex()
            { key: "address", value: "p.hex()" },
            { key: "addresses", value: "p.many('Address.addressId')" }
        ],
        Address: [
            { key: "id", value: "p.string()" },
            { key: "addressId", value: "p.string().references('GlobalAddress.id')" },
            { key: "chainId", value: "p.string().references('Chain.id')" },
            { key: "type", value: "p.string()" },
            { key: "txsFrom", value: "p.many('Tx.fromId')" },
            { key: "txsTo", value: "p.many('Tx.toId')" },
            { key: "searchable", value: "p.string().optional()" }
        ],
        Scope: [
            { key: "id", value: "p.string()" },
            { key: "name", value: "p.string()" },
            { key: "addressId", value: "p.string().references('Address.id')" },
            { key: "address", value: "p.one('addressId')" },
            { key: "txId", value: "p.string().references('Tx.id')" },
            { key: "tx", value: "p.one('txId')" },
            { key: "chainId", value: "p.string().references('Chain.id')" },
            { key: "chain", value: "p.one('chainId')" }
        ]
    }

    const enumEntities = Object.entries(enums).map(([key, value]) => { return createEnumFromObject(key, value) });
    const tableEntities = Object.entries(tables).map(([key, value]) => { return createTableFromObject(key, value) });

    return [...enumEntities, ...tableEntities];
} 
