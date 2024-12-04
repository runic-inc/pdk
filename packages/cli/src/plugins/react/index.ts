import { PDKPlugin } from '../../types';

type ReactPluginProps = {
    reownProjectId: string;
};

function react(props: ReactPluginProps): PDKPlugin {
    return {
        name: 'React',
        generate: async ({ context, task }) => {
            return task.newListr(
                [
                    {
                        title: 'Generating Wagmi hooks...',
                        task: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 1500));
                        },
                    },
                    {
                        title: 'Generating tRPC hooks...',
                        task: async (ctx, task) => {
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
