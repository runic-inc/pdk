import { Feature, type ProjectConfig } from '@patchworkdev/common/types';
import { anvil, base, baseSepolia } from 'viem/chains';

const projectConfig: ProjectConfig = {
    name: 'My Patchwork App',
    contracts: {
        FirstContract: {
            scopeName: 'myapp',
            name: 'My First Contract',
            symbol: 'FIRST',
            baseURI: 'https://www.example.com/',
            schemaURI: 'https://www.example.com/schemas/myfirstcontract.json',
            imageURI: 'https://www.example.com/assets/myfirstcontract/{tokenID}',
            fields: [
                {
                    id: 0,
                    key: 'myfield',
                    type: 'char32',
                    description: 'My Field',
                },
                {
                    id: 1,
                    key: 'myarray',
                    type: 'char8',
                    description: 'My Array',
                    arrayLength: 4,
                },
            ],
            features: [Feature.MINTABLE],
        },
    },
    contractRelations: {},
    scopes: [
        {
            name: 'myapp',
        },
    ],
    networks: {
        local: {
            chain: anvil,
        },
        testnet: {
            chain: baseSepolia,
        },
        mainnet: {
            chain: base,
        },
    },
};

export default projectConfig;
