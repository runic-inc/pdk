import { asyncLocalStorage, TaskLogger } from '../../common/helpers/logger';
import { PDKPlugin } from '../../types';
import { generateEnv } from './env';
import { generateTrpcHooks, generateWagmiHooks } from './hooks';

type ReactPluginProps = {
    reownProjectId?: string;
};

const rendererOptions = {
    persistentOutput: true,
    outputBar: Infinity,
};

export function react(props: ReactPluginProps): PDKPlugin {
    return {
        name: 'React',
        generate: async ({ context, task }) => {
            return task.newListr(
                [
                    {
                        title: 'Generating WAGMI hooks...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateWagmiHooks(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                    {
                        title: 'Generating tRPC hooks...',
                        enabled(ctx) {
                            return ctx.artifacts['trpc'] ? true : false;
                        },
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateTrpcHooks(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                    // {
                    //     title: 'Generating components...',
                    //     task: async (ctx) => {
                    //         await generateReactComponents(ctx.rootDir);
                    //     },
                    // },
                    // {
                    //     title: 'Generating demo page...',
                    //     task: async (ctx) => {
                    //         await generateDemoPage(ctx.rootDir);
                    //     },
                    // },
                    {
                        title: 'Generating env...',
                        task: async (ctx, task) => {
                            const logger = new TaskLogger(task);
                            await asyncLocalStorage.run({ logger }, async () => {
                                await generateEnv(ctx.rootDir);
                            });
                        },
                        rendererOptions,
                    },
                ],
                { concurrent: true },
            );
        },
    };
}
