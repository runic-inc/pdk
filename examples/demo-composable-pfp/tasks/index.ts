import { Task } from '@patchworkdev/pdk/utils';
import { exampleTask } from './example-task';

export const tasks: Task[] = [
    {
        name: 'Example Task',
        description: 'Runs an example task on dev up',
        enabled: true,
        order: 0,
        execute: exampleTask,
    },
];
