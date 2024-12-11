import path from 'path';
import { register } from 'ts-node';
import { Task, TaskExecuteParams } from '../types';

export class TaskService {
    private configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;

        register({
            transpileOnly: true,
            compilerOptions: {
                module: 'CommonJS',
            },
        });
    }

    private async loadTasks(): Promise<Task[]> {
        try {
            const configDir = path.dirname(path.isAbsolute(this.configPath) ? this.configPath : path.resolve(process.cwd(), this.configPath));

            const tasksModule = await import(path.join(configDir, 'tasks/index.ts'));
            return tasksModule.tasks || [];
        } catch (error) {
            console.warn('No custom tasks found:', error);
            return [];
        }
    }

    async runTasks(params: TaskExecuteParams): Promise<void> {
        const tasks = await this.loadTasks();

        const enabledTasks = tasks.filter((task) => task.enabled).sort((a, b) => a.order - b.order);

        for (const task of enabledTasks) {
            console.info(`Executing task: ${task.name} - ${task.description}`);
            try {
                await task.execute(params);
                console.info(`Successfully completed task: ${task.name}`);
            } catch (error) {
                console.error(`Failed to execute task ${task.name}:`, error);
                throw error;
            }
        }
    }
}
