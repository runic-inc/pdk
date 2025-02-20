export type Point = { x: number; y: number };

export type PlacementResult = {
    score: number;
    offsetX: number;
    offsetY: number;
    finalCoordinates: Point[];
    rotation: number; // rotation in degrees
};

export type EdgeCell = {
    x: number;
    y: number;
    neighborCount: number;
};

export type Cell = {
    color: string | null; // null means cell empty
    neighborCount: number; // ct of neighboring filled cells
};

export class Grid {
    cells: Map<string, Cell> = new Map();
    private extentTop = 0;
    private extentRight = 0;
    private extentBottom = 0;
    private extentLeft = 0;

    constructor() {}

    key(x: number, y: number): string {
        return `${x},${y}`;
    }

    keyToCoords(key: string): [number, number] {
        const [_x, _y] = key.split(',');
        const x = parseInt(_x!);
        const y = parseInt(_y!);
        return [x, y];
    }

    unsetCell(x: number, y: number): void {
        const key = this.key(x, y);
        if (this.cells.has(key)) {
            this.cells.delete(key);
        }
    }

    setCell(x: number, y: number, color: string | null): void {
        const key = this.key(x, y);

        if (!this.cells.has(key)) {
            // init cell with no neighbors if doesn't exist
            this.cells.set(key, { color: null, neighborCount: 0 });
        }

        const cell = this.cells.get(key)!;
        cell.color = color;

        this.extentTop = Math.min(this.extentTop, y);
        this.extentRight = Math.max(this.extentRight, x);
        this.extentBottom = Math.max(this.extentBottom, y);
        this.extentLeft = Math.min(this.extentLeft, x);

        // update neighboring cell neighbor cts
        this.updateNeighborCounts(x, y, color !== null ? 1 : -1);
    }

    private updateNeighborCounts(x: number, y: number, increment: number): void {
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 0, dy: 1 }, // down
            { dx: -1, dy: 0 }, // left
            { dx: 1, dy: 0 }, // right
        ];

        for (const { dx, dy } of directions) {
            const neighborKey = this.key(x + dx, y + dy);
            if (!this.cells.has(neighborKey)) {
                this.cells.set(neighborKey, { color: null, neighborCount: 0 });
            }
            const neighbor = this.cells.get(neighborKey)!;
            neighbor.neighborCount += increment;
        }
    }

    // retrieve all available edges and rank by neighbor ct
    getRankedEdges(): EdgeCell[] {
        const edges: EdgeCell[] = [];

        for (const [key, value] of this.cells) {
            const [x, y] = this.keyToCoords(key);

            // edge cell should have no color and positive neighbor count
            if (value.color === null && value.neighborCount > 0) {
                edges.push({ x, y, neighborCount: value.neighborCount });
            }
        }

        // sort by neighbor ct
        edges.sort((a, b) => b.neighborCount - a.neighborCount);

        return edges;
    }

    private rotate90Clockwise(blocks: Point[]): Point[] {
        return blocks.map((block) => ({ x: block.y, y: -block.x }));
    }

    // find the best fitness score and return best placement
    bestPlacementWithRotation(brick: Point[], emptyCell: Point): PlacementResult | null {
        let bestScore = -1;
        let bestOffsetX = 0;
        let bestOffsetY = 0;
        let bestCoordinates: Point[] = [];
        let bestRotation = 0;

        let rotatedBlocks = brick;

        for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
            const currentRotation = rotationIndex * 90;

            // move and shift brick around to find best placement
            for (const anchor of rotatedBlocks) {
                // calculate offsets to align this anchor with the empty cell
                const offsetX = emptyCell.x - anchor.x;
                const offsetY = emptyCell.y - anchor.y;

                // shift all blocks, calc the fitness score
                let score = 0;
                let valid = true;
                const currentCoordinates: Point[] = [];
                const emptyNeighbors: Map<string, number> = new Map();

                for (const block of rotatedBlocks) {
                    const translatedX = block.x + offsetX;
                    const translatedY = block.y + offsetY;
                    const key = this.key(translatedX, translatedY);

                    // check for overlaps, mark as invalid if found
                    const existingCell = this.cells.get(key);
                    if (existingCell && existingCell.color !== null) {
                        valid = false;
                        break;
                    }

                    // track the final coords for this placemnt
                    currentCoordinates.push({ x: translatedX, y: translatedY });

                    // score the placement
                    if (existingCell) {
                        score += existingCell.neighborCount;
                    }

                    const neighbors = [
                        { x: translatedX + 1, y: translatedY },
                        { x: translatedX - 1, y: translatedY },
                        { x: translatedX, y: translatedY + 1 },
                        { x: translatedX, y: translatedY - 1 },
                    ];

                    // iterate over neighbors
                    for (const neighbor of neighbors) {
                        const neighborKey = this.key(neighbor.x, neighbor.y);
                        const neighborCell = this.cells.get(neighborKey);
                        if (!neighborCell || neighborCell.color === null) {
                            const count = emptyNeighbors.get(neighborKey) ?? 0;
                            emptyNeighbors.set(neighborKey, count + 1);
                        }
                    }
                }

                // make sure we create an isolated empty
                for (const [_, filledNeighborCount] of emptyNeighbors) {
                    if (filledNeighborCount == 4) {
                        valid = false;
                        break;
                    }
                }

                if (valid && score > bestScore) {
                    bestScore = score;
                    bestOffsetX = offsetX;
                    bestOffsetY = offsetY;
                    bestCoordinates = currentCoordinates;
                    bestRotation = currentRotation;
                }
            }

            // rotate for next iteration
            rotatedBlocks = this.rotate90Clockwise(rotatedBlocks);
        }

        if (bestScore === -1) {
            return null;
        }

        // return best placement
        return {
            score: bestScore,
            offsetX: bestOffsetX,
            offsetY: bestOffsetY,
            finalCoordinates: bestCoordinates,
            rotation: bestRotation,
        };
    }

    placeFirstBrick(brick: Point[], color: string): void {
        const centerX = 0;
        const centerY = 0;
        const result = this.bestPlacementWithRotation(brick, { x: centerX, y: centerY });
        this.placeBrick(result!, color);
    }

    placeBrick(result: PlacementResult, color: string): void {
        for (const coordinate of result.finalCoordinates) {
            this.setCell(coordinate.x, coordinate.y, color);
        }
    }

    // find best-scoring placement
    findBestPlacementForBrick(brick: Point[], color: string): void {
        const rankedEdges = this.getRankedEdges();
        let bestResult: PlacementResult | null = null;

        // check each edge and find the best scoring configuration
        for (const edge of rankedEdges) {
            const result = this.bestPlacementWithRotation(brick, { x: edge.x, y: edge.y });
            if (result && (!bestResult || result.score > bestResult.score)) {
                bestResult = result;
            }
        }

        if (bestResult) {
            this.placeBrick(bestResult, color);
        } else {
            console.log('No valid placement found');
        }
    }

    getBounds(): [number, number, number, number] {
        return [this.extentTop, this.extentRight, this.extentBottom, this.extentLeft];
    }
}
