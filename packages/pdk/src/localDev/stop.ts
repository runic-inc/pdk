import path from 'path';

export async function localDevStop(configPath: string) {
    console.log('Stopping local development environment...');
    const targetDir = path.dirname(configPath);
    try {
        //doing dynamic import due to CommonJS packages not being able to import ESM packages synchronously
        const execa = (await import('execa')).execa;
        const result = await execa('docker', ['compose', 'down'], {
            cwd: targetDir,
        });
    } catch (error) {
        console.log(error);
    }
}
