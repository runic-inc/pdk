import path from 'path';

export async function localDevRun(configPath: string) {
    console.log('Running local development environment...');
    const targetDir = path.dirname(configPath);
    try {
        //doing dynamic import due to CommonJS packages not being able to import ESM packages synchronously
        const execa = (await import('execa')).execa;
        const result = await execa('docker', ['compose', 'up', '--build', '-d'], {
            cwd: targetDir,
        });

        console.log(result);
    } catch (error) {
        console.log(error);
    }
}
