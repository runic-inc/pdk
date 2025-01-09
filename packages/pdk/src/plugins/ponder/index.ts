import { asyncLocalStorage, TaskLogger } from '../../common/helpers/logger';
import { PDKPlugin } from '../../types';
import { generateABIs } from './abis';
import { generateAPI } from './api';
import { generateConfig } from './config';
import { generatePonderEnv } from './env';
import { generateEventHooks } from './eventHooks';
import { generateSchema } from './schema';
import { generateTypescriptSchemas } from './typescriptSchemas';

type PonderPluginProps = {
    trpc: boolean;
};

const rendererOptions = {
    persistentOutput: true,
    outputBar: Infinity,
};

export function ponder(props: PonderPluginProps = { trpc: true }): PDKPlugin {
    return {
        name: 'Ponder',
        generate: async ({ context, task }) => {
            return task.newListr(
                [
                    {
                        title: 'Processing ABIs...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateABIs(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Ponder schema...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateSchema(ctx.rootDir);
                            });
                        },
                    },
                    {
                        title: 'Generating Typescript schemas...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateTypescriptSchemas(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating event filters',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateEventHooks(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Ponder config',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateConfig(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating tRPC endpoints...',
                        enabled: () => props.trpc,
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                const artifacts = await generateAPI(ctx.rootDir);
                                for (const [key, value] of Object.entries(artifacts)) {
                                    ctx.artifacts[key] = value;
                                }
                            });
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Ponder env...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generatePonderEnv(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                ],
                { concurrent: false },
            );
        },
    };
}
