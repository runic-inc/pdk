import * as fs from 'node:fs/promises';
import path from 'node:path';
import { PDKContext } from '../types';

export async function saveContext(ctx: PDKContext): Promise<void> {
    const lockFilePath = path.join(process.cwd(), 'patchwork.lock');
    const lockFileContent = JSON.stringify(ctx, null, 2);
    await fs.writeFile(lockFilePath, lockFileContent);
}

export async function loadContext(): Promise<PDKContext> {
    const lockFilePath = path.join(process.cwd(), 'patchwork.lock');
    try {
        const lockFileContent = await fs.readFile(lockFilePath, 'utf-8');
        return JSON.parse(lockFileContent);
    } catch (error) {
        return {} as PDKContext;
    }
}
