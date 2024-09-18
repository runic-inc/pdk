import { oraPromise } from 'ora';
import { execa } from 'execa';



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