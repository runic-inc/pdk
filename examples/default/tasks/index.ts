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
    {
        name: 'Example Task 3',
        description: 'Runs  example task 2 on dev up',
        enabled: true,
        order: 1,
        execute: exampleTask,
    },
];
