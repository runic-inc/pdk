/// <reference types="https://cdn.jsdelivr.net/npm/@patchworkdev/common@0.2.5/dist/types/index.d.ts" />

import { Feature, ProjectConfig } from '@patchworkdev/common/types';

const projectConfig: ProjectConfig = {
    name: 'canvas',
    contracts: {
        Canvas: {
            scopeName: 'canvas',
            name: 'Canvas',
            symbol: 'CANVAS',
            baseURI: 'https://canvas.patchwork.dev/',
            schemaURI: 'https://canvas.patchwork.dev/schemas/canvas.json',
            imageURI: 'https://canvas.patchwork.dev/assets/canvas/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'name',
                    type: 'char32',
                    description: 'Name',
                },
                {
                    id: 1,
                    key: 'bubbleRefs',
                    type: 'literef',
                    description: 'Bubble Literefs',
                    arrayLength: 0,
                },
            ],
            features: [Feature.MINTABLE],
            fragments: ['Bubble'],
        },
        Bubble: {
            scopeName: 'canvas',
            name: 'Bubble',
            symbol: 'BUBBLE',
            baseURI: 'https://canvas.patchwork.dev/',
            schemaURI: 'https://canvas.patchwork.dev/schemas/bubble.json',
            imageURI: 'https://canvas.patchwork.dev/assets/bubble/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'sequence',
                    type: 'uint256',
                    description: 'Sequence',
                },
                {
                    id: 1,
                    key: 'decorations',
                    type: 'bytes8',
                    description: 'Decorations',
                    arrayLength: 4,
                },
                {
                    id: 2,
                    key: 'minter',
                    type: 'address',
                    description: 'Original minter address',
                },
            ],
            features: [Feature.MINTABLE, Feature.FRAGMENTSINGLE, Feature.WEAKREF],
        },
    },
    scopes: [
        {
            name: 'canvas',
        },
    ],
    networks: {
        local: {
            chain: 'anvil',
            rpc: 'http://anvil:8545',
        },
        testnet: {
            chain: 'baseSepolia',
            rpc: 'http://anvil:8545',
        },
        mainnet: {
            chain: 'base',
            rpc: 'http://anvil:8545',
        },
    },
    plugins: [{ name: 'ponder' }, { name: 'react' }],
};

export default projectConfig;
