import { FieldType } from '@patchworkdev/common';

export type ContractJSONSchema = {
    $schema: string;
    scopeName: string;
    name: string;
    symbol: string;
    schemaURI?: string;
    imageURI?: string;
    fields: ContractJSONSchemaField[];
};

export type ContractJSONSchemaField = {
    id: number;
    key: string;
    permissionId?: number;
    description?: string;
    type: keyof FieldTypeMap;
    arrayLength?: number;
    visibility?: 'public' | 'private';
    slot: number;
    offset: number;
};

export type FieldTypeMap = {
    bool: boolean;
    int8: number;
    int16: number;
    int32: number;
    int64: number;
    int128: number;
    int256: number;
    uint8: number;
    uint16: number;
    uint32: number;
    uint64: number;
    uint128: number;
    uint256: number;
    char8: string;
    char16: string;
    char32: string;
    char64: string;
    bytes8: string;
    bytes16: string;
    bytes32: string;
    literef: string;
    address: string;
    string: string;
};

export type InferSchemaType<
    S extends ContractJSONSchema,
    ExcludedKeys extends string = never, // Keys to exclude (default: none)
    ExcludedTypes extends keyof FieldTypeMap = never, // Types to exclude (default: none)
> = {
    [F in S['fields'][number] as F['key'] extends ExcludedKeys ? never : F['type'] extends ExcludedTypes ? never : F['key']]: F['arrayLength'] extends
        | 1
        | undefined
        ? FieldTypeMap[F['type']] | undefined
        : FieldTypeMap[F['type']][] | undefined;
};

export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

/*
 * Given a parsed contract JSON schema and packed metadata (uint256 array), walks through each field and
 * attemps to unpack its corresponding metadata from the packed array
 */
export async function unpackMetadata<S extends ContractJSONSchema, ExcludedKeys extends string = never, ExcludedTypes extends keyof FieldTypeMap = never>(
    schema: S,
    packedMetadata: readonly bigint[],
    excludedKeys: ExcludedKeys[] = [],
    excludedTypes: ExcludedTypes[] = [],
): Promise<Prettify<InferSchemaType<S, ExcludedKeys, ExcludedTypes>>> {
    if (!schema?.fields?.length) throw new Error('Schema is empty');

    const processedFields: Partial<InferSchemaType<S, ExcludedKeys, ExcludedTypes>> = {};

    for (const field of schema.fields) {
        // Skip fields based on key or type
        if (excludedKeys.includes(field.key as ExcludedKeys)) continue;
        if (excludedTypes.includes(field.type as ExcludedTypes)) continue;

        const values = splitPackedValues(packedMetadata, Number(field.slot), Number(field.arrayLength || 1), getBitLength(field.type), Number(field.offset));
        (processedFields as any)[field.key] =
            field.arrayLength === 1 || field.arrayLength === undefined
                ? convertValue(values[0], field.type) // Single value
                : values.map((v) => convertValue(v, field.type)); // Array of values
    }

    // Cast processedFields to InferSchemaType<S> safely
    return processedFields as Prettify<InferSchemaType<S, ExcludedKeys, ExcludedTypes>>;
}

/*
 * Given a bit window and full array of bitpacked uint256 bigints, walks through the array and attempts to split
 * relevant bits into a new array of unpacked bigints of various lengths for the specific field
 */
export function splitPackedValues(uint256array: readonly bigint[], startingslot: number, fieldlength: number, bitlength: number, offset: number): bigint[] {
    const values: bigint[] = [];

    for (let i = 0; i < fieldlength; i++) {
        const value = (uint256array[startingslot]! >> BigInt(offset)) & ((1n << BigInt(bitlength)) - 1n);
        values.push(value);
        offset += bitlength;
        if (offset >= 256) {
            startingslot++;
            offset = 0;
        }
    }

    return values;
}

/*
 * Given a field type from a JSON contract schema, returns bit length of the field
 */
export function getBitLength(fieldType: FieldType): number {
    switch (fieldType) {
        case 'bool':
            return 1;
        case 'int8':
        case 'uint8':
            return 8;
        case 'int16':
        case 'uint16':
            return 16;
        case 'int32':
        case 'uint32':
            return 32;
        case 'int64':
        case 'uint64':
            return 64;
        case 'int128':
        case 'uint128':
            return 128;
        case 'int256':
        case 'uint256':
            return 256;
        case 'char8':
            return 8 * 8;
        case 'char16':
            return 16 * 8;
        case 'char32':
            return 32 * 8;
        case 'char64':
            return 64 * 8;
        case 'literef':
            return 64;
        case 'address':
            return 160;
        case 'string':
            throw new Error('string type is not supported for packed metadata');
        default:
            throw new Error(`Unsupported field type: ${fieldType}`);
    }
}

/*
 * Given a raw bigint and a field type from a JSON contract schema, returns the converted value
 */
export function convertValue(value: bigint, fieldType: FieldType): boolean | number | string {
    switch (fieldType) {
        case 'bool':
            return value !== 0n;
        case 'int8':
        case 'int16':
        case 'int32':
        case 'int64':
        case 'int128':
        case 'int256':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'uint64':
        case 'uint128':
        case 'uint256':
        case 'literef':
            return Number(value);
        case 'char8':
        case 'char16':
        case 'char32':
        case 'char64':
            // Convert bigint to a buffer and then to a string
            const hexString = value.toString(16);
            const utf8String = Buffer.from(hexString, 'hex')
                .toString('utf8')
                .replace(/[\0]+$/g, '');
            const jankyCharacters = /[\uFFFD\u0000-\u001F]/;
            if (jankyCharacters.test(utf8String)) {
                return hexString;
            } else {
                return utf8String;
            }
        case 'address':
            return value.toString(16).padStart(40, '0');
        case 'string':
            throw new Error('STRING type is not supported for packed metadata');
        default:
            throw new Error(`Unsupported field type for conversion: ${fieldType}`);
    }
}
