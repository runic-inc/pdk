import { Feature, type ProjectConfig } from '@patchworkdev/common/types';
import { anvil, base, baseSepolia } from 'viem/chains';

const projectConfig: ProjectConfig = {
    name: 'My Patchwork App',
    contracts: {
        'Word': {
            scopeName: 'myapp',
            name: 'My First Contract',
            symbol: 'FIRST',
            baseURI: 'https://www.example.com/',
            schemaURI: 'https://www.example.com/schemas/myfirstcontract.json',
            imageURI: 'https://www.example.com/assets/myfirstcontract/{tokenID}',
            fields: [],
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
    }
};

export default projectConfig;
