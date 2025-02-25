import { writeFile } from 'fs/promises';
import { Bubble } from '../generated/types';
import { BubbleService } from './bubble.service';
import { PathsService } from './paths.service';

export class MetadataService {
    baseUrl: string;
    bubbleService: BubbleService;
    pathService: PathsService;

    constructor(bubbleService: BubbleService, pathService: PathsService) {
        this.baseUrl = process.env.FS_URL!;
        this.bubbleService = bubbleService;
        this.pathService = pathService;
    }

    generateBubbleMetadata(bubble: Bubble, checkpoint: number) {
        const geom = this.bubbleService.generateBubbleGeometry(bubble);
        const metadata = {
            name: 'Canvas Bubble #' + bubble.tokenId.toString(),
            description: `A Bubble NFT fragment irreversibly assigned to the Patchwork Canvas NFT. This was the ord Bubble added to the Canvas, where it was positioned at coordinates (${(
                geom.x / this.bubbleService.width
            ).toFixed(
                3,
            )}, ${(geom.y / this.bubbleService.height).toFixed(3)}).`,
            external_url: 'https://canvas.patchwork.dev',
            image: this.baseUrl + `/assets/bubble/` + bubble.tokenId.toString(),
            attributes: [
                {
                    trait_type: 'Gradient Start Color',
                    value: 'bubble.decorator1',
                },
                {
                    trait_type: 'Gradient End Color',
                    value: 'bubble.decorator2',
                },
                {
                    display_type: 'number',
                    trait_type: 'Assignment Number',
                    value: checkpoint,
                },
            ],
        };
        return void writeFile(
            this.pathService.pathToBubbleMetadata(bubble.tokenId),
            JSON.stringify(metadata),
        );
    }

    generateCanvasMetadata(
        tokenid: bigint,
        checkpoint: number,
        latestFragment: Bubble,
    ) {
        let metadata;
        switch (tokenid) {
            case 0n:
                metadata = {
                    name: 'Canvas Zero',
                    description: `A collaborative, dynamic NFT. Each bubble represents a unique Patchwork NFT fragment irreversibly assigned to this NFT.`,
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
                            value: latestFragment.timestamp,
                        },
                        {
                            trait_type: 'Last assigner',
                            value: latestFragment.minter,
                        },
                    ],
                };
                break;
        }
        return void writeFile(
            this.pathService.pathToCanvasMetadata(tokenid),
            JSON.stringify(metadata),
        );
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
