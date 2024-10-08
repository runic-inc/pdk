import { ProjectConfig } from '@patchworkdev/common';
import ts from 'typescript';
import { Abi, AbiEvent, getAbiItem } from 'viem';
import { Schema } from '../generateApi/ponderMocks';
import { createImport, writeTsFile } from '../helpers/factories';

// experiment with ts factory functions. Hard to make work with these more complex examples
// function createASTFromSnippet(codeSnippet: string): ts.SourceFile {
//     return ts.createSourceFile(
//         'snippet.ts', // Using the same filename every time
//         codeSnippet,
//         ts.ScriptTarget.Latest,
//         true
//     );
// }

// function extractFunctionBody(codeSnippet: string): ts.Block | undefined {
//     const sourceFile = createASTFromSnippet(codeSnippet);
//     const functionDeclaration = sourceFile.statements.find(
//         (node): node is ts.FunctionDeclaration => ts.isFunctionDeclaration(node)
//     );
//     return functionDeclaration?.body;
// }

// function extractPonderOnCall(codeSnippet: string): ts.ExpressionStatement | undefined {
//     const sourceFile = createASTFromSnippet(codeSnippet);

//     const ponderOnStatement = sourceFile.statements.find(
//         (node): node is ts.ExpressionStatement =>
//             ts.isExpressionStatement(node) &&
//             ts.isCallExpression(node.expression) &&
//             ts.isPropertyAccessExpression(node.expression.expression) &&
//             node.expression.expression.name.text === 'on' &&
//             node.expression.expression.expression.getText() === 'ponder'
//     );
//     console.log('ponderOnStatement', ponderOnStatement);
//     return ponderOnStatement;
// }

export function createPonderEventFile(tsArray: ts.Statement[], fileName: string) {
    const importDeclaration = createImport('ponder', '@/generated');

    writeTsFile([importDeclaration, ...tsArray], fileName);
}

export function generatePonderOnHandler(entity: string, event: AbiEvent, projectConfig: ProjectConfig, ponderSchema: Schema, abis: Record<string, Abi>): ts.Statement {
    const templateFunctions: Record<string, (args: { entity: string; event: AbiEvent, projectConfig: ProjectConfig, ponderSchema: Schema, abis: Record<string, Abi> }) => string> = {
        "Frozen": frozenHandler,
        "Locked": lockedHandler,
        "Transfer": transferHandler,
        "Unlocked": unlockedHandler,
        "Thawed": thawedHandler,
    }

    const handlerCode = templateFunctions[event.name]({ entity, event, projectConfig, ponderSchema, abis });

    return ts.factory.createExpressionStatement(
        ts.factory.createIdentifier(handlerCode)
    ) as ts.Statement;
}


// Below are the template functions. Could be moved to a separate file if there are too many.
export function transferHandler({ entity, event, projectConfig, ponderSchema, abis }: { entity: string; event: AbiEvent; projectConfig: ProjectConfig; ponderSchema: Schema; abis: Record<string, Abi> }): string {
    const data: Record<string, string> = {
        "owner": "event.args.to",
        "tokenId": "event.args.tokenId",
        "mintTxId": "event.transaction.hash",
        "contractId": "event.log.address",
        "timestamp": "event.block.timestamp",
    }

    return `ponder.on('${entity}:${event.name}', async ({ event, context }) => {
    const { ${entity} } = context.db;
    if (parseInt(event.args.from, 16) === 0) {
       await ${entity}.create({
           id: \`\${event.log.address}:\$\{event.args.tokenId}\`,
           data: {
               ${Object.keys(data).map((key) => { return `${key}: ${data[key]}` }).join(',')}
           },
       });
    } else if (parseInt(event.args.to, 16) === 0) {
        await ${entity}.update({
            id: \`\${event.log.address}:\$\{event.args.tokenId}\`,
            data: {
                owner: event.args.to,
                burnTxId: event.transaction.hash,
            },
        });
    } else {
        await ${entity}.update({
            id: \`\${event.log.address}:\$\{event.args.tokenId}\`,
            data: {
                owner: event.args.to,
            },
        });
    }
})`;
}

function transferHandlerData(data: Record<string, string>) {
    console.log(data);

    const temp = Object.keys(data).map((key) => { return `${key}: ${data[key]}` }).join(',')
    console.log(temp);
    return temp;
}

export function loadMetadataHandler({ entity, event, projectConfig, ponderSchema, abis }: { entity: string; event: AbiEvent; projectConfig: ProjectConfig; ponderSchema: Schema; abis: Record<string, Abi> }): string {

    const loadMetadata = getAbiItem({ abi: abis["Bubble"], name: 'loadMetadata' })
    return `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    })`
};

export function frozenHandler({ entity, event }: { entity: string; event: AbiEvent; }): string {
    return `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`;
}
export function lockedHandler({ entity, event }: { entity: string; event: AbiEvent; }): string {
    return `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`;
}
export function unlockedHandler({ entity, event }: { entity: string; event: AbiEvent; }): string {
    return `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`;
}
export function thawedHandler({ entity, event }: { entity: string; event: AbiEvent; }): string {
    return `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`;
}
