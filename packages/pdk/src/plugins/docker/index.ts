import path from 'node:path';
import { findConfig } from '../../common/helpers/config';
import { GeneratorService } from '../../services/generator';
import LockFileManager from '../../services/lockFile';
import { PDKPlugin, PDKPluginCommand } from '../../types';
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
                const configPath = (await findConfig())!;
                const lockFileManager = new LockFileManager(configPath);
                const generatorService = new GeneratorService(lockFileManager);
                await localDevUp(path.join(ctx.rootDir, 'patchwork.config.ts'), undefined, generatorService);
            });

            const downCmd = new PDKPluginCommand().name('down').action(async (_, ctx) => {
                console.log('Docker context:', ctx);
            });

            dockerCmd.addSubCommand(upCmd);
            dockerCmd.addSubCommand(downCmd);
            return [dockerCmd];
        },
    };
}
