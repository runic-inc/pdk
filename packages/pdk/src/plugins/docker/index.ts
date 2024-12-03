import { Compute, PatchworkPlugin, RequiredBy } from '../types';

type ReactPlugin = Compute<RequiredBy<PatchworkPlugin, 'generate'>>;

type ReactPluginOptions = {
    hooksPath: string;
};

function docker({ hooksPath }: ReactPluginOptions): ReactPlugin {
    return {
        name: 'Docker',
        commands: (program) => {
            program.addOption()
            up: async () => { },
            down: async () => { },
        }
    };
}

export default docker;
