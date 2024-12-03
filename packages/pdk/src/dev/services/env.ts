// services/env.ts
import { generatePonderEnv } from '../../generate/ponderEnv';
import { generateWWWEnv } from '../../generate/wwwEnv';

export class EnvGenerator {
    private configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    async generateEnvironments(): Promise<void> {
        await generatePonderEnv(this.configPath);
        await generateWWWEnv(this.configPath);
    }
}
