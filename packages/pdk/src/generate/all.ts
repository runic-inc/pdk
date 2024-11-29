import { generateServices } from './services';

export async function generateAll(configPath: string) {
    await generateServices(configPath);
}
