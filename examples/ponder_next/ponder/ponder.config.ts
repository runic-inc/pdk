import { createConfig } from '@ponder/core';
import { http } from 'viem';

import { ExampleContractAbi } from './abis/ExampleContractAbi';

export default createConfig({
    database: {
        kind: 'postgres',
        connectionString: 'postgres://postgres:password@localhost:5432/ponder',
    },
    networks: {
        mainnet: {
            chainId: 1,
            transport: http(process.env.PONDER_RPC_URL_1),
        },
    },
    contracts: {
        ExampleContract: {
            network: 'mainnet',
            abi: ExampleContractAbi,
            address: '0x0000000000000000000000000000000000000000',
            startBlock: 1234567,
        },
    },
});
