import { PDKPlugin } from '../../types';

function ponder(): PDKPlugin {
    return {
        name: 'Ponder',
        generate: ({ context }) => {
            //console.log('Generating Wagmi hooks...');
            if (context.artifacts['trpc']) {
                //console.log('Found valid tRPC router definition at: ', context.artifacts['trpc']);
                //console.log('Generating tRPC hooks...');
            }
        },
    };
}

export default ponder;
