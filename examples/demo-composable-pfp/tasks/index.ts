import { Task } from '@patchworkdev/pdk/utils';
import { exampleTask } from './example-task';
import { registerTraitsTask } from './register-traits';

export const tasks: Task[] = [
    {
        name: 'Example Task',
        description: 'Runs an example task on dev up',
        enabled: true,
        order: 0,
        execute: exampleTask,
    },
    {
        name: 'Register Traits',
        description: 'Registers unregistered traits to the contract',
        enabled: true,
        order: 1,
        execute: registerTraitsTask,
    },
];
