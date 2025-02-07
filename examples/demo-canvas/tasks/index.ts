import { Task } from '@patchworkdev/pdk/utils';
import { mintCanvasTask } from './mint-first-canvas';

export const tasks: Task[] = [
    {
        name: 'Mint Canvas',
        description: 'Checks if a canvas has been minted and offers to mint the first one',
        enabled: true,
        execute: mintCanvasTask,
    },
];
