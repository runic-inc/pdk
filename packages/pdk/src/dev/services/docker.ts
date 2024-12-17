import Docker from 'dockerode';
import path from 'path';
import { getPonderContainerName, getProjectNameFromConfig } from '../utils';

const docker = new Docker();

export type ContainerStatus = {
    id: string;
    name: string;
    privatePort?: number;
    publicPort?: number;
};

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

    async getContainerStatus(prefix?: string): Promise<ContainerStatus[]> {
        const status: ContainerStatus[] = [];
        const containers = await docker.listContainers({
            filters: {
                name: [prefix ?? ''],
            },
            all: true,
        });

        containers.map((container) => {
            const ports = container.Ports?.[0] ?? {};
            status.push({
                id: container.Id.substring(0, 12),
                name: container.Names[0].replace('/', ''),
                privatePort: ports['PrivatePort'],
                publicPort: ports['PublicPort'],
            });
        });

        return status;
    }
}
