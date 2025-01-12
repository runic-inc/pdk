import path from 'path';
import { logger } from '../../../common/helpers/logger';
import { tsLoader } from '../../../common/helpers/tsLoader';
import { Task, TaskExecuteParams } from '../types';

export class TaskService {
    private configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    private async loadTasks(): Promise<Task[]> {
        try {
            const configDir = path.dirname(path.isAbsolute(this.configPath) ? this.configPath : path.resolve(process.cwd(), this.configPath));
            const tasksPath = path.join(configDir, 'tasks/index.ts');

            logger.debug(`Loading tasks from ${tasksPath}`);

            const tasksModule = await tsLoader<{ tasks: Task[] }>(tasksPath, {
                moduleOverrides: {
                    '@patchworkdev/pdk/utils': '../../exports',
                },
            });

            return tasksModule.tasks || [];
        } catch (error) {
            logger.warn(`No custom tasks found: ${error}`);
            return [];
        }
    }

    async runTasks(params: TaskExecuteParams): Promise<void> {
        const tasks = await this.loadTasks();

        if (!tasks.length) {
            return logger.info('No tasks to execute.');
        }

        const enabledTasks = tasks.filter((task) => task.enabled);

        for (const task of enabledTasks) {
            logger.info(`Executing task: ${task.name} - ${task.description}`);

            try {
                await task.execute(params);
                logger.info(`Successfully completed task: ${task.name}`);
            } catch (error) {
                logger.error(`Failed to execute task ${task.name}:`, error);
                throw error;
            }
        }
    }
}
