import { ponder, react } from '@patchworkdev/pdk/plugins';
import { PatchworkProject } from '@patchworkdev/pdk/types';

export default {
    plugins: [
        ponder(),
        react({
            reownProjectId: 'my-fake-project-key',
        }),
    ],
} as PatchworkProject;
