import fs from 'fs/promises';
import prettier from 'prettier';
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
    const formatted = await prettier.format(result, { parser: 'typescript', tabWidth: 4 });
    await fs.writeFile(filename, formatted, 'utf-8');
}
