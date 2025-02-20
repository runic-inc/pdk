import { Context } from '@/generated';
import { bubble } from '../../ponder.schema';
import { existsSync, statSync } from 'fs';
import { writeFile } from 'fs/promises';
import { Address, Hex, keccak256 } from 'viem';
import { metadataService, pathsService } from '.';
import { Bubble } from '../generated/types';

// TODO: temporary, try and use ponder's Bubble type instead of this

interface BubGeom {
    x: number;
    y: number;
    r: number;
    // layer: number;
}

export class BubbleService {
    bubbles: Bubble[];
    // layers: number;
    width: number;
    height: number;

    constructor() {
        this.bubbles = [];
        // Make sure this matches app and ui!!
        // this.layers = 12;
        this.width = 8640 / 2;
        this.height = 4320 / 2;
    }

    generateBubbleColors(address: Address, ownedCount: number): [string, string] {
        console.log('Generating bubble colors for ', address, ownedCount);
        const base = keccak256((address + ownedCount.toString()) as Hex).substring(2, 62);
        const hash1 = parseInt(base.substring(0, 10), 16);
        const hash2 = parseInt(base.substring(10, 20), 16);
        const hash3 = parseInt(base.substring(20, 30), 16);
        const hash4 = parseInt(base.substring(30, 40), 16);
        const hash5 = parseInt(base.substring(40, 50), 16);
        const hash6 = parseInt(base.substring(50), 16);

        //const color1 = `hsla(${hash1 % 360}deg, ${90 + (hash2 % 10)}%, ${30 + (hash3 % 30)}%, 1)`;
        //const color2 = `hsla(${hash6 % 360}deg, ${90 + (hash5 % 10)}%, ${40 + (hash4 % 40)}%, 0.75)`;

        const color1 = `hsla(${hash1 % 360}deg, ${90 + (hash2 % 10)}%, ${30 + (hash3 % 40)}%, 1)`;
        const color2 = `hsla(${hash6 % 360}deg, ${90 + (hash5 % 10)}%, ${25 + (hash4 % 50)}%, 0.7)`;

        return [color1, color2];
    }

    generateBubbleGeometry(bubble: Bubble, checkpoint: number): BubGeom {
        const i = this.bubbles.findIndex(({ tokenId }) => tokenId == bubble.tokenId);
        const latestBubble = this.bubbles[checkpoint - 1]!;
        const seed = keccak256((latestBubble.minter + latestBubble.tokenId.toString()) as Hex).substring(2, 42);

        const edgePadding = 0.01; // 1% of width
        // const ctPerLayer = Math.ceil(checkpoint / this.layers);i

        // eg subtract trancheDecrease from maxradius for every N tranche items in the count
        const tranche = 100;
        const trancheDecrease = 0.6;

        // use trancheDecrease to lower starting radius
        const minStartRadius = 12;
        const maxStartRadius = 60;
        const radiusDelta = Math.floor(checkpoint / tranche) * trancheDecrease;
        const radius = Math.max(minStartRadius, maxStartRadius - radiusDelta);

        const base = keccak256((bubble.minter + bubble.tokenId.toString()) as Hex).substring(2, 42);
        const seedX = ((parseInt(seed, 16) * parseInt(base.substring(0, 20), 16)) % 1001) / 1001; // set to % 1000 / 1000
        const seedY = ((parseInt(seed, 16) * parseInt(base.substring(20), 16)) % 1001) / 1001;
        const r = Math.max(radius - ((checkpoint - i) / checkpoint) * (radius - radius * 0.1), radius - i);
        const x = Math.min(this.width - this.width * edgePadding, Math.max(this.width * edgePadding, seedX * this.width));
        const y = Math.min(this.height - this.height * (edgePadding * 2), Math.max(this.height * (edgePadding * 2), seedY * this.height));

        // const bubbleLayer = Math.floor(i / ctPerLayer);

        return {
            x: x,
            y: y,
            r: r,
            // layer: bubbleLayer,
        };
    }

    drawBubble(bubble: Bubble, geom: BubGeom, classes?: string): string {
        const randomChars = new Uint32Array(32);
        crypto.getRandomValues(randomChars);
        return `
            <g class="${classes}">
                <circle
                    cx="${geom.x}"
                    cy="${geom.y}"
                    r="${geom.r}"
                    fill="url(#linear_${randomChars[0]})"
                    style="filter: url(#shadow)"
                />
                <circle
                    cx="${geom.x}"
                    cy="${geom.y}"
                    r="${geom.r}"
                    fill="url(#inner-hint)"
                />
                <linearGradient
                    id="linear_${randomChars[0]}"
                    x1="${geom.x - geom.r + geom.r * 0.1}"
                    y1="${geom.y - geom.r + geom.r * 0.1}"
                    x2="${geom.x + geom.r - geom.r * 0.1}"
                    y2="${geom.y + geom.r - geom.r * 0.1}"
                    gradientUnits="userSpaceOnUse">
                    <stop stop-color="hsla(24deg, 91%, 44%, 1)" />
                    <stop offset="1" stop-color="hsla(200deg, 92%, 57%, 0.7)" />
                </linearGradient>
            </g>
        `;
    }

    async drawCanvas(latestBubble: Bubble, context: Context): Promise<any> {
        // const { Fragment, Checkpoint } = context.db;
        this.bubbles.push(latestBubble);

        const ct = this.bubbles.length;
        if (!ct) return;

        // const cp = await Checkpoint.create({
        //     id: '0_' + ct.toString().padStart(7, '0'),
        //     data: {
        //         itemCount: ct,
        //         canvasId: latestBubble.canvasId,
        //         fragmentId: latestBubble.id,
        //         assetsGenerated: false,
        //     },
        // });
        // await Fragment.update({
        //     id: latestBubble.id,
        //     data: ({ current }) => ({
        //         ...current,
        //         checkpointId: cp.id,
        //     }),
        // });

        console.log('Generating Bubble metadata for token ID ' + latestBubble.id.toString());
        metadataService.generateBubbleMetadata(latestBubble, ct); // remove me later
        metadataService.generateCanvasMetadata(0n, ct, latestBubble); // remove me later

        if (existsSync(pathsService.pathToCheckpointImage(0, ct)) && statSync(pathsService.pathToCheckpointImage(0, ct)).size > 1000) {
            //console.log('Checkpoint image exists for ' + ct);
            //await this.saveCanvasStatus(ct, context);
            //return;
        }

        console.log('Generating image for checkpoint ' + ct);

        // const layeredBubbles: Record<number, string[]> = Object.fromEntries(new Array(this.layers).fill('').map((_, i) => [i, new Array()]));
        const bubbleSVG: string[] = []
        let latestBubbleGeom: BubGeom;
        // generate bubble layers
        this.bubbles.forEach((b, i) => {
            const geometry = this.generateBubbleGeometry(b, ct);
            if (b.id == latestBubble.id) latestBubbleGeom = geometry;
            // layeredBubbles[geometry.layer]?.push(this.drawBubble(b, geometry, b.id == latestBubble.id ? 'latestbubble' : 'oldbubble'));
            bubbleSVG.push(this.drawBubble(b, geometry, b.id == latestBubble.id ? 'latestbubble' : 'oldbubble'))
        });

        const svgObj = {
            open: `
                <svg
                    width="${this.width}"
                    height="${this.height}"
                    viewBox="0 0 ${this.width} ${this.height}"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">`,
            bg: `<rect x="-600" y="-600" width="${this.width + 1200}" height="${this.height + 1200}" fill="#020617" />`,
            bubbles: bubbleSVG,
            close: `<defs>
                        <radialGradient id="inner-hint" gradientTransform="translate(-0.1, -0.025) scale(1.2)">
                            <stop offset="0.3" stop-color="#fff" stop-opacity="0" />
                            <stop offset="0.6" stop-color="#fff" stop-opacity="0.05" />
                            <stop offset="0.85" stop-color="#fff" stop-opacity="0.22" />
                            <stop offset="1" stop-color="#fff" stop-opacity="0.8" />
                        </radialGradient>
                        <filter id="shadow" x="-100%" y="-20%" width="300%" height="400%">
                            <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#00000099" />
                        </filter>
                        <filter id="blur">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                        </filter>
                    </defs>
                </svg>`,
        };

        void this.saveImages(svgObj, ct, latestBubble, latestBubbleGeom!, context);
    }

    drawBubbleNft(
        svgObj: {
            open: string;
            bg: string;
            bubbles: string[];
            close: string;
        },
        checkpoint: number,
        bubble: Bubble,
        geom: BubGeom,
    ): string {
        const x = Math.round(geom.x - geom.r * 1.9);
        const y = Math.round(geom.y - geom.r * 1.9);
        const a = Math.round(geom.r * 3.8);

        const svgObjCopy = structuredClone(svgObj);
        const layers = Object.values(svgObjCopy.bubbles);

        const textSvg = `
            <svg width="${a}" height="${a}" viewBox="0 0 1000 1000" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
                <style type="text/css">
                    @font-face {
                        font-family: 'JetBrains Mono';
                        src: url(data:application/font-woff;charset=utf-8;base64,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) format('woff');
                        font-weight: 400;
                        font-style: normal;
                    }
                    .lbl-glow { text-shadow: 0 0 10px #fff8; }
                </style>
                <defs>
                    <filter id="text-glow">
                        <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#fff9" />
                    </filter>
                </defs>
                <text filter="url(#text-glow)" xml:space="preserve" style="white-space: pre; transform: translateX(19px);" font-family="JetBrains Mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace" font-size="48" font-weight="400" letter-spacing="10px" text-anchor="middle" x="500" y="480" fill="white">BUBBLE NO.</text>
                <text filter="url(#text-glow)" xml:space="preserve" style="white-space: pre" font-family="JetBrains Mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace" font-size="48" font-weight="400" letter-spacing="10px" text-anchor="middle" x="500" y="545" fill="white">${bubble.tokenId.toString()}</text>
            </svg>
        `;

        const logoSvg = `
            <svg width="${a}" height="${a}" viewBox="0 0 1000 1000" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
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
            </svg>
        `;

        const addressSvg = `
            <svg width="${a}" height="${a}" viewBox="0 0 1000 1000" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
                <style type="text/css">
                    @font-face {
                        font-family: 'JetBrains Mono';
                        src: url(data:application/font-woff;charset=utf-8;base64,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) format('woff');
                        font-weight: 500;
                        font-style: normal;
                    }
                </style>
                <text fill="#fffa" xml:space="preserve" style="text-transform: uppercase; white-space: pre" font-family="JetBrains Mono, ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace" font-size="16" font-weight="500" letter-spacing="0.2em"><tspan x="233.431" y="882.26">${bubble.owner.toUpperCase()}</tspan></text>
                <g>
                    <path d="M587.253 853V849.88L584.733 844.24H586.617L587.721 846.88C587.833 847.144 587.929 847.424 588.009 847.72C588.097 848.016 588.157 848.256 588.189 848.44C588.229 848.256 588.285 848.016 588.357 847.72C588.437 847.424 588.529 847.144 588.633 846.88L589.701 844.24H591.573L589.053 849.88V853H587.253Z" fill="white" fill-opacity="0.3"/>
                    <path d="M576.95 853V844.24H579.77C580.658 844.24 581.366 844.444 581.894 844.852C582.422 845.252 582.686 845.796 582.686 846.484C582.686 846.868 582.594 847.204 582.41 847.492C582.234 847.78 581.994 848.004 581.69 848.164C581.394 848.324 581.07 848.404 580.718 848.404V848.44C581.11 848.432 581.466 848.504 581.786 848.656C582.114 848.808 582.378 849.036 582.578 849.34C582.778 849.644 582.878 850.02 582.878 850.468C582.878 850.98 582.754 851.428 582.506 851.812C582.266 852.188 581.922 852.48 581.474 852.688C581.026 852.896 580.494 853 579.878 853H576.95ZM578.69 851.548H579.806C580.198 851.548 580.506 851.444 580.73 851.236C580.954 851.028 581.066 850.74 581.066 850.372C581.066 850.004 580.954 849.716 580.73 849.508C580.506 849.292 580.198 849.184 579.806 849.184H578.69V851.548ZM578.69 847.768H579.746C580.098 847.768 580.374 847.676 580.574 847.492C580.774 847.3 580.874 847.044 580.874 846.724C580.874 846.396 580.774 846.144 580.574 845.968C580.374 845.784 580.098 845.692 579.746 845.692H578.69V847.768Z" fill="white" fill-opacity="0.3"/>
                    <path d="M562.967 853.12C562.351 853.12 561.815 853.016 561.359 852.808C560.903 852.6 560.551 852.308 560.303 851.932C560.055 851.556 559.931 851.112 559.931 850.6H561.731C561.731 850.896 561.843 851.132 562.067 851.308C562.299 851.476 562.611 851.56 563.003 851.56C563.379 851.56 563.671 851.476 563.879 851.308C564.095 851.14 564.203 850.908 564.203 850.612C564.203 850.356 564.123 850.136 563.963 849.952C563.803 849.768 563.579 849.644 563.291 849.58L562.403 849.376C561.659 849.2 561.079 848.876 560.663 848.404C560.255 847.924 560.051 847.34 560.051 846.652C560.051 846.14 560.167 845.696 560.399 845.32C560.639 844.936 560.975 844.64 561.407 844.432C561.839 844.224 562.351 844.12 562.943 844.12C563.839 844.12 564.547 844.344 565.067 844.792C565.595 845.232 565.859 845.828 565.859 846.58H564.059C564.059 846.3 563.959 846.08 563.759 845.92C563.567 845.76 563.287 845.68 562.919 845.68C562.575 845.68 562.311 845.76 562.127 845.92C561.943 846.072 561.851 846.292 561.851 846.58C561.851 846.836 561.923 847.056 562.067 847.24C562.219 847.416 562.431 847.536 562.703 847.6L563.639 847.816C564.415 847.992 565.003 848.312 565.403 848.776C565.803 849.232 566.003 849.816 566.003 850.528C566.003 851.04 565.875 851.492 565.619 851.884C565.371 852.276 565.019 852.58 564.563 852.796C564.115 853.012 563.583 853.12 562.967 853.12Z" fill="white" fill-opacity="0.3"/>
                    <path d="M551.272 853L553.42 844.24H555.7L557.872 853H556.036L555.616 851.02H553.528L553.108 853H551.272ZM553.828 849.58H555.304L554.884 847.468C554.828 847.164 554.768 846.864 554.704 846.568C554.648 846.264 554.604 846.028 554.572 845.86C554.54 846.028 554.496 846.26 554.44 846.556C554.392 846.852 554.336 847.152 554.272 847.456L553.828 849.58Z" fill="white" fill-opacity="0.3"/>
                    <path d="M545.048 853L542.876 844.24H544.736L545.948 849.772C545.988 849.964 546.036 850.208 546.092 850.504C546.156 850.8 546.204 851.052 546.236 851.26C546.268 851.052 546.308 850.8 546.356 850.504C546.404 850.208 546.448 849.96 546.488 849.76L547.664 844.24H549.476L547.328 853H545.048Z" fill="white" fill-opacity="0.3"/>
                    <path d="M534.901 853V844.24H537.001L539.269 851.02C539.245 850.724 539.217 850.384 539.185 850C539.153 849.608 539.125 849.22 539.101 848.836C539.085 848.444 539.077 848.112 539.077 847.84V844.24H540.661V853H538.561L536.317 846.22C536.341 846.476 536.365 846.78 536.389 847.132C536.413 847.484 536.433 847.84 536.449 848.2C536.473 848.56 536.485 848.88 536.485 849.16V853H534.901Z" fill="white" fill-opacity="0.3"/>
                    <path d="M526.086 853L528.234 844.24H530.514L532.686 853H530.85L530.43 851.02H528.342L527.922 853H526.086ZM528.642 849.58H530.118L529.698 847.468C529.642 847.164 529.582 846.864 529.518 846.568C529.462 846.264 529.418 846.028 529.386 845.86C529.354 846.028 529.31 846.26 529.254 846.556C529.206 846.852 529.15 847.152 529.086 847.456L528.642 849.58Z" fill="white" fill-opacity="0.3"/>
                    <path d="M521.051 853.12C520.459 853.12 519.943 853.012 519.503 852.796C519.063 852.572 518.719 852.264 518.471 851.872C518.231 851.472 518.111 851.008 518.111 850.48V846.76C518.111 846.224 518.231 845.76 518.471 845.368C518.719 844.976 519.063 844.672 519.503 844.456C519.943 844.232 520.459 844.12 521.051 844.12C521.635 844.12 522.143 844.232 522.575 844.456C523.015 844.672 523.355 844.976 523.595 845.368C523.843 845.76 523.967 846.224 523.967 846.76H522.167C522.167 846.408 522.067 846.14 521.867 845.956C521.675 845.772 521.399 845.68 521.039 845.68C520.679 845.68 520.399 845.772 520.199 845.956C520.007 846.14 519.911 846.408 519.911 846.76V850.48C519.911 850.824 520.007 851.092 520.199 851.284C520.399 851.468 520.679 851.56 521.039 851.56C521.399 851.56 521.675 851.468 521.867 851.284C522.067 851.092 522.167 850.824 522.167 850.48H523.967C523.967 851.008 523.843 851.472 523.595 851.872C523.355 852.264 523.015 852.572 522.575 852.796C522.143 853.012 521.635 853.12 521.051 853.12Z" fill="white" fill-opacity="0.3"/>
                    <path d="M501.56 853V844.24H506.96V845.776H503.324V847.744H506.54V849.28H503.324V851.464H506.96V853H501.56Z" fill="white" fill-opacity="0.3"/>
                    <path d="M492.997 853V844.24H494.797V847.6H496.813V844.24H498.613V853H496.813V849.28H494.797V853H492.997Z" fill="white" fill-opacity="0.3"/>
                    <path d="M486.509 853V845.92H484.289V844.24H490.529V845.92H488.309V853H486.509Z" fill="white" fill-opacity="0.3"/>
                    <path d="M470.619 853.12C470.035 853.12 469.527 853.012 469.095 852.796C468.663 852.572 468.327 852.264 468.087 851.872C467.855 851.472 467.739 851.008 467.739 850.48V846.76C467.739 846.232 467.855 845.772 468.087 845.38C468.327 844.98 468.663 844.672 469.095 844.456C469.527 844.232 470.035 844.12 470.619 844.12C471.211 844.12 471.719 844.232 472.143 844.456C472.575 844.672 472.907 844.98 473.139 845.38C473.379 845.772 473.499 846.232 473.499 846.76V850.48C473.499 851.008 473.379 851.472 473.139 851.872C472.907 852.264 472.575 852.572 472.143 852.796C471.719 853.012 471.211 853.12 470.619 853.12ZM470.619 851.56C470.979 851.56 471.247 851.468 471.423 851.284C471.607 851.092 471.699 850.824 471.699 850.48V846.76C471.699 846.408 471.611 846.14 471.435 845.956C471.259 845.772 470.987 845.68 470.619 845.68C470.251 845.68 469.979 845.772 469.803 845.956C469.627 846.14 469.539 846.408 469.539 846.76V850.48C469.539 850.824 469.627 851.092 469.803 851.284C469.987 851.468 470.259 851.56 470.619 851.56Z" fill="white" fill-opacity="0.3"/>
                    <path d="M461.324 853V845.92H459.104V844.24H465.344V845.92H463.124V853H461.324Z" fill="white" fill-opacity="0.3"/>
                    <path d="M442.589 853V844.24H445.433C446.041 844.24 446.569 844.356 447.017 844.588C447.473 844.82 447.825 845.148 448.073 845.572C448.329 845.988 448.457 846.48 448.457 847.048V850.18C448.457 850.74 448.329 851.232 448.073 851.656C447.825 852.08 447.473 852.412 447.017 852.652C446.569 852.884 446.041 853 445.433 853H442.589ZM444.389 851.32H445.433C445.801 851.32 446.097 851.216 446.321 851.008C446.545 850.8 446.657 850.524 446.657 850.18V847.048C446.657 846.712 446.545 846.44 446.321 846.232C446.097 846.024 445.801 845.92 445.433 845.92H444.389V851.32Z" fill="white" fill-opacity="0.3"/>
                    <path d="M434.397 853V844.24H439.797V845.776H436.161V847.744H439.377V849.28H436.161V851.464H439.797V853H434.397Z" fill="white" fill-opacity="0.3"/>
                    <path d="M425.798 853V844.24H428.642C429.25 844.24 429.778 844.356 430.226 844.588C430.682 844.82 431.034 845.148 431.282 845.572C431.538 845.988 431.666 846.48 431.666 847.048V850.18C431.666 850.74 431.538 851.232 431.282 851.656C431.034 852.08 430.682 852.412 430.226 852.652C429.778 852.884 429.25 853 428.642 853H425.798ZM427.598 851.32H428.642C429.01 851.32 429.306 851.216 429.53 851.008C429.754 850.8 429.866 850.524 429.866 850.18V847.048C429.866 846.712 429.754 846.44 429.53 846.232C429.306 846.024 429.01 845.92 428.642 845.92H427.598V851.32Z" fill="white" fill-opacity="0.3"/>
                    <path d="M417.403 853V844.24H420.247C420.855 844.24 421.383 844.356 421.831 844.588C422.287 844.82 422.639 845.148 422.887 845.572C423.143 845.988 423.271 846.48 423.271 847.048V850.18C423.271 850.74 423.143 851.232 422.887 851.656C422.639 852.08 422.287 852.412 421.831 852.652C421.383 852.884 420.855 853 420.247 853H417.403ZM419.203 851.32H420.247C420.615 851.32 420.911 851.216 421.135 851.008C421.359 850.8 421.471 850.524 421.471 850.18V847.048C421.471 846.712 421.359 846.44 421.135 846.232C420.911 846.024 420.615 845.92 420.247 845.92H419.203V851.32Z" fill="white" fill-opacity="0.3"/>
                    <path d="M408.552 853L410.7 844.24H412.98L415.152 853H413.316L412.896 851.02H410.808L410.388 853H408.552ZM411.108 849.58H412.584L412.164 847.468C412.108 847.164 412.048 846.864 411.984 846.568C411.928 846.264 411.884 846.028 411.852 845.86C411.82 846.028 411.776 846.26 411.72 846.556C411.672 846.852 411.616 847.152 411.552 847.456L411.108 849.58Z" fill="white" fill-opacity="0.3"/>

                </g>
            </svg>
        `;

        const circlesSvg = `
            <svg width="${a}" height="${a}" viewBox="0 0 1000 1000" x="${x}" y="${y}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.015">
                    <circle opacity="0.7" cx="500" cy="500" r="363.172" stroke="white"/>
                    <circle opacity="0.8" cx="500" cy="500" r="456.688" stroke="white"/>
                    <circle opacity="0.9" cx="500" cy="500" r="560.594" stroke="white"/>
                    <circle opacity="1" cx="500" cy="500" r="664.5" stroke="white"/>
                </g>
                <g style="mix-blend-mode:overlay" opacity="0.3">
                    <circle opacity="0.2" cx="500" cy="500" r="363.172" stroke="white"/>
                    <circle opacity="0.4" cx="500" cy="500" r="456.688" stroke="white"/>
                    <circle opacity="0.6" cx="500" cy="500" r="560.594" stroke="white"/>
                    <circle opacity="0.8" cx="500" cy="500" r="664.5" stroke="white"/>
                </g>
            </svg>
        `;

        const userBubble = `
            <svg width="${a}" height="${a}" viewBox="0 0 1000 1000" x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_dddddiiiiii_103_116)">
                    <circle cx="500" cy="500" r="260" fill="url(#latest-linear-grad)"/>
                    <circle cx="500" cy="500" r="259.4" stroke="white" stroke-opacity="0.25" stroke-width="1.2" style="mix-blend-mode:soft-light"/>
                </g>
                <defs>
                    <filter id="filter0_dddddiiiiii_103_116" x="80" y="160" width="840" height="840" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="10"/>
                        <feGaussianBlur stdDeviation="10"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="20"/>
                        <feGaussianBlur stdDeviation="20"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                        <feBlend mode="normal" in2="effect1_dropShadow_103_116" result="effect2_dropShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="40"/>
                        <feGaussianBlur stdDeviation="40"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                        <feBlend mode="normal" in2="effect2_dropShadow_103_116" result="effect3_dropShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="80"/>
                        <feGaussianBlur stdDeviation="80"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                        <feBlend mode="normal" in2="effect3_dropShadow_103_116" result="effect4_dropShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="80"/>
                        <feGaussianBlur stdDeviation="40"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                        <feBlend mode="normal" in2="effect4_dropShadow_103_116" result="effect5_dropShadow_103_116"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect5_dropShadow_103_116" result="shape"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="50"/>
                        <feGaussianBlur stdDeviation="25"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.33 0"/>
                        <feBlend mode="overlay" in2="shape" result="effect6_innerShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="40"/>
                        <feGaussianBlur stdDeviation="20"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"/>
                        <feBlend mode="normal" in2="effect6_innerShadow_103_116" result="effect7_innerShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="20"/>
                        <feGaussianBlur stdDeviation="10"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"/>
                        <feBlend mode="normal" in2="effect7_innerShadow_103_116" result="effect8_innerShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="10"/>
                        <feGaussianBlur stdDeviation="5"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0"/>
                        <feBlend mode="normal" in2="effect8_innerShadow_103_116" result="effect9_innerShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4"/>
                        <feGaussianBlur stdDeviation="4"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"/>
                        <feBlend mode="overlay" in2="effect9_innerShadow_103_116" result="effect10_innerShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="-8"/>
                        <feGaussianBlur stdDeviation="4"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"/>
                        <feBlend mode="overlay" in2="effect10_innerShadow_103_116" result="effect11_innerShadow_103_116"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="-80"/>
                        <feGaussianBlur stdDeviation="40"/>
                        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
                        <feBlend mode="overlay" in2="effect11_innerShadow_103_116" result="effect12_innerShadow_103_116"/>
                    </filter>
                    <linearGradient id="latest-linear-grad" x1="240" y1="240" x2="760" y2="760" gradientUnits="userSpaceOnUse">
                        <stop offset="0.14" stop-color="hsla(24deg, 91%, 44%, 1)"/>
                        <stop offset="0.86" stop-color="hsla(200deg, 92%, 57%, 0.7)"/>
                    </linearGradient>
                </defs>
            </svg>
        `;

        // layers[geom.layer]!.splice(
        //     layers[geom.layer]!.length - 1,
        //     1,
        //     this.drawBubble(bubble, geom, 'glow1'),
        //     addressSvg,
        //     this.drawBubble(bubble, geom, 'glow2'),
        // );
        /*layers[geom.layer]!.splice(
            layers[geom.layer]!.length,
            0,
            `
                <circle cx="${geom.x}" cy="${geom.y}" r="${geom.r}" fill="url(#inner-hint-2)" style="mix-blend-mode: overlay;" />
            `,
        );*/

        // layers.splice(geom.layer, 0, [logoSvg]);

        const bubblesvg =
            `<svg width="2000" height="2000" viewBox="${x} ${y} ${a} ${a}"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <style>
                    .oldbubble { filter: blur(9px); opacity: 0.8; }
                    .glow1 { filter: blur(30px); }
                    .glow2 { filter: blur(60px); }
                </style>
                <defs>
                    <filter id="glow-1" color-interpolation-filters="sRGB">
                        <feGaussianBlur stdDeviation="20" edgeMode="duplicate" />
                    </filter>
                    <filter id="glow-2" color-interpolation-filters="sRGB">
                        <feGaussianBlur stdDeviation="20" edgeMode="duplicate" />
                    </filter>
                </defs>
                ` +
            svgObj.bg +
            layers.flat().join('\n') +
            userBubble +
            textSvg +
            circlesSvg +
            svgObj.close;

        return bubblesvg;
    }

    async saveImages(
        svgObj: {
            open: string;
            bg: string;
            bubbles: string[];
            close: string;
        },
        checkpoint: number,
        bubble: Bubble,
        latestBubbleGeom: BubGeom,
        context: Context,
    ) {
        // Generate canvas image & update metadata
        const canv = svgObj.open + svgObj.bg + svgObj.bubbles.join('\n') + svgObj.close;
        await writeFile(pathsService.pathToCanvasImage(0), canv);
        await writeFile(pathsService.pathToCheckpointImage(0, checkpoint), canv);

        //comment out just now
        // await this.saveCanvasStatus(checkpoint, context);
        metadataService.generateCanvasMetadata(0n, checkpoint, bubble);
        console.log(`Canvas ${checkpoint} generated`);

        // Generate and save bubble image & metadata
        const bubblecanv = this.drawBubbleNft(svgObj, checkpoint, bubble, latestBubbleGeom);
        await writeFile(pathsService.pathToBubbleImage(bubble.tokenId), bubblecanv);
        console.log('Bubble generated for Canvas ' + checkpoint);

        // Generate canvas layers
        // let generated = 0;
        // Object.values(svgObj.bubbles).forEach(async (bubbles, i) => {
        //     const layer = svgObj.open + bubbles.join('\n') + svgObj.close;
        //     await writeFile(pathsService.pathToLayerImage(0, checkpoint, i), layer);
        //     generated++;
        //     if (generated == this.layers) {
        //         console.log('Layers generated for Canvas ' + checkpoint);
        //     }
        // });
        await this.saveCanvasStatus(checkpoint, context);
    }

    async saveCanvasStatus(id: number, ctx: Context): Promise<boolean> {
        // const { Checkpoint } = ctx.db;
        // await Checkpoint.update({
        //     id: '0_' + id.toString().padStart(7, '0'),
        //     data: ({ current }) => ({
        //         fragmentId: current.fragmentId,
        //         canvasId: current.canvasId,
        //         assetsGenerated: true,
        //     }),
        // });
        return true;
    }
}
