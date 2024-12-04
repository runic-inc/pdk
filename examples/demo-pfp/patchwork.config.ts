import { Feature, ProjectConfig } from '@patchworkdev/common/types';

const projectConfig: ProjectConfig = {
    name: 'elephants',
    contracts: {
        Elephant: {
            scopeName: 'elephants',
            name: 'Elephants',
            symbol: 'ELEPHANT',
            baseURI: 'https://elephants.fun/metadata/elephant/',
            schemaURI: 'https://elephants.fun/schemas/elephant.json',
            imageURI: 'https://elephants.fun/assets/elephant/{tokenID}',
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
            fragments: ['Attribute'],
        },
        Attribute: {
            scopeName: 'elephants',
            name: 'Elephants: Attributes',
            symbol: 'ATTRIBUTE',
            baseURI: 'https://elephants.fun/metadata/attribute/',
            schemaURI: 'https://elephants.fun/schemas/attribute.json',
            imageURI: 'https://elephants.fun/assets/attribute/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'attributeType',
                    type: 'uint8',
                    description: 'Attribute Type',
                },
                {
                    id: 1,
                    key: 'attributeId',
                    type: 'uint16',
                    description: 'Attribute ID',
                },
                {
                    id: 2,
                    key: 'tier',
                    type: 'uint8',
                    description: 'Attribute Tier',
                },
                {
                    id: 3,
                    key: 'name',
                    type: 'char16',
                    description: 'Attribute Name',
                },
            ],
            features: [Feature.MINTABLE, Feature.FRAGMENTSINGLE],
        },
    },
    scopes: [
        {
            name: 'elephants',
        },
    ],
    networks: {
        base: {
            chainId: 8453,
            rpc: 'http://anvil:8545',
        },
    },
    deployments: [
        {
            network: 'base',
            contracts: {
                Elephant: {
                    name: 'Elephant',
                    address: '0xbeefbeefbeefd8719828fc887effd1f4c85b2848',
                    block: 10968348,
                },
                Attribute: {
                    name: 'Attribute',
                    address: '0xbeeeeeeeeeef0da9a8b35516d7b1ace4a33380ab',
                    block: 10968348,
                },
            },
        },
    ],
};

export default projectConfig;
