import { Command } from 'commander';
import { PDKContext, PDKPlugin } from '../types';

// Dynamically load and initialize plugins
export async function loadPlugins(plugins: PDKPlugin[], context: PDKContext, program: Command): Promise<void> {
    for (const plugin of plugins) {
        // console.log(`Loading plugin: ${plugin.name}`);
        if (plugin.commands) {
            const commands = plugin.commands(context);
            if (Array.isArray(commands)) {
                commands.forEach((cmd) => program.addCommand(cmd));
            } else {
                program.addCommand(commands);
            }
        }
    }
}
