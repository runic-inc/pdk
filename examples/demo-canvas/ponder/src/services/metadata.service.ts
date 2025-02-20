// import { Schema } from '@/generated';
import { writeFile } from 'fs/promises';
// import { ordinalize } from '../utilities/ordinalize';
import { bubble, bubbledecorations } from '../../ponder.schema';
import { BrickService } from './brick.service';
import { BubbleService } from './bubble.service';
import { PathsService } from './paths.service';
import { Bubble } from '../generated/types';


export class MetadataService {
    baseUrl: string;
    bubbleService: BubbleService;
    brickService: BrickService;
    pathService: PathsService;

    constructor(bubbleService: BubbleService, brickService: BrickService, pathService: PathsService) {
        this.baseUrl = process.env.FS_URL!;
        this.bubbleService = bubbleService;
        this.brickService = brickService;
        this.pathService = pathService;
    }

    generateBubbleMetadata(bubble: Bubble, checkpoint: number) {
        // const ord = ordinalize(checkpoint);
        const geom = this.bubbleService.generateBubbleGeometry(bubble, checkpoint);
        const metadata = {
            name: 'Canvas Bubble #' + bubble.tokenId.toString(),
            description: `A Bubble NFT fragment commemorating the launch of Patchwork Protocol, irreversibly assigned to the Patchwork Canvas NFT. This was the ord Bubble added to the Canvas, where it was positioned at coordinates (${(
                geom.x / this.bubbleService.width
            ).toFixed(3)}, ${(geom.y / this.bubbleService.height).toFixed(3)}).`,
            external_url: 'https://canvas.patchwork.dev',
            image: this.baseUrl + `/assets/bubble/` + bubble.tokenId.toString(),
            attributes: [
                {
                    trait_type: 'Gradient Start Color',
                    value: "bubble.decorator1",
                },
                {
                    trait_type: 'Gradient End Color',
                    value: "bubble.decorator2",
                },
                {
                    display_type: 'number',
                    trait_type: 'Assignment Number',
                    value: checkpoint,
                },
            ],
        };
        return void writeFile(this.pathService.pathToBubbleMetadata(bubble.tokenId), JSON.stringify(metadata));
    }

    generateCanvasMetadata(tokenid: bigint, checkpoint: number, latestFragment: Bubble) {
        let metadata;
        switch (tokenid) {
            case 0n:
                metadata = {
                    name: 'Canvas Zero',
                    description: `A collaborative, dynamic NFT commemorating the launch of Patchwork Protocol. Each bubble represents a unique Patchwork NFT fragment irreversibly assigned to this NFT. The Canvas is completely rearranged with every new assignment. There are currently ${checkpoint} unique bubbles added to the Canvas.`,
                    external_url: 'https://canvas.patchwork.dev/0',
                    image: this.baseUrl + '/assets/canvas/0',
                    attributes: [
                        {
                            trait_type: 'Total bubbles',
                            value: checkpoint,
                        },
                        {
                            display_type: 'date',
                            trait_type: 'Last assignment',
                            value: Math.floor(Date.now() / 1000),
                        },
                        {
                            trait_type: 'Last assigner',
                            value: latestFragment.minter,
                        },
                    ],
                };
                break;
            case 1n:
                metadata = {
                    name: 'Canvas One',
                    description: `A collaborative, dynamic NFT powered by Patchwork. Each brick represents a unique Patchwork NFT fragment irreversibly assigned to this NFT. There are currently ${checkpoint} unique bricks added to the Canvas.`,
                    external_url: 'https://canvas.patchwork.dev/1',
                    image: this.baseUrl + '/assets/canvas/1',
                    attributes: [
                        {
                            trait_type: 'Total bricks',
                            value: checkpoint,
                        },
                        {
                            display_type: 'date',
                            trait_type: 'Last assignment',
                            value: Math.floor(Date.now() / 1000),
                        },
                        {
                            trait_type: 'Last assigner',
                            value: latestFragment.minter,
                        },
                    ],
                };
                break;
        }
        return void writeFile(this.pathService.pathToCanvasMetadata(tokenid), JSON.stringify(metadata));
    }

    generateBrickMetadata(brick: Bubble) {
        // const ord = ordinalize(Number(brick.tokenId));
        const metadata = {
            name: 'Canvas Brick #' + brick.tokenId.toString(),
            description: `A Brick NFT fragment, irreversibly assigned to Patchwork Canvas #1 NFT. This was the ord brick added to the canvas `,
            external_url: 'https://canvas.patchwork.dev',
            image: this.baseUrl + `/assets/brick/` + brick.tokenId.toString(),
            attributes: [
                {
                    trait_type: 'Color',
                    value: "brick.decorator1",
                },
                {
                    trait_type: 'Shape',
                    value: "brick.decorator2",
                },
                {
                    display_type: 'number',
                    trait_type: 'Assignment Number',
                    value: Number(brick.tokenId) + 1,
                },
            ],
        };
        return void writeFile(this.pathService.pathToBrickMetadata(brick.tokenId), JSON.stringify(metadata));
    }

    refreshCanvasMetadata(tokenid: bigint) {
        void fetch(
            `https://testnets-api.opensea.io/api/v2/chain/sepolia/contract/${process.env.ETH_SEPOLIA_CANVAS_ADDRESS}/nfts/${tokenid.toString()}/refresh`,
            { method: 'POST' },
        );
    }

    refreshBubbleMetadata(tokenid: bigint) {
        void fetch(
            `https://testnets-api.opensea.io/api/v2/chain/sepolia/contract/${process.env.ETH_SEPOLIA_BUBBLE_ADDRESS}/nfts/${tokenid.toString()}/refresh`,
            { method: 'POST' },
        );
    }
}
