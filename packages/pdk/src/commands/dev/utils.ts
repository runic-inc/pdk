import fs from 'fs/promises';
import _ from 'lodash';

export async function getProjectNameFromConfig(configPath: string): Promise<string> {
    const content = await fs.readFile(configPath, 'utf8');

    try {
        if (configPath.endsWith('.json')) {
            const config = JSON.parse(content);
            return config.name;
        } else {
            const match = content.match(/name:\s*["'](.+?)["']/);
            if (match && match[1]) {
                return match[1];
            }
        }
        throw new Error('Project name not found in config file');
    } catch (error) {
        console.error(`Error reading project name from config: ${error}`);
        throw error;
    }
}

export function getDockerContainerName(projectName: string, serviceName: string, instanceNumber: number = 1): string {
    const sanitizedName = _.chain(projectName)
        .kebabCase()
        .thru((name) => (/^[a-z]/.test(name) ? name : `project-${name}`))
        .value();

    return `${sanitizedName}-${serviceName}-${instanceNumber}`;
}

export function getPonderContainerName(projectName: string, instanceNumber: number = 1): string {
    return getDockerContainerName(projectName, 'ponder', instanceNumber);
}
