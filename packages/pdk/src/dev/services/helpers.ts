import { Chain, anvil, base, baseSepolia } from 'viem/chains';

export function getChainForNetwork(network?: string): Chain {
    switch (network) {
        case 'base':
            return base;
        case 'base-sepolia':
            return baseSepolia;
        case 'local':
            return anvil;
        default:
            console.warn(`Unknown network ${network}, defaulting to base`);
            return base;
    }
}
