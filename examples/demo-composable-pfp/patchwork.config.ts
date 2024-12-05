import { Feature, ProjectConfig } from '@patchworkdev/common/types';
import { anvil, base, baseSepolia } from 'viem/chains';

const projectConfig: ProjectConfig = {
    name: 'Composable PFP Demo',
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
            ],
            features: [],
            fragments: ['Trait'],
        },
        Trait: {
            scopeName: 'composable-pfp-demo',
            name: 'Character Traits',
            symbol: 'CHARTRAIT',
            baseURI: 'https://example.com/metadata/trait',
            schemaURI: 'https://example.com/schemas/trait.json',
            imageURI: 'https://example.com/assets/trait/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'id',
                    type: 'uint16',
                    description: 'Trait ID',
                },
                {
                    id: 1,
                    key: 'type',
                    type: 'uint8',
                    description: 'Trait Type',
                },
                {
                    id: 2,
                    key: 'name',
                    type: 'char16',
                    description: 'Trait Name',
                },
            ],
            features: [Feature.MINTABLE, Feature.FRAGMENTSINGLE],
        },
    },
    scopes: [
        {
            name: 'composable-pfp-demo',
        },
    ],
    networks: {
        local: {
            chain: anvil,
            rpc: 'http://127.0.0.1:8545',
        },
        testnet: {
            chain: baseSepolia,
            rpc: 'http://127.0.0.1:8545',
        },
        mainnet: {
            chain: base,
            rpc: 'http://127.0.0.1:8545',
        },
    },
};

export default projectConfig;
