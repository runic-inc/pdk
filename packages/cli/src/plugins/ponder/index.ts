import { PDKContext, PDKPlugin } from '../../types';

type PonderPluginProps = {
    trpc: boolean;
};

function ponder(props: PonderPluginProps = { trpc: true }): PDKPlugin {
    return {
        name: 'Ponder',
        generate: async ({ context, task }) => {
            return task.newListr<PDKContext>(
                [
                    {
                        title: 'Processing ABIs...',
                        task: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                        },
                    },
                    {
                        title: 'Generating Ponder schema...',
                        task: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 500));
                        },
                    },
                    {
                        title: 'Generating event filters',
                        task: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                        },
                    },
                    {
                        title: 'Generating tRPC endpoints...',
                        enabled: () => props.trpc,
                        task: async (ctx) => {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            ctx.artifacts['trpc'] = 'my-trpc-router.ts';
                        },
                    },
                ],
                { concurrent: false },
            );
        },
    };
}

export default ponder;
