import * as fs from 'fs';
import * as path from 'path';

function findFileUpwards(directory: string, filename: string): string | null {
    const filePath = path.join(directory, filename);
    if (fs.existsSync(filePath)) {
        return filePath;
    }
    const parentDirectory = path.dirname(directory);
    if (parentDirectory === directory) {
        return null;
    }
    return findFileUpwards(parentDirectory, filename);
}

export function findConfig() {

    const configFileName = 'patchwork.config.ts';
    const currentDirectory = process.cwd();
    return findFileUpwards(currentDirectory, configFileName);
}