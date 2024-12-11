import { Chain, base, baseSepolia } from 'viem/chains';

export function getChainForNetwork(network?: string): Chain {
    switch (network) {
        case 'base':
            return base;
        case 'base-sepolia':
            return baseSepolia;
        case 'local':
            return base; // Use base for local development
        default:
            console.warn(`Unknown network ${network}, defaulting to base`);
            return base;
    }
}
