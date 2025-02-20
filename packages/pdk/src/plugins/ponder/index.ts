import { PDKPlugin } from '../../types';
import { generateABIs } from './abis';
import { generateAPI } from './api';
import { generateConfig } from './config';
import { generatePonderEnv } from './env';
import { generateEventHooks } from './eventHooks';
import { generateSchema } from './schema';
import { generateTypes } from './types';
import { generateTypescriptSchemas } from './typescriptSchemas';

type PonderPluginProps = {
    trpc: boolean;
};

export function ponder(props: PonderPluginProps = { trpc: true }): PDKPlugin {
    return {
        name: 'Ponder',
        configProps: props,
        generate: async ({ context, task }) => {
            return task.newListr(
                [
                    {
                        title: 'Processing ABIs...',
                        task: async () => {
                            // await new Promise((resolve) => setTimeout(resolve, 1000));
                            await generateABIs(context.rootDir);
                        },
                    },
                    {
                        title: 'Generating Ponder schema...',
                        task: async () => {
                            await generateSchema(context.rootDir);
                        },
                    },
                    {
                        title: 'Generating Typescript schemas...',
                        task: async () => {
                            await generateTypescriptSchemas(context.rootDir);
                        },
                    },
                    {
                        title: 'Generating event filters',
                        task: async () => {
                            await generateEventHooks(context.rootDir);
                        },
                    },
                    {
                        title: 'Generating ponder config',
                        task: async () => {
                            await generateConfig(context.rootDir);
                        },
                    },
                    {
                        title: 'Generating tRPC endpoints...',
                        enabled: () => props.trpc,
                        task: async (ctx) => {
                            const artifacts = await generateAPI(context.rootDir);
                            for (const [key, value] of Object.entries(artifacts)) {
                                ctx.artifacts[key] = value;
                            }
                        },
                    },
                    {
                        title: 'Generating types',
                        task: async (ctx) => {
                            const artifacts = await generateTypes(context.rootDir);
                            for (const [key, value] of Object.entries(artifacts)) {
                                ctx.artifacts[key] = value;
                            }
                        },
                    },
                    {
                        title: 'Generating Ponder env...',
                        task: async (ctx) => {
                            await generatePonderEnv(context.rootDir);
                        },
                    },
                ],
                { concurrent: false },
            );
        },
    };
}
