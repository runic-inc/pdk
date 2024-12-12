import { TaskExecuteParams } from '@patchworkdev/pdk/utils';

export async function exampleTask({ deployConfig, deployedContracts }: TaskExecuteParams): Promise<void> {
    console.log('Running example task');
}
