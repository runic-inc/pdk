import { PDKContext, PDKPlugin } from '../../types';

type ReactPluginProps = {
    reownProjectId: string;
};

function react(props: ReactPluginProps): PDKPlugin {
    return {
        name: 'React',
        generate: async ({ context, task }) => {
            return task.newListr<PDKContext>(
                [
                    {
                        title: 'Generating Wagmi hooks...',
                        task: async (ctx) => {
                            await new Promise((resolve) => setTimeout(resolve, 1500));
                        },
                    },
                    {
                        title: 'Generating tRPC hooks...',
                        enabled(ctx) {
                            return ctx.artifacts['trpc'] ? true : false;
                        },
                        task: async (ctx, t) => {
                            await new Promise((resolve) => setTimeout(resolve, 500));
                        },
                    },
                ],
                { concurrent: true },
            );
        },
    };
}

export default react;
