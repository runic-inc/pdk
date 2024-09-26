import fs from 'fs/promises';
import ts from 'typescript';

export function createImport(imports: string, module: string) {
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

export async function writeTsFile(tsStatements: ts.Statement[], filename: string) {
    const sourceFile = ts.factory.createSourceFile(
        tsStatements,
        ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
        ts.NodeFlags.None
    );
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(sourceFile);
    const formatted = result;//await prettier.format(result, { parser: 'typescript' });
    fs.writeFile(filename, formatted, 'utf-8');
}

// export async function writeTsFile(tsStatements: ts.Statement[], filename: string) {
//     const sourceFile = ts.createSourceFile(
//         filename,
//         '',
//         ts.ScriptTarget.Latest,
//         false,
//         ts.ScriptKind.TS
//     );

//     const printer = ts.createPrinter({
//         newLine: ts.NewLineKind.LineFeed,
//         removeComments: false,
//     });

//     const result = tsStatements.map(statement =>
//         printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile)
//     ).join('\n\n');

//     await fs.writeFile(filename, result, 'utf-8');
// }