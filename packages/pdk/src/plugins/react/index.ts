import { Compute, PatchworkPlugin, RequiredBy } from '../types';
import { generateTrpcHooks } from './utils/generateTrpcHooks';

type ReactPlugin = Compute<RequiredBy<PatchworkPlugin, 'generate'>>;

type ReactPluginOptions = {
    hooksPath: string;
};

function react({ hooksPath }: ReactPluginOptions): ReactPlugin {
    return {
        name: 'React',
        generate: async ({ config, contracts, rootDir, artifacts }) => {
            if (artifacts['trpcRouterFile']) {
                generateTrpcHooks(artifacts.trpcRouterFile, hooksPath);
            }
        },
    };
}

export default react;
