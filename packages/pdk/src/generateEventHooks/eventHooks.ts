import { ProjectConfig } from '@patchworkdev/common';
import _ from 'lodash';
import { Abi, AbiEvent } from 'viem';
import { formatAndSaveFile } from '../helpers/file';
import { SchemaModule } from '../helpers/ponderSchemaMock';

export type GeneratedHandlers = { imports: Set<string>; handlers: string[] };
type HandlerAndImport = { handler: string; imports: Set<string> };

export async function createPonderEventFile(handlers: GeneratedHandlers, eventFile: string) {
    const output: string[] = [];
    output.push(`import { ponder } from "@/generated";`);
    output.push(`import {${[...handlers.imports].sort().join(',')}} from "../../ponder.schema";`);
    handlers.handlers.forEach((handler) => {
        output.push(handler);
    });

    console.log(eventFile);
    await formatAndSaveFile(eventFile, output.join('\n'));
}

export function generateEntityEventHandlers(projectConfig: ProjectConfig, ponderSchema: SchemaModule, abis: Record<string, Abi>): GeneratedHandlers {
    const handlers: GeneratedHandlers = { imports: new Set(), handlers: [] };
    const entityEvents = ['Frozen', 'Locked', 'Transfer', 'Unlocked', 'Thawed'];

    Object.entries(projectConfig.contracts).flatMap(([contractName, contractConfig]) => {
        const key = (typeof contractConfig !== 'string' && contractConfig.name.replace(/\s+/g, '')) || contractName;
        const abi = abis[contractName] ?? abis[key];
        const filteredEvents = abi.filter((abiEvent) => abiEvent.type === 'event')?.filter((abiEvent) => entityEvents.includes(abiEvent.name));
        return filteredEvents
            .map((event) => generatePonderOnHandler(contractName, event, projectConfig, ponderSchema, abis))
            .map((handler) => {
                handler.imports.forEach((item) => handlers.imports.add(item));
                handlers.handlers.push(handler.handler);
            });
    });

    return handlers;
}

export function generatePonderOnHandler(
    entity: string,
    event: AbiEvent,
    projectConfig: ProjectConfig,
    ponderSchema: SchemaModule,
    abis: Record<string, Abi>,
): HandlerAndImport {
    const templateFunctions: Record<
        string,
        (args: { entity: string; event: AbiEvent; projectConfig: ProjectConfig; ponderSchema: SchemaModule; abis: Record<string, Abi> }) => HandlerAndImport
    > = {
        Frozen: frozenHandler,
        Locked: lockedHandler,
        Transfer: transferHandler,
        Unlocked: unlockedHandler,
        Thawed: thawedHandler,
    };

    const handler = templateFunctions[event.name]({ entity, event, projectConfig, ponderSchema, abis });
    return handler;
}

// Below are the template functions. Could be moved to a separate file if there are too many.
export function transferHandler({
    entity,
    event,
    projectConfig,
    ponderSchema,
    abis,
}: {
    entity: string;
    event: AbiEvent;
    projectConfig: ProjectConfig;
    ponderSchema: SchemaModule;
    abis: Record<string, Abi>;
}): HandlerAndImport {
    const data: Record<string, string> = {
        owner: 'event.args.to',
        tokenId: 'event.args.tokenId',
        mintTxId: 'event.transaction.hash',
        contractId: 'event.log.address',
        timestamp: 'event.block.timestamp',
    };

    return {
        imports: new Set([_.camelCase(entity)]),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {
        if (parseInt(event.args.from, 16) === 0) {
            await context.db.insert(${_.camelCase(entity)}).values({
                id: \`\${event.log.address}:\$\{event.args.tokenId}\`,
                ${Object.keys(data)
                    .map((key) => {
                        return `${key}: ${data[key]}`;
                    })
                    .join(',\n')}
    
            });
        } else if (parseInt(event.args.to, 16) === 0) {
            await context.db.update(${_.camelCase(entity)}, { id: \`\${event.log.address}:\$\{event.args.tokenId}\` })
                .set((row) => (
                    {
                        owner: event.args.to,
                        burnTxId: event.transaction.hash,
                    }
                ));
        } else {
            await context.db.update(${_.camelCase(entity)}, { id: \`\${event.log.address}:\$\{event.args.tokenId}\` })
                .set((row) => ({ owner: event.args.to }));
        }
    });`,
    };
}

export function frozenHandler({ entity, event }: { entity: string; event: AbiEvent }): HandlerAndImport {
    return {
        imports: new Set(),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`,
    };
}
export function lockedHandler({ entity, event }: { entity: string; event: AbiEvent }): HandlerAndImport {
    return {
        imports: new Set(),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`,
    };
}
export function unlockedHandler({ entity, event }: { entity: string; event: AbiEvent }): HandlerAndImport {
    return {
        imports: new Set(),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`,
    };
}
export function thawedHandler({ entity, event }: { entity: string; event: AbiEvent }): HandlerAndImport {
    return {
        imports: new Set(),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {

    
})`,
    };
}
