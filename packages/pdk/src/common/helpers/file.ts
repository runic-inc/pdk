import fs from 'fs/promises';
import prettier from 'prettier';
import { ErrorCode, PDKError } from './error';
import { logger } from './logger';

export async function formatAndSaveFile(filePath: string, content: string, parser: string = 'typescript') {
    try {
        const formatted = await formatFile(content, parser);
        await fs.writeFile(filePath, formatted, 'utf-8');
    } catch (error) {
        logger.error(`Error formatting and saving file: ${filePath}`);
        throw new PDKError(ErrorCode.FILE_SAVE_ERROR, `Error formatting and saving file ${filePath}`);
    }
}

export async function formatFile(content: string, parser: string = 'typescript') {
    return await prettier.format(content, {
        parser: parser,
        tabWidth: 4,
        printWidth: 120,
    });
}
