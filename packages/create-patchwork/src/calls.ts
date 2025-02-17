import { execa } from 'execa';
import path from 'path';

export async function checkPnpmInstalled(): Promise<boolean> {
    try {
        await execa('pnpm', ['--version']);
        return true; // `pnpm` is installed
    } catch (error) {
        return false; // `pnpm` is not installed
    }
}

export async function installNodeDependencies(targetDir: string, packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'): Promise<void> {
    try {
        await execa(packageManager, ['install'], {
            cwd: targetDir,
            env: {
                ...process.env,
                ADBLOCK: '1',
                // we set NODE_ENV to development as pnpm skips dev
                // dependencies when production
                NODE_ENV: 'development',
                DISABLE_OPENCOLLECTIVE: '1',
            },
        });
    } catch (e) {
        throw new Error(`Failed to install dependencies.`, {
            cause: e,
        });
    }
}

export async function initGitRepo(targetDir: string): Promise<void> {
    try {
        await execa('git', ['init'], {
            cwd: targetDir,
        });
        await execa('git', ['add', '.'], {
            cwd: targetDir,
        });
        await execa('git', ['commit', '-m', '"initial commit"'], {
            cwd: targetDir,
        });
    } catch (e) {
        throw new Error(`Git setup failed.`, {
            cause: e,
        });
    }
}

export async function linkLocalPackages(targetDir: string): Promise<void> {
    try {
        await execa('pnpm', ['link', '--global', '@patchworkdev/pdk'], {
            cwd: targetDir,
        });
        await execa('pnpm', ['link', '--global', '@patchworkdev/common'], {
            cwd: targetDir,
        });
    } catch (e) {
        throw new Error(`Failed to link local packages.`, {
            cause: e,
        });
    }
}

export async function selectLocalNetwork(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
    const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');
    try {
        await execa(pdkCommand, ['network', 'switch', 'local'], {
            cwd: targetDir,
        });
    } catch (e) {
        throw new Error(`Failed to select network.`, {
            cause: e,
        });
    }
}

export async function generateAllComponents(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
    const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');
    try {
        await execa(pdkCommand, ['generate', 'all'], {
            cwd: targetDir,
        });
    } catch (e) {
        throw new Error(`PDK code generation failed.`, {
            cause: e,
        });
    }
}
