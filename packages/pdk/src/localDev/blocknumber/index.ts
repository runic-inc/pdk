import { createPublicClient, http } from 'viem';

export async function getBlockNumber(rpcUrl: string): Promise<bigint> {
    try {
        const client = createPublicClient({
            transport: http(rpcUrl),
        });

        const blockNumber = await client.getBlockNumber();
        return blockNumber;
    } catch (error) {
        console.error('Failed to fetch block number:', error);
        throw new Error('Failed to fetch block number from node');
    }
}

export async function getDeploymentBlockNumber(rpcUrl: string, retries = 3, delay = 1000): Promise<bigint> {
    for (let i = 0; i < retries; i++) {
        try {
            const blockNumber = await getBlockNumber(rpcUrl);
            return blockNumber;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error('Failed to fetch block number after multiple attempts');
}
