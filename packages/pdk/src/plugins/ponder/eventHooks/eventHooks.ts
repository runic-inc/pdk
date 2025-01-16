import _ from 'lodash';
import { Abi, AbiEvent } from 'viem';
import { formatAndSaveFile } from '../../../common/helpers/file';
import { SchemaModule } from '../../../common/helpers/ponderSchemaMock';
import { PatchworkProject } from '../../../types';

export type GeneratedHandlers = { imports: Set<string>; handlers: string[] };
type HandlerAndImport = { handler: string; imports: Set<string> };

export async function createPonderEventFile(handlers: GeneratedHandlers, eventFile: string) {
    const output: string[] = [];
    output.push(`import { ponder } from "@/generated";`);
    output.push(`import { patchwork } from "./patchwork";`);
    output.push(`import { getMetadata } from "./utils";`);
    output.push(`import {${[...handlers.imports].sort().join(',')}} from "../../ponder.schema";`);
    handlers.handlers.forEach((handler) => {
        output.push(handler);
    });
    await formatAndSaveFile(eventFile, output.join('\n'));
}

export function generateEntityEventHandlers(projectConfig: PatchworkProject, ponderSchema: SchemaModule, abis: Record<string, Abi>): GeneratedHandlers {
    const handlers: GeneratedHandlers = { imports: new Set(), handlers: [] };
    const entityEvents = ['Frozen', 'Locked', 'Transfer', 'Unlocked', 'Thawed'];

    Object.entries(projectConfig.contracts).flatMap(([contractName, contractConfig]) => {
        const key = (typeof contractConfig !== 'string' && contractConfig.name.replace(/\s+/g, '')) || contractName;
        const abi = abis[contractName] ?? abis[key];
        const filteredEvents = abi.filter((abiEvent) => abiEvent.type === 'event');
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
    projectConfig: PatchworkProject,
    ponderSchema: SchemaModule,
    abis: Record<string, Abi>,
): HandlerAndImport {
    const templateFunctions: Record<
        string,
        (args: { entity: string; event: AbiEvent; projectConfig: PatchworkProject; ponderSchema: SchemaModule; abis: Record<string, Abi> }) => HandlerAndImport
    > = {
        Transfer: transferHandler,
        MetadataUpdate: metadataUpdateHandler,
    };

    const handler = templateFunctions[event.name]
        ? templateFunctions[event.name]({ entity, event, projectConfig, ponderSchema, abis })
        : genericEventTemplate({ entity, event });
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
    projectConfig: PatchworkProject;
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
	        const metadata = await getMetadata(event.args.tokenId, '${entity}', context);
            await context.db.insert(${_.camelCase(entity)}).values({
                id: \`\${event.log.address}:\$\{event.args.tokenId}\`,
                ${Object.keys(data)
                    .map((key) => {
                        return `${key}: ${data[key]}`;
                    })
                    .join(',\n')},
                ...metadata,
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
	    await patchwork.emit('${entity}:${event.name}', { event, context });
    });`,
    };
}

export function metadataUpdateHandler({ entity, event }: { entity: string; event: AbiEvent }): HandlerAndImport {
    return {
        imports: new Set([_.camelCase(entity)]),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {
            const metadata = await getMetadata(event.args._tokenId, '${entity}', context);
            await context.db
                .update(${_.camelCase(entity)}, {
                    id: \`\${event.log.address}:\$\{event.args._tokenId}\`,
                })
                .set(() => metadata);
            await patchwork.emit('${entity}:${event.name}', { event, context });
        });`,
    };
}

export function genericEventTemplate({ entity, event }: { entity: string; event: AbiEvent }): HandlerAndImport {
    return {
        imports: new Set([_.camelCase(entity)]),
        handler: `ponder.on('${entity}:${event.name}', async ({ event, context }) => {
            await patchwork.emit('${entity}:${event.name}', { event, context });
        });`,
    };
}
