import { Feature, ProjectConfig } from '@patchworkdev/common/types';

const projectConfig: ProjectConfig = {
    name: 'ComposablePFPDemo',
    contracts: {
        Character: {
            scopeName: 'composable-pfp-demo',
            name: 'Character',
            symbol: 'CHAR',
            baseURI: 'https://example.com/metadata/character',
            schemaURI: 'https://example.com/schemas/character.json',
            imageURI: 'https://example.com/assets/character/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'attributeLiteRefs',
                    type: 'literef',
                    description: 'Attribute LiteRefs',
                    arrayLength: 8,
                },
                {
                    id: 1,
                    key: 'name',
                    type: 'char32',
                    description: 'Name',
                },
                {
                    id: 2,
                    key: 'bg_color',
                    type: 'bytes8',
                    description: 'Background Color',
                },
            ],
            features: [],
            fragments: ['CharacterTraits'],
        },
        CharacterTraits: {
            scopeName: 'composable-pfp-demo',
            name: 'CharacterTraits',
            symbol: 'CHARTRAIT',
            baseURI: 'https://example.com/metadata/trait',
            schemaURI: 'https://example.com/schemas/trait.json',
            imageURI: 'https://example.com/assets/trait/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'trait_id',
                    type: 'uint16',
                    description: 'Trait ID',
                },
                {
                    id: 1,
                    key: 'trait_type',
                    type: 'uint8',
                    description: 'Trait Type',
                },
                {
                    id: 2,
                    key: 'trait_name',
                    type: 'char16',
                    description: 'Trait Name',
                },
            ],
            features: [Feature.MINTABLE, Feature.FRAGMENTSINGLE],
            fees: {
                mintFee: 0.000111,
                assignFee: 0,
                patchFee: 0,
            },
        },
    },
    scopes: [
        {
            name: 'composable-pfp-demo',
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
