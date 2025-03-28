import { Context } from '@/generated';
import Sharp from 'sharp';
import { Address, Hex, keccak256 } from 'viem';
import { pathsService } from '.';
import { Bubble } from '../generated/types';

interface BubGeom {
    x: number;
    y: number;
    r: number;
}

export class BubbleService {
    bubbles: Bubble[];
    width: number;
    height: number;
    images: string[];

    constructor() {
        this.bubbles = [];
        this.width = 8640 / 2;
        this.height = 4320 / 2;
        this.images = [
            '../img/clown_face_flat.svg',
            '../img/collision_flat.svg',
            '../img/grinning_face_with_big_eyes_flat.svg',
            '../img/grinning_squinting_face_flat.svg',
            '../img/money-mouth_face_flat.svg',
            '../img/rolling_on_the_floor_laughing_flat.svg',
            '../img/see-no-evil_monkey_flat.svg',
            '../img/smiling_cat_with_heart-eyes_flat.svg',
            '../img/star-struck_flat.svg',
            '../img/zipper-mouth_face_flat.svg',
        ];
    }

    generateBubbleGeometry(bubble: Bubble): BubGeom {
        const ts = bubble.timestamp ?? BigInt(new Date().toUTCString());
        const seed = keccak256((bubble.owner + ts.toString()) as Hex).substring(
            2,
            42,
        );

        const edgePadding = 0.01; // 1% of width

        const base = keccak256(
            (bubble.minter + bubble.tokenId.toString()) as Hex,
        ).substring(2, 42);
        const seedX =
            ((parseInt(seed, 16) * parseInt(base.substring(0, 20), 16)) %
                1001) /
            1001; // set to % 1000 / 1000
        const seedY =
            ((parseInt(seed, 16) * parseInt(base.substring(20), 16)) % 1001) /
            1001;
        const x = Math.min(
            this.width - this.width * edgePadding,
            Math.max(this.width * edgePadding, seedX * this.width),
        );
        const y = Math.min(
            this.height - this.height * (edgePadding * 2),
            Math.max(this.height * (edgePadding * 2), seedY * this.height),
        );

        return {
            x: x,
            y: y,
            r: 16,
        };
    }

    async drawCanvas(latestBubble: Bubble, context: Context): Promise<any> {
        const image = this.selectImage(
            latestBubble.owner,
            latestBubble.timestamp ?? BigInt(new Date().toUTCString()),
        );

        let sharp: Sharp.Sharp;
        const outputPath = pathsService.pathToCanvasImage(latestBubble.tokenId);
        const width = this.width;
        const height = this.height;

        if (latestBubble.tokenId === 0n) {
            // first bubble create canvas
            sharp = Sharp({
                create: {
                    width: width,
                    height: height,
                    channels: 4,
                    background: { r: 2, g: 6, b: 23, alpha: 1 },
                },
            });
        } else {
            // use previous canvas as source for new image
            sharp = Sharp(
                pathsService.pathToCanvasImage(latestBubble.tokenId - 1n),
            );
        }

        const bubbleGeom = this.generateBubbleGeometry(latestBubble);

        await sharp
            .composite([
                {
                    input: image,
                    left: Math.round(bubbleGeom.x - bubbleGeom.r),
                    top: Math.round(bubbleGeom.y - bubbleGeom.r),
                },
            ])
            .toFile(outputPath);

        await this.drawBubbleNft(
            image,
            pathsService.pathToBubbleImage(latestBubble.tokenId),
        );
    }

    selectImage(owner: Address, timestamp: bigint): string {
        const base = keccak256((owner + timestamp.toString()) as Hex).substring(
            2,
            34,
        );
        const index = parseInt(base, 16) % 10;
        console.log(this.images, base, index);
        return this.images[index] as string;
    }

    async drawBubbleNft(image: string, path: string) {
        const bubblesvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1000" height="1000" viewBox="0 0 1000 1000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="1000" height="1000" fill="#101010"/>
        <g>
                    <path d="M612.45 153.64C609.165 153.64 606.306 153.085 603.874 151.976C601.442 150.867 599.565 149.309 598.242 147.304C596.919 145.299 596.258 142.931 596.258 140.2H605.858C605.858 141.779 606.455 143.037 607.65 143.976C608.887 144.872 610.551 145.32 612.642 145.32C614.647 145.32 616.205 144.872 617.314 143.976C618.466 143.08 619.042 141.843 619.042 140.264C619.042 138.899 618.615 137.725 617.762 136.744C616.909 135.763 615.714 135.101 614.178 134.76L609.442 133.672C605.474 132.733 602.381 131.005 600.162 128.488C597.986 125.928 596.898 122.813 596.898 119.144C596.898 116.413 597.517 114.045 598.754 112.04C600.034 109.992 601.826 108.413 604.13 107.304C606.434 106.195 609.165 105.64 612.322 105.64C617.101 105.64 620.877 106.835 623.65 109.224C626.466 111.571 627.874 114.749 627.874 118.76H618.274C618.274 117.267 617.741 116.093 616.674 115.24C615.65 114.387 614.157 113.96 612.194 113.96C610.359 113.96 608.951 114.387 607.97 115.24C606.989 116.051 606.498 117.224 606.498 118.76C606.498 120.125 606.882 121.299 607.65 122.28C608.461 123.219 609.591 123.859 611.042 124.2L616.034 125.352C620.173 126.291 623.309 127.997 625.442 130.472C627.575 132.904 628.642 136.019 628.642 139.816C628.642 142.547 627.959 144.957 626.594 147.048C625.271 149.139 623.394 150.76 620.962 151.912C618.573 153.064 615.735 153.64 612.45 153.64Z" fill="white"/>
                    <path d="M550.075 153L561.531 106.28H573.691L585.275 153H575.483L573.243 142.44H562.107L559.867 153H550.075ZM563.707 134.76H571.579L569.339 123.496C569.041 121.875 568.721 120.275 568.379 118.696C568.081 117.075 567.846 115.816 567.675 114.92C567.505 115.816 567.27 117.053 566.971 118.632C566.715 120.211 566.417 121.811 566.075 123.432L563.707 134.76Z" fill="white"/>
                    <path d="M516.884 153L505.3 106.28H515.22L521.684 135.784C521.897 136.808 522.153 138.109 522.452 139.688C522.793 141.267 523.049 142.611 523.22 143.72C523.391 142.611 523.604 141.267 523.86 139.688C524.116 138.109 524.351 136.787 524.564 135.72L530.836 106.28H540.5L529.044 153H516.884Z" fill="white"/>
                    <path d="M462.765 153V106.28H473.965L486.061 142.44C485.933 140.861 485.784 139.048 485.613 137C485.442 134.909 485.293 132.84 485.165 130.792C485.08 128.701 485.037 126.931 485.037 125.48V106.28H493.485V153H482.285L470.317 116.84C470.445 118.205 470.573 119.827 470.701 121.704C470.829 123.581 470.936 125.48 471.021 127.4C471.149 129.32 471.213 131.027 471.213 132.52V153H462.765Z" fill="white"/>
                    <path d="M415.75 153L427.206 106.28H439.366L450.95 153H441.158L438.918 142.44H427.782L425.542 153H415.75ZM429.382 134.76H437.254L435.014 123.496C434.715 121.875 434.395 120.275 434.054 118.696C433.755 117.075 433.521 115.816 433.35 114.92C433.179 115.816 432.945 117.053 432.646 118.632C432.39 120.211 432.091 121.811 431.75 123.432L429.382 134.76Z" fill="white"/>
                    <path d="M388.895 153.64C385.738 153.64 382.986 153.064 380.639 151.912C378.292 150.717 376.458 149.075 375.135 146.984C373.855 144.851 373.215 142.376 373.215 139.56V119.72C373.215 116.861 373.855 114.387 375.135 112.296C376.458 110.205 378.292 108.584 380.639 107.432C382.986 106.237 385.738 105.64 388.895 105.64C392.01 105.64 394.719 106.237 397.023 107.432C399.37 108.584 401.183 110.205 402.463 112.296C403.786 114.387 404.447 116.861 404.447 119.72H394.847C394.847 117.843 394.314 116.413 393.247 115.432C392.223 114.451 390.751 113.96 388.831 113.96C386.911 113.96 385.418 114.451 384.351 115.432C383.327 116.413 382.815 117.843 382.815 119.72V139.56C382.815 141.395 383.327 142.824 384.351 143.848C385.418 144.829 386.911 145.32 388.831 145.32C390.751 145.32 392.223 144.829 393.247 143.848C394.314 142.824 394.847 141.395 394.847 139.56H404.447C404.447 142.376 403.786 144.851 402.463 146.984C401.183 149.075 399.37 150.717 397.023 151.912C394.719 153.064 392.01 153.64 388.895 153.64Z" fill="white"/>
                </g>
                <g opacity="0.25">
                    <path d="M975.71 961.357H979.57L974.21 966.811L979.57 974.7H975.822L971.98 968.928L970.181 970.709V974.7H967.014V961.357H970.181V967.129L975.71 961.357Z" fill="#DEEDFF"/>
                    <path d="M964.698 971.383L965.085 973.257C965.085 973.257 965.312 974.7 965.899 974.7H962.638C962.092 974.7 961.88 973.238 961.88 973.238L961.531 971.739C961.531 971.739 961.325 970.502 961.025 970.221C960.725 969.94 960.238 969.79 959.564 969.79H956.977V974.7H953.81V961.357H960.126C961.681 961.357 962.881 961.713 963.705 962.407C964.53 963.1 964.961 964.037 964.961 965.218C964.961 966.754 964.23 967.823 962.806 968.385C963.48 968.61 963.968 968.966 964.23 969.415C964.542 969.951 964.698 971.383 964.698 971.383ZM956.977 963.887V967.41H959.77C960.369 967.41 960.857 967.26 961.194 966.96C961.531 966.661 961.7 966.211 961.7 965.63C961.7 964.468 961.025 963.887 959.713 963.887H956.977Z" fill="#DEEDFF"/>
                    <path d="M945.128 975C943.085 975 941.436 974.363 940.18 973.088C938.906 971.814 938.288 970.128 938.288 968.029C938.288 965.948 938.906 964.262 940.18 962.969C941.436 961.694 943.085 961.057 945.128 961.057C947.152 961.057 948.801 961.694 950.075 962.969C951.331 964.262 951.968 965.948 951.968 968.029C951.968 970.128 951.331 971.814 950.075 973.088C948.801 974.363 947.152 975 945.128 975ZM942.56 971.121C943.198 971.87 944.041 972.245 945.128 972.245C946.177 972.245 947.039 971.87 947.714 971.121C948.351 970.39 948.688 969.359 948.688 968.029C948.688 966.717 948.351 965.686 947.714 964.936C947.039 964.187 946.177 963.812 945.128 963.812C944.041 963.812 943.198 964.187 942.56 964.936C941.904 965.686 941.586 966.717 941.586 968.029C941.586 969.359 941.904 970.39 942.56 971.121Z" fill="#DEEDFF"/>
                    <path d="M914.957 966.454V961.357H918.124V974.7H914.957V969.303H909.597V974.7H906.43V961.357H909.597V966.454H914.957Z" fill="#DEEDFF"/>
                    <path d="M898.255 975C896.268 975 894.657 974.382 893.439 973.107C892.202 971.852 891.602 970.165 891.602 968.029C891.602 965.892 892.202 964.187 893.401 962.931C894.6 961.694 896.212 961.057 898.255 961.057C899.904 961.057 901.291 961.507 902.453 962.369C903.615 963.269 904.327 964.671 904.57 966.282H901.366C901.16 965.533 900.785 964.824 900.241 964.412C899.698 963.999 899.042 963.793 898.255 963.793C897.168 963.793 896.343 964.168 895.762 964.899C895.181 965.649 894.9 966.679 894.9 968.029C894.9 969.378 895.181 970.427 895.762 971.158C896.343 971.908 897.168 972.264 898.255 972.264C899.079 972.264 899.773 972.039 900.354 971.552C900.916 971.083 901.291 970.281 901.441 969.419H904.608C904.402 971.143 903.727 972.639 902.565 973.576C901.384 974.531 899.941 975 898.255 975Z" fill="#DEEDFF"/>
                    <path d="M879.656 961.357H891.032V964.187H886.928V974.7H883.742V964.187H879.656V961.357Z" fill="#DEEDFF"/>
                    <path d="M880.841 974.7H877.487L876.7 972.376H871.153L870.384 974.7H867.142L872.052 961.357H875.819L880.841 974.7ZM872.802 967.448L872.033 969.734H875.8L875.032 967.448C874.788 966.773 874.413 965.649 873.907 964.074C873.233 966.117 872.877 967.242 872.802 967.448Z" fill="#DEEDFF"/>
                    <path d="M857 961.357H863.072C864.609 961.357 865.808 961.769 866.689 962.575C867.551 963.381 868.001 964.468 868.001 965.855C868.001 967.242 867.551 968.347 866.689 969.153C865.808 969.959 864.609 970.352 863.072 970.352H860.167V974.7H857V961.357ZM860.167 967.673H862.866C863.484 967.673 863.971 967.523 864.309 967.204C864.646 966.904 864.833 966.454 864.833 965.855C864.833 965.274 864.646 964.824 864.309 964.506C863.953 964.206 863.465 964.037 862.866 964.037H860.167V967.673Z" fill="#DEEDFF"/>
                    <path d="M923.733 971.626H926.954V974.7H923.733V971.626Z" fill="#DEEDFF"/>
                    <path d="M930.175 971.626H933.396V974.7H930.175V971.626Z" fill="#DEEDFF"/>
                    <path d="M926.954 961.341H930.175V971.626H926.954V961.341Z" fill="#DEEDFF"/>
                    <path d="M920.512 961.341H923.733V974.7L920.512 974.7V961.341Z" fill="#DEEDFF"/>
                    <path d="M933.396 961.341H936.617V967.453H933.396V961.341Z" fill="#DEEDFF"/>
                </g>
            </svg>`;

        await Sharp(Buffer.from(bubblesvg))
            .png()
            .composite([
                {
                    input: await Sharp(image)
                        .resize(500, 500) // resize the overlay
                        .toBuffer(),
                    left: 250,
                    top: 250,
                },
            ])
            .toFile(path);

        return;
    }
}
