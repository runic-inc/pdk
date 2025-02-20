import { readFile } from 'fs/promises';
import * as path from 'path';

export class PathsService {
    baseDir: string;
    constructor() {
        this.baseDir = path.join(process.cwd(), 'generated');
    }

    pathToCanvasImage = (canvasId: number | bigint) => {
        return path.join(this.baseDir, `/images/canvases/${canvasId}.svg`);
    };

    pathToCheckpointImage = (canvasId: number | bigint, chk: number) => {
        const padId = canvasId.toString().padStart(3, '0');
        const padChk = chk.toString().padStart(7, '0');
        const pth = path.join(this.baseDir, 'images/checkpoints', `${padId}_${padChk}.svg`);
        return pth;
    };

    pathToBubbleImage = (id: number | bigint) => {
        const pth = path.join(this.baseDir, '/images/bubbles', `${id.toString()}.svg`);
        return pth;
    };

    pathToBrickImage = (id: number | bigint) => {
        const pth = path.join(this.baseDir, '/images/bricks', `${id.toString()}.svg`);
        return pth;
    };

    pathToLayerImage = (canvasId: number | bigint, chk: number, layer: number) => {
        const padId = canvasId.toString().padStart(3, '0');
        const padChk = chk.toString().padStart(7, '0');
        const padLyr = layer.toString().padStart(2, '0');
        const pth = path.join(this.baseDir, '/images/layers', `${padId}_${padChk}_${padLyr}.svg`);
        return pth;
    };

    pathToCanvasMetadata = (tokenid: number | bigint) => {
        console.log(tokenid);
        const pth = path.join(this.baseDir, '/metadata/canvases', `${tokenid.toString()}.json`);
        return pth;
    };

    pathToBubbleMetadata = (tokenid: number | bigint) => {
        const pth = path.join(this.baseDir, '/metadata/bubbles', `${tokenid.toString()}.json`);
        return pth;
    };

    pathToBrickMetadata = (tokenid: number | bigint) => {
        const pth = path.join(this.baseDir, '/metadata/bricks', `${tokenid.toString()}.json`);
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
