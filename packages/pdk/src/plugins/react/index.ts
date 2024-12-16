import { PDKPlugin } from '../../types';
import { generateReactComponents } from './components';
import { generateDemoPage } from './demoPage';
import { generateEnv } from './env';
import { generateTrpcHooks, generateWagmiHooks } from './hooks';

type ReactPluginProps = {
    reownProjectId?: string;
};

export function react(props: ReactPluginProps): PDKPlugin {
    return {
        name: 'React',
        generate: async ({ context, task }) => {
            return task.newListr(
                [
                    {
                        title: 'Generating WAGMI hooks...',
                        task: async (ctx) => {
                            await generateWagmiHooks(ctx.rootDir);
                        },
                    },
                    {
                        title: 'Generating tRPC hooks...',
                        enabled(ctx) {
                            return ctx.artifacts['trpc'] ? true : false;
                        },
                        task: async (ctx, t) => {
                            await generateTrpcHooks(ctx.rootDir);
                        },
                    },
                    {
                        title: 'Generating components...',
                        task: async (ctx) => {
                            await generateReactComponents(ctx.rootDir);
                        },
                    },
                    {
                        title: 'Generating demo page...',
                        task: async (ctx) => {
                            await generateDemoPage(ctx.rootDir);
                        },
                    },
                    {
                        title: 'Generating env...',
                        task: async (ctx) => {
                            await generateEnv(ctx.rootDir);
                        },
                    },
                ],
                { concurrent: true },
            );
        },
    };
}
