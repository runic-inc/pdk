import { Context } from '@/generated';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface SchemaField {
    key: string;
    fieldType: SchemaTypes;
    slot: bigint;
    offset: bigint;
    fieldCount?: bigint;
}

// Add contract name type to ensure type safety
export type ContractNames = keyof Context['contracts'];

export type SchemaTypes =
    | 'BOOLEAN'
    | 'INT8'
    | 'INT16'
    | 'INT32'
    | 'INT64'
    | 'INT128'
    | 'INT256'
    | 'UINT8'
    | 'UINT16'
    | 'UINT32'
    | 'UINT64'
    | 'UINT128'
    | 'UINT256'
    | 'CHAR8'
    | 'CHAR16'
    | 'CHAR32'
    | 'CHAR64'
    | 'LITEREF'
    | 'ADDRESS'
    | 'STRING';

export function loadSchemaForContract(contractName: ContractNames): SchemaField[] {
    try {
        const schemaPath = join(__dirname, '../../../contracts/src', `${contractName}-schema.json`);
        const schemaData = readFileSync(schemaPath, 'utf8');
        return JSON.parse(schemaData);
    } catch (error) {
        console.error(`Failed to load schema for contract ${contractName}:`, error);
        throw error;
    }
}

export async function getMetadataFromSchema(tokenId: bigint, contractName: ContractNames, context: Context): Promise<Record<string, any>> {
    const schema = loadSchemaForContract(contractName);
    const metadataCache: Record<number, bigint> = {};
    const extractedDataMap: Record<string, any> = {};

    for (const field of schema) {
        const slotNumber = Number(field.slot);

        // Fetch and cache the packed data if not already fetched
        if (metadataCache[slotNumber] === undefined) {
            const packed = await context.client.readContract({
                address: context.contracts[contractName].address,
                abi: context.contracts[contractName].abi,
                functionName: 'loadPackedMetadataSlot',
                args: [tokenId, field.slot],
            });
            metadataCache[slotNumber] = packed as bigint;
        }

        const extractedData = extractField(metadataCache[slotNumber], field);
        Object.assign(extractedDataMap, extractedData);
    }

    return extractedDataMap;
}

function getBitLength(fieldType: SchemaTypes): number {
    switch (fieldType) {
        case 'BOOLEAN':
            return 1;
        case 'INT8':
        case 'UINT8':
            return 8;
        case 'INT16':
        case 'UINT16':
            return 16;
        case 'INT32':
        case 'UINT32':
            return 32;
        case 'INT64':
        case 'UINT64':
            return 64;
        case 'INT128':
        case 'UINT128':
            return 128;
        case 'INT256':
        case 'UINT256':
            return 256;
        case 'CHAR8':
            return 8 * 8;
        case 'CHAR16':
            return 16 * 8;
        case 'CHAR32':
            return 32 * 8;
        case 'CHAR64':
            return 64 * 8;
        case 'LITEREF':
            return 64;
        case 'ADDRESS':
            return 160;
        case 'STRING':
            throw new Error('STRING type is not supported for packed metadata');
        default:
            throw new Error(`Unsupported field type: ${fieldType}`);
    }
}

function convertValue(value: bigint, fieldType: SchemaTypes): any {
    switch (fieldType) {
        case 'BOOLEAN':
            return value !== 0n;
        case 'INT8':
        case 'INT16':
        case 'INT32':
        case 'INT64':
        case 'INT128':
        case 'INT256':
        case 'UINT8':
        case 'UINT16':
        case 'UINT32':
        case 'UINT64':
        case 'UINT128':
        case 'UINT256':
        case 'LITEREF':
            return Number(value);
        case 'CHAR8':
        case 'CHAR16':
        case 'CHAR32':
        case 'CHAR64':
            const buffer = Buffer.from(value.toString(16), 'hex');
            return buffer.toString('utf8').replace(/[\0]+$/g, '');
        case 'ADDRESS':
            return value.toString(16).padStart(40, '0');
        case 'STRING':
            throw new Error('STRING type is not supported for packed metadata');
        default:
            throw new Error(`Unsupported field type for conversion: ${fieldType}`);
    }
}

function extractField(uint256: bigint, field: SchemaField): Record<string, any> {
    const bitLength = getBitLength(field.fieldType);
    let offset = Number(field.offset);
    let extractedValues: any[] = [];

    const arrayLength = Number(field.fieldCount || 1n);

    for (let i = 0; i < arrayLength; i++) {
        const mask = (1n << BigInt(bitLength)) - 1n;
        const value = (uint256 >> BigInt(offset)) & mask;
        extractedValues.push(convertValue(value, field.fieldType));
        offset += bitLength;
    }

    return {
        [field.key]: arrayLength === 1 ? extractedValues[0] : extractedValues,
    };
}
