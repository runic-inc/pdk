




const template = `
import { createConfig, mergeAbis } from '@ponder/core';
import { http, Abi } from 'viem';

// import * as abisImport from './abis/index';

// Create a typed object of the ABIs
// const abis: Record<string, Abi> = abisImport;

import { Canvas, Bubble } from './abis/index';

// const allAbis = Object.entries(abis).filter(([i])=>i==="Bubble").map(([name, abi]) => {return abi as Abi});
// const Bubble = Object.entries(abis).filter(([i])=>i==="Bubble").map(([name, abi]) => {return abi as Abi});
// const Canvas = Object.entries(abis).filter(([i])=>i==="Canvas").map(([name, abi]) => {return abi as Abi});
// const allAbis = Object.values(abis).filter((a)=>a.);

export default createConfig({
    networks: {
        mainnet: {
            chainId: 1,
            transport: http(process.env.PONDER_RPC_URL_1),
        },
    },
    contracts: {
        Canvas: {
            network: 'mainnet',
            abi: mergeAbis([Canvas]),
            address: '0x0000000000000000000000000000000000000000',
            startBlock: 1234567,
        },
        Bubble: {
            network: 'mainnet',
            abi: mergeAbis([Bubble]),
            address: '0x0000000000000000000000000000000000000000',
            startBlock: 1234567,
        },
    },
});

`

// config
// we can get all the abis in one array but do we want to do that? doesn't work as thought so no
// networks needs to be any network that we have deployed to
// contracts needs to be
//      any entities
//      patchwork
// questions
//      how do we handle test and mainnets. do we put all the networks in the
//      config or do we populate things via env vars like patchwork explorer
//      alternatively do we have an env var that switches between test and mainnets
