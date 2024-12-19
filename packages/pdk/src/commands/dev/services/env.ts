// services/env.ts

export class EnvGenerator {
    private configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    async generateEnvironments(): Promise<void> {
        // comment out and leave as dummy function while we transition to plugin system
        // await generatePonderEnv(this.configPath);
        // await generateWWWEnv(this.configPath);
    }
}
