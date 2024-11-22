import fs from 'fs/promises';
import { ErrorCode, PDKError } from './error';
import { logger } from './logger';

export async function getEnvFile(filePath: string, createIfNotExists = true) {
    try {
        await fs.access(filePath);
    } catch {
        if (createIfNotExists) {
            await fs.writeFile(filePath, '', 'utf-8');
        } else {
            logger.error(`File does not exist: ${filePath}`);
            throw new PDKError(ErrorCode.FILE_NOT_FOUND, `File does not exist ${filePath}`);
        }
    }
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const envVars: Record<string, string> = {};
        const lines = data.split('\n');
        for (const line of lines) {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        }
        return envVars;
    } catch (error) {
        logger.error(`Error reading file: ${filePath}`);
        throw new PDKError(ErrorCode.FILE_READ_ERROR, `Error reading file ${filePath}`);
    }
}

export async function writeEnvFile(content: Record<string, string>, filePath: string) {
    const output: string[] = [];
    for (const key in content) {
        output.push(`${key}=${content[key]}`);
    }
    try {
        await fs.writeFile(filePath, output.join('\n'), 'utf-8');
    } catch (error) {
        logger.error(`Error writing to file: ${filePath}`);
        throw new PDKError(ErrorCode.FILE_SAVE_ERROR, `Error writing to file ${filePath}`);
    }
}
