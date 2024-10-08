import { execa } from 'execa';
import { oraPromise } from 'ora';
import path from 'path';



export async function installNodeDependencies(targetDir: string): Promise<void> {

    await oraPromise(
        execa('pnpm', ['install'], {
            cwd: targetDir,
            env: {
                ...process.env,
                ADBLOCK: '1',
                // we set NODE_ENV to development as pnpm skips dev
                // dependencies when production
                NODE_ENV: 'development',
                DISABLE_OPENCOLLECTIVE: '1',
            },
        }),
        {
            text: `Installing node dependencies`,
            failText: "Failed to install node dependencies.",
            successText: `Node dependencies installed successfully`,
        },
    );

}

export async function initGitRepo(targetDir: string): Promise<void> {
    await oraPromise(
        execa('git', ['init'], {
            cwd: targetDir,
        }),
        {
            text: `Initializing git repo`,
            failText: "Failed to initialize git repo",
            successText: `Git repo initialized successfully`,
        },
    );

    await oraPromise(
        execa('git', ['add', '.'], {
            cwd: targetDir,
        }),
        {
            text: `Adding files to git repo`,
            failText: "Failed to add files to git repo",
            successText: `Files added to git repo successfully`,
        },
    );

    await oraPromise(
        execa('git', ['commit', '-m', '"initial commit"'], {
            cwd: targetDir,
        }),
        {
            text: `Initial commit`,
            failText: "Initial commit failed",
            successText: `Initial commit complete`,
        },
    );

}

export async function forgeBuild(targetDir: string): Promise<void> {
    await oraPromise(
        execa('forge', ['build', '--extra-output-files', 'abi', '--force'], {
            cwd: targetDir,
        }),
        {
            text: `Building contracts`,
            failText: "Failed to build contracts",
            successText: `Contracts built successfully`,
        },
    );
}


export async function generateContracts(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
    const outputDir = './contracts/src';
    const rootDir = './';

    const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');

    await oraPromise(
        execa(pdkCommand, [
            'generate',
            configPath,
            '-o', outputDir,
            '-r', rootDir
        ], {
            cwd: targetDir,
        }),
        {
            text: `Generating contracts`,
            failText: "Failed to generate contracts",
            successText: `Contracts generated successfully`,
        }
    );
}

export async function linkLocalPackages(targetDir: string): Promise<void> {
    await oraPromise(
        execa('pnpm', ['link', '--global', '@patchworkdev/pdk'], {
            cwd: targetDir,
        }),
        {
            text: `Linking @patchworkdev/pdk`,
            failText: "Failed to link @patchworkdev/pdk",
            successText: `@patchworkdev/pdk linked successfully`,
        }
    );
    await oraPromise(
        execa('pnpm', ['link', '--global', '@patchworkdev/common'], {
            cwd: targetDir,
        }),
        {
            text: `Linking @patchworkdev/common`,
            failText: "Failed to link @patchworkdev/common",
            successText: `@patchworkdev/common linked successfully`,
        }
    );
}

export async function generateAllComponents(targetDir: string, useLocalPackages: boolean, configPath: string): Promise<void> {
    const pdkCommand = useLocalPackages ? 'pdk' : path.join(targetDir, 'node_modules', '.bin', 'pdk');
    await oraPromise(
        execa(pdkCommand, ['generateAll', configPath], {
            cwd: targetDir,
        }),
        {
            text: `Generating abis, apis, ponder schema, scripts, and hooks`,
            failText: "Failed to generate all components",
            successText: `All components generated successfully`,
        }
    );
}