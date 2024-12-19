import { Feature, ProjectConfig } from '@patchworkdev/common/types';
import { ponder, react } from '@patchworkdev/pdk/plugins';

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
        base: {
            chainId: 8453,
            rpc: 'http://anvil:8545',
        },
    },
    plugins: [
        ponder(),
        react({}),
    ],
    deployments: [
        {
            network: 'base',
            contracts: {
                Canvas: {
                    name: 'Canvas',
                    address: '0x4e110000000003FaC58d6F09DbA701181Bb67738',
                    block: 5302131,
                },
                Bubble: {
                    name: 'Bubble',
                    address: '0xB0Bb1eb0bb1E823D6eFfd2ED7Fdb67A78995AE7c',
                    block: 5302131,
                },
            },
        },
    ],
};

export default projectConfig;
