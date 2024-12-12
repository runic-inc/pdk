import { Task } from '@patchworkdev/pdk/utils';
import { registerTraitsTask } from './register-traits';

export const tasks: Task[] = [
    {
        name: 'Register Traits',
        description: 'Registers unregistered traits to the contract',
        enabled: true,
        execute: registerTraitsTask,
    },
];
