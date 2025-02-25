import { readFile } from 'fs/promises';
import * as path from 'path';

export class PathsService {
    baseDir: string;
    constructor() {
        this.baseDir = path.join(process.cwd(), 'assets');
    }

    pathToCanvasImage = (canvasId: number | bigint) => {
        return path.join(this.baseDir, `/images/canvases/${canvasId}.png`);
    };

    pathToBubbleImage = (id: number | bigint) => {
        const pth = path.join(
            this.baseDir,
            '/images/bubbles',
            `${id.toString()}.png`,
        );
        return pth;
    };

    pathToCanvasMetadata = (tokenid: number | bigint) => {
        console.log(tokenid);
        const pth = path.join(
            this.baseDir,
            '/metadata/canvases',
            `${tokenid.toString()}.json`,
        );
        return pth;
    };

    pathToBubbleMetadata = (tokenid: number | bigint) => {
        const pth = path.join(
            this.baseDir,
            '/metadata/bubbles',
            `${tokenid.toString()}.json`,
        );
        return pth;
    };

    readFile = async (pth: string): Promise<string | false> => {
        try {
            const data = await readFile(pth, { encoding: 'utf-8' });
            return data;
        } catch (e) {
            console.error(e);
            return false;
        }
    };
}
