import path from 'path';
import { getPonderContainerName, getProjectNameFromConfig } from '../utils';

export class DockerService {
    private targetDir: string;
    private configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
        this.targetDir = path.dirname(configPath);
    }

    async startServices(): Promise<void> {
        console.info('Starting Docker services...');
        const { execa } = await import('execa');
        await execa('docker', ['compose', 'up', '-d'], {
            cwd: this.targetDir,
        });
    }

    async restartPonderContainer(): Promise<void> {
        const { execa } = await import('execa');
        const projectName = await getProjectNameFromConfig(this.configPath);
        const ponderContainer = getPonderContainerName(projectName);
        console.log(`Restarting Ponder container: ${ponderContainer}`);
        await execa('docker', ['container', 'restart', ponderContainer], {
            cwd: this.targetDir,
        });
    }

    async displayContainerStatus(): Promise<void> {
        const { execa } = await import('execa');
        const { stdout } = await execa('docker', ['container', 'ls', '--format', '{{.ID}}\t{{.Names}}\t{{.Ports}}', '-a'], {
            cwd: this.targetDir,
        });
        console.info('Docker containers and network ports:');
        console.info(stdout);
    }
}
