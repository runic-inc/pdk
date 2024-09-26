import ts from 'typescript';
import { createImport, writeTsFile } from '../helpers/factories';

function createASTFromSnippet(codeSnippet: string): ts.SourceFile {
    return ts.createSourceFile(
        'snippet.ts', // Using the same filename every time
        codeSnippet,
        ts.ScriptTarget.Latest,
        true
    );
}

function extractFunctionBody(codeSnippet: string): ts.Block | undefined {
    const sourceFile = createASTFromSnippet(codeSnippet);
    const functionDeclaration = sourceFile.statements.find(
        (node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node)
    );
    return functionDeclaration?.body;
}

export function createPonderEventFile(tsArray: ts.Statement[], fileName: string) {
    const importDeclaration = createImport('ponder', '@/generated');

    writeTsFile([importDeclaration, ...tsArray], fileName);
    // // Create a new SourceFile with the statements we want
    // const sourceFile = ts.factory.createSourceFile(
    //     [importDeclaration, ...tsArray],
    //     ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    //     ts.NodeFlags.None
    // );
}

function extractPonderOnCall(codeSnippet: string): ts.ExpressionStatement | undefined {
    const sourceFile = createASTFromSnippet(codeSnippet);

    const ponderOnStatement = sourceFile.statements.find(
        (node): node is ts.ExpressionStatement =>
            ts.isExpressionStatement(node) &&
            ts.isCallExpression(node.expression) &&
            ts.isPropertyAccessExpression(node.expression.expression) &&
            node.expression.expression.name.text === 'on' &&
            node.expression.expression.expression.getText() === 'ponder'
    );
    console.log('ponderOnStatement', ponderOnStatement);
    return ponderOnStatement;
}

export function generatePonderOnHandler(entity: string, event: string, templateVars: {}): ts.Statement {
    const handlerCode = `ponder.on('${entity}:${event}', async ({ event, context }) => {
    const { ${entity} } = context.db;
    if (parseInt(event.args.from, 16) === 0) {
        await ${entity}.create({
            id: event.args.tokenId,
            data: {
                name: '${entity} #' + (Number(event.args.tokenId) + 1),
            },
        });
    }
});`;

    return ts.factory.createExpressionStatement(
        ts.factory.createIdentifier(handlerCode)
    ) as ts.Statement;
}


// export function generatePonderOnHandler(entity: string, event: string, templateVars: {}) {
//     console.log('generatePonderOnHandler', entity, event, templateVars);
//     const snippet = (entity: string, event: string, templateVars: {}) => {
//         const template = `ponder.on('${entity}:${event}', async ({ event, context }) => {
//             const { ${entity} } = context.db;
//             if (parseInt(event.args.from, 16) == 0) {
//                 await ${entity}.create({
//                     id: event.args.tokenId,
//                     data: {
//                         name: '${entity} #' + (Number(event.args.tokenId) + 1),
//                     },
//                 });
//             }
//         });
//         `
//         console.log('snippet', template);
//         return template;
//     }
//     return extractPonderOnCall(snippet(entity, event, templateVars));
// }
