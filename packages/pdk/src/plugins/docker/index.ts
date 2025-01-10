import path from 'node:path';
import { GeneratorService } from '../../services/generator';
import LockFileManager from '../../services/lockFile';
import { PDKPlugin, PDKPluginCommand } from '../../types';
import { localDevDown } from './down';
import { localDevUp } from './up';

type DockerPluginProps = {};

const rendererOptions = {
    persistentOutput: true,
    outputBar: Infinity,
};

export function docker(props: DockerPluginProps = {}): PDKPlugin {
    return {
        name: 'Docker',
        commands: () => {
            const dockerCmd = new PDKPluginCommand().name('docker').action(async (_, ctx) => {
                console.log('Docker context:', ctx);
            });

            const upCmd = new PDKPluginCommand().name('up').action(async (_, ctx) => {
                const configPath = path.join(ctx.rootDir, 'patchwork.config.ts');
                const lockFileManager = new LockFileManager(configPath);
                const generatorService = new GeneratorService(lockFileManager);
                await localDevUp(configPath, undefined, generatorService);
            });

            const downCmd = new PDKPluginCommand().name('down').action(async (_, ctx) => {
                await localDevDown(path.join(ctx.rootDir, 'patchwork.config.ts'));
            });

            dockerCmd.addSubCommand(upCmd);
            dockerCmd.addSubCommand(downCmd);
            return [dockerCmd];
        },
    };
}
