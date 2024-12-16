/// <reference types="https://cdn.jsdelivr.net/npm/@patchworkdev/common@0.2.5/dist/types/index.d.ts" />

import { Feature, type ProjectConfig } from '@patchworkdev/common/types';
import { ponder, react } from '@patchworkdev/pdk/plugins';
import { anvil, base, baseSepolia } from 'viem/chains';

const projectConfig: ProjectConfig = {
    name: 'My Patchwork App',
    contracts: {
        MyFirstContract: {
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
    scopes: [
        {
            name: 'myapp',
        },
    ],
    networks: {
        local: {
            chain: anvil,
            rpc: 'http://anvil:8545',
        },
        testnet: {
            chain: baseSepolia,
            rpc: 'http://anvil:8545',
        },
        mainnet: {
            chain: base,
            rpc: 'http://anvil:8545',
        },
    },
    plugins: [
        // foundry(),
        ponder(),
        react({}),
        // docker({
        //     anvil: true,
        // }),
    ],
};

export default projectConfig;
