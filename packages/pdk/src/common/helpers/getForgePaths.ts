import { execSync } from 'node:child_process';
import path from 'node:path';

export function getForgePaths(): { src: string; script: string; out: string } {
    const forgeConfig = JSON.parse(execSync('forge config --json', { encoding: 'utf-8' }));
    const src = forgeConfig.src || path.join(process.cwd(), 'contracts', 'src');
    const script = forgeConfig.script || path.join(process.cwd(), 'contracts', 'script');
    const out = forgeConfig.out || path.join(process.cwd(), 'contracts', 'out');

    return {
        src,
        script,
        out,
    };
}
