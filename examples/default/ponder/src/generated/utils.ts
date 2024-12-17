import { Context } from '@/generated';
import { unpackMetadata } from '@patchworkdev/pdk/utils';
import { ContractSchemas, ContractSchemasMap } from '../../schemas';

export async function getMetadata<T extends keyof ContractSchemasMap>(tokenId: bigint, contractName: T, context: Context) {
    const schema = ContractSchemas[contractName];

    // Read packed metadata from the contract
    const packedMetadata = await context.client.readContract({
        address: context.contracts[contractName as keyof Context['contracts']].address,
        abi: context.contracts[contractName as keyof Context['contracts']].abi,
        functionName: 'loadPackedMetadata',
        args: [tokenId],
    });

    // Unpack metadata based on the schema, ignoring literef fields (indexed separately)
    const unpackedMetadata = await unpackMetadata<typeof schema, never, 'literef'>(schema, packedMetadata, [], ['literef']);

    return unpackedMetadata;
}
