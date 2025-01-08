import pino from 'pino';
import pretty from 'pino-pretty';
import { TaskLogger } from '../../common/helpers/logger';
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
                        skip: true,
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await generateABIs(context.rootDir, logger);
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Ponder schema...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await generateSchema(context.rootDir, logger);
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Typescript schemas...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await generateTypescriptSchemas(context.rootDir, logger);
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating event filters',
                        task: async () => {
                            const logger = new TaskLogger(task);
                            await generateEventHooks(context.rootDir, logger);
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Ponder config',
                        task: async (ctx, task) => {
                            const stream = pretty({
                                colorize: true,
                            });
                            const lg = pino(stream);
                            stream.pipe(task.stdout());

                            // Nothing is printed
                            lg.info('hi');
                            lg.info('hi');
                            lg.info('hi');
                            lg.info('hi');
                            const logger = new TaskLogger(task);
                            await generateConfig(context.rootDir, logger);
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating tRPC endpoints...',
                        enabled: () => props.trpc,
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            const artifacts = await generateAPI(context.rootDir, logger);
                            for (const [key, value] of Object.entries(artifacts)) {
                                ctx.artifacts[key] = value;
                            }
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating Ponder env...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await generatePonderEnv(context.rootDir, logger);
                        },
                        rendererOptions,
                    },
                ],
                { concurrent: false },
            );
        },
    };
}
